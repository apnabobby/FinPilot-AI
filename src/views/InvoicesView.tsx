import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  Edit2,
  Check,
  X,
  ShieldAlert,
  Play,
  Save,
  Building,
  CreditCard,
  Percent,
} from 'lucide-react';
import { Invoice } from '../types.js';

interface InvoicesViewProps {
  invoices: Invoice[];
  onUploadInvoice: (data: { fileName: string; fileContent?: string; vendorName?: string; totalAmount?: number; invoiceNumber?: string }) => Promise<void>;
  onUpdateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  onProcessInvoice: (id: string) => Promise<void>;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onUploadInvoice,
  onUpdateInvoice,
  onProcessInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Quick sample templates to upload
  const sampleUploads = [
    { name: 'Vultr Cloud Compute - NVMe High Frequency Node', vendor: 'Vultr Cloud Infrastructure LLC', num: 'VULTR-2026-9921', total: 1420.00 },
    { name: 'Datadog Enterprise APM Subscription (Flagged Variance)', vendor: 'Datadog Enterprise Monitoring', num: 'DDG-2026-8812', total: 19800.00 },
    { name: 'Apex Offshore Cargo Invoice (Suspicious Routing)', vendor: 'Apex Global Logistics Holdings', num: 'APEX-2026-7711', total: 34900.00 },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.totalAmount.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleQuickUpload = async (sample: typeof sampleUploads[0]) => {
    setIsUploading(true);
    try {
      await onUploadInvoice({
        fileName: `${sample.vendor.slice(0, 5).toLowerCase()}_invoice.pdf`,
        vendorName: sample.vendor,
        invoiceNumber: sample.num,
        totalAmount: sample.total,
        fileContent: `INVOICE: ${sample.num}\nVENDOR: ${sample.vendor}\nTOTAL: $${sample.total}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice) return;
    await onUpdateInvoice(editingInvoice.id, {
      vendorName: editingInvoice.vendorName,
      invoiceNumber: editingInvoice.invoiceNumber,
      subtotal: editingInvoice.subtotal,
      tax: editingInvoice.tax,
      totalAmount: editingInvoice.totalAmount,
    });
    // refresh selected invoice view
    setSelectedInvoice(editingInvoice);
    setEditingInvoice(null);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & UPLOAD ZONE */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>AI Invoice Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            OCR & structured extraction via Gemini 3.8 Flash. Validates required fields, checks mathematical formulas (subtotal + tax = total), and isolates duplicate submissions.
          </p>
        </div>

        {/* Quick Sample Ingestion Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase mr-1">Simulate Upload:</span>
          {sampleUploads.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickUpload(sample)}
              disabled={isUploading}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              + {sample.vendor.split(' ')[0]} (${sample.total})
            </button>
          ))}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice #, vendor or amount..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'VALIDATED', 'RECONCILED', 'DISCREPANCY', 'SUSPICIOUS', 'NEEDS_APPROVAL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* INVOICES TABLE */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Confidence</th>
                <th className="py-3 px-4 text-center">Math Check</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.slice(0, 30).map((inv) => {
                const mathValid = inv.validationReport?.mathValid ?? true;
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-cyan-300">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      <div className="truncate max-w-[180px]">{inv.vendorName}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{inv.vendorCategory}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      ${inv.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      ${inv.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-white">
                      ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[11px] text-slate-300">
                        {Math.round((inv.confidence?.overall || 0.95) * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {mathValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Mismatch</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inv.status === 'VALIDATED' || inv.status === 'RECONCILED'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : inv.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : inv.status === 'SUSPICIOUS' || inv.status === 'REJECTED'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(inv);
                        }}
                        className="px-2 py-1 text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingInvoice({ ...inv });
                        }}
                        className="px-2 py-1 text-cyan-400 hover:text-cyan-300 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {Math.min(30, filteredInvoices.length)} of {filteredInvoices.length} invoices</span>
          <span>Click any row to open extraction & verification drawer</span>
        </div>
      </div>

      {/* INVOICE DETAIL & VERIFICATION DRAWER / MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-mono text-cyan-400">INVOICE INTELLIGENCE INSPECTOR</div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedInvoice.invoiceNumber} · {selectedInvoice.vendorName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side: Extracted Fields & Validation Report */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: Extracted Data Preview & Confidence */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Structured Fields & Confidence Scores
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Vendor:</span>
                    <span className="font-semibold text-white">{selectedInvoice.vendorName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Tax ID:</span>
                    <span className="font-mono text-slate-200">{selectedInvoice.vendorTaxId || 'US-82910482'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Issue Date:</span>
                    <span className="font-mono text-slate-200">{selectedInvoice.invoiceDate}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Due Date:</span>
                    <span className="font-mono text-slate-200">{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="font-mono tabular-nums text-slate-200">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Tax:</span>
                    <span className="font-mono tabular-nums text-slate-200">${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900 font-bold">
                    <span className="text-slate-200">Declared Total:</span>
                    <span className="font-mono tabular-nums text-cyan-400 text-sm">${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Bank Routing:</span>
                    <span className={`font-mono text-[11px] ${selectedInvoice.bankInfo.verifiedStatus === 'FLAGGED_OFFSHORE' ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      {selectedInvoice.bankInfo.bankName} ({selectedInvoice.bankInfo.accountNumber})
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 mb-1 flex justify-between">
                    <span>Overall Extraction Confidence:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {Math.round((selectedInvoice.confidence?.overall || 0.95) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${Math.round((selectedInvoice.confidence?.overall || 0.95) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right: AI Validation & Math Verification Report */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Deterministic Validation Report
                </div>

                {/* Math Consistency Card */}
                <div className={`p-3 rounded-lg border text-xs ${
                  selectedInvoice.validationReport?.mathValid
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {selectedInvoice.validationReport?.mathValid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Calculations Consistent</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Calculation Inconsistency Detected</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] font-mono">
                    Subtotal (${selectedInvoice.subtotal.toFixed(2)}) + Tax (${selectedInvoice.tax.toFixed(2)}) = ${(selectedInvoice.subtotal + selectedInvoice.tax).toFixed(2)} vs Declared (${selectedInvoice.totalAmount.toFixed(2)})
                  </div>
                </div>

                {/* Fraud / Anomaly Warnings */}
                {selectedInvoice.fraudAlerts && selectedInvoice.fraudAlerts.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Fraud & Risk Alerts ({selectedInvoice.riskLevel} - Score {selectedInvoice.riskScore})</span>
                    </div>
                    {selectedInvoice.fraudAlerts.map((alert, i) => (
                      <div key={i} className="text-[11px] font-mono text-rose-200">
                        • {alert}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={() => {
                      onProcessInvoice(selectedInvoice.id);
                      setSelectedInvoice(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Multi-Agent Pipeline</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingInvoice({ ...selectedInvoice });
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Edit Fields
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-cyan-400" />
              <span>Correct Extracted Invoice Data</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={editingInvoice.vendorName}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, vendorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={editingInvoice.invoiceNumber}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Subtotal ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingInvoice.subtotal}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, subtotal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tax ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingInvoice.tax}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, tax: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingInvoice.totalAmount}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setEditingInvoice(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Correction</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
