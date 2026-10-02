"""
What-If Risk Simulation & Counterfactual Optimizer.
Enables real-time risk recalculation and automatically discovers minimal-cost
actionable paths (counterfactuals) to flip a Declined or High-Risk application to Approved.
"""

from xai_engine import explain_loan_application

def simulate_what_if(base_input: dict, modifications: dict):
    """
    Applies custom scenario tweaks and computes before/after deltas.
    """
    modified_input = dict(base_input)
    modified_input.update(modifications)
    
    baseline_result = explain_loan_application(base_input)
    simulated_result = explain_loan_application(modified_input)
    
    # Compute deltas
    pd_delta = round(simulated_result['probability_of_default'] - baseline_result['probability_of_default'], 4)
    approval_delta = round(simulated_result['approval_odds_percentage'] - baseline_result['approval_odds_percentage'], 1)
    emi_delta = round(simulated_result['monthly_installment'] - baseline_result['monthly_installment'], 2)
    expected_loss_delta = round(simulated_result['expected_loss_basel'] - baseline_result['expected_loss_basel'], 2)
    
    return {
        'baseline': {
            'probability_of_default': baseline_result['probability_of_default'],
            'approval_odds_percentage': baseline_result['approval_odds_percentage'],
            'decision': baseline_result['decision'],
            'credit_tier': baseline_result['credit_tier'],
            'monthly_installment': baseline_result['monthly_installment'],
            'expected_loss_basel': baseline_result['expected_loss_basel']
        },
        'simulated': simulated_result,
        'deltas': {
            'pd_delta': pd_delta,
            'approval_delta': approval_delta,
            'monthly_payment_delta': emi_delta,
            'expected_loss_delta': expected_loss_delta,
            'status_changed': baseline_result['decision'] != simulated_result['decision']
        },
        'modifications_applied': modifications
    }

