import { Router, Request, Response } from 'express';
import { db, DEMO_USERS } from './db.js';
import { orchestrator } from './orchestrator.js';
import { generateWithGemini } from './gemini.js';
import { Invoice, BankTransaction, UserRole } from './types.js';

export const apiRouter = Router();

// Current active session user (defaults to Admin for frictionless demo)
let currentUser = db.users[0];

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    success: true,
    user: currentUser,
    availableRoles: DEMO_USERS,
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || db.users[0];
  currentUser = user;
  
  db.logAudit({
    actor: { id: user.id, name: user.name, role: user.role, type: 'HUMAN' },
    action: 'USER_LOGIN',
    entityType: 'SYSTEM',
    entityId: user.id,
    details: `${user.name} (${user.role}) authenticated successfully.`,
  });

  res.json({ success: true, user: currentUser });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'USER_LOGOUT',
    entityType: 'SYSTEM',
    entityId: currentUser.id,
    details: `${currentUser.name} signed out.`,
  });
  currentUser = db.users[0];
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const targetUser = db.users.find((u) => u.role === role) || db.users[0];
  currentUser = targetUser;

  db.logAudit({
    actor: { id: targetUser.id, name: targetUser.name, role: targetUser.role, type: 'HUMAN' },
    action: 'ROLE_SWITCHED',
    entityType: 'SYSTEM',
    entityId: targetUser.id,
    details: `Switched active profile to ${targetUser.name} (${targetUser.role}).`,
  });

  res.json({ success: true, user: currentUser });
});

// ==========================================
// INVOICES ROUTES
// ==========================================
apiRouter.get('/invoices', (req: Request, res: Response) => {
  const { status, search, limit = 100 } = req.query;
  let list = [...db.invoices];

  if (status && status !== 'ALL') {
    list = list.filter((i) => i.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.vendorName.toLowerCase().includes(q) ||
        i.totalAmount.toString().includes(q)
    );
  }

  res.json({
    success: true,
    total: list.length,
    invoices: list.slice(0, Number(limit)),
  });
});

apiRouter.get('/invoices/:id', (req: Request, res: Response) => {
  const invoice = db.invoices.find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, error: 'Invoice not found' });
  }
  res.json({ success: true, invoice });
});

apiRouter.patch('/invoices/:id', (req: Request, res: Response) => {
  const invoice = db.invoices.find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, error: 'Invoice not found' });
  }

  const { vendorName, invoiceNumber, subtotal, tax, totalAmount, status } = req.body;
  const changes: string[] = [];

  if (vendorName !== undefined && vendorName !== invoice.vendorName) {
    changes.push(`vendorName from "${invoice.vendorName}" to "${vendorName}"`);
    invoice.vendorName = vendorName;
  }
  if (invoiceNumber !== undefined && invoiceNumber !== invoice.invoiceNumber) {
    changes.push(`invoiceNumber from "${invoice.invoiceNumber}" to "${invoiceNumber}"`);
    invoice.invoiceNumber = invoiceNumber;
  }
  if (subtotal !== undefined) {
    invoice.subtotal = Number(subtotal);
  }
  if (tax !== undefined) {
    invoice.tax = Number(tax);
  }
  if (totalAmount !== undefined) {
    invoice.totalAmount = Number(totalAmount);
    changes.push(`totalAmount updated to $${invoice.totalAmount}`);
  }
  if (status !== undefined) {
    invoice.status = status;
    changes.push(`status set to ${status}`);
  }

  // Recalculate deterministic validation
  const calculated = Math.round((invoice.subtotal + invoice.tax) * 100) / 100;
  const mathValid = Math.abs(calculated - invoice.totalAmount) < 0.05;
  invoice.validationReport = {
    mathValid,
    calculatedTotal: calculated,
    declaredTotal: invoice.totalAmount,
    taxRatePercent: invoice.subtotal > 0 ? Math.round((invoice.tax / invoice.subtotal) * 10000) / 100 : 0,
    missingFields: [],
    duplicateWarnings: invoice.validationReport?.duplicateWarnings || [],
    vendorRiskFlags: invoice.validationReport?.vendorRiskFlags || [],
    timestamp: new Date().toISOString(),
  };

  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'INVOICE_MANUAL_EDIT',
    entityType: 'INVOICE',
    entityId: invoice.id,
    details: `Manual correction by ${currentUser.name}: ${changes.join(', ')}.`,
  });

  res.json({ success: true, invoice });
});

