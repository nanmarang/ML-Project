"""
Model Trainer for Explainable AI Loan Approval and Default Risk Prediction.
Trains XGBoost, Random Forest, and Scorecard models, saves artifacts,
computes evaluation metrics, and initializes SHAP TreeExplainer.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score, roc_curve, precision_recall_curve,
    confusion_matrix, classification_report, brier_score_loss, f1_score
)
import xgboost as xgb
import shap

np.random.seed(42)

def generate_synthetic_credit_data(n_samples=12000):
    """
    Generates realistic, multi-factor credit underwriting dataset
    with complex non-linear relationships, credit histories, and macro factors.
    """
    # 1. Demographics & Employment
    person_age = np.random.randint(21, 68, size=n_samples)
    emp_length = np.clip(np.random.exponential(scale=6, size=n_samples), 0, 40).round(1)
    # Ensure emp_length <= age - 18
    emp_length = np.minimum(emp_length, np.maximum(0, person_age - 18))
    
    # 2. Financial Standing
    # Log-normal distribution for income
    person_income = np.exp(np.random.normal(10.8, 0.65, size=n_samples)).round(-2)
    person_income = np.clip(person_income, 18000, 450000)
    
    # Home ownership
    home_ownership_probs = [0.45, 0.42, 0.11, 0.02] # RENT, MORTGAGE, OWN, OTHER
    person_home_ownership = np.random.choice(['RENT', 'MORTGAGE', 'OWN', 'OTHER'], size=n_samples, p=home_ownership_probs)
    
    # Liquid assets & Collateral
    liquid_assets = (person_income * np.random.uniform(0.05, 0.85, size=n_samples)).round(-2)
    collateral_value = np.where(
        person_home_ownership == 'OWN',
        np.random.uniform(1.2, 3.5, size=n_samples) * person_income,
        np.where(person_home_ownership == 'MORTGAGE', np.random.uniform(0.4, 1.8, size=n_samples) * person_income, 0.0)
    ).round(-2)

    # 3. Loan Application Details
    loan_intents = ['PERSONAL', 'EDUCATION', 'MEDICAL', 'VENTURE', 'HOMEIMPROVEMENT', 'DEBTCONSOLIDATION']
    intent_probs = [0.20, 0.15, 0.15, 0.15, 0.15, 0.20]
    loan_intent = np.random.choice(loan_intents, size=n_samples, p=intent_probs)
    
    # Loan amount requested
    loan_amnt = np.random.choice([3000, 5000, 10000, 15000, 20000, 25000, 35000, 50000, 75000], size=n_samples,
                                 p=[0.12, 0.18, 0.22, 0.18, 0.12, 0.08, 0.05, 0.03, 0.02])
    # Add random jitter to loan amount
    loan_amnt = np.clip(loan_amnt + np.random.randint(-1500, 1500, size=n_samples), 1000, 100000)
    
    # Loan term (months)
    loan_term_months = np.random.choice([24, 36, 48, 60], size=n_samples, p=[0.15, 0.45, 0.20, 0.20])
    
    # Down payment ($)
    down_payment = (loan_amnt * np.random.uniform(0.0, 0.35, size=n_samples)).round(-2)

    # 4. Credit Bureau History
    # Credit score (FICO style: 350 to 850)
    base_score = 660 + (person_income / 12000) * 12 + (emp_length * 2.5)
    credit_score = np.clip(base_score + np.random.normal(0, 65, size=n_samples), 350, 850).round().astype(int)
    
    # Credit history length in years
    cb_person_cred_hist_length = np.clip(
        (person_age - 18) * np.random.uniform(0.3, 0.9, size=n_samples), 1, 45
    ).round(1)
    
    # Open credit lines & derogatory records
    open_credit_lines = np.clip(np.random.poisson(lam=7, size=n_samples), 1, 28)
    derogatory_prob = np.where(credit_score < 600, 0.45, np.where(credit_score < 700, 0.12, 0.02))
    derogatory_records = np.random.binomial(n=4, p=derogatory_prob)
    
    # Prior default on record
    default_prob = np.where(credit_score < 580, 0.40, np.where(credit_score < 660, 0.15, 0.03))
    cb_person_default_on_file = np.where(np.random.rand(n_samples) < default_prob, 'Y', 'N')
    
    # 5. Financial Ratios & Derived Risk Factors
    # Debt-To-Income (DTI %): monthly non-mortgage debt / monthly income
    base_dti = np.random.uniform(10.0, 48.0, size=n_samples)
    dti_ratio = np.clip(base_dti + (derogatory_records * 3.5) - (person_income / 80000) * 4, 4.0, 75.0).round(1)
    
    # Loan percent of income
    loan_percent_income = (loan_amnt / person_income).round(3)
    
    # Interest rate depends on credit score, DTI, and loan intent
    base_rate = 14.5 - ((credit_score - 600) / 250) * 8.0 + (dti_ratio / 30.0) * 2.5
    loan_int_rate = np.clip(base_rate + np.random.normal(0, 1.2, size=n_samples), 4.5, 29.5).round(2)
    
    # Monthly payment approx: P * (r / (1 - (1+r)^-n))
    r_monthly = (loan_int_rate / 100.0) / 12.0
    monthly_debt_service = (loan_amnt - down_payment) * (r_monthly / (1 - (1 + r_monthly) ** (-loan_term_months)))
    monthly_income = person_income / 12.0
    payment_to_income_ratio = (monthly_debt_service / monthly_income).round(3)

    # 6. Realistic Default Target Formulation (Ground Truth Probability)
    # Using calibrated logistic hazard function
    z = (
        - 2.8
        + 0.038 * dti_ratio
        - 0.011 * (credit_score - 600)
        + 1.8 * loan_percent_income
        + 0.08 * loan_int_rate
        + 0.65 * (cb_person_default_on_file == 'Y').astype(float)
        + 0.40 * derogatory_records
        - 0.045 * emp_length
        - 0.000008 * (person_income - 60000)
        - 0.000005 * collateral_value
        - 0.000010 * liquid_assets
        + 0.35 * (person_home_ownership == 'RENT').astype(float)
        - 0.45 * (person_home_ownership == 'OWN').astype(float)
        + 0.30 * (payment_to_income_ratio > 0.25).astype(float)
        - 0.02 * (down_payment / loan_amnt) * 10
    )
    
    prob_default = 1.0 / (1.0 + np.exp(-z))
    # Binary label: 1 if defaulted/high-risk, 0 if good standing
    loan_status = (np.random.rand(n_samples) < prob_default).astype(int)

    df = pd.DataFrame({
        'person_age': person_age,
        'person_income': person_income,
        'person_home_ownership': person_home_ownership,
        'person_emp_length': emp_length,
        'loan_intent': loan_intent,
        'loan_amnt': loan_amnt,
        'loan_term_months': loan_term_months,
        'down_payment': down_payment,
        'loan_int_rate': loan_int_rate,
        'credit_score': credit_score,
        'dti_ratio': dti_ratio,
        'loan_percent_income': loan_percent_income,
        'cb_person_default_on_file': cb_person_default_on_file,
        'cb_person_cred_hist_length': cb_person_cred_hist_length,
        'open_credit_lines': open_credit_lines,
        'derogatory_records': derogatory_records,
        'liquid_assets': liquid_assets,
        'collateral_value': collateral_value,
        'loan_status': loan_status
    })

    return df

def train_and_save_pipeline(output_dir='backend/models'):
    os.makedirs(output_dir, exist_ok=True)
    print("Generating synthetic multi-factor credit underwriting dataset...")
    df = generate_synthetic_credit_data(12000)
    
    # Save a CSV copy for transparency and user exploration
    csv_path = os.path.join(output_dir, 'synthetic_loan_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Saved dataset preview ({len(df)} rows) to {csv_path}")

    # Feature definitions
    categorical_features = ['person_home_ownership', 'loan_intent', 'cb_person_default_on_file']
    numeric_features = [
        'person_age', 'person_income', 'person_emp_length', 'loan_amnt',
        'loan_term_months', 'down_payment', 'loan_int_rate', 'credit_score',
        'dti_ratio', 'loan_percent_income', 'cb_person_cred_hist_length',
        'open_credit_lines', 'derogatory_records', 'liquid_assets', 'collateral_value'
    ]
    
    X = df[categorical_features + numeric_features]
    y = df['loan_status']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numeric_features)
        ]
    )
    
    # Fit preprocessor on training data
    print("Fitting feature preprocessor...")
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)
    
    # Feature names after one-hot encoding
    cat_encoder = preprocessor.named_transformers_['cat']
    encoded_cat_names = list(cat_encoder.get_feature_names_out(categorical_features))
    all_feature_names = encoded_cat_names + numeric_features

    # 1. Train Champion Model: XGBoost Classifier
    print("Training Champion Model (XGBoost Classifier)...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric='logloss',
        random_state=42
    )
    xgb_model.fit(X_train_trans, y_train)
    
    # 2. Train Challenger Model: Random Forest
    print("Training Challenger Model (Random Forest)...")
    rf_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_trans, y_train)
    
    # 3. Train Scorecard Baseline: Logistic Regression
    print("Training Scorecard Baseline (Logistic Regression)...")
    lr_model = LogisticRegression(max_iter=1000, random_state=42)
    lr_model.fit(X_train_trans, y_train)

    # Evaluations
    models = {
        'xgboost': xgb_model,
        'random_forest': rf_model,
        'logistic_regression': lr_model
    }
    
    metrics_summary = {}
    for name, model in models.items():
        y_prob = model.predict_proba(X_test_trans)[:, 1]
        y_pred = (y_prob >= 0.50).astype(int)
        
        auc = float(roc_auc_score(y_test, y_prob))
        brier = float(brier_score_loss(y_test, y_prob))
        f1 = float(f1_score(y_test, y_pred))
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        metrics_summary[name] = {
            'roc_auc': round(auc, 4),
            'brier_score': round(brier, 4),
            'f1_score': round(f1, 4),
            'confusion_matrix': cm
        }
        print(f"Model [{name.upper()}]: ROC-AUC={auc:.4f}, F1={f1:.4f}, Brier={brier:.4f}")

    # Generate ROC curve points for frontend visualizer
    xgb_probs = xgb_model.predict_proba(X_test_trans)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, xgb_probs)
    # Downsample points for efficient JSON serialization
    idx = np.linspace(0, len(fpr) - 1, 35, dtype=int)
    roc_data = [{'fpr': round(float(fpr[i]), 3), 'tpr': round(float(tpr[i]), 3)} for i in idx]

    # Global feature importances
    xgb_imp = xgb_model.feature_importances_
    sorted_idx = np.argsort(xgb_imp)[::-1]
    feature_importance_list = [
        {
            'feature': all_feature_names[i],
            'importance': round(float(xgb_imp[i]), 4)
        }
        for i in sorted_idx
    ]

    # 4. Train and calibrate SHAP Explainer
    print("Initializing SHAP TreeExplainer for Explainable AI...")
    # Use a representative background dataset for SHAP
    explainer = shap.TreeExplainer(xgb_model)
    
    # Save Pipeline and Components
    pipeline_bundle = {
        'preprocessor': preprocessor,
        'champion_model': xgb_model,
        'rf_model': rf_model,
        'lr_model': lr_model,
        'categorical_features': categorical_features,
        'numeric_features': numeric_features,
        'all_feature_names': all_feature_names,
    }
    
    pipeline_path = os.path.join(output_dir, 'pipeline_bundle.joblib')
    joblib.dump(pipeline_bundle, pipeline_path)
    print(f"Serialized pipeline bundle to {pipeline_path}")
    
    # Save SHAP explainer
    shap_path = os.path.join(output_dir, 'shap_explainer.joblib')
    joblib.dump(explainer, shap_path)
    print(f"Serialized SHAP explainer to {shap_path}")

    # Store background samples for counterfactual reference
    background_samples = X_test.iloc[:200].to_dict(orient='records')
    bg_path = os.path.join(output_dir, 'background_samples.joblib')
    joblib.dump(background_samples, bg_path)

    # Save comprehensive metadata
    meta = {
        'training_samples': len(df),
        'test_samples': len(X_test),
        'default_rate_base': round(float(y.mean()), 4),
        'model_comparison': metrics_summary,
        'roc_curve': roc_data,
        'global_feature_importance': feature_importance_list,
        'feature_names': all_feature_names,
        'categorical_features': categorical_features,
        'numeric_features': numeric_features
    }
    
    meta_path = os.path.join(output_dir, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"Saved model metadata to {meta_path}")
    print("Training & XAI initialization complete successfully!")

if __name__ == '__main__':
    train_and_save_pipeline()
