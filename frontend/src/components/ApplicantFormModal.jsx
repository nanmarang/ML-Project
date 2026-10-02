import React, { useState } from 'react';
import { X, UserPlus, Sparkles, Check } from 'lucide-react';

export default function ApplicantFormModal({ isOpen, onClose, onSubmitCustom }) {
  const [formData, setFormData] = useState({
    person_age: 32,
    person_income: 75000,
    person_home_ownership: 'RENT',
    person_emp_length: 4.5,
    loan_intent: 'DEBTCONSOLIDATION',
    loan_amnt: 18000,
    loan_term_months: 36,
    down_payment: 2000,
    loan_int_rate: 11.5,
    credit_score: 660,
    dti_ratio: 38.0,
    cb_person_default_on_file: 'N',
    cb_person_cred_hist_length: 6.0,
    open_credit_lines: 7,
    derogatory_records: 0,
    liquid_assets: 8500,
    collateral_value: 0
  });

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleNumericChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(val)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitCustom(formData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0F172A',
        padding: '1.75rem',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
      }}>
        
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div className="flex items-center gap-2">
            <UserPlus size={20} color="#818CF8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Underwrite Custom Loan Applicant
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '0.3rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Section 1: Financial Standing & Demographics */}
          <div>
            <h5 style={{ fontSize: '0.85rem', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              1. Household Financial Standing
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="input-label">Annual Income ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.person_income}
                  onChange={(e) => handleNumericChange('person_income', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Applicant Age (Years)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.person_age}
                  onChange={(e) => handleNumericChange('person_age', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Employment Tenure (Yrs)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.person_emp_length}
                  onChange={(e) => handleNumericChange('person_emp_length', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Home Ownership</label>
                <select
                  className="form-select"
                  value={formData.person_home_ownership}
                  onChange={(e) => handleChange('person_home_ownership', e.target.value)}
                >
                  <option value="RENT">Rent</option>
                  <option value="MORTGAGE">Mortgage</option>
                  <option value="OWN">Own (Outright)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="input-label">Liquid Savings ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.liquid_assets}
                  onChange={(e) => handleNumericChange('liquid_assets', e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Collateral Asset ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.collateral_value}
                  onChange={(e) => handleNumericChange('collateral_value', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Loan Terms */}
          <div>
            <h5 style={{ fontSize: '0.85rem', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              2. Requested Credit Terms
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="input-label">Loan Amount ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.loan_amnt}
                  onChange={(e) => handleNumericChange('loan_amnt', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Down Payment ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.down_payment}
                  onChange={(e) => handleNumericChange('down_payment', e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Tenure (Months)</label>
                <select
                  className="form-select"
                  value={formData.loan_term_months}
                  onChange={(e) => handleNumericChange('loan_term_months', e.target.value)}
                >
                  <option value={24}>24 Months</option>
                  <option value={36}>36 Months</option>
                  <option value={48}>48 Months</option>
                  <option value={60}>60 Months</option>
                </select>
              </div>

              <div>
                <label className="input-label">Stated Loan Intent</label>
                <select
                  className="form-select"
                  value={formData.loan_intent}
                  onChange={(e) => handleChange('loan_intent', e.target.value)}
                >
                  <option value="PERSONAL">Personal</option>
                  <option value="EDUCATION">Education</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="VENTURE">Venture / Business</option>
                  <option value="HOMEIMPROVEMENT">Home Improvement</option>
                  <option value="DEBTCONSOLIDATION">Debt Consolidation</option>
                </select>
              </div>

              <div>
                <label className="input-label">Interest Rate (% APR)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.loan_int_rate}
                  onChange={(e) => handleNumericChange('loan_int_rate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Credit History & Risk Ratios */}
          <div>
            <h5 style={{ fontSize: '0.85rem', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              3. Credit Bureau Profile & Risk Ratios
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="input-label">FICO Credit Score (300-850)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.credit_score}
                  onChange={(e) => handleNumericChange('credit_score', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Debt-to-Income (DTI %)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.dti_ratio}
                  onChange={(e) => handleNumericChange('dti_ratio', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Derogatory Bureau Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.derogatory_records}
                  onChange={(e) => handleNumericChange('derogatory_records', e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Credit File Length (Yrs)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.cb_person_cred_hist_length}
                  onChange={(e) => handleNumericChange('cb_person_cred_hist_length', e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Open Credit Lines</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.open_credit_lines}
                  onChange={(e) => handleNumericChange('open_credit_lines', e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Prior Default on Record?</label>
                <select
                  className="form-select"
                  value={formData.cb_person_default_on_file}
                  onChange={(e) => handleChange('cb_person_default_on_file', e.target.value)}
                >
                  <option value="N">No (Clean Record)</option>
                  <option value="Y">Yes (Historical Default)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Score & Explain Applicant</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