apiRouter.post('/invoices/upload', async (req: Request, res: Response) => {
  const { fileName, fileContent, vendorName, totalAmount, invoiceNumber } = req.body;

  // Use Gemini to parse or structured fallback
  let extractedVendor = vendorName || 'Unspecified Vendor LLC';
  let extractedNum = invoiceNumber || `INV-${Math.floor(100000 + Math.random() * 900000)}`;
  let extractedTotal = Number(totalAmount) || Math.round((500 + Math.random() * 8500) * 100) / 100;
  let extractedSubtotal = Math.round((extractedTotal / 1.0825) * 100) / 100;
  let extractedTax = Math.round((extractedTotal - extractedSubtotal) * 100) / 100;

  // If text or description provided, try Gemini extraction
  if (fileContent && typeof fileContent === 'string') {
    const aiPrompt = `Extract structured finance fields from this invoice text:
"${fileContent.slice(0, 800)}"
Return JSON with { "vendorName": string, "invoiceNumber": string, "subtotal": number, "tax": number, "totalAmount": number }`;
    const aiResult = await generateWithGemini(aiPrompt, undefined, true);
    if (aiResult) {
      try {
        const parsed = JSON.parse(aiResult);
        if (parsed.vendorName) extractedVendor = parsed.vendorName;
        if (parsed.invoiceNumber) extractedNum = parsed.invoiceNumber;
        if (parsed.totalAmount) extractedTotal = Number(parsed.totalAmount);
        if (parsed.subtotal) extractedSubtotal = Number(parsed.subtotal);
        if (parsed.tax) extractedTax = Number(parsed.tax);
      } catch (e) {
        // use fallback values
      }
    }
  }

  const newInvoice: Invoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    invoiceNumber: extractedNum,
    vendorName: extractedVendor,
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    subtotal: extractedSubtotal,
    tax: extractedTax,
    totalAmount: extractedTotal,
    currency: 'USD',
    items: [
      {
        id: `item_new_1`,
        description: 'Uploaded Service / Product Line Item',
        quantity: 1,
        unitPrice: extractedSubtotal,
        total: extractedSubtotal,
      },
    ],
    bankInfo: {
      bankName: 'Commercial Clearing Bank NA',
      accountNumber: '****7712',
      routingNumber: '021000021',
      verifiedStatus: 'VERIFIED',
    },
    confidence: {
      vendorName: 0.95,
      invoiceNumber: 0.96,
      invoiceDate: 0.98,
      dueDate: 0.95,
      subtotal: 0.94,
      tax: 0.93,
      totalAmount: 0.98,
      bankAccount: 0.91,
      overall: 0.95,
    },
    status: 'QUEUED',
    fileName: fileName || 'uploaded_invoice.pdf',
    fileType: 'pdf',
    uploadedAt: new Date().toISOString(),
    riskScore: 15,
    riskLevel: 'LOW',
    tags: ['Live Upload', 'Vultr API'],
  };

  db.invoices.unshift(newInvoice);

  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'INVOICE_UPLOAD',
    entityType: 'INVOICE',
    entityId: newInvoice.id,
    details: `Uploaded invoice ${newInvoice.invoiceNumber} ($${newInvoice.totalAmount}) from file ${newInvoice.fileName}.`,
  });

  res.status(201).json({ success: true, invoice: newInvoice });
});

apiRouter.post('/invoices/:id/process', async (req: Request, res: Response) => {
  const invoice = db.invoices.find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, error: 'Invoice not found' });
  }

  const workflow = await orchestrator.launchWorkflow(
    `Single Invoice Run: ${invoice.invoiceNumber}`,
    [invoice.id],
    currentUser.name
  );

  res.json({ success: true, workflowId: workflow.id, message: 'Workflow launched' });
});

