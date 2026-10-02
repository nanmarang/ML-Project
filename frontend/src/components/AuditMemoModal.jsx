import React from 'react';
import { X, Printer, Download, ShieldCheck, FileText } from 'lucide-react';

export default function AuditMemoModal({ isOpen, onClose, auditData }) {
  if (!isOpen || !auditData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CrediXAI_Audit_Memo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0B1120',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)'
      }}>
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between no-print" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div className="flex items-center gap-2">
            <FileText size={20} color="#6366F1" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Underwriting Audit Dossier & Compliance Memo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleDownloadJSON} className="btn btn-secondary btn-sm">
              <Download size={14} />
              <span>Download JSON</span>
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '0.35rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Audit Document Body */}
        <div style={{ border: '1px solid var(--border-subtle)', padding: '2rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.5)' }}>
          
          {/* Memo Header */}
          <div className="flex justify-between items-start" style={{ borderBottom: '2px solid rgba(99, 102, 241, 0.4)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC' }}>
                {auditData.institution}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                Algorithmic Underwriting & Model Governance Memorandum
              </p>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                Compliance: {auditData.audit_standard}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Timestamp</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                {auditData.timestamp}
              </div>
            </div>
          </div>

          {/* Underwriting Decision Summary */}
          <div style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Underwriting Decision:
              </span>
              <span className={`badge ${
                auditData.underwriting_decision === 'APPROVED' ? 'badge-success' :
                auditData.underwriting_decision === 'CONDITIONALLY APPROVED' ? 'badge-warning' :
                auditData.underwriting_decision === 'UNDER MANUAL REVIEW' ? 'badge-info' : 'badge-danger'
              }`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}>
                {auditData.underwriting_decision}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3" style={{ fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Default Probability (PD): </span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{auditData.probability_of_default}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Credit Tier: </span>
                <strong style={{ color: 'var(--text-main)' }}>{auditData.credit_tier}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Basel Expected Loss: </span>
                <strong style={{ color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>{auditData.basel_expected_loss}</strong>
              </div>
            </div>
          </div>

          {/* Applicant Profile Snapshot */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.85rem', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Applicant Parameters
            </h5>
            <div className="grid grid-cols-4 gap-2" style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.01)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div><span style={{ color: 'var(--text-dim)' }}>Household Income: </span><strong>{auditData.applicant_summary?.income}</strong></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Loan Requested: </span><strong>{auditData.applicant_summary?.loan_amount}</strong></div>
              <div><span style={{ color: 'var(--text-dim)' }}>Credit Score: </span><strong>{auditData.applicant_summary?.credit_score} FICO</strong></div>
              <div><span style={{ color: 'var(--text-dim)' }}>DTI Ratio: </span><strong>{auditData.applicant_summary?.dti_ratio}</strong></div>
            </div>
          </div>

          {/* Explainable AI (SHAP) Factor Attribution Breakdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.85rem', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Explainable AI (TreeSHAP) Factor Attributions
            </h5>

            <div className="grid grid-cols-2 gap-4">
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34D399' }}>
                  Top Protective Factors (Supporting Approval):
                </span>
                <ul style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '0.4rem', paddingLeft: '1.2rem' }}>
                  {auditData.primary_protective_factors?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F87171' }}>
                  Top Adverse Factors (Elevating Risk):
                </span>
                <ul style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '0.4rem', paddingLeft: '1.2rem' }}>
                  {auditData.primary_risk_drivers?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Regulatory Adverse Action Legal Notice */}
          {auditData.regulatory_adverse_action_notices?.length > 0 && (
            <div style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FCA5A5', textTransform: 'uppercase' }}>
                ECOA / FCRA Formal Adverse Action Statements:
              </span>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {auditData.regulatory_adverse_action_notices.map((n, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                    <strong>{i + 1}. {n.factor}:</strong> {n.notice_text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptive & Counterfactual Summary */}
          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div>
              Actionable Counterfactual Pathways Discovered: <strong style={{ color: '#38BDF8' }}>{auditData.counterfactual_pathways_count}</strong>
            </div>
            <div>
              Prescriptive Lifetime Savings Potential: <strong style={{ color: '#34D399' }}>{auditData.prescriptive_savings_potential}</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
