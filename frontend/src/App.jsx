import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ApplicantSelector from './components/ApplicantSelector';
import DecisionScorecard from './components/DecisionScorecard';
import XaiAttributionView from './components/XaiAttributionView';
import WhatIfSimulator from './components/WhatIfSimulator';
import PrescriptiveRecommendations from './components/PrescriptiveRecommendations';
import PortfolioGovernanceView from './components/PortfolioGovernanceView';
import ApplicantFormModal from './components/ApplicantFormModal';
import AuditMemoModal from './components/AuditMemoModal';

import { 
  Sparkles, Sliders, Activity, Lightbulb, 
  BarChart2, ShieldCheck, RefreshCw
} from 'lucide-react';

const API_BASE = '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('scorecard'); // 'scorecard', 'xai', 'whatif', 'recommendations', 'governance'
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [activeInputData, setActiveInputData] = useState(null);
  const [isCustomActive, setIsCustomActive] = useState(false);

  // Results State
  const [evaluation, setEvaluation] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [counterfactualAnalysis, setCounterfactualAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);
  const [auditMemoData, setAuditMemoData] = useState(null);

  // UI Modals
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isAuditMemoModalOpen, setIsAuditMemoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial Load: Fetch sample applicants and portfolio metrics
  useEffect(() => {
    fetchSampleApplicants();
    fetchPortfolioMetrics();
  }, []);

  const fetchSampleApplicants = async () => {
    try {
      const res = await fetch(`${API_BASE}/sample-applicants`);
      const data = await res.json();
      if (data?.applicants?.length > 0) {
        setApplicants(data.applicants);
        // Default to Marcus Vance (Near Prime) or Elena (Prime)
        const defaultApp = data.applicants[1] || data.applicants[0];
        handleSelectApplicant(defaultApp);
      }
    } catch (err) {
      console.error("Failed to fetch sample applicants:", err);
    }
  };

  const fetchPortfolioMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/portfolio-metrics`);
      const data = await res.json();
      if (data?.success && data?.metrics) {
        setPortfolioMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to fetch portfolio metrics:", err);
    }
  };

  // 2. Select Applicant
  const handleSelectApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setIsCustomActive(false);
    setActiveInputData(applicant.data);
    evaluateApplicant(applicant.data);
  };

  // 3. Custom Applicant Submission
  const handleCustomApplicantSubmit = (formData) => {
    setIsCustomActive(true);
    setSelectedApplicant(null);
    setActiveInputData(formData);
    evaluateApplicant(formData);
  };

  // 4. Main Evaluation Runner: calls /explain, /recommendations, /counterfactuals
  const evaluateApplicant = async (data) => {
    setIsLoading(true);
    try {
      // Parallel requests for maximum responsiveness
      const [explainRes, recsRes, cfRes, memoRes] = await Promise.all([
        fetch(`${API_BASE}/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),

        fetch(`${API_BASE}/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),

        fetch(`${API_BASE}/what-if/counterfactuals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),

        fetch(`${API_BASE}/audit-memo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json())
      ]);

      if (explainRes.success) {
        setEvaluation(explainRes.explanation);
        // Initialize simulation baseline
        handleSimulate(data, data);
      }
      if (recsRes.success) {
        setRecommendations(recsRes.recommendations);
      }
      if (cfRes.success) {
        setCounterfactualAnalysis(cfRes.counterfactual_analysis);
      }
      if (memoRes.success) {
        setAuditMemoData(memoRes.audit_memo);
      }
    } catch (err) {
      console.error("Evaluation request error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. What-If Scenario Simulator
  const handleSimulate = async (modifications, overrideBase) => {
    const base = overrideBase || activeInputData;
    if (!base) return;

    try {
      const res = await fetch(`${API_BASE}/what-if/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_input: base,
          modifications: modifications
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.simulation);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  return (
    <div className="app-container">
      
      {/* Top Header */}
      <Header
        onOpenCustomForm={() => setIsCustomModalOpen(true)}
        onOpenAuditMemo={() => setIsAuditMemoModalOpen(true)}
      />

      {/* Benchmark Persona Bar */}
      <ApplicantSelector
        applicants={applicants}
        selectedApplicant={selectedApplicant}
        onSelectApplicant={handleSelectApplicant}
        isCustomActive={isCustomActive}
      />

      {/* Main Core Scorecard (Always pinned on top for instant visibility) */}
      <DecisionScorecard
        evaluation={evaluation}
        inputData={activeInputData || {}}
      />

      {/* Navigation Tabs */}
      <div className="flex gap-2" style={{ marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`nav-tab ${activeTab === 'scorecard' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} />
          <span>Underwriting Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('xai')}
          className={`nav-tab ${activeTab === 'xai' ? 'active' : ''}`}
        >
          <Activity size={16} />
          <span>Explainable AI (TreeSHAP)</span>
        </button>

        <button
          onClick={() => setActiveTab('whatif')}
          className={`nav-tab ${activeTab === 'whatif' ? 'active' : ''}`}
        >
          <Sliders size={16} />
          <span>What-If Risk Simulation & Counterfactuals</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`nav-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
        >
          <Lightbulb size={16} />
          <span>Prescriptive AI Financial Roadmap</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`nav-tab ${activeTab === 'governance' ? 'active' : ''}`}
        >
          <BarChart2 size={16} />
          <span>Model Governance & Portfolio</span>
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <RefreshCw size={18} className="pulse-glow" />
          <span style={{ fontSize: '0.85rem' }}>Computing TreeSHAP Attributions & Counterfactuals...</span>
        </div>
      )}

      {/* Tab Views */}
      <main>
        {activeTab === 'scorecard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick XAI Summary Snapshot */}
            <XaiAttributionView evaluation={evaluation} />
          </div>
        )}

        {activeTab === 'xai' && (
          <XaiAttributionView evaluation={evaluation} />
        )}

        {activeTab === 'whatif' && (
          <WhatIfSimulator
            baseApplicantData={activeInputData}
            onSimulate={handleSimulate}
            simulationResult={simulationResult}
            counterfactualAnalysis={counterfactualAnalysis}
          />
        )}

        {activeTab === 'recommendations' && (
          <PrescriptiveRecommendations recommendations={recommendations} />
        )}

        {activeTab === 'governance' && (
          <PortfolioGovernanceView portfolioMetrics={portfolioMetrics} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <div>
          CrediXAI Underwriting Intelligence • Explainable AI Credit Risk Architecture • TreeSHAP & Basel II/III Compliant
        </div>
        <div>
          Model Risk Governance: SR 11-7 / OCC 2011-12 • FCRA & ECOA Compliant
        </div>
      </footer>

      {/* Custom Applicant Modal */}
      <ApplicantFormModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmitCustom={handleCustomApplicantSubmit}
      />

      {/* Audit Memo Dossier Modal */}
      <AuditMemoModal
        isOpen={isAuditMemoModalOpen}
        onClose={() => setIsAuditMemoModalOpen(false)}
        auditData={auditMemoData}
      />

    </div>
  );
}
