"""
Explainable AI (XAI) Engine for Credit Underwriting.
Calculates exact SHAP values, builds attribution waterfalls, generates
FCRA/ECOA-compliant adverse action notices, and estimates Basel Expected Loss.
"""

import os
import joblib
import numpy as np
import pandas as pd

# Load artifacts once
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
PIPELINE_PATH = os.path.join(MODELS_DIR, 'pipeline_bundle.joblib')
SHAP_PATH = os.path.join(MODELS_DIR, 'shap_explainer.joblib')

_pipeline_bundle = None
_explainer = None

def get_bundle():
    global _pipeline_bundle, _explainer
    if _pipeline_bundle is None:
        _pipeline_bundle = joblib.load(PIPELINE_PATH)
    if _explainer is None:
        _explainer = joblib.load(SHAP_PATH)
    return _pipeline_bundle, _explainer

# Friendly display names and units for underwriting features
FEATURE_DICTIONARY = {
    'person_income': {'label': 'Annual Household Income', 'unit': '$', 'category': 'Financial Strength'},
    'credit_score': {'label': 'Credit Bureau Score (FICO)', 'unit': 'pts', 'category': 'Credit History'},
    'dti_ratio': {'label': 'Debt-to-Income Ratio (DTI)', 'unit': '%', 'category': 'Debt Burden'},
    'loan_amnt': {'label': 'Requested Loan Amount', 'unit': '$', 'category': 'Loan Terms'},
    'loan_percent_income': {'label': 'Loan-to-Income Ratio', 'unit': 'ratio', 'category': 'Loan Terms'},
    'loan_int_rate': {'label': 'Interest Rate', 'unit': '%', 'category': 'Pricing'},
    'loan_term_months': {'label': 'Loan Tenure', 'unit': 'months', 'category': 'Loan Terms'},
    'down_payment': {'label': 'Down Payment Amount', 'unit': '$', 'category': 'Equity'},
    'liquid_assets': {'label': 'Liquid Cash & Savings', 'unit': '$', 'category': 'Financial Strength'},
    'collateral_value': {'label': 'Pledged Collateral Asset', 'unit': '$', 'category': 'Financial Strength'},
    'person_emp_length': {'label': 'Employment Stability', 'unit': 'years', 'category': 'Capacity'},
    'cb_person_cred_hist_length': {'label': 'Credit File Depth', 'unit': 'years', 'category': 'Credit History'},
    'open_credit_lines': {'label': 'Open Credit Revolving Lines', 'unit': 'lines', 'category': 'Credit History'},
    'derogatory_records': {'label': 'Derogatory Bureau Marks', 'unit': 'records', 'category': 'Credit History'},
    'person_age': {'label': 'Applicant Age', 'unit': 'years', 'category': 'Demographics'},
    'person_home_ownership': {'label': 'Home Ownership Status', 'unit': '', 'category': 'Capacity'},
    'loan_intent': {'label': 'Stated Purpose of Loan', 'unit': '', 'category': 'Loan Terms'},
    'cb_person_default_on_file': {'label': 'Historical Default Record', 'unit': '', 'category': 'Credit History'},
}

def calculate_monthly_installment(principal, annual_rate, term_months):
    if term_months <= 0 or principal <= 0:
        return 0.0
    r = (annual_rate / 100.0) / 12.0
    if r == 0:
        return round(principal / term_months, 2)
    emi = principal * (r * ((1 + r) ** term_months)) / (((1 + r) ** term_months) - 1)
    return round(float(emi), 2)

def determine_credit_tier(pd_score):
    if pd_score < 0.08:
        return 'Tier 1: Prime Superb (A+)', 'Lowest credit default risk, maximum preferred interest terms.'
    elif pd_score < 0.18:
        return 'Tier 2: Prime Standard (A)', 'Strong credit fundamentals, eligible for full automated approval.'
    elif pd_score < 0.32:
        return 'Tier 3: Near Prime (B)', 'Acceptable risk profile with mild structural leverage or debt limits.'
    elif pd_score < 0.50:
        return 'Tier 4: Subprime Caution (C)', 'Elevated risk of default; requires conditional collateral or co-borrower.'
    elif pd_score < 0.70:
        return 'Tier 5: High Risk (D)', 'Substantial probability of default; underwriting review or loan restructuring needed.'
    else:
        return 'Tier 6: Severe Risk (F)', 'High default risk exceeding institutional risk appetite.'

