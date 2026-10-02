"""
Flask REST API for Explainable AI Loan Approval & Default Risk Prediction.
Provides predictive scoring, SHAP local/global explanations, What-If counterfactual simulation,
prescriptive financial recommendations, and underwriting compliance audit reports.
"""

import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from xai_engine import explain_loan_application
from counterfactual_optimizer import simulate_what_if, find_optimal_counterfactuals
from recommendation_engine import generate_personalized_recommendations

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
META_PATH = os.path.join(MODELS_DIR, 'model_metadata.json')

# Predefined Applicant Personas for quick one-click testing
SAMPLE_APPLICANTS = [
    {
        'id': 'applicant-elena',
        'name': 'Elena Rostova',
        'persona_tag': 'Prime Superb (A+)',
        'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        'role': 'Senior Software Architect',
        'highlight': 'High income, clean credit history, 785 FICO score, minimal debt burden.',
        'data': {
            'person_age': 35,
            'person_income': 145000,
            'person_home_ownership': 'MORTGAGE',
            'person_emp_length': 8.5,
            'loan_intent': 'HOMEIMPROVEMENT',
            'loan_amnt': 35000,
            'loan_term_months': 36,
            'down_payment': 5000,
            'loan_int_rate': 7.2,
            'credit_score': 785,
            'dti_ratio': 18.5,
            'cb_person_default_on_file': 'N',
            'cb_person_cred_hist_length': 12.0,
            'open_credit_lines': 11,
            'derogatory_records': 0,
            'liquid_assets': 52000,
            'collateral_value': 180000
        }
    },
    {
        'id': 'applicant-marcus',
        'name': 'Marcus Vance',
        'persona_tag': 'Near Prime (Borderline)',
        'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        'role': 'Commercial Contractor',
        'highlight': 'Solid trade income ($74k), but elevated DTI (42.5%) and 645 FICO score.',
        'data': {
            'person_age': 41,
            'person_income': 74000,
            'person_home_ownership': 'RENT',
            'person_emp_length': 5.0,
            'loan_intent': 'DEBTCONSOLIDATION',
            'loan_amnt': 18000,
            'loan_term_months': 36,
            'down_payment': 1500,
            'loan_int_rate': 12.9,
            'credit_score': 645,
            'dti_ratio': 42.5,
            'cb_person_default_on_file': 'N',
            'cb_person_cred_hist_length': 7.5,
            'open_credit_lines': 9,
            'derogatory_records': 0,
            'liquid_assets': 6500,
            'collateral_value': 0
        }
    },
    {
        'id': 'applicant-chloe',
        'name': 'Chloe Martinez',
        'persona_tag': 'Young Graduate (Thin File)',
        'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'role': 'Junior UX Designer',
        'highlight': 'Entry salary ($45k), short credit file (2.5 yrs), modest loan request.',
        'data': {
            'person_age': 24,
            'person_income': 45000,
            'person_home_ownership': 'RENT',
            'person_emp_length': 1.5,
            'loan_intent': 'EDUCATION',
            'loan_amnt': 8500,
            'loan_term_months': 24,
            'down_payment': 800,
            'loan_int_rate': 11.2,
            'credit_score': 675,
            'dti_ratio': 26.0,
            'cb_person_default_on_file': 'N',
            'cb_person_cred_hist_length': 2.5,
            'open_credit_lines': 4,
            'derogatory_records': 0,
            'liquid_assets': 4200,
            'collateral_value': 0
        }
    },
    {
        'id': 'applicant-derrick',
        'name': 'Derrick Hayes',
        'persona_tag': 'High Risk / Subprime',
        'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'role': 'Logistics Warehouse Lead',
        'highlight': 'Past collection record, 565 FICO, 48.0% DTI; ideal for What-If Rehabilitation.',
        'data': {
            'person_age': 38,
            'person_income': 52000,
            'person_home_ownership': 'RENT',
            'person_emp_length': 3.0,
            'loan_intent': 'PERSONAL',
            'loan_amnt': 22000,
            'loan_term_months': 36,
            'down_payment': 500,
            'loan_int_rate': 18.5,
            'credit_score': 565,
            'dti_ratio': 48.0,
            'cb_person_default_on_file': 'N',
            'cb_person_cred_hist_length': 6.0,
            'open_credit_lines': 8,
            'derogatory_records': 1,
            'liquid_assets': 2100,
            'collateral_value': 0
        }
    },
    {
        'id': 'applicant-aisha',
        'name': 'Aisha Patel',
        'persona_tag': 'Consultant / Entrepreneur',
        'avatar': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        'role': 'Independent Growth Consultant',
        'highlight': 'High revenue ($92k), strong credit score (715), larger expansion loan request.',
        'data': {
            'person_age': 31,
            'person_income': 92000,
            'person_home_ownership': 'RENT',
            'person_emp_length': 4.0,
            'loan_intent': 'VENTURE',
            'loan_amnt': 38000,
            'loan_term_months': 48,
            'down_payment': 3500,
            'loan_int_rate': 10.4,
            'credit_score': 715,
            'dti_ratio': 33.0,
            'cb_person_default_on_file': 'N',
            'cb_person_cred_hist_length': 8.0,
            'open_credit_lines': 12,
            'derogatory_records': 0,
            'liquid_assets': 24000,
            'collateral_value': 15000
        }
    }
]

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'engine': 'CrediXAI Underwriting Intelligence 2.0',
        'version': '2.4.0',
        'models_available': ['xgboost', 'random_forest', 'logistic_regression'],
        'xai_methodology': 'TreeSHAP (Tree-based Shapley Additive Explanations)'
    })

