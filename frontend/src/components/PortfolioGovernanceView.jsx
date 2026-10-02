import React, { useState } from 'react';
import { 
  BarChart3, Award, ShieldAlert, Cpu, CheckCircle2, 
  HelpCircle, Scale, Database, TrendingUp
} from 'lucide-react';

export default function PortfolioGovernanceView({ portfolioMetrics }) {
  const [selectedModel, setSelectedModel] = useState('xgboost');

  if (!portfolioMetrics) return null;

  const {
    training_samples = 12000,
    test_samples = 2400,
    default_rate_base = 0.227,
    model_comparison = {},
    roc_curve = [],
    global_feature_importance = []
  } = portfolioMetrics;

  const currentModelStats = model_comparison[selectedModel] || {};
  const cm = currentModelStats.confusion_matrix || [[0, 0], [0, 0]];
  const [tn, fp] = cm[0] || [0, 0];
  const [fn, tp] = cm[1] || [0, 0];

  const maxImp = Math.max(...global_feature_importance.slice(0, 10).map(f => f.importance), 0.05);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <Scale size={20} color="#6366F1" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Algorithmic Credit Governance & Model Risk Management (SR 11-7)
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Validation metrics, champion-challenger benchmarking, ROC analysis, and population feature importances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
              Population: {training_samples.toLocaleString()} Records
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
              Validation Holdout: {test_samples.toLocaleString()} (20%)
            </span>
          </div>
        </div>

        {/* Model Selector Tabs */}
        <div className="flex gap-2" style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
          <button
            onClick={() => setSelectedModel('xgboost')}
            className={`btn btn-sm ${selectedModel === 'xgboost' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Cpu size={14} />
            <span>XGBoost (Champion + TreeSHAP)</span>
          </button>
          <button
            onClick={() => setSelectedModel('random_forest')}
            className={`btn btn-sm ${selectedModel === 'random_forest' ? 'btn-primary' : 'btn-outline'}`}
          >
            <span>Random Forest (Challenger)</span>
          </button>
          <button
            onClick={() => setSelectedModel('logistic_regression')}
            className={`btn btn-sm ${selectedModel === 'logistic_regression' ? 'btn-primary' : 'btn-outline'}`}
          >
            <span>Logistic Scorecard (Baseline)</span>
          </button>
        </div>

        {/* Model Metrics Cards */}
        <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Discrimination (ROC-AUC)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818CF8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {currentModelStats.roc_auc}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#A5B4FC', marginTop: '0.2rem' }}>
              Standard benchmark: &gt; 0.80
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Harmonic Balance (F1 Score)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {currentModelStats.f1_score}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#6EE7B7', marginTop: '0.2rem' }}>
              Balanced precision/recall
            </div>
          </div>

          <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Probability Calibration (Brier)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {currentModelStats.brier_score}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#7DD3FC', marginTop: '0.2rem' }}>
              Near zero indicates true calibration
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Population Base Default
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FBBF24', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {(default_rate_base * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#FDE68A', marginTop: '0.2rem' }}>
              Unbiased portfolio prior
            </div>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Holdout Test Confusion Matrix ({selectedModel.toUpperCase()})
          </div>

          <div className="grid grid-cols-2 gap-3" style={{ maxWidth: '500px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: '#6EE7B7' }}>True Negatives (Correct Non-Defaults)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34D399' }}>
                {tn.toLocaleString()}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: '#FCA5A5' }}>False Positives (Incorrectly Denied)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F87171' }}>
                {fp.toLocaleString()}
              </div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: '#FDE68A' }}>False Negatives (Missed Defaults)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FBBF24' }}>
                {fn.toLocaleString()}
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: '#6EE7B7' }}>True Positives (Correctly Flagged Defaults)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34D399' }}>
                {tp.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Feature Importance & ROC Curve Row */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Global Feature Importance */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
            <BarChart3 size={18} color="#06B6D4" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Global Feature Importance (Population Ranking)
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {global_feature_importance.slice(0, 8).map((feat, idx) => {
              const widthPct = (feat.importance / maxImp) * 100;
              return (
                <div key={idx}>
                  <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {idx + 1}. {feat.feature.replace(/_/g, ' ')}
                    </span>
                    <span style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      {(feat.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366F1, #06B6D4)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROC Curve SVG Graph */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} color="#10B981" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                Receiver Operating Characteristic (ROC Curve)
              </h4>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              AUC: {currentModelStats.roc_auc}
            </span>
          </div>

          {/* SVG ROC Plot */}
          <div style={{ width: '100%', height: '220px', position: 'relative' }}>
            <svg viewBox="0 0 300 200" style={{ width: '100%', height: '100%' }}>
              {/* Grid lines */}
              <line x1="40" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
              <line x1="40" y1="65" x2="280" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
              <line x1="40" y1="110" x2="280" y2="110" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
              <line x1="40" y1="155" x2="280" y2="155" stroke="rgba(255,255,255,0.06)" />

              {/* Axes */}
              <line x1="40" y1="20" x2="40" y2="155" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <line x1="40" y1="155" x2="280" y2="155" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

              {/* Diagonal baseline (Random Guessing AUC 0.5) */}
              <line x1="40" y1="155" x2="280" y2="20" stroke="rgba(255,255,255,0.25)" strokeDasharray="4" />

              {/* ROC Path */}
              {roc_curve.length > 0 && (
                <path
                  d={`M ${roc_curve.map((pt) => {
                    const x = 40 + pt.fpr * 240;
                    const y = 155 - pt.tpr * 135;
                    return `${x} ${y}`;
                  }).join(' L ')}`}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                />
              )}

              {/* Axis labels */}
              <text x="160" y="178" fill="#94A3B8" fontSize="10" textAnchor="middle">False Positive Rate (FPR)</text>
              <text x="18" y="90" fill="#94A3B8" fontSize="10" textAnchor="middle" transform="rotate(-90 18 90)">True Positive Rate (TPR)</text>
            </svg>
          </div>
          <div className="flex justify-between" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            <span>Model Curve (Purple)</span>
            <span>Chance Baseline (Dashed)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
