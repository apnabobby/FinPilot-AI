import React, { useState } from 'react';
import {
  FileText,
  GitMerge,
  ShieldAlert,
  ArrowRight,
  Cpu,
  Layers,
  Database,
  Lock,
  ChevronRight,
  UserCheck,
  Zap,
  Server,
} from 'lucide-react';
import { Navbar } from './Navbar.js';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeAgentTab, setActiveAgentTab] = useState<number>(0);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const agents = [
    {
      title: 'Planner Agent',
      desc: 'Formulates task dependency graphs, checks preconditions, and schedules specialized agent pipelines based on transaction volume and risk tier.',
      badge: 'TOPOLOGICAL ENGINE',
      icon: Cpu,
    },
    {
      title: 'Document Intelligence Agent',
      desc: 'Multimodal OCR and schema normalization extracting vendor names, invoice numbers, tax IDs, and bank remittance data with field-level confidence scores.',
      badge: 'MULTIMODAL EXTRACTION',
      icon: FileText,
    },
    {
      title: 'Reconciliation Agent',
      desc: 'Executes exact and fuzzy matching between accounts payable invoices and bank transaction feeds, identifying amounts and timing variances.',
      badge: 'LEDGER SYNC',
      icon: GitMerge,
    },
    {
      title: 'Fraud Detection Agent',
      desc: 'Forensic risk analyzer scanning for duplicate invoice numbers, unverified offshore wire instructions, and velocity anomalies.',
      badge: 'FORENSIC ANOMALY',
      icon: ShieldAlert,
    },
    {
      title: 'Verification Agent',
      desc: 'Independent auditor re-verifying mathematical consistency (subtotal + tax = total) and confirming evidence integrity prior to human gating.',
      badge: 'INDEPENDENT AUDIT',
      icon: Layers,
    },
    {
      title: 'Human Approval Agent',
      desc: 'Strict governance checkpoint blocking autonomous payment execution and presenting rich decision cards to authorized finance controllers.',
      badge: 'HUMAN-IN-THE-LOOP',
      icon: UserCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar onEnterApp={onEnterApp} onNavigateSection={scrollTo} />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden border-b border-slate-800/60">
        {/* Subtle ambient gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline and Call-to-actions */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Vultr Agent Rush Hackathon · Challenge 2</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 text-balance">
                Your Finance Operations. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Now Autonomous.
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-8">
                FinPilot AI coordinates six specialized autonomous AI agents to eliminate manual reconciliation, catch invoice fraud, and enforce strict human approval checkpoints on Vultr Cloud Compute.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <button
                  onClick={onEnterApp}
                  className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-lg shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Launch FinPilot AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTo('agents')}
                  className="px-6 py-3.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Inspect Agent Fleet
                </button>
              </div>

              {/* Trust & Architecture KPI Strip */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 w-full max-w-lg">
                <div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-white">6 Agents</div>
                  <div className="text-xs text-slate-500 mt-0.5">Autonomous Fleet</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400">100%</div>
                  <div className="text-xs text-slate-500 mt-0.5">Human Governance Gate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">&lt; 2.1s</div>
                  <div className="text-xs text-slate-500 mt-0.5">Vultr VM Pipeline Speed</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset with Glass Overlay */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl shadow-cyan-950/40 group">
                <img
                  src="/src/assets/images/hero_finpilot_network_1793891655993.jpg"
                  alt="FinPilot Autonomous Financial Data Pipeline"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Floating Telemetry Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="font-mono text-cyan-400">STATE: ACTIVE ORCHESTRATION</span>
                    <span className="font-mono">VULTR BARE METAL</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Batch #BATCH-101: 5 Invoices Reconciled
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Offshore wire flagged by Fraud Agent · Halted for Admin sign-off
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE FEATURES (Section 2 Requirements) */}
      <section id="features" className="py-20 bg-slate-950 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="max-w-2xl mb-16">
            <div className="text-xs font-mono font-semibold text-cyan-400 tracking-wider uppercase mb-2">
              Three Non-Negotiable Pillars
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for Enterprise Financial Defense
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Autonomous execution paired with mathematical invariants and zero-compromise human authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  01. AI Invoice Intelligence
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Multimodal OCR and Gemini 3.8 Flash structured extraction for PDF, PNG, and JPG invoices. Computes field-level confidence scores, enforces mathematical consistency (subtotal + tax = total), and flags duplicate vendor collisions.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pt-4 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Field-level confidence scoring (0–100%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Subtotal & tax arithmetic verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Direct inline corrections in editable table</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-6">
                  <GitMerge className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  02. Autonomous Reconciliation
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Dual-algorithm matching engine parsing corporate bank transaction CSVs against accounts payable invoices. Flags amount variances, missing debits, and unverified offshore bank routing with transparent evidence trails.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pt-4 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Exact & fuzzy semantic counterparty matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Forensic offshore wire routing detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Manual link overrides for edge cases</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-6">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  03. Human Approval & Audit
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Agents can never independently trigger financial disbursements. High-risk decisions are gated by role-based human sign-off with side-by-side evidence, mandatory comments, and an append-only immutable audit trail.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pt-4 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Autonomous transfers strictly blocked by policy</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Role-based delegation (Admin, Manager, Auditor)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Immutable audit log with CSV & PDF export</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* MULTI-AGENT ORCHESTRATION FLEET (Section 3 Requirements) */}
      <section id="agents" className="py-20 bg-slate-900/30 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-mono font-semibold text-cyan-400 tracking-wider uppercase mb-2">
              Autonomous Collaboration
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              The Six Specialized Agents
            </h2>
            <p className="text-slate-400 mt-2 text-base">
              Every displayed status reflects real backend events executed on the Vultr Cloud Compute server.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Agent Selector List */}
            <div className="lg:col-span-5 space-y-2">
              {agents.map((agent, index) => {
                const IconComponent = agent.icon;
                const isActive = activeAgentTab === index;
                return (
                  <button
                    key={agent.title}
                    onClick={() => setActiveAgentTab(index)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-950/30'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{agent.title}</div>
                        <div className="text-[11px] font-mono text-slate-500">{agent.badge}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isActive ? 'text-cyan-400 translate-x-1' : ''}`} />
                  </button>
                );
              })}
            </div>

            {/* Right: Selected Agent Interactive Deep Dive */}
            <div className="lg:col-span-7 p-8 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <div>
                  <span className="text-xs font-mono font-medium text-cyan-400">
                    AGENT SPECIFICATION #{activeAgentTab + 1}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {agents[activeAgentTab].title}
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-md text-xs font-mono bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                  ACTIVE ON VULTR
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                {agents[activeAgentTab].desc}
              </p>

              {/* Execution Lifecycle Preview */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-6">
                <div className="text-xs font-mono text-slate-400 mb-3 flex items-center justify-between">
                  <span>EXECUTION LIFECYCLE HANDOFF</span>
                  <span className="text-cyan-400">STATE: VERIFIED INVARIANTS</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-2 text-[11px] font-mono">
                  {['QUEUED', 'PLANNING', 'PROCESSING', 'RECONCILING', 'FRAUD_CHECK', 'VERIFYING', 'APPROVAL', 'DONE'].map((st, i) => (
                    <React.Fragment key={st}>
                      <span className={`px-2 py-1 rounded whitespace-nowrap ${i <= activeAgentTab + 1 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-600'}`}>
                        {st}
                      </span>
                      {i < 7 && <span className="text-slate-600">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                <span className="font-mono">HOST: Vultr Ubuntu VM (Node.js + tsx)</span>
                <button
                  onClick={onEnterApp}
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                >
                  <span>Test in Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* VULTR INFRASTRUCTURE SECTION (Section 8 Requirements) */}
      <section id="infrastructure" className="py-20 bg-slate-950 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 mb-4">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>MANDATORY VULTR CLOUD COMPUTE ARCHITECTURE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Powered by Vultr Cloud Compute
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-6">
                The Vultr Ubuntu Cloud Compute VM serves as the central application server and agent controller—not a passive web host. It actively coordinates multi-agent state machines, executes forensic anomaly algorithms, and manages persistent relational data.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Ubuntu 24.04 LTS & Docker Compose</div>
                    <div className="text-xs text-slate-400">Containerized orchestration bundling Express API, Vite SPA, and PostgreSQL.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Persistent NVMe Storage</div>
                    <div className="text-xs text-slate-400">High-IOPS local storage for invoice binaries, audit event logs, and bank statement CSVs.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Nginx Reverse Proxy & SSL</div>
                    <div className="text-xs text-slate-400">TLS termination, rate limiting, and strict security headers for financial governance.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Datacenter Visual */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40 relative group">
                <img
                  src="/src/assets/images/vultr_cloud_datacenter_1793891656698.jpg"
                  alt="Vultr Enterprise Cloud Compute Cluster"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">Vultr High-Frequency Compute</div>
                    <div className="text-slate-400 text-[11px]">New Jersey EWR · 10Gbps Network Fabric</div>
                  </div>
                  <span className="font-mono text-emerald-400 text-xs">99.99% UPTIME</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* GOVERNANCE & SECURITY (Section 9 Requirements) */}
      <section id="security" className="py-20 bg-slate-900/30 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono font-semibold text-cyan-400 tracking-wider uppercase mb-2">
              Financial Safety Guarantee
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Zero Unauthorized Financial Disbursements
            </h2>
            <p className="text-slate-400 mt-2 text-base">
              Autonomous agents extract, reconcile, and investigate. Only authorized human controllers hold execution authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl font-bold font-mono text-white mb-1">RBAC</div>
              <div className="text-xs font-semibold text-cyan-400 mb-2">Role Access Control</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Distinct permissions for Administrator, Finance Manager, Accountant, and Compliance Auditor.
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl font-bold font-mono text-white mb-1">Append-Only</div>
              <div className="text-xs font-semibold text-blue-400 mb-2">Immutable Audit Trail</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Every agent assertion, extraction confidence, and human approval decision is recorded permanently.
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl font-bold font-mono text-white mb-1">No Drift</div>
              <div className="text-xs font-semibold text-indigo-400 mb-2">Deterministic Math</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                LLMs never certify financial truth alone. Code validates subtotal, tax formulas, and ledger balance.
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl font-bold font-mono text-white mb-1">Air-Gapped</div>
              <div className="text-xs font-semibold text-emerald-400 mb-2">Payment Guardrail</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                The platform contains no API keys capable of executing real bank transfers or ACH drafts.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 bg-slate-950 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Experience Autonomous Finance Operations
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-8">
            Inspect 100 sample invoices, 120 bank transactions, duplicate detection, and live agent orchestration in the FinPilot interactive console.
          </p>
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-xl shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Launch FinPilot AI Operations</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">FinPilot AI</span>
            <span>· Built for Vultr Agent Rush Hackathon 2026</span>
          </div>
          <div>
            <span>Vultr Cloud Compute Infrastructure · Challenge 2: Powering the Future of Work</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