// ==========================================
// TRANSACTIONS ROUTES
// ==========================================
apiRouter.get('/transactions', (req: Request, res: Response) => {
  const { status, limit = 100 } = req.query;
  let list = [...db.transactions];
  if (status && status !== 'ALL') {
    list = list.filter((t) => t.status === status);
  }
  res.json({
    success: true,
    total: list.length,
    transactions: list.slice(0, Number(limit)),
  });
});

apiRouter.post('/transactions/upload', (req: Request, res: Response) => {
  const { transactions } = req.body;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ success: false, error: 'Expected array of transactions' });
  }

  const added: BankTransaction[] = [];
  transactions.forEach((t, i) => {
    const tx: BankTransaction = {
      id: `tx_${Date.now()}_${i}`,
      date: t.date || new Date().toISOString().slice(0, 10),
      description: t.description || 'ACH COMMERCIAL DEBIT',
      referenceNumber: t.referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: Number(t.amount) || 100,
      type: t.type || 'DEBIT',
      counterparty: t.counterparty || 'External Vendor',
      accountNumber: '****9812',
      status: 'UNMATCHED',
    };
    db.transactions.unshift(tx);
    added.push(tx);
  });

  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'CSV_TRANSACTIONS_INGESTED',
    entityType: 'TRANSACTION',
    entityId: `batch_${Date.now()}`,
    details: `Imported ${added.length} bank statement transaction rows from CSV.`,
  });

  res.status(201).json({ success: true, count: added.length, transactions: added });
});

// ==========================================
// RECONCILIATION ROUTES
// ==========================================
apiRouter.get('/reconciliation', (req: Request, res: Response) => {
  const totalInvoices = db.invoices.length;
  const matchedInvoices = db.reconciliationMatches.length;
  const discrepancyMatches = db.reconciliationMatches.filter((m) => m.matchType === 'DISCREPANCY').length;

  res.json({
    success: true,
    summary: {
      totalInvoices,
      matchedInvoices,
      unmatchedInvoices: totalInvoices - matchedInvoices,
      reconciliationRatePercent: totalInvoices > 0 ? Math.round((matchedInvoices / totalInvoices) * 1000) / 10 : 0,
      discrepancyCount: discrepancyMatches,
    },
    matches: db.reconciliationMatches,
  });
});

apiRouter.post('/reconciliation/run', async (req: Request, res: Response) => {
  // Trigger full matching across all unmatched items
  let newMatchesCount = 0;
  db.invoices.forEach((inv) => {
    const alreadyMatched = db.reconciliationMatches.some((m) => m.invoiceId === inv.id);
    if (!alreadyMatched) {
      const tx = db.transactions.find((t) => t.status === 'UNMATCHED' && Math.abs(t.amount - inv.totalAmount) < 0.05);
      if (tx) {
        tx.status = 'MATCHED';
        tx.matchedInvoiceId = inv.id;
        db.reconciliationMatches.push({
          id: `match_${Date.now()}_${inv.id}`,
          invoiceId: inv.id,
          transactionId: tx.id,
          invoiceNumber: inv.invoiceNumber,
          vendorName: inv.vendorName,
          transactionCounterparty: tx.counterparty,
          invoiceAmount: inv.totalAmount,
          transactionAmount: tx.amount,
          amountDifference: 0,
          matchConfidence: 96,
          matchType: 'EXACT',
          status: 'VERIFIED',
          reconciledBy: 'AI_RECONCILIATION_AGENT',
          reconciledAt: new Date().toISOString(),
          notes: 'Auto-reconciled on exact dollar amount and available ledger match.',
        });
        inv.status = 'RECONCILED';
        newMatchesCount++;
      }
    }
  });

  db.logAudit({
    actor: { id: 'agent_reconciliation', name: 'Reconciliation Agent', role: 'LEDGER_SYNC', type: 'AI_AGENT' },
    action: 'BATCH_RECONCILIATION_RUN',
    entityType: 'RECONCILIATION',
    entityId: `rec_run_${Date.now()}`,
    details: `Executed autonomous reconciliation run: found ${newMatchesCount} new exact ledger matches.`,
  });

  res.json({ success: true, newMatches: newMatchesCount });
});

