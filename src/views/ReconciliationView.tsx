import React, { useState } from 'react';
import {
  GitMerge,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  ArrowRightLeft,
  Link as LinkIcon,
  Play,
  FileSpreadsheet,
  DollarSign,
  HelpCircle,
  X,
  Check,
} from 'lucide-react';
import { Invoice, BankTransaction, ReconciliationMatch } from '../types.js';

interface ReconciliationViewProps {
  invoices: Invoice[];
  transactions: BankTransaction[];
  matches: ReconciliationMatch[];
  summary: {
    totalInvoices: number;
    matchedInvoices: number;
    unmatchedInvoices: number;
    reconciliationRatePercent: number;
    discrepancyCount: number;
  };
  onRunReconciliation: () => Promise<void>;
  onManualMatch: (invoiceId: string, transactionId: string, notes?: string) => Promise<void>;
  onUploadCsvTransactions: (txs: Partial<BankTransaction>[]) => Promise<void>;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  invoices,
  transactions,
  matches,
  summary,
  onRunReconciliation,
  onManualMatch,
  onUploadCsvTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<'MATCHES' | 'UNMATCHED_INVOICES' | 'UNMATCHED_TRANSACTIONS'>('MATCHES');
  const [searchTerm, setSearchTerm] = useState('');
  const [manualMatchModalOpen, setManualMatchModalOpen] = useState(false);
  const [selectedInvoiceForMatch, setSelectedInvoiceForMatch] = useState<Invoice | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');
  const [manualMatchNotes, setManualMatchNotes] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Filtered unmatched records
  const unmatchedInvoices = invoices.filter(
    (inv) => !matches.some((m) => m.invoiceId === inv.id)
  );
  const unmatchedTransactions = transactions.filter((tx) => tx.status === 'UNMATCHED');

