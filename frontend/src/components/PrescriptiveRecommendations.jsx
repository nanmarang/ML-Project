import React from 'react';
import { 
  Sparkles, DollarSign, TrendingUp, Clock, ShieldCheck, 
  PiggyBank, CheckCircle2, ChevronRight, Award, Zap
} from 'lucide-react';

export default function PrescriptiveRecommendations({ recommendations }) {
  if (!recommendations) return null;

  const {
    financial_health_scorecard = [],
    action_roadmap = {},
    quantitative_impact = {}
  } = recommendations;

  const {
    phase_1_immediate = [],
    phase_2_tactical = [],
    phase_3_strategic = []
  } = action_roadmap;

  // Grade color helper
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return '#10B981';
      case 'B': return '#06B6D4';
      case 'C': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner: Quantitative ROI Impact */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <Sparkles size={20} color="#F59E0B" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Prescriptive Financial Improvement Plan & Quantitative Impact
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '0.5rem' }}>
          
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Lifetime Interest Savings
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              ${quantitative_impact.potential_lifetime_interest_saved?.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6EE7B7', marginTop: '0.2rem' }}>
              By optimizing rate & loan terms
            </div>
          </div>

          <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Projected APR Discount
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {quantitative_impact.current_interest_rate}% → {quantitative_impact.projected_improved_rate}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#7DD3FC', marginTop: '0.2rem' }}>
              -{(quantitative_impact.current_interest_rate - quantitative_impact.projected_improved_rate).toFixed(1)}% rate concession
            </div>
          </div>

          <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Projected FICO Uplift
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C084FC', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {quantitative_impact.potential_credit_score_uplift}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#E9D5FF', marginTop: '0.2rem' }}>
              Via utilization & dispute actions
            </div>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Target Underwriting Tier
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#60A5FA', marginTop: '0.35rem' }}>
              {quantitative_impact.new_target_tier}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#93C5FD', marginTop: '0.2rem' }}>
              Automated approval eligibility
            </div>
          </div>

        </div>
      </div>

      {/* 4-Pillar Financial Health Scorecard */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          4-Pillar Borrower Financial Health Scorecard
        </h4>

        <div className="grid grid-cols-4 gap-4">
          {financial_health_scorecard.map((pillar, idx) => {
            const color = getGradeColor(pillar.grade);
            return (
              <div 
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {pillar.pillar}
                    </span>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: `${color}25`,
                      color: color,
                      border: `1px solid ${color}60`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {pillar.grade}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {pillar.metric}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: color, fontWeight: 500 }}>
                    {pillar.status}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: '0.75rem', paddingTop: '0.5rem', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  Benchmark: {pillar.benchmark}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Phase Action Roadmap */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Personalized Action Roadmap (Tailored to Negative SHAP Drivers)
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Phase 1: Immediate */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.65rem' }}>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                Phase 1: Immediate Underwriting Levers (1 - 14 Days)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Direct adjustments to loan structuring and cash equity
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {phase_1_immediate.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                      <span className={`badge ${item.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                        {item.priority} PRIORITY
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {item.title}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#E2E8F0', marginTop: '0.2rem' }}>
                      {item.action}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {item.benefit}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34D399' }}>
                      {item.estimated_score_impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2: Tactical */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.65rem' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                Phase 2: Tactical Debt Restructuring (30 - 60 Days)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Revolving balance compression and credit bureau disputes
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {phase_2_tactical.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                      <span className={`badge ${item.priority === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                        {item.priority}
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {item.title}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#E2E8F0', marginTop: '0.2rem' }}>
                      {item.action}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {item.benefit}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56, 189, 248, 0.2)', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8' }}>
                      {item.estimated_score_impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3: Strategic */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.65rem' }}>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                Phase 3: Strategic Credit Building (90 - 180 Days)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Trade-line deepening and asset-backed enhancement
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {phase_3_strategic.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                        {item.priority}
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {item.title}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#E2E8F0', marginTop: '0.2rem' }}>
                      {item.action}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {item.benefit}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.2)', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#C084FC' }}>
                      {item.estimated_score_impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