apiRouter.post('/reconciliation/:id/manual-match', (req: Request, res: Response) => {
  const { invoiceId, transactionId, notes } = req.body;
  const invoice = db.invoices.find((i) => i.id === invoiceId);
  const transaction = db.transactions.find((t) => t.id === transactionId);

  if (!invoice || !transaction) {
    return res.status(400).json({ success: false, error: 'Invoice or transaction not found' });
  }

  const diff = Math.abs(invoice.totalAmount - transaction.amount);
  const match = {
    id: `manual_match_${Date.now()}`,
    invoiceId: invoice.id,
    transactionId: transaction.id,
    invoiceNumber: invoice.invoiceNumber,
    vendorName: invoice.vendorName,
    transactionCounterparty: transaction.counterparty,
    invoiceAmount: invoice.totalAmount,
    transactionAmount: transaction.amount,
    amountDifference: diff,
    matchConfidence: 100,
    matchType: 'MANUAL' as const,
    status: 'VERIFIED' as const,
    reconciledBy: currentUser.name,
    reconciledAt: new Date().toISOString(),
    notes: notes || `Manual match confirmed by ${currentUser.name} (${currentUser.role})`,
  };

  transaction.status = 'MATCHED';
  transaction.matchedInvoiceId = invoice.id;
  invoice.status = 'RECONCILED';
  db.reconciliationMatches.push(match);

  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'MANUAL_RECONCILIATION_MATCH',
    entityType: 'RECONCILIATION',
    entityId: match.id,
    details: `Manual match linked ${invoice.invoiceNumber} ($${invoice.totalAmount}) to ${transaction.referenceNumber} ($${transaction.amount}). Diff: $${diff}.`,
  });

  res.json({ success: true, match });
});

// ==========================================
// FRAUD ALERTS ROUTES
// ==========================================
apiRouter.get('/fraud/alerts', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: db.fraudAlerts.length,
    alerts: db.fraudAlerts,
  });
});

apiRouter.patch('/fraud/alerts/:id', (req: Request, res: Response) => {
  const alert = db.fraudAlerts.find((f) => f.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }
  const { status, comment } = req.body;
  if (status) alert.status = status;

  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'FRAUD_ALERT_STATUS_UPDATE',
    entityType: 'INVOICE',
    entityId: alert.id,
    details: `${currentUser.name} updated fraud alert "${alert.title}" status to ${status}. Notes: ${comment || 'None'}`,
  });

  res.json({ success: true, alert });
});

// ==========================================
// WORKFLOWS ROUTES
// ==========================================
apiRouter.get('/workflows', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: db.workflows.length,
    workflows: db.workflows,
  });
});

apiRouter.get('/workflows/:id', (req: Request, res: Response) => {
  const workflow = db.workflows.find((w) => w.id === req.params.id);
  if (!workflow) {
    return res.status(404).json({ success: false, error: 'Workflow not found' });
  }
  res.json({ success: true, workflow });
});

apiRouter.post('/workflows', async (req: Request, res: Response) => {
  const { name, invoiceIds } = req.body;
  const ids = Array.isArray(invoiceIds) && invoiceIds.length > 0
    ? invoiceIds
    : db.invoices.slice(0, 5).map((i) => i.id);

  const workflow = await orchestrator.launchWorkflow(
    name || `Batch Processing Workflow #${Date.now().toString().slice(-4)}`,
    ids,
    currentUser.name
  );

  res.status(201).json({ success: true, workflow });
});

apiRouter.post('/workflows/:id/cancel', (req: Request, res: Response) => {
  const workflow = db.workflows.find((w) => w.id === req.params.id);
  if (!workflow) {
    return res.status(404).json({ success: false, error: 'Workflow not found' });
  }

  workflow.status = 'CANCELLED';
  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'WORKFLOW_CANCELLED',
    entityType: 'WORKFLOW',
    entityId: workflow.id,
    details: `Workflow ${workflow.name} cancelled by ${currentUser.name}.`,
  });

  res.json({ success: true, workflow });
});