def determine_approval_decision(pd_score, dti, derogatory_records, prior_default):
    if prior_default == 'Y' and pd_score > 0.45:
        return 'DECLINED', 'Severe historical credit delinquency on bureau record.', 'danger'
    if pd_score <= 0.22 and dti <= 43.0 and derogatory_records == 0:
        return 'APPROVED', 'Applicant satisfies prime underwriting criteria.', 'success'
    elif pd_score <= 0.38 and dti <= 50.0:
        return 'CONDITIONALLY APPROVED', 'Approved subject to verification of assets, income, and debt-service cap.', 'warning'
    elif pd_score <= 0.55:
        return 'UNDER MANUAL REVIEW', 'Application queued for secondary underwriter verification or restructuring.', 'info'
    else:
        return 'DECLINED', 'Application exceeds maximum acceptable risk threshold (PD > 55%).', 'danger'

def explain_loan_application(input_data: dict):
    """
    Evaluates applicant, computes probability of default (PD),
    extracts local SHAP feature attributions, and returns structured XAI report.
    """
    bundle, explainer = get_bundle()
    preprocessor = bundle['preprocessor']
    champion_model = bundle['champion_model']
    all_feature_names = bundle['all_feature_names']
    
    # Calculate derived features if missing
    loan_amnt = float(input_data.get('loan_amnt', 10000))
    person_income = max(float(input_data.get('person_income', 50000)), 1000)
    down_payment = float(input_data.get('down_payment', 0))
    loan_int_rate = float(input_data.get('loan_int_rate', 11.5))
    loan_term_months = int(input_data.get('loan_term_months', 36))
    
    input_copy = dict(input_data)
    input_copy['loan_percent_income'] = round(loan_amnt / person_income, 3)
    
    # Create DataFrame for single row
    df_row = pd.DataFrame([input_copy])
    
    # Transform row
    X_trans = preprocessor.transform(df_row)
    
    # Predict default probability
    probs = champion_model.predict_proba(X_trans)[0]
    pd_score = float(probs[1]) # probability of default
    approval_odds = round((1.0 - pd_score) * 100.0, 1)
    
    # Calculate SHAP values
    shap_vals = explainer.shap_values(X_trans)
    if isinstance(shap_vals, list):
        shap_vals_class1 = shap_vals[1][0]
    elif len(shap_vals.shape) == 2:
        shap_vals_class1 = shap_vals[0]
    else:
        shap_vals_class1 = shap_vals[0, :, 1]
        
    expected_value = explainer.expected_value
    if isinstance(expected_value, (list, np.ndarray)):
        expected_val_class1 = float(expected_value[1] if len(expected_value) > 1 else expected_value[0])
    else:
        expected_val_class1 = float(expected_value)

    # Map SHAP values to features
    # Since One-Hot encoding expands categoricals, aggregate categorical impacts back to original features
    cat_features = bundle['categorical_features']
    num_features = bundle['numeric_features']
    
    feature_impacts = []
    
    # Process encoded features
    cat_encoder = preprocessor.named_transformers_['cat']
    encoded_cat_names = list(cat_encoder.get_feature_names_out(cat_features))
    
    # Map encoded categorical indices
    cat_shap_sum = {cat: 0.0 for cat in cat_features}
    for i, enc_name in enumerate(encoded_cat_names):
        val = float(shap_vals_class1[i])
        for cat in cat_features:
            if enc_name.startswith(cat + '_'):
                cat_shap_sum[cat] += val
                
    for cat in cat_features:
        actual_val = str(input_copy.get(cat, ''))
        shap_v = cat_shap_sum[cat]
        meta = FEATURE_DICTIONARY.get(cat, {'label': cat, 'unit': '', 'category': 'General'})
        feature_impacts.append({
            'feature': cat,
            'label': meta['label'],
            'category': meta['category'],
            'actual_value': actual_val,
            'unit': meta['unit'],
            'shap_value': round(shap_v, 4),
            'direction': 'increases_risk' if shap_v > 0 else 'lowers_risk',
            'abs_impact': abs(round(shap_v, 4))
        })
        
    # Process numeric features
    offset = len(encoded_cat_names)
    for j, num in enumerate(num_features):
        idx = offset + j
        shap_v = float(shap_vals_class1[idx])
        actual_val = input_copy.get(num, 0)
        meta = FEATURE_DICTIONARY.get(num, {'label': num, 'unit': '', 'category': 'General'})
        feature_impacts.append({
            'feature': num,
            'label': meta['label'],
            'category': meta['category'],
            'actual_value': actual_val,
            'unit': meta['unit'],
            'shap_value': round(shap_v, 4),
            'direction': 'increases_risk' if shap_v > 0 else 'lowers_risk',
            'abs_impact': abs(round(shap_v, 4))
        })

    # Sort impacts by absolute magnitude
    feature_impacts.sort(key=lambda x: x['abs_impact'], reverse=True)
    
    # Separate top risk drivers (positive SHAP = pushes toward default) vs protective factors (negative SHAP = pulls toward safety)
    top_adverse_drivers = [f for f in feature_impacts if f['shap_value'] > 0.01]
    top_protective_drivers = [f for f in feature_impacts if f['shap_value'] < -0.01]
    
    # Generate Adverse Action Reasons (FCRA / ECOA regulatory compliance)
    adverse_notices = []
    adverse_templates = {
        'credit_score': "Credit bureau score ({val} FICO) is below the threshold for preferred terms.",
        'dti_ratio': "Debt-to-Income ratio ({val}%) exceeds maximum allowable portfolio ceiling (recommended <36%).",
        'loan_percent_income': "Requested loan amount equals {val:.1%} of annual gross household income.",
        'loan_amnt': "Principal loan amount (${val:,.0f}) requires higher tier equity or collateral enhancement.",
        'loan_int_rate': "Assigned interest rate ({val}%) reflects elevated historical default probability.",
        'derogatory_records': "Bureau report reflects {val} adverse derogatory item(s) or collection proceedings.",
        'cb_person_default_on_file': "Credit bureau report contains a prior history of loan default.",
        'person_emp_length': "Current continuous employment tenure ({val} yrs) is under institutional stability standard.",
        'liquid_assets': "Liquid reserve liquidity (${val:,.0f}) is insufficient to support debt service under shock.",
        'collateral_value': "Unsecured exposure exceeds pledged asset coverage ratio."
    }
    
    for item in top_adverse_drivers[:4]:
        feat = item['feature']
        val = item['actual_value']
        if feat in adverse_templates:
            try:
                msg = adverse_templates[feat].format(val=val)
            except Exception:
                msg = f"{item['label']} ({val}) is currently exerting upward pressure on credit default risk."
        else:
            msg = f"{item['label']} ({val}) increases projected risk profile."
        adverse_notices.append({
            'code': feat.upper(),
            'factor': item['label'],
            'value': val,
            'unit': item['unit'],
            'impact_weight': item['abs_impact'],
            'notice_text': msg
        })

    # Calculate Basel Metrics
    # Exposure at Default: Principal - Down Payment
    net_exposure = max(0.0, loan_amnt - down_payment)
    # LGD standard 45% for personal/unsecured
    lgd = 0.45 if input_copy.get('collateral_value', 0) < loan_amnt else 0.20
    expected_loss = round(pd_score * lgd * net_exposure, 2)
    monthly_payment = calculate_monthly_installment(net_exposure, loan_int_rate, loan_term_months)
    
    tier_name, tier_desc = determine_credit_tier(pd_score)
    decision, decision_rationale, decision_variant = determine_approval_decision(
        pd_score,
        float(input_copy.get('dti_ratio', 25.0)),
        int(input_copy.get('derogatory_records', 0)),
        str(input_copy.get('cb_person_default_on_file', 'N'))
    )

    # Base log-odds converted to base probability
    base_probability = round(1.0 / (1.0 + np.exp(-expected_val_class1)), 3)

    return {
        'probability_of_default': round(pd_score, 4),
        'approval_odds_percentage': approval_odds,
        'decision': decision,
        'decision_rationale': decision_rationale,
        'decision_variant': decision_variant,
        'credit_tier': tier_name,
        'credit_tier_desc': tier_desc,
        'monthly_installment': monthly_payment,
        'net_exposure_at_default': net_exposure,
        'expected_loss_basel': expected_loss,
        'loss_given_default_rate': lgd,
        'base_expected_value_logodds': round(expected_val_class1, 4),
        'base_default_rate': base_probability,
        'feature_attributions': feature_impacts,
        'top_adverse_drivers': top_adverse_drivers[:5],
        'top_protective_drivers': top_protective_drivers[:5],
        'adverse_action_notices': adverse_notices,
        'input_snapshot': input_copy
    }

if __name__ == '__main__':
    # Test sample
    test_applicant = {
        'person_age': 32,
        'person_income': 65000,
        'person_home_ownership': 'RENT',
        'person_emp_length': 4.0,
        'loan_intent': 'DEBTCONSOLIDATION',
        'loan_amnt': 18000,
        'loan_term_months': 36,
        'down_payment': 1500,
        'loan_int_rate': 12.8,
        'credit_score': 640,
        'dti_ratio': 42.5,
        'cb_person_default_on_file': 'N',
        'cb_person_cred_hist_length': 6.5,
        'open_credit_lines': 8,
        'derogatory_records': 0,
        'liquid_assets': 4500,
        'collateral_value': 0
    }
    res = explain_loan_application(test_applicant)
    print("Test applicant PD:", res['probability_of_default'])
    print("Decision:", res['decision'])
    print("Top adverse drivers:", [d['label'] for d in res['top_adverse_drivers']])