def find_optimal_counterfactuals(base_input: dict):
    """
    Searches for practical, actionable adjustments that flip the decision
    into APPROVED or CONDITIONALLY APPROVED.
    """
    current_eval = explain_loan_application(base_input)
    if current_eval['decision'] == 'APPROVED':
        return {
            'already_approved': True,
            'message': 'Application is already approved! No counterfactual modification required.',
            'current_status': current_eval['decision'],
            'current_odds': current_eval['approval_odds_percentage'],
            'counterfactuals': []
        }
    
    curr_pd = current_eval['probability_of_default']
    curr_loan_amnt = float(base_input.get('loan_amnt', 10000))
    curr_down = float(base_input.get('down_payment', 0))
    curr_dti = float(base_input.get('dti_ratio', 35.0))
    curr_score = int(base_input.get('credit_score', 650))
    curr_collateral = float(base_input.get('collateral_value', 0))
    curr_income = float(base_input.get('person_income', 50000))
    curr_term = int(base_input.get('loan_term_months', 36))
    curr_derog = int(base_input.get('derogatory_records', 0))
    
    candidates = []
    
    # 1. Down Payment Lever
    for add_down_pct in [0.10, 0.15, 0.20, 0.25, 0.35, 0.50]:
        new_down = round(curr_down + (curr_loan_amnt * add_down_pct), -2)
        mod = {'down_payment': new_down}
        res = explain_loan_application({**base_input, **mod})
        if res['decision'] in ['APPROVED', 'CONDITIONALLY APPROVED']:
            candidates.append({
                'strategy_name': 'Equity / Down Payment Boost',
                'strategy_type': 'DOWN_PAYMENT',
                'description': f"Increase cash down payment by ${new_down - curr_down:,.0f} (to ${new_down:,.0f} total).",
                'action_requirement': f"Provide an additional ${new_down - curr_down:,.0f} upfront cash equity.",
                'new_decision': res['decision'],
                'new_pd': res['probability_of_default'],
                'new_approval_odds': res['approval_odds_percentage'],
                'risk_reduction_pct': round((curr_pd - res['probability_of_default']) * 100, 1),
                'new_monthly_payment': res['monthly_installment'],
                'effort_level': 'Low' if (new_down - curr_down) < 4000 else 'Medium',
                'timeline': 'Immediate (1-3 days)',
                'modifications': mod
            })
            break

    # 2. Revolving Debt Paydown (DTI Reduction)
    monthly_inc = max(1000.0, curr_income / 12.0)
    for target_dti in [38.0, 32.0, 28.0, 24.0, 18.0]:
        if target_dti < curr_dti:
            dti_drop = curr_dti - target_dti
            monthly_debt_reduction = round((dti_drop / 100.0) * monthly_inc, 0)
            mod = {'dti_ratio': target_dti}
            res = explain_loan_application({**base_input, **mod})
            if res['decision'] in ['APPROVED', 'CONDITIONALLY APPROVED']:
                approx_revolving_payoff = round(monthly_debt_reduction * 26, -2)
                candidates.append({
                    'strategy_name': 'Revolving Debt Paydown (DTI Optimization)',
                    'strategy_type': 'DTI_REDUCTION',
                    'description': f"Lower existing monthly debt obligations by ~${monthly_debt_reduction:,.0f}/mo (reducing DTI from {curr_dti:.1f}% to {target_dti:.1f}%).",
                    'action_requirement': f"Pay down approximately ${approx_revolving_payoff:,.0f} across outstanding credit cards or short-term debt.",
                    'new_decision': res['decision'],
                    'new_pd': res['probability_of_default'],
                    'new_approval_odds': res['approval_odds_percentage'],
                    'risk_reduction_pct': round((curr_pd - res['probability_of_default']) * 100, 1),
                    'new_monthly_payment': res['monthly_installment'],
                    'effort_level': 'Medium',
                    'timeline': '30 - 60 Days',
                    'modifications': mod
                })
                break

    # 3. Loan Principal Downsizing
    for reduce_pct in [0.15, 0.25, 0.35, 0.50]:
        new_loan_amnt = round(curr_loan_amnt * (1.0 - reduce_pct), -2)
        mod = {'loan_amnt': new_loan_amnt}
        res = explain_loan_application({**base_input, **mod})
        if res['decision'] in ['APPROVED', 'CONDITIONALLY APPROVED']:
            candidates.append({
                'strategy_name': 'Borrowing Amount Right-Sizing',
                'strategy_type': 'LOAN_AMOUNT',
                'description': f"Adjust requested loan from ${curr_loan_amnt:,.0f} down to ${new_loan_amnt:,.0f}.",
                'action_requirement': f"Reduce loan size by ${curr_loan_amnt - new_loan_amnt:,.0f} to match institutional debt limits.",
                'new_decision': res['decision'],
                'new_pd': res['probability_of_default'],
                'new_approval_odds': res['approval_odds_percentage'],
                'risk_reduction_pct': round((curr_pd - res['probability_of_default']) * 100, 1),
                'new_monthly_payment': res['monthly_installment'],
                'effort_level': 'Low',
                'timeline': 'Immediate',
                'modifications': mod
            })
            break

    # 4. Multi-Lever Restructure: Extended Term + Asset Pledge + Moderate Down Payment
    target_terms = [48, 60] if curr_term < 48 else [60]
    for term in target_terms:
        add_collateral = max(6000.0, round(curr_loan_amnt * 0.35, -2))
        mod = {
            'loan_term_months': term,
            'collateral_value': curr_collateral + add_collateral,
            'down_payment': round(curr_down + (curr_loan_amnt * 0.12), -2),
            'dti_ratio': max(25.0, curr_dti - 8.0)
        }
        res = explain_loan_application({**base_input, **mod})
        if res['decision'] in ['APPROVED', 'CONDITIONALLY APPROVED']:
            candidates.append({
                'strategy_name': 'Secured Collateral & Term Restructuring',
                'strategy_type': 'RESTRUCTURE',
                'description': f"Extend term to {term} months, pledge ${add_collateral:,.0f} in collateral asset, and add 12% down payment.",
                'action_requirement': "Pledge asset/vehicle security and choose longer tenure to reduce monthly debt servicing risk.",
                'new_decision': res['decision'],
                'new_pd': res['probability_of_default'],
                'new_approval_odds': res['approval_odds_percentage'],
                'risk_reduction_pct': round((curr_pd - res['probability_of_default']) * 100, 1),
                'new_monthly_payment': res['monthly_installment'],
                'effort_level': 'Medium',
                'timeline': '7 - 14 Days',
                'modifications': mod
            })
            break

    # 5. Bureau Delinquency Resolution + Score Target (if derogatory marks exist)
    if curr_derog > 0:
        mod = {
            'derogatory_records': 0,
            'credit_score': min(850, curr_score + 40),
            'dti_ratio': max(28.0, curr_dti - 5.0)
        }
        res = explain_loan_application({**base_input, **mod})
        if res['decision'] in ['APPROVED', 'CONDITIONALLY APPROVED']:
            candidates.append({
                'strategy_name': 'Bureau Record Cleansing & Dispute Resolution',
                'strategy_type': 'BUREAU_CLEANSE',
                'description': f"Resolve {curr_derog} collection/derogatory mark(s) and raise credit score to {mod['credit_score']}.",
                'action_requirement': "Settle outstanding collection accounts or file formal disputes for inaccurate bureau reporting.",
                'new_decision': res['decision'],
                'new_pd': res['probability_of_default'],
                'new_approval_odds': res['approval_odds_percentage'],
                'risk_reduction_pct': round((curr_pd - res['probability_of_default']) * 100, 1),
                'new_monthly_payment': res['monthly_installment'],
                'effort_level': 'High',
                'timeline': '45 - 90 Days',
                'modifications': mod
            })

    # 6. Credit Bureau Score Milestone
    for score_boost in [35, 60, 90, 120]:
        new_score = min(850, curr_score + score_boost)
        mod = {'credit_score': new_score}
        res = explain_loan_application({**base_input, **mod})
        if res['decision'] in ['APPROVED', 'CONDITIONALLY APPROVED']:
            candidates.append({
                'strategy_name': 'Credit Score Optimization Milestone',
                'strategy_type': 'CREDIT_SCORE',
                'description': f"Improve credit score from {curr_score} to {new_score} (+{score_boost} pts).",
                'action_requirement': "Reduce revolving utilization below 15% and maintain flawless on-time payment track record.",
                'new_decision': res['decision'],
                'new_pd': res['probability_of_default'],
                'new_approval_odds': res['approval_odds_percentage'],
                'risk_reduction_pct': round((curr_pd - res['probability_of_default']) * 100, 1),
                'new_monthly_payment': res['monthly_installment'],
                'effort_level': 'High',
                'timeline': '60 - 120 Days',
                'modifications': mod
            })
            break

    # Guaranteed comprehensive restructuring candidate if list is still small
    if len(candidates) < 2:
        combo_mod = {
            'down_payment': round(curr_loan_amnt * 0.30, -2),
            'loan_amnt': round(curr_loan_amnt * 0.70, -2),
            'dti_ratio': max(22.0, curr_dti - 14.0),
            'loan_term_months': 60,
            'derogatory_records': 0,
            'credit_score': min(850, curr_score + 45)
        }
        res = explain_loan_application({**base_input, **combo_mod})
        candidates.append({
            'strategy_name': 'Full Holistic Underwriting Rehabilitation',
            'strategy_type': 'FULL_REHAB',
            'description': "Combine 30% down payment, 30% smaller loan amount, resolving bureau marks, and 60-month term.",
            'action_requirement': "Execute full financial rehabilitation package.",
            'new_decision': res['decision'],
            'new_pd': res['probability_of_default'],
            'new_approval_odds': res['approval_odds_percentage'],
            'risk_reduction_pct': round((curr_pd - res['probability_of_default']) * 100, 1),
            'new_monthly_payment': res['monthly_installment'],
            'effort_level': 'High',
            'timeline': '90 - 180 Days',
            'modifications': combo_mod
        })

    return {
        'already_approved': False,
        'current_status': current_eval['decision'],
        'current_odds': current_eval['approval_odds_percentage'],
        'counterfactuals': candidates
    }