// Server-Sent Events (SSE) live updates for workflows
apiRouter.get('/workflows/events/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const unsubscribe = orchestrator.subscribe((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

// ==========================================
// APPROVALS ROUTES
// ==========================================
apiRouter.get('/approvals', (req: Request, res: Response) => {
  const { status, riskLevel } = req.query;
  let list = [...db.approvals];
  if (status && status !== 'ALL') {
    list = list.filter((a) => a.status === status);
  }
  if (riskLevel && riskLevel !== 'ALL') {
    list = list.filter((a) => a.riskLevel === riskLevel);
  }
  res.json({ success: true, total: list.length, approvals: list });
});

apiRouter.post('/approvals/:id/approve', async (req: Request, res: Response) => {
  const approval = db.approvals.find((a) => a.id === req.params.id);
  if (!approval) {
    return res.status(404).json({ success: false, error: 'Approval request not found' });
  }

  // Role check: Critical risk requires ADMIN
  if (approval.riskLevel === 'CRITICAL' && currentUser.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: `CRITICAL risk approval requires Administrator credentials. Current role: ${currentUser.role}.`,
    });
  }

  const { comment } = req.body;
  approval.status = 'APPROVED';
  approval.decision = {
    decidedBy: currentUser.name,
    decidedByRole: currentUser.role,
    decision: 'APPROVED',
    comment: comment || 'Approved for accounts payable release.',
    timestamp: new Date().toISOString(),
  };

  // Update underlying invoice
  const invoice = db.invoices.find((i) => i.id === approval.invoiceId);
  if (invoice) {
    invoice.status = 'APPROVED';
  }

  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'APPROVAL_GRANTED',
    entityType: 'APPROVAL',
    entityId: approval.id,
    details: `${currentUser.name} (${currentUser.role}) APPROVED invoice ${approval.invoiceNumber} ($${approval.amount}). Comment: "${approval.decision.comment}"`,
    evidenceSnapshot: approval.evidence as unknown as Record<string, unknown>,
  });

  // Resume workflow if attached
  if (approval.workflowId) {
    await orchestrator.resumeWorkflow(approval.workflowId, 'APPROVED').catch(() => {});
  }

  res.json({ success: true, approval });
});

apiRouter.post('/approvals/:id/reject', async (req: Request, res: Response) => {
  const approval = db.approvals.find((a) => a.id === req.params.id);
  if (!approval) {
    return res.status(404).json({ success: false, error: 'Approval request not found' });
  }

  const { comment } = req.body;
  approval.status = 'REJECTED';
  approval.decision = {
    decidedBy: currentUser.name,
    decidedByRole: currentUser.role,
    decision: 'REJECTED',
    comment: comment || 'Rejected due to forensic risk score.',
    timestamp: new Date().toISOString(),
  };

  const invoice = db.invoices.find((i) => i.id === approval.invoiceId);
  if (invoice) {
    invoice.status = 'REJECTED';
  }

  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'APPROVAL_REJECTED',
    entityType: 'APPROVAL',
    entityId: approval.id,
    details: `${currentUser.name} (${currentUser.role}) REJECTED invoice ${approval.invoiceNumber} ($${approval.amount}). Reason: "${approval.decision.comment}"`,
  });

  if (approval.workflowId) {
    await orchestrator.resumeWorkflow(approval.workflowId, 'REJECTED').catch(() => {});
  }

  res.json({ success: true, approval });
});

apiRouter.post('/approvals/:id/request-review', (req: Request, res: Response) => {
  const approval = db.approvals.find((a) => a.id === req.params.id);
  if (!approval) {
    return res.status(404).json({ success: false, error: 'Approval request not found' });
  }
  const { notes, assignToRole } = req.body;
  approval.status = 'UNDER_REVIEW';

  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'APPROVAL_MANUAL_REVIEW_REQUESTED',
    entityType: 'APPROVAL',
    entityId: approval.id,
    details: `${currentUser.name} requested manual review for ${approval.invoiceNumber}. Assigned to: ${assignToRole || 'Auditor'}. Notes: "${notes || ''}"`,
  });

  res.json({ success: true, approval });
});

