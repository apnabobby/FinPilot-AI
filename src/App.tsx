import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage.js';
import { DashboardLayout } from './components/DashboardLayout.js';
import { DashboardView } from './views/DashboardView.js';
import { InvoicesView } from './views/InvoicesView.js';
import { ReconciliationView } from './views/ReconciliationView.js';
import { ApprovalsView } from './views/ApprovalsView.js';
import { AgentsView } from './views/AgentsView.js';
import { AuditView } from './views/AuditView.js';
import { SettingsView } from './views/SettingsView.js';
import { api } from './services/api.js';
import {
  User,
  Invoice,
  BankTransaction,
  ReconciliationMatch,
  Workflow,
  ApprovalRequest,
  AgentStatus,
  AuditEvent,
  SummaryMetrics,
  UserRole,
} from './types.js';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('app');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);

  // Core Platform State
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_admin_1',
    name: 'Alexandria Chen',
    email: 'alex.chen@finpilot.vultr.internal',
    role: 'ADMIN',
    department: 'Executive Finance & Ops',
  });
  const [availableRoles, setAvailableRoles] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [matches, setMatches] = useState<ReconciliationMatch[]>([]);
  const [recSummary, setRecSummary] = useState({
    totalInvoices: 100,
    matchedInvoices: 75,
    unmatchedInvoices: 25,
    reconciliationRatePercent: 75,
    discrepancyCount: 4,
  });
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [metrics, setMetrics] = useState<SummaryMetrics>({
    totalInvoices: 100,
    totalValue: 482100,
    reconciliationRate: 75.0,
    pendingApprovals: 3,
    duplicatesDetected: 1,
    suspiciousTransactions: 4,
    financialRiskExposure: 62270,
    averageInvoiceValue: 4821,
  });

  const [isDemoRunning, setIsDemoRunning] = useState(false);

  // Load all data from backend
  const loadData = useCallback(async () => {
    try {
      const [
        meRes,
        invRes,
        txRes,
        recRes,
        apprRes,
        agentRes,
        wfRes,
        auditRes,
        repRes,
      ] = await Promise.all([
        api.getMe().catch(() => null),
        api.getInvoices({ limit: 100 }).catch(() => null),
        api.getTransactions({ limit: 120 }).catch(() => null),
        api.getReconciliation().catch(() => null),
        api.getApprovals().catch(() => null),
        api.getAgents().catch(() => null),
        api.getWorkflows().catch(() => null),
        api.getAuditEvents({ limit: 100 }).catch(() => null),
        api.getReportsSummary().catch(() => null),
      ]);

      if (meRes?.user) {
        setCurrentUser(meRes.user);
        if (meRes.availableRoles) setAvailableRoles(meRes.availableRoles);
      }
      if (invRes?.invoices) setInvoices(invRes.invoices);
      if (txRes?.transactions) setTransactions(txRes.transactions);
      if (recRes) {
        if (recRes.matches) setMatches(recRes.matches);
        if (recRes.summary) setRecSummary(recRes.summary);
      }
      if (apprRes?.approvals) setApprovals(apprRes.approvals);
      if (agentRes?.agents) setAgents(agentRes.agents);
      if (wfRes?.workflows) setWorkflows(wfRes.workflows);
      if (auditRes?.events) setAuditEvents(auditRes.events);
      if (repRes?.metrics) setMetrics(repRes.metrics);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to SSE for live workflow & agent updates
    const eventSource = new EventSource('/api/workflows/events/stream');
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.workflow) {
          setWorkflows((prev) => {
            const index = prev.findIndex((w) => w.id === payload.workflow.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = payload.workflow;
              return updated;
            }
            return [payload.workflow, ...prev];
          });
        }
        // refresh data on completion or pause
        if (payload.type === 'WORKFLOW_PAUSED' || payload.type === 'WORKFLOW_COMPLETED') {
          loadData();
          setIsDemoRunning(false);
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [loadData]);

  // Demo Trigger Handler
  const handleTriggerDemo = async () => {
    setIsDemoRunning(true);
    setCurrentTab('agents');
    try {
      const res = await api.triggerDemoScenario();
      if (res?.workflow) {
        setWorkflows((prev) => [res.workflow, ...prev.filter((w) => w.id !== res.workflow.id)]);
      }
    } catch (err) {
      console.error('Demo trigger error:', err);
    } finally {
      setTimeout(() => {
        loadData();
        setIsDemoRunning(false);
      }, 4000);
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    await api.resetDemo();
    await loadData();
  };

  // Switch Role
  const handleSwitchRole = async (role: UserRole) => {
    const res = await api.switchRole(role);
    if (res?.user) {
      setCurrentUser(res.user);
      loadData();
    }
  };

  // Upload Invoice
  const handleUploadInvoice = async (data: {
    fileName: string;
    fileContent?: string;
    vendorName?: string;
    totalAmount?: number;
    invoiceNumber?: string;
  }) => {
    const res = await api.uploadInvoice(data);
    if (res?.invoice) {
      setInvoices((prev) => [res.invoice, ...prev]);
      loadData();
    }
  };

  // Update Invoice
  const handleUpdateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const res = await api.updateInvoice(id, updates);
    if (res?.invoice) {
      setInvoices((prev) => prev.map((i) => (i.id === id ? res.invoice : i)));
      loadData();
    }
  };

  // Process Single Invoice
  const handleProcessInvoice = async (id: string) => {
    setIsDemoRunning(true);
    setCurrentTab('agents');
    await api.processInvoice(id);
    setTimeout(() => {
      loadData();
      setIsDemoRunning(false);
    }, 3500);
  };

  // Reconciliation Run
  const handleRunReconciliation = async () => {
    await api.runReconciliation();
    await loadData();
  };

  // Manual Match
  const handleManualMatch = async (invoiceId: string, transactionId: string, notes?: string) => {
    await api.manualMatch(invoiceId, transactionId, notes);
    await loadData();
  };

  // CSV Bank Transactions Ingestion
  const handleUploadCsvTransactions = async (txs: Partial<BankTransaction>[]) => {
    await api.uploadTransactions(txs);
    await loadData();
  };

  // Approvals Actions
  const handleApprove = async (id: string, comment?: string) => {
    await api.approveRequest(id, comment);
    await loadData();
  };

  const handleReject = async (id: string, comment?: string) => {
    await api.rejectRequest(id, comment);
    await loadData();
  };

  const handleRequestReview = async (id: string, notes?: string, assignToRole?: string) => {
    await api.requestReview(id, notes, assignToRole);
    await loadData();
  };

  const pendingApprovalsCount = approvals.filter(
    (a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW'
  ).length;

  if (viewMode === 'landing') {
    return <LandingPage onEnterApp={() => setViewMode('app')} />;
  }

  return (
    <DashboardLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onBackToLanding={() => setViewMode('landing')}
      currentUser={currentUser}
      availableRoles={availableRoles}
      onSwitchRole={handleSwitchRole}
      pendingApprovalsCount={pendingApprovalsCount}
      onTriggerDemo={handleTriggerDemo}
      onResetDemo={handleResetDemo}
      isDemoRunning={isDemoRunning}
    >
      {currentTab === 'dashboard' && (
        <DashboardView
          metrics={metrics}
          workflows={workflows}
          agents={agents}
          auditEvents={auditEvents}
          onNavigateTab={setCurrentTab}
          onTriggerDemo={handleTriggerDemo}
          isDemoRunning={isDemoRunning}
        />
      )}

      {currentTab === 'invoices' && (
        <InvoicesView
          invoices={invoices}
          onUploadInvoice={handleUploadInvoice}
          onUpdateInvoice={handleUpdateInvoice}
          onProcessInvoice={handleProcessInvoice}
        />
      )}

      {currentTab === 'reconciliation' && (
        <ReconciliationView
          invoices={invoices}
          transactions={transactions}
          matches={matches}
          summary={recSummary}
          onRunReconciliation={handleRunReconciliation}
          onManualMatch={handleManualMatch}
          onUploadCsvTransactions={handleUploadCsvTransactions}
        />
      )}

      {currentTab === 'approvals' && (
        <ApprovalsView
          approvals={approvals}
          currentUser={currentUser}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestReview={handleRequestReview}
        />
      )}

      {currentTab === 'agents' && (
        <AgentsView
          agents={agents}
          workflows={workflows}
          onTriggerBatchRun={handleTriggerDemo}
          isRunningBatch={isDemoRunning}
        />
      )}

      {currentTab === 'audit' && (
        <AuditView events={auditEvents} metrics={metrics} />
      )}

      {currentTab === 'settings' && <SettingsView currentUser={currentUser} />}
    </DashboardLayout>
  );
}
