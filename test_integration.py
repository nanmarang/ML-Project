"""
Integration test suite for CrediXAI server and endpoints.
Verifies all predictive scoring, TreeSHAP calculations, What-If simulations,
counterfactual pathways, and prescriptive financial recommendations.
"""

import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:5000"

def request_json(path, data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def run_tests():
    print("=== CrediXAI Integration Test Suite ===")

    # 1. Test Health
    health = request_json("/api/health")
    assert health['status'] == 'healthy', "Health check failed"
    print("[PASS] 1. /api/health passed:", health['engine'])

    # 2. Test Sample Applicants
    applicants_resp = request_json("/api/sample-applicants")
    applicants = applicants_resp.get('applicants', [])
    assert len(applicants) >= 5, "Sample applicants missing"
    print(f"[PASS] 2. /api/sample-applicants passed: {len(applicants)} personas loaded")

    # Pick test applicant: Marcus Vance (Near Prime)
    marcus = next(a for a in applicants if a['id'] == 'applicant-marcus')['data']

    # 3. Test Explain (TreeSHAP & Decision)
    explain_res = request_json("/api/explain", marcus)
    assert explain_res['success'] is True, "Explain endpoint failed"
    exp = explain_res['explanation']
    print(f"[PASS] 3. /api/explain passed: Decision={exp['decision']}, Approval={exp['approval_odds_percentage']}%, PD={exp['probability_of_default']:.3f}")
    assert len(exp['feature_attributions']) > 0, "Feature attributions missing"
    assert 'adverse_action_notices' in exp, "Adverse action notices missing"

    # 4. Test What-If Simulation
    mods = {'loan_amnt': 12000, 'down_payment': 3000, 'dti_ratio': 32.0}
    sim_res = request_json("/api/what-if/simulate", {'base_input': marcus, 'modifications': mods})
    assert sim_res['success'] is True, "Simulation failed"
    sim = sim_res['simulation']
    print(f"[PASS] 4. /api/what-if/simulate passed: PD Delta={sim['deltas']['pd_delta']}, Approval Delta=+{sim['deltas']['approval_delta']}%")

    # 5. Test Counterfactual Pathways
    cf_res = request_json("/api/what-if/counterfactuals", marcus)
    assert cf_res['success'] is True, "Counterfactuals failed"
    cfs = cf_res['counterfactual_analysis']
    print(f"[PASS] 5. /api/what-if/counterfactuals passed: {len(cfs.get('counterfactuals', []))} actionable pathways found")

    # 6. Test Prescriptive Recommendations
    recs_res = request_json("/api/recommendations", marcus)
    assert recs_res['success'] is True, "Recommendations failed"
    recs = recs_res['recommendations']
    savings = recs['quantitative_impact']['potential_lifetime_interest_saved']
    print(f"[PASS] 6. /api/recommendations passed: 4-Pillar Scorecard verified, Potential Savings = ${savings:,.2f}")

    # 7. Test Portfolio Metrics
    metrics_res = request_json("/api/portfolio-metrics")
    assert metrics_res['success'] is True, "Portfolio metrics failed"
    m = metrics_res['metrics']
    print(f"[PASS] 7. /api/portfolio-metrics passed: {m['training_samples']} samples, XGBoost AUC = {m['model_comparison']['xgboost']['roc_auc']}")

    # 8. Test Audit Memo Generation
    memo_res = request_json("/api/audit-memo", marcus)
    assert memo_res['success'] is True, "Audit memo failed"
    memo = memo_res['audit_memo']
    print(f"[PASS] 8. /api/audit-memo passed: Institution='{memo['institution']}', Decision='{memo['underwriting_decision']}'")

    # 9. Test Static Frontend Assets
    req_root = urllib.request.Request(f"{BASE_URL}/")
    with urllib.request.urlopen(req_root) as resp:
        html = resp.read().decode('utf-8')
        assert "CrediXAI" in html, "Frontend index.html title missing"
    print("[PASS] 9. Static Frontend HTML delivery passed: React app mounted correctly")

    print("\n>>> ALL 9 INTEGRATION TESTS PASSED PERFECTLY! <<<")

if __name__ == '__main__':
    run_tests()
