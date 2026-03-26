# Bastion Audit — NorthGuard Security

### AI Security Posture Management (AI-SPM) Dashboard
**Mission-critical tool for Canadian Federally Regulated Financial Institutions (FRFIs)**

---

## 🛡️ Executive Summary

**Bastion Audit** is a production-grade AI Security Posture Management (AI-SPM) platform purpose-built for Canadian banks and financial institutions. It delivers real-time visibility, automated guardrails, and audit-ready compliance tooling to protect AI agents deployed in high-stakes domains such as fraud detection, anti-money laundering (AML), credit adjudication, and customer service operations.

As Canadian banks accelerate AI adoption, they face heightened regulatory expectations under **OSFI guidelines**, **PIPEDA**, **FINTRAC**, and the forthcoming **Artificial Intelligence and Data Act (AIDA / Bill C-27)**. Bastion Audit addresses these challenges by providing a centralized control layer for AI risk management.

---

## ✨ Key Features

- **Live Threat Interception:** Real-time monitoring and neutralization of prompt injection, PII/SIN exfiltration, and AML bypass attempts using Canadian banking-specific attack vectors.
- **OSFI E-21 Compliant Model Inventory:** A centralized, auditable registry of all AI models used in material decisions, including risk tiering, validation status, and explainability tracking.
- **Behavioural Drift Detection:** Proactive identification of anomalous agent behaviour using 30-day drift analysis and red-team simulation logs.
- **Immutable Audit Trails:** Cryptographically secured logs and reports designed for OSFI, FINTRAC, and PIPEDA examination readiness.
- **Security Sentinel AI Advisor:** An embedded dual-tier AI assistant (powered by Gemini) providing regulatory-aligned guidance on security posture.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Visualization:** Recharts (Area & Bar Charts)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **AI Integration:** Google GenAI SDK (Gemini 3 Flash)
- **Fonts:** 
  - **UI:** Inter (Google Fonts)
  - **Terminal/Logs:** JetBrains Mono (Google Fonts)

---

## 🎨 Design System

- **Background:** `#020617` (Deep Obsidian)
- **Cards:** `#0f172a` (Slate-900)
- **Accent Colours:**
  - **Teal (#0f9e75):** Active, Compliant, Passed
  - **Amber (#f59e0b):** Warning, Review
  - **Red (#ef4444):** Critical, Failed, Breach
  - **Blue (#3b82f6):** Info, Monitoring

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Google AI Studio API Key (for the Security Sentinel)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/bastion-audit.git
   cd bastion-audit


   🇨🇦 Regulatory Compliance
Bastion Audit is designed with strict adherence to Canadian sovereign infrastructure requirements:

Data Residency: All data processing and audit trails are strictly confined to Canadian regions (Canada Central / Canada East).

Frameworks Supported:
OSFI E-21: Model Risk Management
PIPEDA: Personal Information Protection and Electronic Documents Act
FINTRAC: Anti-Money Laundering (AML) and Anti-Terrorist Financing (ATF)
AIDA: Artificial Intelligence and Data Act (Bill C-27)

📄 License
© 2026 NorthGuard Security. All rights reserved. Headquartered in Toronto, Ontario.
This project is licensed under the Apache-2.0 License.
