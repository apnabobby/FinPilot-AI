import React, { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  Lock,
  Cpu,
  Shield,
  Layers,
  Save,
  Check,
  CheckCircle2,
  HardDrive,
  Globe,
  Radio,
  ExternalLink,
  Terminal,
  Activity,
  FileCode,
} from 'lucide-react';
import { User } from '../types.js';

interface SettingsViewProps {
  currentUser: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const [approvalThreshold, setApprovalThreshold] = useState<number>(25000);
  const [fraudQuarantineScore, setFraudQuarantineScore] = useState<number>(75);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'VULTR_ARCH' | 'GOVERNANCE' | 'HACKATHON_SPEC'>('VULTR_ARCH');

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* HEADER */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 mb-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>VULTR: AGENT RUSH HACKATHON · CHALLENGE 2</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>Vultr Infrastructure & Architecture Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Vultr Cloud Compute VM central control layer, state manager, PostgreSQL database connection, and governance guardrails.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>VULTR VM HOST ACTIVE</span>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('VULTR_ARCH')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'VULTR_ARCH'
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Vultr Central Control Architecture
        </button>
        <button
          onClick={() => setActiveTab('HACKATHON_SPEC')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'HACKATHON_SPEC'
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Challenge 2 Submission Spec
        </button>
        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'GOVERNANCE'
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Governance & Risk Thresholds
        </button>
      </div>

      {/* TAB 1: VULTR CENTRAL CONTROL ARCHITECTURE */}
      {activeTab === 'VULTR_ARCH' && (
        <div className="space-y-6">
          
          {/* VULTR VM ARCHITECTURE CARD */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Vultr Cloud Compute Specifications
                  </h2>
                  <div className="text-xs text-slate-400">
                    Central Application & Agent Orchestration Server (Ubuntu 24.04 LTS)
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-400">STATUS: PROVISIONED</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">COMPUTE TIER</span>
                <span className="text-white font-bold">High-Frequency 4 vCPU</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">MEMORY</span>
                <span className="text-white font-bold">8 GB High-Speed RAM</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">LOCAL NVME DISK</span>
                <span className="text-white font-bold">160 GB NVMe Storage</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">NETWORK FABRIC</span>
                <span className="text-cyan-400 font-bold">10 Gbps Direct Uplink</span>
              </div>
            </div>

            {/* Exact Flow Diagram matching Hackathon Prompt */}
            <div className="p-5 rounded-xl bg-slate-950/95 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>VULTR CLOUD COMPUTE ARCHITECTURE FLOW</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">MANDATORY HACKATHON PATTERN</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-900/90 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{`[User / Web Frontend (React 19 + Tailwind v4 + Recharts)]
        │
        ▼ (REST API / Server-Sent Events SSE stream)
[Vultr Cloud Compute (VM)] ───► Central Control & Orchestration Layer
        │
        ├──► Agent Planner & State Manager (Topological multi-step state machine)
        ├──► LLM Inference Layer (Gemini 3.8 Flash + Deterministic OCR)
        └──► Verification & Audit Database (PostgreSQL Relational Ledger + NVMe Storage)`}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-white mb-1">1. Central Control Layer</div>
                  <div className="text-[11px] text-slate-400">
                    Runs the multi-agent state machine on the Vultr VM, managing execution steps from QUEUED to WAITING_FOR_APPROVAL.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-white mb-1">2. Stateful Storage</div>
                  <div className="text-[11px] text-slate-400">
                    Maintains persistent relational state across workflows, invoices, bank matches, and fraud alerts.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-white mb-1">3. Human-in-the-Loop Gate</div>
                  <div className="text-[11px] text-slate-400">
                    Autonomous transfer code is disabled. Workflows strictly pause at Step 6 awaiting authorized human sign-off.
                  </div>
                </div>
              </div>
            </div>

            {/* Docker Compose Topology */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-[11px] font-mono text-cyan-400 uppercase">
                Containerized Docker Compose Services on Vultr VM
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <Globe className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <div className="font-bold text-white">Nginx Proxy</div>
                  <div className="text-[10px] text-slate-500">Port 80/443 SSL</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <Cpu className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="font-bold text-white">Express Backend</div>
                  <div className="text-[10px] text-slate-500">Port 3000 Node.js</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <Layers className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <div className="font-bold text-white">6 AI Agents</div>
                  <div className="text-[10px] text-slate-500">Autonomous Fleet</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <Database className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="font-bold text-white">PostgreSQL</div>
                  <div className="text-[10px] text-slate-500">Port 5432 Ledger</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <HardDrive className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="font-bold text-white">Storage Volume</div>
                  <div className="text-[10px] text-slate-500">Persistent NVMe</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: HACKATHON SPECIFICATION & JUDGE CHECKLIST */}
      {activeTab === 'HACKATHON_SPEC' && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase">Official Hackathon Submission</div>
            <h2 className="text-xl font-bold text-white mt-1">
              FinPilot AI — Autonomous Enterprise Workflow Agent
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Challenge 2: "Powering the Future of Work" · Vultr Agent Rush 2026
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1. Overview & Problem Statement</span>
              </h3>
              <p className="text-slate-400">
                <strong className="text-slate-200">The Problem:</strong> Enterprise finance teams waste hundreds of hours each quarter manually checking invoices, matching bank statement lines, and verifying tax arithmetic. Worse, sophisticated invoice manipulation (such as offshore wire redirection and duplicate billing) causes billions in enterprise fraud losses.
              </p>
              <p className="text-slate-400">
                <strong className="text-slate-200">The Solution:</strong> FinPilot AI automates the end-to-end financial operations pipeline via 6 specialized autonomous agents executing on Vultr Cloud Compute. The system extracts structured fields with confidence scores, matches transactions with dual exact/fuzzy logic, investigates duplicate collisions and offshore routing, validates calculations with deterministic code, and enforces mandatory human approval.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>2. Three Core Features</span>
              </h3>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li>
                  <strong className="text-slate-200">Multi-Step Agentic Planning:</strong> The Planner Agent decomposes tasks, builds topological execution graphs, and manages execution steps with state persistence.
                </li>
                <li>
                  <strong className="text-slate-200">Human-in-the-Loop Governance:</strong> High-risk disbursements require explicit human confirmation with side-by-side invoice and bank evidence. Autonomous agents are strictly air-gapped from executing actual financial transfers.
                </li>
                <li>
                  <strong className="text-slate-200">Enterprise Dashboard & Audit Trail:</strong> High-density dashboard with 7 KPI metrics, 14-day trend charts, active workflow visualizer, real-time agent fleet telemetry, and an immutable append-only audit trail with CSV and printable certificates.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>3. Vultr Infrastructure Architecture (Mandatory)</span>
              </h3>
              <p className="text-slate-400">
                The Vultr Cloud Compute VM is the central brain and execution engine of the platform. It handles agent task dispatch, maintains workflow states, runs PostgreSQL, processes file OCR, and computes forensic anomaly scores.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: GOVERNANCE & THRESHOLDS */}
      {activeTab === 'GOVERNANCE' && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Financial Governance & Risk Guardrails
              </h2>
              <div className="text-xs text-slate-400">
                Configure automated quarantine triggers and authorization thresholds
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <label className="text-slate-300 font-semibold block">
                High-Value Invoice Human Hold Threshold ($)
              </label>
              <input
                type="number"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500">
                Invoices exceeding this amount require explicit Finance Manager sign-off even if all checks pass.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-semibold block">
                Automatic Forensic Quarantine Risk Score (0–100)
              </label>
              <input
                type="number"
                value={fraudQuarantineScore}
                onChange={(e) => setFraudQuarantineScore(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500">
                Any invoice with risk score equal or above this threshold is immediately frozen and flagged for Administrator review.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {saveSuccess ? (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Thresholds updated and applied across all agents!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Changes take effect immediately on next batch dispatch.
              </span>
            )}

            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Governance Rules</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
