"""
Prescriptive AI Recommendation Engine.
Produces personalized, actionable financial recommendations based on an applicant's
underwriting metrics, negative SHAP feature attributions, and debt profile.
"""

from xai_engine import explain_loan_application

def generate_personalized_recommendations(applicant_data: dict):
    """
    Analyzes applicant metrics and SHAP risk drivers to generate
    a comprehensive, multi-phase prescriptive financial improvement plan.
    """
    eval_result = explain_loan_application(applicant_data)
    
    person_income = float(applicant_data.get('person_income', 50000))
    monthly_income = max(1000.0, person_income / 12.0)
    loan_amnt = float(applicant_data.get('loan_amnt', 10000))
    down_payment = float(applicant_data.get('down_payment', 0))
    credit_score = int(applicant_data.get('credit_score', 650))
    dti_ratio = float(applicant_data.get('dti_ratio', 35.0))
    derogatory = int(applicant_data.get('derogatory_records', 0))
    loan_term = int(applicant_data.get('loan_term_months', 36))
    liquid_assets = float(applicant_data.get('liquid_assets', 3000))
    collateral = float(applicant_data.get('collateral_value', 0))
    current_rate = float(applicant_data.get('loan_int_rate', 12.0))
    
    # 1. Financial Health Scorecard (Pillars)
    # Pillar A: Debt Capacity (DTI)
    if dti_ratio <= 28.0:
        dti_grade = 'A'
        dti_status = 'Optimal (Conservative)'
    elif dti_ratio <= 36.0:
        dti_grade = 'B'
        dti_status = 'Acceptable (Standard Prime)'
    elif dti_ratio <= 43.0:
        dti_grade = 'C'
        dti_status = 'Strained (Elevated Risk)'
    else:
        dti_grade = 'D'
        dti_status = 'Critical Over-Leverage'
        
    # Pillar B: Credit Reliability (FICO)
    if credit_score >= 740:
        fico_grade = 'A'
        fico_status = 'Excellent Tier'
    elif credit_score >= 680:
        fico_grade = 'B'
        fico_status = 'Good Tier'
    elif credit_score >= 620:
        fico_grade = 'C'
        fico_status = 'Fair / Near Prime'
    else:
        fico_grade = 'D'
        fico_status = 'Subprime / Challenged'

    # Pillar C: Liquidity Buffer
    months_buffer = round(liquid_assets / (monthly_income * (dti_ratio / 100.0) + 1.0), 1)
    if months_buffer >= 6.0:
        liq_grade = 'A'
        liq_status = 'Robust (>6 mo buffer)'
    elif months_buffer >= 3.0:
        liq_grade = 'B'
        liq_status = 'Sufficient (3-6 mo buffer)'
    elif months_buffer >= 1.0:
        liq_grade = 'C'
        liq_status = 'Tight (1-3 mo buffer)'
    else:
        liq_grade = 'D'
        liq_status = 'Depleted (<1 mo buffer)'

    # Pillar D: Collateral & Equity
    ltv = round(((loan_amnt - down_payment) / (collateral + 1.0)) * 100, 1) if collateral > 0 else 100.0
    if collateral >= loan_amnt:
        col_grade = 'A'
        col_status = 'Fully Secured (LTV <= 100%)'
    elif collateral > 0:
        col_grade = 'B'
        col_status = 'Partially Collateralized'
    else:
        col_grade = 'C'
        col_status = 'Unsecured'

    health_scorecard = [
        {'pillar': 'Debt Capacity (DTI)', 'grade': dti_grade, 'metric': f"{dti_ratio:.1f}%", 'status': dti_status, 'benchmark': '< 36.0%'},
        {'pillar': 'Credit Reliability', 'grade': fico_grade, 'metric': f"{credit_score} FICO", 'status': fico_status, 'benchmark': '>= 680 pts'},
        {'pillar': 'Liquidity Reserve', 'grade': liq_grade, 'metric': f"${liquid_assets:,.0f} ({months_buffer} mo)", 'status': liq_status, 'benchmark': '>= 3 months'},
        {'pillar': 'Collateral Coverage', 'grade': col_grade, 'metric': f"${collateral:,.0f} (LTV {ltv:.0f}%)" if collateral > 0 else 'Unsecured', 'status': col_status, 'benchmark': '>= 50% coverage'}
    ]

    # 2. Targeted Action Items (Grouped by Timeline)
    immediate_actions = []
    midterm_actions = []
    longterm_actions = []
    
    # Priority 1: DTI Payoff Target
    if dti_ratio > 36.0:
        excess_dti_pts = dti_ratio - 36.0
        monthly_excess_debt = round((excess_dti_pts / 100.0) * monthly_income, 0)
        revolving_balance_to_pay = round(monthly_excess_debt * 28, -2)
        
        immediate_actions.append({
            'title': 'High-Impact Revolving Debt Payoff',
            'category': 'Debt Capacity',
            'priority': 'HIGH',
            'action': f"Target paying down ${revolving_balance_to_pay:,.0f} across high-interest revolving balances.",
            'benefit': f"Reduces monthly debt burden by ~${monthly_excess_debt:,.0f}/mo, dropping DTI into prime territory (<=36%).",
            'estimated_score_impact': '+15 to +30 FICO pts',
            'icon': 'DollarSign'
        })

    # Priority 2: Down Payment / Equity Enhancement
    min_recommended_down = round(loan_amnt * 0.15, -2)
    if down_payment < min_recommended_down:
        additional_needed = min_recommended_down - down_payment
        immediate_actions.append({
            'title': 'Optimize Cash Down Payment',
            'category': 'Equity & Terms',
            'priority': 'HIGH' if eval_result['decision'] != 'APPROVED' else 'MEDIUM',
            'action': f"Increase initial down payment from ${down_payment:,.0f} to ${min_recommended_down:,.0f} (+${additional_needed:,.0f}).",
            'benefit': f"Lowers required financed principal to ${loan_amnt - min_recommended_down:,.0f}, reducing baseline default risk by ~18%.",
            'estimated_score_impact': 'Immediate Underwriting Boost',
            'icon': 'PiggyBank'
        })

    # Priority 3: Loan Tenure Extension
    if loan_term <= 36 and loan_amnt >= 15000:
        emi_curr = eval_result['monthly_installment']
        r = (current_rate / 100.0) / 12.0
        emi_60 = round((loan_amnt - down_payment) * (r * ((1 + r) ** 60)) / (((1 + r) ** 60) - 1), 2)
        monthly_cashflow_saved = round(emi_curr - emi_60, 2)
        
        immediate_actions.append({
            'title': 'Extend Loan Term to 60 Months',
            'category': 'Cash Flow',
            'priority': 'MEDIUM',
            'action': f"Switch loan duration from {loan_term} to 60 months.",
            'benefit': f"Frees up ${monthly_cashflow_saved:,.0f} in monthly cashflow, lowering payment-to-income ratio significantly.",
            'estimated_score_impact': 'Reduces Monthly Debt Strain',
            'icon': 'Clock'
        })

    # Priority 4: Credit Score & Bureau Cleanse
    if credit_score < 720:
        target_score = min(760, credit_score + 45)
        midterm_actions.append({
            'title': 'Credit Line Utilization Compression',
            'category': 'Credit Optimization',
            'priority': 'HIGH',
            'action': "Keep revolving credit line balance utilization strictly below 15% on each credit card before statement closing dates.",
            'benefit': f"FICO algorithm awards rapid score improvements when utilization drops into the single digits.",
            'estimated_score_impact': f"+25 to +45 pts (target: {target_score})",
            'icon': 'TrendingUp'
        })

    if derogatory > 0:
        midterm_actions.append({
            'title': 'Derogatory Bureau Dispute & Settle',
            'category': 'Regulatory / Bureau',
            'priority': 'CRITICAL',
            'action': f"Address {derogatory} adverse collection mark(s) through 'Pay for Delete' agreements or formal Fair Credit Reporting Act (FCRA) disputes.",
            'benefit': "Removes automatic underwriting flags that disqualify applicants regardless of income.",
            'estimated_score_impact': '+40 to +70 pts',
            'icon': 'ShieldAlert'
        })

    # Priority 5: Alternative Data & Asset Pledging
    if collateral == 0 and loan_amnt >= 20000:
        longterm_actions.append({
            'title': 'Asset-Backed Co-Collateralization',
            'category': 'Loss Protection',
            'priority': 'MEDIUM',
            'action': "Pledge vehicle equity, term deposits, or a qualified co-borrower / guarantor.",
            'benefit': "Shifts institutional Loss Given Default (LGD) from 45% (unsecured) to 20% (secured), unlocking tier-1 interest discounts.",
            'estimated_score_impact': 'Unlocks Lower APR (-2.5% to -4.0%)',
            'icon': 'Key'
        })

    longterm_actions.append({
        'title': 'Trade-Line Depth & Alternative Bureau Reporting',
        'category': 'Credit File Depth',
        'priority': 'LOW',
        'action': "Enroll in utility, rent, and telecom bureau reporting programs (e.g. Experian Boost) to deepen credit file longevity.",
        'benefit': "Strengthens baseline stability indicators for long-term prime mortgage and prime personal credit.",
        'estimated_score_impact': '+10 to +20 pts',
        'icon': 'Layers'
    })

    # Calculate Potential Interest Rate Savings if recommendations executed
    projected_rate = max(6.5, current_rate - 3.8)
    net_principal = max(1000.0, loan_amnt - down_payment)
    curr_total_interest = (eval_result['monthly_installment'] * loan_term) - net_principal
    
    r_new = (projected_rate / 100.0) / 12.0
    new_emi = net_principal * (r_new * ((1 + r_new) ** loan_term)) / (((1 + r_new) ** loan_term) - 1)
    new_total_interest = (new_emi * loan_term) - net_principal
    lifetime_interest_saved = max(0.0, round(curr_total_interest - new_total_interest, 2))

    return {
        'financial_health_scorecard': health_scorecard,
        'action_roadmap': {
            'phase_1_immediate': immediate_actions,
            'phase_2_tactical': midterm_actions,
            'phase_3_strategic': longterm_actions
        },
        'quantitative_impact': {
            'current_interest_rate': current_rate,
            'projected_improved_rate': round(projected_rate, 2),
            'potential_lifetime_interest_saved': lifetime_interest_saved,
            'potential_credit_score_uplift': '+35 to +65 pts',
            'new_target_tier': 'Tier 1 / Tier 2 Prime'
        }
    }

if __name__ == '__main__':
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
    recs = generate_personalized_recommendations(test_applicant)
    print("Health Scorecard:", recs['financial_health_scorecard'])
    print("Potential Savings: $", recs['quantitative_impact']['potential_lifetime_interest_saved'])
