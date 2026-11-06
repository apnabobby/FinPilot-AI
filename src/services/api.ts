import {
  User,
  Invoice,
  BankTransaction,
  ReconciliationMatch,
  FraudAlert,
  Workflow,
  ApprovalRequest,
  AgentStatus,
  AuditEvent,
  SummaryMetrics,
  UserRole,
} from '../types.js';

const API_BASE = '/api';

export const api = {
  // Auth
  async getMe(): Promise<{ success: boolean; user: User; availableRoles: User[] }> {
    const res = await fetch(`${API_BASE}/auth/me`);
    return res.json();
  },

  async switchRole(role: UserRole): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  // Invoices
  async getInvoices(params?: { status?: string; search?: string; limit?: number }): Promise<{
    success: boolean;
    total: number;
    invoices: Invoice[];
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/invoices?${query.toString()}`);
    return res.json();
  },

  async getInvoice(id: string): Promise<{ success: boolean; invoice: Invoice }> {
    const res = await fetch(`${API_BASE}/invoices/${id}`);
    return res.json();
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<{ success: boolean; invoice: Invoice }> {
    const res = await fetch(`${API_BASE}/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async uploadInvoice(data: {
    fileName: string;
    fileContent?: string;
    vendorName?: string;
    totalAmount?: number;
    invoiceNumber?: string;
  }): Promise<{ success: boolean; invoice: Invoice }> {
    const res = await fetch(`${API_BASE}/invoices/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async processInvoice(id: string): Promise<{ success: boolean; workflowId: string }> {
    const res = await fetch(`${API_BASE}/invoices/${id}/process`, {
      method: 'POST',
    });
    return res.json();
  },

  // Transactions
  async getTransactions(params?: { status?: string; limit?: number }): Promise<{
    success: boolean;
    total: number;
    transactions: BankTransaction[];
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
    return res.json();
  },

  async uploadTransactions(transactions: Partial<BankTransaction>[]): Promise<{
    success: boolean;
    count: number;
    transactions: BankTransaction[];
  }> {
    const res = await fetch(`${API_BASE}/transactions/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    });
    return res.json();
  },

  // Reconciliation
  async getReconciliation(): Promise<{
    success: boolean;
    summary: {
      totalInvoices: number;
      matchedInvoices: number;
      unmatchedInvoices: number;
      reconciliationRatePercent: number;
      discrepancyCount: number;
    };
    matches: ReconciliationMatch[];
  }> {
    const res = await fetch(`${API_BASE}/reconciliation`);
    return res.json();
  },

  async runReconciliation(): Promise<{ success: boolean; newMatches: number }> {
    const res = await fetch(`${API_BASE}/reconciliation/run`, {
      method: 'POST',
    });
    return res.json();
  },

  async manualMatch(invoiceId: string, transactionId: string, notes?: string): Promise<{
    success: boolean;
    match: ReconciliationMatch;
  }> {
    const res = await fetch(`${API_BASE}/reconciliation/manual/manual-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, transactionId, notes }),
    });
    return res.json();
  },

  // Fraud
  async getFraudAlerts(): Promise<{ success: boolean; total: number; alerts: FraudAlert[] }> {
    const res = await fetch(`${API_BASE}/fraud/alerts`);
    return res.json();
  },

  async updateFraudAlert(id: string, status: string, comment?: string): Promise<{
    success: boolean;
    alert: FraudAlert;
  }> {
    const res = await fetch(`${API_BASE}/fraud/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment }),
    });
    return res.json();
  },

  // Workflows
  async getWorkflows(): Promise<{ success: boolean; total: number; workflows: Workflow[] }> {
    const res = await fetch(`${API_BASE}/workflows`);
    return res.json();
  },

  async createWorkflow(name?: string, invoiceIds?: string[]): Promise<{ success: boolean; workflow: Workflow }> {
    const res = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, invoiceIds }),
    });
    return res.json();
  },

  async cancelWorkflow(id: string): Promise<{ success: boolean; workflow: Workflow }> {
    const res = await fetch(`${API_BASE}/workflows/${id}/cancel`, {
      method: 'POST',
    });
    return res.json();
  },

  // Approvals
  async getApprovals(params?: { status?: string; riskLevel?: string }): Promise<{
    success: boolean;
    total: number;
    approvals: ApprovalRequest[];
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.riskLevel) query.set('riskLevel', params.riskLevel);
    const res = await fetch(`${API_BASE}/approvals?${query.toString()}`);
    return res.json();
  },

  async approveRequest(id: string, comment?: string): Promise<{ success: boolean; approval: ApprovalRequest }> {
    const res = await fetch(`${API_BASE}/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    return res.json();
  },

  async rejectRequest(id: string, comment?: string): Promise<{ success: boolean; approval: ApprovalRequest }> {
    const res = await fetch(`${API_BASE}/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    return res.json();
  },

  async requestReview(id: string, notes?: string, assignToRole?: string): Promise<{
    success: boolean;
    approval: ApprovalRequest;
  }> {
    const res = await fetch(`${API_BASE}/approvals/${id}/request-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, assignToRole }),
    });
    return res.json();
  },

  // Agents
  async getAgents(): Promise<{ success: boolean; agents: AgentStatus[] }> {
    const res = await fetch(`${API_BASE}/agents`);
    return res.json();
  },

  // Audit
  async getAuditEvents(params?: { entityType?: string; search?: string; limit?: number }): Promise<{
    success: boolean;
    total: number;
    events: AuditEvent[];
  }> {
    const query = new URLSearchParams();
    if (params?.entityType) query.set('entityType', params.entityType);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/audit?${query.toString()}`);
    return res.json();
  },

  async getReportsSummary(): Promise<{ success: boolean; metrics: SummaryMetrics }> {
    const res = await fetch(`${API_BASE}/reports/summary`);
    return res.json();
  },

  // Demo
  async triggerDemoScenario(): Promise<{ success: boolean; workflow: Workflow; message: string }> {
    const res = await fetch(`${API_BASE}/demo/run-scenario`, {
      method: 'POST',
    });
    return res.json();
  },

  async resetDemo(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
    });
    return res.json();
  },
};
