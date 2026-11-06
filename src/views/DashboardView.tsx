import React from 'react';
import {
  FileText,
  DollarSign,
  GitMerge,
  Clock,
  Copy,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SummaryMetrics, Workflow, AgentStatus, AuditEvent } from '../types.js';

interface DashboardViewProps {
  metrics: SummaryMetrics;
  workflows: Workflow[];
  agents: AgentStatus[];
  auditEvents: AuditEvent[];
  onNavigateTab: (tab: string) => void;
  onTriggerDemo: () => void;
  isDemoRunning: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  workflows,
  agents,
  auditEvents,
  onNavigateTab,
  onTriggerDemo,
  isDemoRunning,
}) => {
  // Mock historical 14-day volume data for trend chart
  const trendData = [
    { day: 'Oct 22', invoices: 8, value: 18200 },
    { day: 'Oct 23', invoices: 12, value: 29400 },
    { day: 'Oct 24', invoices: 15, value: 34100 },
    { day: 'Oct 25', invoices: 9, value: 22800 },
    { day: 'Oct 26', invoices: 6, value: 14500 },
    { day: 'Oct 27', invoices: 14, value: 38900 },
    { day: 'Oct 28', invoices: 19, value: 52400 },
    { day: 'Oct 29', invoices: 22, value: 68100 },
    { day: 'Oct 30', invoices: 18, value: 47200 },
    { day: 'Oct 31', invoices: 24, value: 74500 },
    { day: 'Nov 01', invoices: 16, value: 41200 },
    { day: 'Nov 02', invoices: 21, value: 58900 },
    { day: 'Nov 03', invoices: 27, value: 89400 },
    { day: 'Nov 04', invoices: metrics.totalInvoices || 100, value: metrics.totalValue || 482100 },
  ];

  const reconciliationData = [
    { name: 'Reconciled', value: Math.round((metrics.reconciliationRate / 100) * metrics.totalInvoices) || 75, color: '#06b6d4' },
    { name: 'Discrepancy', value: 4, color: '#f59e0b' },
    { name: 'Unmatched', value: metrics.totalInvoices - Math.round((metrics.reconciliationRate / 100) * metrics.totalInvoices) - 4 || 21, color: '#64748b' },
  ];

  const riskData = [
    { name: 'Low Risk', value: 68, color: '#10b981' },
    { name: 'Medium Risk', value: 18, color: '#3b82f6' },
    { name: 'High Risk', value: 10, color: '#f59e0b' },
    { name: 'Critical Risk', value: 4, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      
      {/* HERO BANNER & ONE-CLICK RUNNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 mb-2">
            <span>AUTONOMOUS ORCHESTRATION</span>
            <span>·</span>
            <span>VULTR CLOUD COMPUTE VM</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Financial Operations Command Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Autonomous multi-agent orchestration coordinating document extraction, ledger reconciliation, forensic risk scoring, and human-in-the-loop governance.
          </p>
        </div>

        <button
          onClick={onTriggerDemo}
          disabled={isDemoRunning}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-semibold text-slate-950 shadow-lg transition-all shrink-0 cursor-pointer ${
            isDemoRunning
              ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-cyan-500/20'
          }`}
        >
          <Cpu className={`w-4 h-4 ${isDemoRunning ? 'animate-spin' : ''}`} />
          <span>{isDemoRunning ? 'Executing 6-Agent Batch...' : 'Run Autonomous Batch (Demo)'}</span>
        </button>
      </div>

      {/* TOP 7 KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        
        {/* Card 1: Total Invoices */}
        <div
          onClick={() => onNavigateTab('invoices')}
          className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Invoices</span>
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {metrics.totalInvoices}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Batch total</span>
            <ArrowUpRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Card 2: Total Value */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Processed</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white truncate">
            ${Math.round(metrics.totalValue).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Accounts payable</div>
        </div>

        {/* Card 3: Reconciliation Rate */}
        <div
          onClick={() => onNavigateTab('reconciliation')}
          className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Reconciled</span>
            <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-cyan-400">
            {metrics.reconciliationRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Ledger matched</span>
            <ArrowUpRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Card 4: Pending Approvals */}
        <div
          onClick={() => onNavigateTab('approvals')}
          className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Approvals</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400">
            {metrics.pendingApprovals}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Human gating</span>
            <ArrowUpRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Card 5: Duplicate Invoices */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Duplicates</span>
            <Copy className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-400">
            {metrics.duplicatesDetected}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Collisions caught</div>
        </div>

        {/* Card 6: Suspicious Transactions */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Suspicious</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400">
            {metrics.suspiciousTransactions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Forensic alerts</div>
        </div>

        {/* Card 7: Risk Exposure */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Exposure</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-red-400 truncate">
            ${Math.round(metrics.financialRiskExposure).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">High-risk held</div>
        </div>

      </div>

      {/* CHARTS ROW (Trend & Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Invoice Volume & Total Value Trajectory</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Historical 14-day AP ingestion and validation throughput
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              Live Stream
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Total Volume']}
                />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-white">Reconciliation Ledger Status</div>
            <div className="text-xs text-slate-400 mt-0.5">Matched vs Discrepancy Breakdown</div>
          </div>

          <div className="h-44 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reconciliationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reconciliationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-slate-800 text-xs">
            {reconciliationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono tabular-nums font-semibold">{item.value} records</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LOWER SECTION: ACTIVE WORKFLOWS & LIVE AGENT FLEET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Workflows (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-white">Active Multi-Agent Workflows</div>
              <div className="text-xs text-slate-400">State machines executing on Vultr VM</div>
            </div>
            <button
              onClick={() => onNavigateTab('agents')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              View Command Center →
            </button>
          </div>

          {workflows.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No active workflows. Click "Run Autonomous Batch" above to launch.
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.slice(0, 3).map((wf) => (
                <div key={wf.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs font-semibold text-white">{wf.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {wf.batchId || wf.id} · {wf.summary.invoicesCount} Invoices (${wf.summary.totalAmount.toLocaleString()})
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      wf.status === 'PAUSED_APPROVAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : wf.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {wf.stage}
                    </span>
                  </div>

                  {/* Step Progress Bar */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto">
                    {wf.steps.map((st, i) => (
                      <div key={st.id} className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded ${
                          st.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : st.status === 'RUNNING'
                            ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                            : 'bg-slate-900 text-slate-600'
                        }`}>
                          {st.agentName.split(' ')[0]}
                        </span>
                        {i < wf.steps.length - 1 && <span className="text-slate-600">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Agent Fleet Monitor (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-white">Agent Fleet Status</div>
              <div className="text-xs text-slate-400">Autonomous processing status</div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">6 / 6 OPERATIONAL</span>
          </div>

          <div className="space-y-2.5">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{agent.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">({agent.model.split(' ')[0]})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[220px] mt-0.5">
                    {agent.currentTask}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    agent.status === 'ACTIVE'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : agent.status === 'WAITING'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {agent.status}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {agent.latencyMs}ms
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
