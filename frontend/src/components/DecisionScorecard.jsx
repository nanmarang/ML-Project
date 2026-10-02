import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, AlertTriangle, XCircle, Clock, 
  DollarSign, Shield, TrendingDown, Percent, Wallet, Award
} from 'lucide-react';

export default function DecisionScorecard({ evaluation, inputData }) {
  if (!evaluation) return null;

  const {
    probability_of_default,
    approval_odds_percentage,
    decision,
    decision_rationale,
    decision_variant,
    credit_tier,
    credit_tier_desc,
    monthly_installment,
    expected_loss_basel,
    net_exposure_at_default
  } = evaluation;

  // Fire confetti if approved
  useEffect(() => {
    if (decision === 'APPROVED') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [decision, inputData]);

  // Gauge calculation: circumference = 2 * PI * r (r = 54 => ~339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Approval percentage maps to stroke offset
  const strokeOffset = circumference - (approval_odds_percentage / 100) * circumference;

  // Color scheme based on decision
  let gaugeColor = '#10B981'; // Green
  let badgeClass = 'badge-success';
  let IconComponent = CheckCircle;

  if (decision === 'CONDITIONALLY APPROVED') {
    gaugeColor = '#F59E0B';
    badgeClass = 'badge-warning';
    IconComponent = AlertTriangle;
  } else if (decision === 'UNDER MANUAL REVIEW') {
    gaugeColor = '#3B82F6';
    badgeClass = 'badge-info';
    IconComponent = Clock;
  } else if (decision === 'DECLINED') {
    gaugeColor = '#EF4444';
    badgeClass = 'badge-danger';
    IconComponent = XCircle;
  }

  const pdPercent = (probability_of_default * 100).toFixed(1);

  return (
    <div className="glass-panel glass-panel-glow" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
      <div className="grid grid-cols-12 gap-6 items-center">
        
        {/* Left: Animated Circular Probability & Approval Gauge */}
        <div className="lg-col-span-12" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="gauge-wrapper" style={{ width: '150px', height: '150px' }}>
            <svg width="150" height="150" viewBox="0 0 130 130" className="gauge-circle">
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="gauge-bg"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="gauge-fill"
                stroke={gaugeColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: gaugeColor }}>
                {approval_odds_percentage}%
              </span>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Approval Odds
              </span>
            </div>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Probability of Default (PD):
            </span>{' '}
            <strong style={{ fontSize: '0.92rem', color: pdPercent > 35 ? '#F87171' : '#34D399', fontFamily: 'var(--font-mono)' }}>
              {pdPercent}%
            </strong>
          </div>
        </div>

        {/* Center: Underwriting Decision & Credit Tier */}
        <div className="lg-col-span-12" style={{ gridColumn: 'span 5', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
            <div className={`badge ${badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.9rem' }}>
              <IconComponent size={16} />
              <span>{decision}</span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
              {credit_tier.split(':')[0]}
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            {credit_tier}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
            {decision_rationale}
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            {credit_tier_desc}
          </div>
        </div>

        {/* Right: Basel Metrics & Loan Economics */}
        <div className="lg-col-span-12" style={{ gridColumn: 'span 3', background: 'rgba(15, 23, 42, 0.6)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '0.75rem', fontWeight: 600 }}>
            Basel II/III Underwriting Metrics
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <div className="flex items-center justify-between" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Monthly Payment (EMI):</span>
              <strong style={{ color: '#F8FAFC', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                ${monthly_installment.toLocaleString()}
              </strong>
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <div className="flex items-center justify-between" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Basel Expected Loss (EL):</span>
              <strong style={{ color: expected_loss_basel > 1500 ? '#FBBF24' : '#34D399', fontFamily: 'var(--font-mono)' }}>
                ${expected_loss_basel.toLocaleString()}
              </strong>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
              Formula: PD ({pdPercent}%) × LGD ({evaluation.loss_given_default_rate * 100}%) × EAD
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.6rem' }}>
            <div className="flex items-center justify-between" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Net Exposure (EAD):</span>
              <span style={{ color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                ${net_exposure_at_default.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Snapshot Bar */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>FICO Score</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
            {inputData.credit_score}
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Debt-to-Income (DTI)</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: inputData.dti_ratio > 40 ? '#F87171' : '#34D399', fontFamily: 'var(--font-mono)' }}>
            {inputData.dti_ratio}%
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Loan Requested</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
            ${Number(inputData.loan_amnt).toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Household Income</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
            ${Number(inputData.person_income).toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Loan Tenure</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#A5B4FC', fontFamily: 'var(--font-mono)' }}>
            {inputData.loan_term_months} Months
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Interest Rate</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>
            {inputData.loan_int_rate}% APR
          </div>
        </div>
      </div>
    </div>
  );
}
