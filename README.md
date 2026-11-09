# FinPilot AI — Autonomous Enterprise Workflow Agent

> Powering the Future of Work | Built for Vultr: Agent Rush Hackathon (Challenge 2)

## 🚀 Live Demo

🔗 [http://149.28.53.70](http://149.28.53.70)
---

## 1. Overview & Problem Statement

### The Problem:
Enterprise finance operations and accounts payable teams spend over 40% of their working hours on manual, repetitive, error-prone tasks:
- **Manual Invoice Data Entry & Cross-Checking:** Accountants spend hours re-typing vendor details, calculating taxes, and verifying itemized math from hundreds of supplier PDFs.
- **Tedious Bank Reconciliation:** Matching ledger invoices against bank statements requires cross-referencing reference numbers, clearing amounts, and settlement dates across disparate systems.
- **Rampant Payment Fraud & Redirection Attacks:** Sophisticated invoice manipulation—such as vendor email compromise (VEC), altered offshore wire routing, and double-billing collisions—costs global enterprises billions annually because human reviewers miss subtle anomalies in high-volume queues.

### The Solution:
**FinPilot AI** automates this entire financial operations lifecycle through a coordinated fleet of **6 specialized autonomous AI agents** operating on a central **Vultr Cloud Compute VM**:
1. **Automated Multimodal Document Processing:** Reads invoice PDFs, PNGs, and JPGs via Gemini 3.8 Flash, extracting vendor data, line items, and remittance details with field-level confidence scores.
2. **Deterministic Mathematical Verification:** Re-verifies arithmetic consistency (`subtotal + tax = total`) with zero drift using deterministic server-side code.
3. **Autonomous Ledger Reconciliation:** Dual exact and fuzzy matching pairs accounts payable invoices with bank transaction debits.
4. **Forensic Fraud Detection:** Uncovers duplicate invoice numbers, clearing variances, and unverified offshore bank routing.
5. **Smart Human-in-the-Loop Escalation:** High-risk actions (e.g., invoices with offshore wires, discrepancies, or high values) pause the autonomous loop and generate structured decision cards for authorized human controllers.
6. **Immutable Audit Trail:** Maintains an append-only event log recording every agent assertion and human decision.

---

## 2. Core Features

### A. Multi-Step Agentic Planning:
- The **Planner Agent** breaks down the business task into a topological dependency graph:  
  `QUEUED` → `PLANNING` → `PROCESSING` → `RECONCILING` → `FRAUD_CHECK` → `VERIFYING` → `WAITING_FOR_APPROVAL` → `APPROVED` / `REJECTED` → `COMPLETED`.
- State is persistently tracked across agent handoffs, ensuring retry mechanisms, timeout management, and step-by-step execution telemetry.

### B. Human-in-the-Loop Governance:
- **Zero Autonomous Financial Disbursements:** AI agents are strictly air-gapped from initiating bank transfers or ACH drafts.
- High-risk and threshold-exceeding transactions automatically pause the workflow and generate structured approval requests.
- Requires role-based credentials (Administrator for critical risk, Finance Manager for standard releases) and mandatory audit justifications.

### C. Enterprise Dashboard & Visual Tracker:
- High-density dark-first dashboard inspired by Linear, Stripe, and Ramp.
- **7 Real-Time KPI Metrics:** Total invoices processed, total value ($), reconciliation rate (%), pending approvals, duplicates caught, suspicious transactions, and risk exposure ($).
- **Interactive Data Visualizations (Recharts):** 14-day invoicing volume trends, reconciliation status breakdown, and risk distribution.
- **Real-Time Agent Fleet Monitor:** Live status, current task, latency (ms), and expandable execution logs for all 6 agents.

---

## 3. Vultr Infrastructure Architecture (Mandatory Section)

> **Hackathon Requirement:** The Vultr VM must serve as the central control and orchestration layer, not merely static web hosting.

### Role of Vultr:
- **Central Control Layer:** The backend orchestrator runs on a **Vultr Cloud Compute (VM)** running Ubuntu 24.04 LTS. It plans tasks, dispatches specialized agents, enforces state machine transitions, and validates intermediate results.
- **Workflow State & Database:** Multi-step jobs, accounts payable invoices, bank transactions, and append-only audit trails are managed via a relational PostgreSQL database and persistent NVMe storage directly on the Vultr VM.
- **Resilient Multi-Container Stack:** Nginx reverse proxy with TLS termination, Express API server, and PostgreSQL database containerized via Docker Compose.

### Architecture Flow:
```text
[User / Web Frontend (React 19 + Tailwind v4 + Recharts)]
        │
        ▼ (REST API / Server-Sent Events SSE stream)
[Vultr Cloud Compute (VM)] ───► Central Control & Orchestration Layer
        │
        ├──► Agent Planner & State Manager (Topological multi-step state machine)
        ├──► LLM Inference Layer (Gemini 3.8 Flash / Vultr Serverless Inference)
        └──► Verification & Audit Database (PostgreSQL Relational Ledger + NVMe Storage)
```

### Vultr VM Specifications:
- **Server:** Vultr High-Frequency Cloud Compute
- **OS:** Ubuntu 24.04 LTS
- **vCPU:** 4 vCPU High-Frequency Tier
- **Memory:** 8 GB RAM
- **Storage:** 160 GB NVMe Storage
- **Network:** 10 Gbps Direct Uplink (New Jersey EWR Datacenter)

---

## 4. Multi-Agent Fleet Specification

| Agent Name | Architectural Role | Model / Engine | Responsibilities |
| :--- | :--- | :--- | :--- |
| **01. Planner Agent** | Task Orchestration | `gemini-3.8-flash` | Formulates task execution graph, verifies dependencies, schedules pipeline. |
| **02. Document Intelligence** | Multimodal OCR | `gemini-3.8-flash` + OCR | Extracts vendor, invoice #, amounts, due dates, bank routing, confidence scores. |
| **03. Reconciliation Agent** | Ledger Synchronization | Deterministic Fuzzy Engine | Pairs invoices with bank debits, calculates match confidence, flags discrepancies. |
| **04. Fraud Detection Agent** | Forensic Risk Scorer | Anomaly Rules + LLM | Investigates duplicate numbers, offshore routing, clearing amount variances. |
| **05. Verification Agent** | Independent Auditor | Deterministic Math Engine | Validates subtotal + tax = total, cross-checks assertions, rejects unsupported claims. |
| **06. Human Approval Agent** | Governance Gatekeeper | Stateful Authorization Guard | Halts autonomous loop; generates side-by-side evidence cards for human controllers. |

---

## 5. Demonstration Walkthrough & Seed Data

The platform comes pre-seeded with **100 realistic invoices** and **120 bank transactions** showcasing real-world enterprise edge cases:

1. **One-Click Autonomous Demo:** Click **"Run Autonomous Batch"** in the top navigation or dashboard. Watch all 6 agents execute live through the full state machine.
2. **Critical Duplicate Collision:** Inspect invoice `VULTR-2026-1001` — flagged for duplicate submission within 48 hours.
3. **Clearing Variance Discrepancy:** Inspect `DDG-2026-1002` — invoice declared at $18,450.00 while the bank ACH clearing debit settled at $21,950.00 (+18.9% variance).
4. **Unverified Offshore Wire Routing:** Inspect `APEX-2026-1003` ($34,900.00) — flagged for beneficiary redirection to an unverified Cayman Islands bank branch.
5. **Human Governance Checkpoint:** Open **Approval Center**, review side-by-side evidence, and approve or reject with mandatory audit comments.
6. **Immutable Audit Trail:** Navigate to **Audit Trail & Reports** to inspect event logs and export formal CSV and printable compliance certificates.

---

## 6. Local Setup & Docker Deployment

### Prerequisites:
- Node.js >= 20.0.0
- Docker & Docker Compose (optional for containerized deployment)

### Development Setup:
```bash
# Clone the repository
git clone https://github.com/vultr-hackathon/finpilot-ai.git
cd finpilot-ai

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run local development server (Express + Vite)
npm run dev
```

### Production Deployment via Docker Compose on Vultr VM:
```bash
# Build and run containerized services
docker compose up -d --build

# Verify running services
docker compose ps
```

---

## 7. Role-Based Access Control (RBAC)

FinPilot AI supports realistic enterprise roles (switchable in the bottom-left profile switcher):
- **Administrator** (`Alexandria Chen`): Authority to sign off on Critical and High-risk disbursements.
- **Finance Manager** (`Marcus Vance`): Authority over accounts payable releases and threshold approvals.
- **Senior Accountant** (`Sarah Lindqvist`): Manual reconciliation link overrides and invoice data corrections.
- **Compliance Auditor** (`David O’Connor`): Read-only forensic analysis, invariant verification, and export generation.
