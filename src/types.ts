export type UserRole = 'ADMIN' | 'FINANCE_MANAGER' | 'ACCOUNTANT' | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type InvoiceStatus =
  | 'QUEUED'
  | 'EXTRACTED'
  | 'VALIDATED'
  | 'RECONCILED'
  | 'DISCREPANCY'
  | 'SUSPICIOUS'
  | 'NEEDS_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BankAccountInfo {
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  verifiedStatus: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED_OFFSHORE';
}

export interface InvoiceConfidence {
  vendorName: number;
  invoiceNumber: number;
  invoiceDate: number;
  dueDate: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  bankAccount: number;
  overall: number;
}

export interface InvoiceValidationReport {
  mathValid: boolean;
  calculatedTotal: number;
  declaredTotal: number;
  taxRatePercent: number;
  missingFields: string[];
  duplicateWarnings: string[];
  vendorRiskFlags: string[];
  timestamp: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorTaxId?: string;
  vendorAddress?: string;
  vendorCategory?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  currency: string;
  items: InvoiceItem[];
  bankInfo: BankAccountInfo;
  confidence: InvoiceConfidence;
  status: InvoiceStatus;
  validationReport?: InvoiceValidationReport;
  rawText?: string;
  fileName: string;
  fileType: 'pdf' | 'png' | 'jpg' | 'demo';
  uploadedAt: string;
  reconciliationMatchId?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  fraudAlerts?: string[];
  tags: string[];
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  referenceNumber: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  counterparty: string;
  accountNumber: string;
  status: 'MATCHED' | 'UNMATCHED' | 'FLAGGED';
  matchedInvoiceId?: string;
  confidenceScore?: number;
  reconciledAt?: string;
}

export interface ReconciliationMatch {
  id: string;
  invoiceId: string;
  transactionId: string;
  invoiceNumber: string;
  vendorName: string;
  transactionCounterparty: string;
  invoiceAmount: number;
  transactionAmount: number;
  amountDifference: number;
  matchConfidence: number;
  matchType: 'EXACT' | 'FUZZY_HIGH' | 'FUZZY_LOW' | 'DISCREPANCY' | 'MANUAL';
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'DISPUTED';
  reconciledBy: string;
  reconciledAt: string;
  notes?: string;
}

export interface FraudAlert {
  id: string;
  invoiceId?: string;
  transactionId?: string;
  invoiceNumber?: string;
  vendorName: string;
  amount: number;
  riskLevel: RiskLevel;
  riskScore: number;
  category: string;
  title: string;
  description: string;
  evidence: string[];
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  detectedAt: string;
  detectedBy: string;
}

export interface WorkflowStep {
  id: string;
  agentName: string;
  stage: string;
  title: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  inputSummary?: string;
  outputSummary?: string;
  error?: string;
  agentId: string;
}

export interface Workflow {
  id: string;
  name: string;
  batchId?: string;
  invoiceIds: string[];
  stage: string;
  status: 'RUNNING' | 'PAUSED_APPROVAL' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  currentStepIndex: number;
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  createdBy: string;
  summary: {
    invoicesCount: number;
    totalAmount: number;
    matchedCount: number;
    fraudAlertsCount: number;
    approvalStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  riskLevel: RiskLevel;
  riskScore: number;
  recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
  reasoning: string[];
  evidence: {
    invoiceSubtotal: number;
    invoiceTax: number;
    invoiceTotal: number;
    bankMatchedAmount?: number;
    bankTransactionRef?: string;
    discrepancy?: number;
    riskAlerts: string[];
  };
  agentVerification: {
    verifiedBy: string;
    verificationScore: number;
    status: 'VERIFIED' | 'CONDITIONAL' | 'FAILED';
    notes: string;
  };
  requiredRole: UserRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  decision?: {
    decidedBy: string;
    decidedByRole: UserRole;
    decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    comment: string;
    timestamp: string;
  };
  createdAt: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'IDLE' | 'ACTIVE' | 'PROCESSING' | 'WAITING';
  currentTask?: string;
  completedTasks: number;
  failedTasks: number;
  lastActive: string;
  latencyMs: number;
  model: string;
  description: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    role: string;
    type: 'HUMAN' | 'AI_AGENT';
  };
  action: string;
  entityType: 'INVOICE' | 'TRANSACTION' | 'RECONCILIATION' | 'WORKFLOW' | 'APPROVAL' | 'SYSTEM';
  entityId: string;
  details: string;
  evidenceSnapshot?: Record<string, unknown>;
}

export interface SummaryMetrics {
  totalInvoices: number;
  totalValue: number;
  reconciliationRate: number;
  pendingApprovals: number;
  duplicatesDetected: number;
  suspiciousTransactions: number;
  financialRiskExposure: number;
  averageInvoiceValue: number;
}
