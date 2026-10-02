import React, { useState, useEffect } from 'react';
import { 
  Sliders, RotateCcw, TrendingUp, TrendingDown, ArrowRight, 
  Sparkles, CheckCircle, AlertTriangle, ShieldCheck, Zap
} from 'lucide-react';

export default function WhatIfSimulator({ 
  baseApplicantData, 
  onSimulate, 
  simulationResult, 
  counterfactualAnalysis, 
  onLoadCounterfactuals 
}) {
  const [mods, setMods] = useState({
    loan_amnt: baseApplicantData?.loan_amnt || 15000,
    down_payment: baseApplicantData?.down_payment || 1000,
    loan_term_months: baseApplicantData?.loan_term_months || 36,
    dti_ratio: baseApplicantData?.dti_ratio || 35.0,
    credit_score: baseApplicantData?.credit_score || 650,
    collateral_value: baseApplicantData?.collateral_value || 0,
    loan_int_rate: baseApplicantData?.loan_int_rate || 12.0
  });

  // Keep mods in sync when base applicant changes
  useEffect(() => {
    if (baseApplicantData) {
      setMods({
        loan_amnt: baseApplicantData.loan_amnt,
        down_payment: baseApplicantData.down_payment,
        loan_term_months: baseApplicantData.loan_term_months,
        dti_ratio: baseApplicantData.dti_ratio,
        credit_score: baseApplicantData.credit_score,
        collateral_value: baseApplicantData.collateral_value,
        loan_int_rate: baseApplicantData.loan_int_rate
      });
    }
  }, [baseApplicantData]);

  // Trigger simulation whenever mods change
  useEffect(() => {
    const timer = setTimeout(() => {
      onSimulate(mods);
    }, 150);
    return () => clearTimeout(timer);
  }, [mods]);

  const handleSliderChange = (field, val) => {
    setMods(prev => ({ ...prev, [field]: Number(val) }));
  };

  const handleReset = () => {
    if (baseApplicantData) {
      setMods({
        loan_amnt: baseApplicantData.loan_amnt,
        down_payment: baseApplicantData.down_payment,
        loan_term_months: baseApplicantData.loan_term_months,
        dti_ratio: baseApplicantData.dti_ratio,
        credit_score: baseApplicantData.credit_score,
        collateral_value: baseApplicantData.collateral_value,
        loan_int_rate: baseApplicantData.loan_int_rate
      });
    }
  };

  const applyCounterfactual = (modifications) => {
    setMods(prev => ({
      ...prev,
      ...modifications
    }));
  };

  const sim = simulationResult?.simulated;
  const baseline = simulationResult?.baseline;
  const deltas = simulationResult?.deltas;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Reset */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1.25rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <Sliders size={20} color="#06B6D4" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Interactive "What-If" Counterfactual Risk Simulator
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Adjust applicant financial levers in real-time to observe dynamic changes in default probability, approval odds, and debt service.
            </p>
          </div>

          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} />
            <span>Reset to Baseline</span>
          </button>
        </div>

        {/* Live Delta Summary Card */}
        {deltas && (
          <div style={{
            background: deltas.status_changed 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)' 
              : 'rgba(15, 23, 42, 0.65)',
            border: deltas.status_changed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            transition: 'all 0.3s ease'
          }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              
              {/* Decision Shift */}
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                  Decision Outcome
                </div>
                <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: deltas.status_changed ? 'line-through' : 'none' }}>
                    {baseline?.decision}
                  </span>
                  <ArrowRight size={16} color="#94A3B8" />
                  <span className={`badge ${
                    sim?.decision === 'APPROVED' ? 'badge-success' :
                    sim?.decision === 'CONDITIONALLY APPROVED' ? 'badge-warning' :
                    sim?.decision === 'UNDER MANUAL REVIEW' ? 'badge-info' : 'badge-danger'
                  }`} style={{ fontSize: '0.85rem' }}>
                    {sim?.decision}
                  </span>
                </div>
              </div>

              {/* Approval Odds Delta */}
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                  Approval Odds
                </div>
                <div className="flex items-center gap-1" style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F8FAFC' }}>
                    {sim?.approval_odds_percentage}%
                  </span>
                  {deltas.approval_delta !== 0 && (
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: deltas.approval_delta > 0 ? '#34D399' : '#F87171',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      ({deltas.approval_delta > 0 ? `+${deltas.approval_delta}%` : `${deltas.approval_delta}%`})
                    </span>
                  )}
                </div>
              </div>

              {/* Default Risk (PD) Delta */}
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                  Default Risk (PD)
                </div>
                <div className="flex items-center gap-1" style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: sim?.probability_of_default > 0.35 ? '#F87171' : '#34D399' }}>
                    {(sim?.probability_of_default * 100).toFixed(1)}%
                  </span>
                  {deltas.pd_delta !== 0 && (
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: deltas.pd_delta < 0 ? '#34D399' : '#F87171',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      ({deltas.pd_delta < 0 ? `${(deltas.pd_delta * 100).toFixed(1)}%` : `+${(deltas.pd_delta * 100).toFixed(1)}%`})
                    </span>
                  )}
                </div>
              </div>

              {/* Monthly Payment Delta */}
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                  Monthly Payment (EMI)
                </div>
                <div className="flex items-center gap-1" style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    ${sim?.monthly_installment.toLocaleString()}
                  </span>
                  {deltas.monthly_payment_delta !== 0 && (
                    <span style={{
                      fontSize: '0.78rem',
                      color: deltas.monthly_payment_delta < 0 ? '#34D399' : '#F87171',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      ({deltas.monthly_payment_delta < 0 ? `-$${Math.abs(deltas.monthly_payment_delta)}` : `+$${deltas.monthly_payment_delta}`})
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Sliders Grid */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Slider 1: Loan Amount */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="input-label" style={{ margin: 0 }}>Requested Loan Principal</span>
              <span className="slider-val">${mods.loan_amnt.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="75000"
              step="1000"
              value={mods.loan_amnt}
              onChange={(e) => handleSliderChange('loan_amnt', e.target.value)}
            />
            <div className="flex justify-between" style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>$2,000</span>
              <span>Baseline: ${baseApplicantData?.loan_amnt.toLocaleString()}</span>
              <span>$75,000</span>
            </div>
          </div>

          {/* Slider 2: Down Payment */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="input-label" style={{ margin: 0 }}>Cash Down Payment</span>
              <span className="slider-val">${mods.down_payment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(10000, Math.round(mods.loan_amnt * 0.6))}
              step="500"
              value={mods.down_payment}
              onChange={(e) => handleSliderChange('down_payment', e.target.value)}
            />
            <div className="flex justify-between" style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>$0</span>
              <span>Baseline: ${baseApplicantData?.down_payment.toLocaleString()}</span>
              <span>${Math.round(mods.loan_amnt * 0.6).toLocaleString()}</span>
            </div>
          </div>

          {/* Slider 3: Debt to Income (DTI) */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="input-label" style={{ margin: 0 }}>Debt-to-Income Ratio (DTI)</span>
              <span className="slider-val" style={{ color: mods.dti_ratio > 40 ? '#F87171' : '#38BDF8' }}>
                {mods.dti_ratio.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="10.0"
              max="65.0"
              step="0.5"
              value={mods.dti_ratio}
              onChange={(e) => handleSliderChange('dti_ratio', e.target.value)}
            />
            <div className="flex justify-between" style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>10.0% (Prime)</span>
              <span>Baseline: {baseApplicantData?.dti_ratio}%</span>
              <span>65.0% (Max)</span>
            </div>
          </div>

          {/* Slider 4: Credit Score */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="input-label" style={{ margin: 0 }}>Credit Bureau Score (FICO)</span>
              <span className="slider-val" style={{ color: mods.credit_score >= 680 ? '#34D399' : '#FBBF24' }}>
                {mods.credit_score} pts
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="850"
              step="5"
              value={mods.credit_score}
              onChange={(e) => handleSliderChange('credit_score', e.target.value)}
            />
            <div className="flex justify-between" style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>400 (Subprime)</span>
              <span>Baseline: {baseApplicantData?.credit_score}</span>
              <span>850 (Exceptional)</span>
            </div>
          </div>

          {/* Slider 5: Collateral Asset */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="input-label" style={{ margin: 0 }}>Pledged Collateral Asset Value</span>
              <span className="slider-val">${mods.collateral_value.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="2500"
              value={mods.collateral_value}
              onChange={(e) => handleSliderChange('collateral_value', e.target.value)}
            />
            <div className="flex justify-between" style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>$0 (Unsecured)</span>
              <span>Baseline: ${baseApplicantData?.collateral_value.toLocaleString()}</span>
              <span>$150,000</span>
            </div>
          </div>

          {/* Slider 6: Loan Term Options */}
          <div className="slider-container">
            <div className="slider-header">
              <span className="input-label" style={{ margin: 0 }}>Loan Amortization Tenure</span>
              <span className="slider-val">{mods.loan_term_months} Months</span>
            </div>
            <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
              {[24, 36, 48, 60].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSliderChange('loan_term_months', term)}
                  className={`btn btn-sm flex-1 ${mods.loan_term_months === term ? 'btn-primary' : 'btn-outline'}`}
                >
                  {term} Mo
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Automated Counterfactual Solver Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} color="#C084FC" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F3E8FF' }}>
                Algorithmic Counterfactual Pathways (Automated Approval Discovery)
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Constrained optimization engine solves for the minimal actionable perturbations needed to turn this application into an Approved credit decision.
            </p>
          </div>
        </div>

        {counterfactualAnalysis?.already_approved ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={22} color="#10B981" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34D399' }}>
                Application Already Approved
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                This borrower satisfies all automated underwriting criteria. No counterfactual adjustments are needed.
              </div>
            </div>
          </div>
        ) : counterfactualAnalysis?.counterfactuals?.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {counterfactualAnalysis.counterfactuals.map((cf, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                      Pathway #{idx + 1}: {cf.strategy_type}
                    </span>
                    <span className={`badge ${cf.new_decision === 'APPROVED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                      Target: {cf.new_decision}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Timeline: {cf.timeline}
                    </span>
                  </div>

                  <h5 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {cf.strategy_name}
                  </h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    {cf.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#C084FC', fontStyle: 'italic' }}>
                    Action: {cf.action_requirement}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>New Approval Odds</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                      {cf.new_approval_odds}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#38BDF8' }}>
                      +{cf.risk_reduction_pct}% Risk Drop
                    </div>
                  </div>

                  <button
                    onClick={() => applyCounterfactual(cf.modifications)}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)' }}
                  >
                    <Zap size={14} />
                    <span>Apply Pathway</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
            No automatic counterfactuals found for current configuration.
          </div>
        )}
      </div>

    </div>
  );
}
