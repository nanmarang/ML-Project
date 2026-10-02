import React from 'react';
import { ShieldCheck, Cpu, FileText, Sparkles, UserPlus } from 'lucide-react';

export default function Header({ onOpenCustomForm, onOpenAuditMemo, activeModel = 'XGBoost 3.4 + TreeSHAP' }) {
  return (
    <header className="glass-panel" style={{ padding: '1rem 1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      <div className="flex items-center gap-3">
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)'
        }}>
          <ShieldCheck size={28} color="#FFFFFF" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(90deg, #FFFFFF 30%, #A5B4FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CrediXAI
            </h1>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
              Novel XAI 2.0
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Explainable AI-Based Loan Approval & Default Risk Prediction • What-If Counterfactuals • Prescriptive Advisory
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2" style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Cpu size={16} color="#06B6D4" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Engine:</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{activeModel}</span>
        </div>

        <button 
          onClick={onOpenCustomForm}
          className="btn btn-secondary btn-sm"
          title="Enter custom applicant parameters"
        >
          <UserPlus size={15} />
          <span>New Applicant</span>
        </button>

        <button 
          onClick={onOpenAuditMemo}
          className="btn btn-primary btn-sm"
          title="Export Underwriting Audit Memo"
        >
          <FileText size={15} />
          <span>Audit Memo</span>
        </button>
      </div>
    </header>
  );
}