  const filteredMatches = matches.filter((m) => {
    return (
      m.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.transactionCounterparty.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSimulateCsvUpload = async () => {
    // Ingest 5 realistic transactions from bank feed
    const sampleTxs: Partial<BankTransaction>[] = [
      {
        date: '2026-11-04',
        description: 'ACH DEBIT VULTR CLOUD COMPUTE REF#VULTR-2026-9921',
        referenceNumber: 'ACH-VULTR-7729',
        amount: 1420.00,
        type: 'DEBIT',
        counterparty: 'Vultr Cloud Infrastructure LLC',
      },
      {
        date: '2026-11-04',
        description: 'ACH DEBIT DATADOG INC REF#DDG-2026-8812',
        referenceNumber: 'ACH-DDG-4491',
        amount: 19800.00,
        type: 'DEBIT',
        counterparty: 'Datadog Enterprise Monitoring',
      },
      {
        date: '2026-11-04',
        description: 'WIRE OUT APEX OFFSHORE CAPITAL LLC REF#HOLD-9928',
        referenceNumber: 'WIRE-APEX-8821',
        amount: 34900.00,
        type: 'DEBIT',
        counterparty: 'Apex Global Logistics Holdings',
      },
    ];
    await onUploadCsvTransactions(sampleTxs);
  };

  const handleExecuteManualMatch = async () => {
    if (!selectedInvoiceForMatch || !selectedTransactionId) return;
    await onManualMatch(selectedInvoiceForMatch.id, selectedTransactionId, manualMatchNotes);
    setManualMatchModalOpen(false);
    setSelectedInvoiceForMatch(null);
    setSelectedTransactionId('');
    setManualMatchNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & SUMMARY METRICS */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-cyan-400" />
            <span>Autonomous Reconciliation & Ledger Matching</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Dual exact and fuzzy semantic matching linking accounts payable invoices to corporate bank transaction feeds. Detects clearing discrepancies, duplicate disbursements, and offshore routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateCsvUpload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate Bank CSV Ingestion</span>
          </button>

          <button
            onClick={async () => {
              setIsRunning(true);
              try {
                await onRunReconciliation();
              } finally {
                setIsRunning(false);
              }
            }}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Reconciling...' : 'Run Auto-Reconciliation'}</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-xs text-slate-400">Reconciliation Rate</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400 mt-1">
            {summary.reconciliationRatePercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.matchedInvoices} matched / {summary.totalInvoices} total</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-xs text-slate-400">Exact Ledger Matches</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {matches.filter((m) => m.matchType === 'EXACT').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">High confidence (100%)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-xs text-slate-400">Amount Discrepancies</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {summary.discrepancyCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Clearing variances &gt; 0%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-xs text-slate-400">Unmatched Invoices</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-300 mt-1">
            {summary.unmatchedInvoices}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending bank ACH debit</div>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('MATCHES')}
            className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'MATCHES'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reconciled Pairs ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('UNMATCHED_INVOICES')}
            className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'UNMATCHED_INVOICES'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unmatched Invoices ({unmatchedInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('UNMATCHED_TRANSACTIONS')}
            className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'UNMATCHED_TRANSACTIONS'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unmatched Bank Debits ({unmatchedTransactions.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor or invoice #..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* VIEW CONTENT BY TAB */}
      {activeTab === 'MATCHES' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor & Counterparty</th>
                  <th className="py-3 px-4 text-right">Invoice Total</th>
                  <th className="py-3 px-4 text-right">Settled Amount</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4 text-center">Confidence</th>
                  <th className="py-3 px-4 text-center">Match Type</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Reconciled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMatches.slice(0, 30).map((m) => {
                  const hasVariance = m.amountDifference > 0.05;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-cyan-300">
                        {m.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white truncate max-w-[200px]">{m.vendorName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">Bank: {m.transactionCounterparty}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                        ${m.invoiceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                        ${m.transactionAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {hasVariance ? (
                          <span className="text-rose-400 font-bold">
                            +${m.amountDifference.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-400">$0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-slate-200">{m.matchConfidence}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          m.matchType === 'EXACT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : m.matchType === 'MANUAL'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {m.matchType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          m.status === 'VERIFIED'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(m.reconciledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'UNMATCHED_INVOICES' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs text-slate-400 mb-3">
            Invoices awaiting clearing against bank debit stream. Click "Manual Link" to pair with a statement transaction.
          </div>
          <div className="space-y-2">
            {unmatchedInvoices.slice(0, 15).map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono font-semibold text-cyan-400">{inv.invoiceNumber}</div>
                  <div className="text-slate-300 font-medium">{inv.vendorName}</div>
                  <div className="text-[11px] font-mono text-slate-500">Due: {inv.dueDate} · Bank Account: {inv.bankInfo.accountNumber}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right font-mono tabular-nums text-white font-bold text-sm">
                    ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedInvoiceForMatch(inv);
                      setManualMatchModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Manual Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'UNMATCHED_TRANSACTIONS' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs text-slate-400 mb-3">
            Bank debits cleared without a corresponding invoice in accounts payable.
          </div>
          <div className="space-y-2">
            {unmatchedTransactions.slice(0, 15).map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono text-slate-400 text-[11px]">{tx.referenceNumber} · {tx.date}</div>
                  <div className="text-slate-200 font-medium">{tx.description}</div>
                  <div className="text-[11px] text-slate-500">Account: {tx.accountNumber}</div>
                </div>
                <div className="text-right font-mono tabular-nums text-white font-bold text-sm">
                  ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MANUAL MATCH MODAL */}
      {manualMatchModalOpen && selectedInvoiceForMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                <span>Manual Ledger Reconciliation Override</span>
              </h3>
              <button
                onClick={() => setManualMatchModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <div className="text-slate-400">Target Invoice:</div>
              <div className="font-bold text-white mt-0.5">
                {selectedInvoiceForMatch.invoiceNumber} · {selectedInvoiceForMatch.vendorName}
              </div>
              <div className="font-mono text-cyan-400 font-bold mt-1">
                ${selectedInvoiceForMatch.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 block font-medium">Select Bank Transaction to Pair:</label>
              <select
                value={selectedTransactionId}
                onChange={(e) => setSelectedTransactionId(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Choose matching bank clearing debit --</option>
                {transactions.slice(0, 30).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.referenceNumber} | ${t.amount.toFixed(2)} | {t.counterparty.slice(0, 24)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 block font-medium">Accountant Justification / Audit Note:</label>
              <textarea
                value={manualMatchNotes}
                onChange={(e) => setManualMatchNotes(e.target.value)}
                placeholder="State the commercial basis for this manual link (e.g. verified with vendor statements)..."
                rows={3}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setManualMatchModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteManualMatch}
                disabled={!selectedTransactionId}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 cursor-pointer"
              >
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
