# CrediXAI — Explainable AI-Based Loan Approval and Default Risk Prediction System

**CrediXAI** is an advanced Explainable AI (XAI) underwriting intelligence platform designed to deliver transparent, compliant, and prescriptive credit decisions.

---

## 🌟 Key Pillars & Novel Innovations

1. **Dual Predictive Core & Basel II/III Expected Loss Engine**
   - Calibrated **XGBoost 3.4 Champion Model** with TreeSHAP explainer.
   - Comparison with **Random Forest** and **Logistic Scorecard** baselines (ROC-AUC ~0.89).
   - Automated calculation of **Basel II/III Expected Loss ($)**:
     $$\text{Expected Loss} = \text{PD} \times \text{LGD} \times \text{EAD}$$
   - Dynamic underwriting tiers: Prime Superb (A+), Standard Prime (A), Near Prime (B), Subprime (C), High Risk (D), Severe (F).

2. **Explainable AI (TreeSHAP) Feature Attribution Waterfall**
   - Exact local Shapley feature contributions decomposed into **Protective Factors** (reducing default risk) and **Adverse Drivers** (increasing default risk).
   - Population baseline risk ($E[f(x)]$) comparison.
   - **Regulatory Adverse Action Disclosures** compliant with **Equal Credit Opportunity Act (ECOA)** and the **Fair Credit Reporting Act (FCRA)**.

3. **Interactive "What-If" Counterfactual Risk Simulation**
   - Real-time sliders for Loan Amount, Down Payment, Tenure (24-60 months), DTI ratio, Credit Score (FICO), and Pledged Collateral.
   - Instant delta feedback on Approval Odds, Probability of Default (PD), Monthly Installment (EMI), and Expected Loss ($).
   - **Algorithmic Counterfactual Pathway Discovery**: Constrained optimization solving for the minimal perturbations required to flip an adverse decision into an "APPROVED" or "CONDITIONALLY APPROVED" credit decision.
   - 1-Click *"Apply Pathway"* button to directly load candidate counterfactual scenarios into the live simulator.

4. **Prescriptive AI Financial Roadmap**
   - **4-Pillar Borrower Health Scorecard**: Debt Capacity (DTI), Credit Reliability (FICO), Liquidity Reserve, and Collateral Coverage.
   - **3-Phase Action Roadmap**:
     - *Phase 1 (1 - 14 Days)*: Immediate terms right-sizing & down payment equity.
     - *Phase 2 (30 - 60 Days)*: Tactical debt paydown & revolving utilization compression.
     - *Phase 3 (90 - 180 Days)*: Strategic bureau dispute resolution & asset-backed restructuring.
   - **Quantitative ROI Metrics**: Exact projected lifetime interest savings ($), projected APR concessions, and estimated FICO uplift.

5. **Executive Underwriting Dossier & Model Governance (SR 11-7)**
   - Pre-loaded benchmark applicant personas (Elena Rostova, Marcus Vance, Chloe Martinez, Derrick Hayes, Aisha Patel).
   - Custom applicant evaluation modal.
   - Printable **Underwriting Compliance Memorandum** and JSON audit export.
   - Global feature importance and ROC curve visualization.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node.js v24)

### 2. Start the Application
Simply run the Flask server:
```bash
python backend/app.py
```
Then open your browser at:
👉 **`http://127.0.0.1:5000`**

### 3. Frontend Development Server (Optional)
If you want to modify the React frontend with live hot-reloading:
```bash
cd frontend
npm run dev
```
Open: **`http://127.0.0.1:5173`**

### 4. Run Test Suite
```bash
python test_integration.py
```

---

## 🏛️ Regulatory Compliance Standards
- **Federal Reserve SR 11-7 / OCC 2011-12**: Guidance on Model Risk Management.
- **CFPB Circular 2022-03**: Explainability requirements for algorithmic credit decisions.
- **12 CFR § 1002.9**: Adverse Action notifications under the Equal Credit Opportunity Act.
