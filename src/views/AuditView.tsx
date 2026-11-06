import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  Bot,
  User as UserIcon,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { AuditEvent, SummaryMetrics } from '../types.js';

interface AuditViewProps {
  events: AuditEvent[];
  metrics: SummaryMetrics;
}

export const AuditView: React.FC<AuditViewProps> = ({ events, metrics }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actorFilter, setActorFilter] = useState('ALL');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.actor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'ALL' || e.entityType === entityFilter;
    const matchesActor = actorFilter === 'ALL' || e.actor.type === actorFilter;
    return matchesSearch && matchesEntity && matchesActor;
  });

  const handleDownloadCsv = () => {
    window.open('/api/reports/export', '_blank');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & EXPORT ACTIONS */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <span>Immutable Audit Trail & Regulatory Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Append-only financial audit log recording every autonomous agent execution, extraction assertion, forensic anomaly flag, and human approval sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Executive Report</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, or details..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs"
          >
            <option value="ALL">All Entity Types</option>
            <option value="INVOICE">Invoices</option>
            <option value="TRANSACTION">Transactions</option>
            <option value="RECONCILIATION">Reconciliation</option>
            <option value="WORKFLOW">Workflows</option>
            <option value="APPROVAL">Approvals</option>
            <option value="SYSTEM">System</option>
          </select>

          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs"
          >
            <option value="ALL">All Actors (Human & AI)</option>
            <option value="HUMAN">Human Operators</option>
            <option value="AI_AGENT">Autonomous AI Agents</option>
          </select>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Auditable Record & Evidence Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredEvents.map((evt) => {
                const isAgent = evt.actor.type === 'AI_AGENT';
                return (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isAgent ? (
                          <Bot className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="font-semibold text-white">{evt.actor.name}</span>
                        <span className="text-[10px] text-slate-500">({evt.actor.role})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {evt.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-cyan-400 whitespace-nowrap">
                      {evt.entityType} #{evt.entityId.slice(0, 14)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                      {evt.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXECUTIVE COMPLIANCE REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:p-0 print:bg-white print:text-black">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-8 space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:border-black">
              <div>
                <div className="text-xs font-mono text-cyan-400 print:text-blue-700 uppercase">
                  Vultr Autonomous Operations Compliance
                </div>
                <h2 className="text-xl font-bold text-white print:text-black mt-1">
                  FinPilot AI Executive Audit & Reconciliation Certificate
                </h2>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs">
              <div>
                <div className="text-slate-400 print:text-gray-600">Total Accounts Payable:</div>
                <div className="text-base font-bold font-mono text-white print:text-black mt-1">
                  ${metrics.totalValue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-slate-400 print:text-gray-600">Reconciliation Rate:</div>
                <div className="text-base font-bold font-mono text-cyan-400 print:text-blue-700 mt-1">
                  {metrics.reconciliationRate}%
                </div>
              </div>
              <div>
                <div className="text-slate-400 print:text-gray-600">Forensic Anomalies Held:</div>
                <div className="text-base font-bold font-mono text-rose-400 print:text-red-700 mt-1">
                  {metrics.suspiciousTransactions} Flags
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300 print:text-gray-800">
              <h4 className="font-bold text-white print:text-black">Attestation Statement:</h4>
              <p>
                FinPilot AI operated under strict human-in-the-loop governance policies. All 6 specialized autonomous agents (Planner, Document Intelligence, Reconciliation, Fraud Detection, Verification, Human Approval) executed on the designated Vultr Cloud Compute server.
              </p>
              <p>
                Zero unauthorized financial disbursements occurred. High-risk transactions involving offshore routing changes or duplicate invoice number collisions were quarantined and escalated to authorized enterprise controllers for explicit manual approval.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 print:border-gray-300 flex items-center justify-between print:hidden">
              <span className="text-[11px] font-mono text-slate-500">
                Generated at: {new Date().toUTCString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReport}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 cursor-pointer"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
