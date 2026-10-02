import React, { useState } from 'react';
import { 
  Activity, ArrowUpRight, ArrowDownRight, AlertOctagon, 
  HelpCircle, ShieldCheck, Filter, FileText, CheckCircle2
} from 'lucide-react';

export default function XaiAttributionView({ evaluation }) {
  const [filter, setFilter] = useState('all'); // 'all', 'risk', 'protective'

  if (!evaluation) return null;

  const {
    base_default_rate,
    probability_of_default,
    feature_attributions = [],
    top_adverse_drivers = [],
    top_protective_drivers = [],
    adverse_action_notices = []
  } = evaluation;

  // Filter features
  const filteredFeatures = feature_attributions.filter((item) => {
    if (filter === 'risk') return item.direction === 'increases_risk';
    if (filter === 'protective') return item.direction === 'lowers_risk';
    return true;
  });

  // Find max magnitude for relative bar width
  const maxImpact = Math.max(...feature_attributions.map(f => f.abs_impact), 0.05);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Overview Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <Activity size={20} color="#6366F1" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Explainable AI (TreeSHAP) Feature Attribution Waterfall
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Decomposition of the XGBoost machine learning model decision based on cooperative game theory (Shapley Values).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.72rem' }}
            >
              All Levers ({feature_attributions.length})
            </button>
            <button
              onClick={() => setFilter('risk')}
              className={`btn btn-sm ${filter === 'risk' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.72rem' }}
            >
              Risk Drivers ({top_adverse_drivers.length})
            </button>
            <button
              onClick={() => setFilter('protective')}
              className={`btn btn-sm ${filter === 'protective' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.72rem' }}
            >
              Protective Factors ({top_protective_drivers.length})
            </button>
          </div>
        </div>

        {/* Population Baseline vs Applicant Output Bar */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
          <div className="flex items-center justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <div>
              <span>Population Baseline Risk (E[f(x)]): </span>
              <strong style={{ color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                {(base_default_rate * 100).toFixed(1)}%
              </strong>
            </div>
            <div>
              <span>Applicant Predicted Default Risk: </span>
              <strong style={{ color: probability_of_default > 0.35 ? '#F87171' : '#34D399', fontFamily: 'var(--font-mono)' }}>
                {(probability_of_default * 100).toFixed(1)}%
              </strong>
            </div>
          </div>

          <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
            {/* Population marker */}
            <div style={{
              position: 'absolute',
              left: `${base_default_rate * 100}%`,
              top: 0,
              bottom: 0,
              width: '3px',
              background: '#94A3B8',
              zIndex: 2
            }} title="Population Base Default Rate" />

            {/* Applicant Fill */}
            <div style={{
              width: `${Math.min(100, probability_of_default * 100)}%`,
              height: '100%',
              background: probability_of_default > 0.35 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' : 'linear-gradient(90deg, #06B6D4, #10B981)',
              borderRadius: '6px'
            }} />
          </div>
          <div className="flex justify-between" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            <span>0% (Zero Risk)</span>
            <span>22.7% (Average Base)</span>
            <span>50% (High Risk)</span>
            <span>100% (Certain Default)</span>
          </div>
        </div>

        {/* Feature Attribution List */}
        <div>
          <div className="flex items-center justify-between" style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', padding: '0 0.8rem 0.5rem' }}>
            <span style={{ width: '28%' }}>Underwriting Factor & Value</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Attribution (Protective vs Adverse Pull)</span>
            <span style={{ width: '15%', textAlign: 'right' }}>SHAP Value</span>
          </div>

          {filteredFeatures.map((feat) => {
            const isRisk = feat.direction === 'increases_risk';
            const widthPct = Math.min(100, (feat.abs_impact / maxImpact) * 100);

            return (
              <div key={feat.feature} className="shap-bar-row">
                {/* Feature details */}
                <div style={{ width: '28%', minWidth: 0, paddingRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {feat.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                    {typeof feat.actual_value === 'number'
                      ? (feat.unit === '$' ? `$${feat.actual_value.toLocaleString()}` : `${feat.actual_value} ${feat.unit}`)
                      : String(feat.actual_value)
                    }
                  </div>
                </div>

                {/* Split Center Bar */}
                <div style={{ flex: 1, position: 'relative', height: '14px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                  {/* Center origin line */}
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(255, 255, 255, 0.2)', zIndex: 1 }} />
                  
                  {isRisk ? (
                    // Bar goes right from center
                    <div style={{
                      position: 'absolute',
                      left: '50%',
                      top: '2px',
                      bottom: '2px',
                      width: `${widthPct * 0.48}%`,
                      background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                      borderRadius: '0 3px 3px 0'
                    }} />
                  ) : (
                    // Bar goes left from center
                    <div style={{
                      position: 'absolute',
                      right: '50%',
                      top: '2px',
                      bottom: '2px',
                      width: `${widthPct * 0.48}%`,
                      background: 'linear-gradient(270deg, #06B6D4, #10B981)',
                      borderRadius: '3px 0 0 3px'
                    }} />
                  )}
                </div>

                {/* SHAP numeric value */}
                <div style={{ width: '15%', textAlign: 'right', paddingLeft: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: isRisk ? '#F87171' : '#34D399'
                  }}>
                    {feat.shap_value > 0 ? `+${feat.shap_value.toFixed(3)}` : feat.shap_value.toFixed(3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regulatory Adverse Action Compliance Notice (ECOA / FCRA) */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #EF4444' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
          <AlertOctagon size={20} color="#EF4444" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Regulatory Adverse Action Disclosure (Equal Credit Opportunity Act & FCRA Compliant)
          </h4>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          In accordance with Section 701(d) of the Equal Credit Opportunity Act (ECOA) and 12 CFR § 1002.9, credit institutions using algorithmic underwriting models must specify the principal reasons contributing to an adverse credit decision or conditional pricing adjustment.
        </p>

        {adverse_action_notices.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {adverse_action_notices.map((notice, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.05)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <span className="badge badge-danger" style={{ fontSize: '0.68rem', flexShrink: 0 }}>
                  Reason #{idx + 1}
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FCA5A5' }}>
                    {notice.factor}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.15rem' }}>
                    {notice.notice_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#10B981" />
            <span style={{ fontSize: '0.85rem', color: '#6EE7B7' }}>
              No adverse action notices triggered. All core metrics meet or exceed prime institutional underwriting benchmarks.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
