import React from 'react';
import { Users, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ApplicantSelector({ applicants, selectedApplicant, onSelectApplicant, isCustomActive }) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '0.9rem' }}>
        <div className="flex items-center gap-2">
          <Users size={18} color="#818CF8" />
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            Benchmark Applicant Profiles (One-Click Scenarios)
          </h2>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Click any persona to load full underwriting file & SHAP breakdown
        </span>
      </div>

      <div className="flex gap-3" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {applicants.map((app) => {
          const isSelected = !isCustomActive && selectedApplicant?.id === app.id;
          return (
            <div
              key={app.id}
              onClick={() => onSelectApplicant(app)}
              className={`persona-card ${isSelected ? 'selected' : ''}`}
              style={{ flexShrink: 0 }}
            >
              <img src={app.avatar} alt={app.name} className="persona-img" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center justify-between gap-1">
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {app.name}
                  </span>
                  {isSelected && <CheckCircle2 size={14} color="#6366F1" />}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 500 }}>
                  {app.persona_tag}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {app.role} • ${app.data.loan_amnt.toLocaleString()} req.
                </div>
              </div>
            </div>
          );
        })}

        {isCustomActive && (
          <div className="persona-card selected" style={{ flexShrink: 0, borderColor: '#A855F7' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #A855F7, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}>
              CUST
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C084FC' }}>
                  Custom Applicant
                </span>
                <CheckCircle2 size={14} color="#A855F7" />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                User Defined Parameters
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