// ==========================================
// AGENTS ROUTES
// ==========================================
apiRouter.get('/agents', (req: Request, res: Response) => {
  res.json({
    success: true,
    agents: db.agents,
  });
});

// ==========================================
// AUDIT & REPORTS ROUTES
// ==========================================
apiRouter.get('/audit', (req: Request, res: Response) => {
  const { entityType, actorType, search, limit = 100 } = req.query;
  let list = [...db.auditEvents];

  if (entityType && entityType !== 'ALL') {
    list = list.filter((a) => a.entityType === entityType);
  }
  if (actorType && actorType !== 'ALL') {
    list = list.filter((a) => a.actor.type === actorType);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (a) =>
        a.details.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.actor.name.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: list.length,
    events: list.slice(0, Number(limit)),
  });
});

apiRouter.get('/reports/summary', (req: Request, res: Response) => {
  const totalInvoices = db.invoices.length;
  const totalValue = db.invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const matchedCount = db.reconciliationMatches.length;
  const pendingApprovalsCount = db.approvals.filter((a) => a.status === 'PENDING').length;
  const duplicatesCount = db.fraudAlerts.filter((f) => f.category === 'DUPLICATE_INVOICE').length;
  const suspiciousCount = db.fraudAlerts.length;
  
  // Calculate potential financial risk exposure
  const highRiskTotal = db.invoices
    .filter((i) => i.riskLevel === 'CRITICAL' || i.riskLevel === 'HIGH')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  res.json({
    success: true,
    metrics: {
      totalInvoices,
      totalValue,
      reconciliationRate: totalInvoices > 0 ? Math.round((matchedCount / totalInvoices) * 1000) / 10 : 0,
      pendingApprovals: pendingApprovalsCount,
      duplicatesDetected: duplicatesCount,
      suspiciousTransactions: suspiciousCount,
      financialRiskExposure: highRiskTotal,
      averageInvoiceValue: totalInvoices > 0 ? Math.round((totalValue / totalInvoices) * 100) / 100 : 0,
    },
  });
});

apiRouter.get('/reports/export', (req: Request, res: Response) => {
  // Generate CSV for download
  const headers = ['ID', 'Invoice Number', 'Vendor', 'Date', 'Subtotal', 'Tax', 'Total', 'Status', 'Risk Level', 'Risk Score'];
  const rows = db.invoices.map((i) => [
    i.id,
    i.invoiceNumber,
    `"${i.vendorName.replace(/"/g, '""')}"`,
    i.invoiceDate,
    i.subtotal,
    i.tax,
    i.totalAmount,
    i.status,
    i.riskLevel,
    i.riskScore,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="finpilot_audit_export.csv"');
  res.send(csv);
});

// ==========================================
// SYSTEM & DEMO SCENARIO TRIGGER
// ==========================================
apiRouter.post('/demo/run-scenario', async (req: Request, res: Response) => {
  // Launch demo scenario with top 6 invoices
  const sampleIds = ['inv_001', 'inv_002', 'inv_003', 'inv_004', 'inv_005'];
  const wf = await orchestrator.launchWorkflow(
    'Vultr Hackathon Live Multi-Agent Autonomous Run',
    sampleIds,
    currentUser.name
  );

  res.json({
    success: true,
    workflow: wf,
    message: 'Live autonomous agent orchestration started!',
  });
});

apiRouter.post('/demo/reset', (req: Request, res: Response) => {
  db.seed();
  db.logAudit({
    actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role, type: 'HUMAN' },
    action: 'DEMO_DATA_RESET',
    entityType: 'SYSTEM',
    entityId: 'database_seed',
    details: 'Reset system database with 100 sample invoices, 120 transactions, and initial seed state.',
  });
  res.json({ success: true, message: 'Database reset to initial demo state' });
});
