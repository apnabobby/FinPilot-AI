import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Lock,
  MessageSquare,
  FileText,
  CreditCard,
  Layers,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { ApprovalRequest, User, UserRole } from '../types.js';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  currentUser: User;
  onApprove: (id: string, comment?: string) => Promise<void>;
  onReject: (id: string, comment?: string) => Promise<void>;
  onRequestReview: (id: string, notes?: string, assignToRole?: string) => Promise<void>;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  currentUser,
  onApprove,
  onReject,
  onRequestReview,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [decisionModalAction, setDecisionModalAction] = useState<'APPROVE' | 'REJECT' | 'REVIEW' | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW');
  const historyApprovals = approvals.filter((a) => a.status === 'APPROVED' || a.status === 'REJECTED');

  const displayedList = (activeTab === 'PENDING' ? pendingApprovals : historyApprovals).filter((a) => {
    return riskFilter === 'ALL' || a.riskLevel === riskFilter;
  });

  const handleExecuteDecision = async () => {
    if (!selectedApproval || !decisionModalAction) return;

    // Critical-risk check: requires Admin
    if (selectedApproval.riskLevel === 'CRITICAL' && currentUser.role !== 'ADMIN') {
      setPermissionError(`CRITICAL risk approval requires Administrator credentials. Your current active role is ${currentUser.role}.`);
      return;
    }

    setSubmitting(true);
    setPermissionError(null);
    try {
      if (decisionModalAction === 'APPROVE') {
        await onApprove(selectedApproval.id, decisionComment);
      } else if (decisionModalAction === 'REJECT') {
        await onReject(selectedApproval.id, decisionComment);
      } else if (decisionModalAction === 'REVIEW') {
        await onRequestReview(selectedApproval.id, decisionComment, 'AUDITOR');
      }
      setDecisionModalAction(null);
      setSelectedApproval(null);
      setDecisionComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & SAFETY BANNER */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 mb-2">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>PAYMENT EXECUTION POLICY: ZERO AUTONOMOUS DISBURSEMENTS</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <span>Human Approval & Governance Gate</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Autonomous agents prepare evidence and recommendations, but are strictly prohibited from authorizing financial disbursements. Every decision requires verified human credentials.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
          <div className="text-[11px] font-mono text-slate-400">Current Approver</div>
          <div className="text-xs font-bold text-white mt-0.5">{currentUser.name}</div>
          <div className="text-[10px] font-mono text-cyan-400 font-semibold">{currentUser.role}</div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Actions ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-slate-800 text-slate-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Decided History ({historyApprovals.length})
          </button>
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                riskFilter === lvl
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* APPROVALS QUEUE */}
      {displayedList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-xs text-slate-500">
          No approval items found matching the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((appr) => {
            const isCritical = appr.riskLevel === 'CRITICAL';
            const isHigh = appr.riskLevel === 'HIGH';

            return (
              <div
                key={appr.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {appr.riskLevel} RISK (Score: {appr.riskScore})
                    </span>
                    <span className="font-mono text-cyan-400 text-xs font-semibold">
                      {appr.invoiceNumber}
                    </span>
                    <span className="text-white font-bold text-sm">
                      {appr.vendorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-bold font-mono tabular-nums text-white">
                        ${appr.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">Required: {appr.requiredRole}</div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation & Reason Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left: AI Recommendation & Agent Consensus */}
                  <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">AI RECOMMENDATION:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        appr.recommendation === 'APPROVE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : appr.recommendation === 'REJECT'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {appr.recommendation}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 pt-2 border-t border-slate-900">
                      <div className="font-semibold text-white mb-1">Reasoning:</div>
                      <ul className="space-y-1 text-[11px] text-slate-400">
                        {appr.reasoning.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Verification Consensus:</span>
                      <span className="text-cyan-400 font-bold">{appr.agentVerification.verificationScore}%</span>
                    </div>
                  </div>

                  {/* Middle: Evidence Snapshot */}
                  <div className="md:col-span-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Evidence Invariants</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div>
                        <span className="text-slate-500">Invoice Total:</span>
                        <div className="text-white font-bold">${appr.evidence.invoiceTotal.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Bank Settled ACH:</span>
                        <div className="text-slate-300">
                          {appr.evidence.bankMatchedAmount ? `$${appr.evidence.bankMatchedAmount.toFixed(2)}` : 'No Clearing Debit'}
                        </div>
                      </div>
                    </div>
                    {appr.evidence.riskAlerts && appr.evidence.riskAlerts.length > 0 && (
                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-rose-400 text-[11px] font-semibold">Flagged Inconsistencies:</span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {appr.evidence.riskAlerts.join(' · ')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Human Actions */}
                  <div className="md:col-span-3 flex flex-col justify-center gap-2 h-full">
                    {appr.status === 'PENDING' || appr.status === 'UNDER_REVIEW' ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedApproval(appr);
                            setDecisionModalAction('APPROVE');
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Invoice</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedApproval(appr);
                            setDecisionModalAction('REJECT');
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Payment</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedApproval(appr);
                            setDecisionModalAction('REVIEW');
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Request Review</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                        <div className="text-[10px] font-mono text-slate-500 uppercase">Decided By</div>
                        <div className="font-semibold text-white mt-0.5">{appr.decision?.decidedBy}</div>
                        <div className="text-[11px] text-slate-400 mt-1">"{appr.decision?.comment}"</div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION DECISION MODAL */}
      {selectedApproval && decisionModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Confirm Human Financial Decision</span>
              </h3>
              <button
                onClick={() => {
                  setDecisionModalAction(null);
                  setPermissionError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {permissionError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{permissionError}</div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Invoice:</span>
                <span className="font-mono text-white font-bold">{selectedApproval.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vendor:</span>
                <span className="text-slate-200">{selectedApproval.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Disbursement Amount:</span>
                <span className="font-mono text-cyan-400 font-bold">${selectedApproval.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Assessment:</span>
                <span className="font-mono text-rose-400 font-bold">{selectedApproval.riskLevel} (Score: {selectedApproval.riskScore})</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 block font-medium">
                Mandatory Approver Justification / Audit Comment:
              </label>
              <textarea
                value={decisionComment}
                onChange={(e) => setDecisionComment(e.target.value)}
                placeholder={`Provide the commercial justification for this ${decisionModalAction} action (recorded in permanent audit trail)...`}
                rows={3}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-500">
                Signing as: {currentUser.name} ({currentUser.role})
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDecisionModalAction(null);
                    setPermissionError(null);
                  }}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDecision}
                  disabled={submitting || !decisionComment.trim()}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer ${
                    decisionModalAction === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : decisionModalAction === 'REJECT'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  {submitting ? 'Executing...' : `Confirm ${decisionModalAction}`}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