@app.route('/api/sample-applicants', methods=['GET'])
def get_sample_applicants():
    return jsonify({'applicants': SAMPLE_APPLICANTS})

@app.route('/api/predict', methods=['POST'])
def predict_loan():
    data = request.json or {}
    try:
        result = explain_loan_application(data)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/explain', methods=['POST'])
def explain_applicant():
    data = request.json or {}
    try:
        result = explain_loan_application(data)
        return jsonify({'success': True, 'explanation': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/what-if/simulate', methods=['POST'])
def simulate_scenario():
    payload = request.json or {}
    base_data = payload.get('base_input', {})
    modifications = payload.get('modifications', {})
    try:
        sim_result = simulate_what_if(base_data, modifications)
        return jsonify({'success': True, 'simulation': sim_result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/what-if/counterfactuals', methods=['POST'])
def get_counterfactuals():
    data = request.json or {}
    try:
        cf_results = find_optimal_counterfactuals(data)
        return jsonify({'success': True, 'counterfactual_analysis': cf_results})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json or {}
    try:
        recs = generate_personalized_recommendations(data)
        return jsonify({'success': True, 'recommendations': recs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/portfolio-metrics', methods=['GET'])
def get_portfolio_metrics():
    try:
        if os.path.exists(META_PATH):
            with open(META_PATH, 'r') as f:
                meta = json.load(f)
            return jsonify({'success': True, 'metrics': meta})
        else:
            return jsonify({'success': False, 'error': 'Metadata file not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/audit-memo', methods=['POST'])
def generate_audit_memo():
    data = request.json or {}
    try:
        eval_result = explain_loan_application(data)
        recs = generate_personalized_recommendations(data)
        cf_results = find_optimal_counterfactuals(data)
        
        memo = {
            'institution': 'CrediXAI Algorithmic Credit Governance',
            'audit_standard': 'SR 11-7 / OCC Model Risk Management & ECOA/FCRA',
            'timestamp': '2026-10-01T23:00:00Z',
            'underwriting_decision': eval_result['decision'],
            'probability_of_default': f"{eval_result['probability_of_default']:.2%}",
            'credit_tier': eval_result['credit_tier'],
            'basel_expected_loss': f"${eval_result['expected_loss_basel']:,.2f}",
            'primary_risk_drivers': [d['label'] for d in eval_result['top_adverse_drivers']],
            'primary_protective_factors': [d['label'] for d in eval_result['top_protective_drivers']],
            'regulatory_adverse_action_notices': eval_result['adverse_action_notices'],
            'counterfactual_pathways_count': len(cf_results.get('counterfactuals', [])),
            'prescriptive_savings_potential': f"${recs['quantitative_impact']['potential_lifetime_interest_saved']:,.2f}",
            'applicant_summary': {
                'income': f"${float(data.get('person_income', 0)):,.0f}",
                'loan_amount': f"${float(data.get('loan_amnt', 0)):,.0f}",
                'credit_score': data.get('credit_score'),
                'dti_ratio': f"{float(data.get('dti_ratio', 0)):.1f}%",
                'home_ownership': data.get('person_home_ownership')
            }
        }
        return jsonify({'success': True, 'audit_memo': memo})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# Catch-all to serve React production build
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({
        'message': 'CrediXAI API backend is running. Frontend dev server is active on port 5173.'
    })

if __name__ == '__main__':
    print("Starting CrediXAI Flask Server on http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=False)
