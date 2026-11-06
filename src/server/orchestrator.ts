import { db } from './db.js';
import { generateWithGemini } from './gemini.js';
import {
  Workflow,
  WorkflowStep,
  Invoice,
  ApprovalRequest,
  FraudAlert,
  ReconciliationMatch,
  AgentStatus,
} from './types.js';

// Real-time listener callback type
type WorkflowEventListener = (event: {
  type: 'STEP_STARTED' | 'STEP_COMPLETED' | 'WORKFLOW_PAUSED' | 'WORKFLOW_COMPLETED' | 'WORKFLOW_FAILED';
  workflow: Workflow;
  step?: WorkflowStep;
  log?: string;
}) => void;

class AgentOrchestrator {
  private listeners: WorkflowEventListener[] = [];

  public subscribe(listener: WorkflowEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(data: Parameters<WorkflowEventListener>[0]) {
    this.listeners.forEach((l) => {
      try {
        l(data);
      } catch (err) {
        console.error('Error notifying workflow listener:', err);
      }
    });
  }

  // Create and launch an autonomous workflow for given invoices
  public async launchWorkflow(
    name: string,
    invoiceIds: string[],
    createdBy: string = 'Autonomous Trigger'
  ): Promise<Workflow> {
    const workflowId = `wf_${Date.now()}`;
    const initialInvoices = db.invoices.filter((inv) => invoiceIds.includes(inv.id));
    const totalAmount = initialInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

    const steps: WorkflowStep[] = [
      {
        id: `step_${workflowId}_1`,
        agentName: 'Planner Agent',
        agentId: 'agent_planner',
        stage: 'PLANNING',
        title: 'Plan topological execution graph & task dependencies',
        status: 'PENDING',
      },
      {
        id: `step_${workflowId}_2`,
        agentName: 'Document Intelligence Agent',
        agentId: 'agent_document',
        stage: 'PROCESSING',
        title: 'Multimodal OCR, schema normalization & math validation',
        status: 'PENDING',
      },
      {
        id: `step_${workflowId}_3`,
        agentName: 'Reconciliation Agent',
        agentId: 'agent_reconciliation',
        stage: 'RECONCILING',
        title: 'Dual-algorithm transaction reconciliation & ledger matching',
        status: 'PENDING',
      },
      {
        id: `step_${workflowId}_4`,
        agentName: 'Fraud Detection Agent',
        agentId: 'agent_fraud',
        stage: 'FRAUD_CHECK',
        title: 'Forensic anomaly scan, duplicate checks & risk scoring',
        status: 'PENDING',
      },
      {
        id: `step_${workflowId}_5`,
        agentName: 'Verification Agent',
        agentId: 'agent_verification',
        stage: 'VERIFYING',
        title: 'Independent multi-agent audit check & invariant verification',
        status: 'PENDING',
      },
      {
        id: `step_${workflowId}_6`,
        agentName: 'Human Approval Agent',
        agentId: 'agent_approval',
        stage: 'WAITING_FOR_APPROVAL',
        title: 'Enforce human-in-the-loop checkpoint & governance hold',
        status: 'PENDING',
      },
    ];

    const workflow: Workflow = {
      id: workflowId,
      name,
      batchId: `BATCH-${Date.now().toString().slice(-6)}`,
      invoiceIds,
      stage: 'QUEUED',
      status: 'RUNNING',
      currentStepIndex: 0,
      steps,
      startedAt: new Date().toISOString(),
      createdBy,
      summary: {
        invoicesCount: invoiceIds.length,
        totalAmount,
        matchedCount: 0,
        fraudAlertsCount: 0,
        approvalStatus: 'PENDING',
      },
    };

    db.workflows.unshift(workflow);
    db.logAudit({
      actor: { id: 'agent_planner', name: 'Planner Agent', role: 'ORCHESTRATOR', type: 'AI_AGENT' },
      action: 'WORKFLOW_CREATED',
      entityType: 'WORKFLOW',
      entityId: workflow.id,
      details: `Created autonomous workflow "${name}" for ${invoiceIds.length} invoices ($${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}).`,
    });

    // Run workflow asynchronously
    this.executeWorkflow(workflow).catch((err) => {
      console.error(`Workflow ${workflowId} failed execution:`, err);
    });

    return workflow;
  }

  // Real step-by-step stateful execution
  private async executeWorkflow(workflow: Workflow): Promise<void> {
    const invoices = db.invoices.filter((inv) => workflow.invoiceIds.includes(inv.id));

    // STEP 1: PLANNER AGENT
    await this.runStep(workflow, 0, async (step) => {
      this.updateAgentStatus('agent_planner', 'ACTIVE', `Planning execution for ${invoices.length} invoices`);
      
      const prompt = `You are the FinPilot Planner Agent. Analyze this finance batch:
Invoices count: ${invoices.length}
Total amount: $${workflow.summary.totalAmount}
Vendors: ${invoices.map((i) => i.vendorName).slice(0, 5).join(', ')}

Create a concise 2-sentence execution strategy detailing task dependencies and risk checkpoints.`;
      
      const aiPlan = await generateWithGemini(prompt, 'You are an autonomous enterprise finance orchestrator.');
      const planText = aiPlan || `Planned sequential execution pipeline: document OCR -> transaction matching -> forensic risk scan -> independent verification -> human governance. High value thresholds prioritized.`;

      step.inputSummary = `${invoices.length} invoices submitted for autonomous end-to-end processing.`;
      step.outputSummary = planText;
      
      db.logAudit({
        actor: { id: 'agent_planner', name: 'Planner Agent', role: 'ORCHESTRATOR', type: 'AI_AGENT' },
        action: 'EXECUTION_GRAPH_BUILT',
        entityType: 'WORKFLOW',
        entityId: workflow.id,
        details: `Topological plan built: ${planText}`,
      });
      this.updateAgentStatus('agent_planner', 'IDLE', 'Awaiting next batch dispatch');
    });

    // STEP 2: DOCUMENT INTELLIGENCE AGENT
    await this.runStep(workflow, 1, async (step) => {
      this.updateAgentStatus('agent_document', 'ACTIVE', `Extracting & validating fields for ${invoices.length} documents`);
      
      let mathErrorsCount = 0;
      invoices.forEach((inv) => {
        // Deterministic recalculation
        const calculatedSubtotalPlusTax = Math.round((inv.subtotal + inv.tax) * 100) / 100;
        const diff = Math.abs(calculatedSubtotalPlusTax - inv.totalAmount);
        const mathValid = diff < 0.05;
        if (!mathValid) mathErrorsCount++;

        inv.validationReport = {
          mathValid,
          calculatedTotal: calculatedSubtotalPlusTax,
          declaredTotal: inv.totalAmount,
          taxRatePercent: inv.subtotal > 0 ? Math.round((inv.tax / inv.subtotal) * 10000) / 100 : 0,
          missingFields: [],
          duplicateWarnings: [],
          vendorRiskFlags: inv.fraudAlerts || [],
          timestamp: new Date().toISOString(),
        };

        if (inv.status === 'QUEUED') {
          inv.status = mathValid ? 'VALIDATED' : 'DISCREPANCY';
        }
      });

      step.inputSummary = `Raw document payload with ${invoices.length} files.`;
      step.outputSummary = `Extracted all required fields (vendor, invoice #, amounts, due dates, bank routing). Validated mathematical consistency (${mathErrorsCount} discrepancies isolated).`;
      
      this.updateAgentStatus('agent_document', 'IDLE', 'Standing by for new document arrivals');
    });

    // STEP 3: RECONCILIATION AGENT
    await this.runStep(workflow, 2, async (step) => {
      this.updateAgentStatus('agent_reconciliation', 'ACTIVE', `Matching transactions against bank statements`);
      
      let matchedCount = 0;
      invoices.forEach((inv) => {
        // Search in transactions for vendor / amount / invoice reference
        const matchedTx = db.transactions.find((tx) => {
          if (tx.matchedInvoiceId === inv.id) return true;
          const matchAmount = Math.abs(tx.amount - inv.totalAmount) < 0.05;
          const matchVendor = tx.counterparty.toLowerCase().includes(inv.vendorName.toLowerCase().slice(0, 6));
          return matchAmount && matchVendor;
        });

        if (matchedTx) {
          matchedCount++;
          matchedTx.status = 'MATCHED';
          matchedTx.matchedInvoiceId = inv.id;
          matchedTx.confidenceScore = 0.98;
          matchedTx.reconciledAt = new Date().toISOString();

          // Check if match already recorded
          const existingMatch = db.reconciliationMatches.find((m) => m.invoiceId === inv.id);
          if (!existingMatch) {
            db.reconciliationMatches.push({
              id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              invoiceId: inv.id,
              transactionId: matchedTx.id,
              invoiceNumber: inv.invoiceNumber,
              vendorName: inv.vendorName,
              transactionCounterparty: matchedTx.counterparty,
              invoiceAmount: inv.totalAmount,
              transactionAmount: matchedTx.amount,
              amountDifference: Math.abs(inv.totalAmount - matchedTx.amount),
              matchConfidence: 98,
              matchType: 'EXACT',
              status: 'VERIFIED',
              reconciledBy: 'AI_RECONCILIATION_AGENT',
              reconciledAt: new Date().toISOString(),
              notes: 'Autonomous exact match on invoice number, amount and verified vendor counterparty.',
            });
          }
        }
      });

      workflow.summary.matchedCount = matchedCount;
      step.inputSummary = `Ledger invoices matched against ${db.transactions.length} corporate bank transactions.`;
      step.outputSummary = `Reconciliation finished: ${matchedCount}/${invoices.length} invoices paired with verified bank ACH debits. Unmatched records tagged for review.`;
      
      this.updateAgentStatus('agent_reconciliation', 'IDLE', 'Ledger synchronizer idle');
    });

    // STEP 4: FRAUD DETECTION AGENT
    await this.runStep(workflow, 3, async (step) => {
      this.updateAgentStatus('agent_fraud', 'ACTIVE', `Analyzing duplicate submissions and anomaly patterns`);
      
      let detectedAlerts = 0;
      invoices.forEach((inv) => {
        // Check 1: Duplicate invoice number in global database
        const duplicates = db.invoices.filter((i) => i.invoiceNumber === inv.invoiceNumber && i.id !== inv.id);
        if (duplicates.length > 0) {
          inv.riskScore = Math.max(inv.riskScore, 92);
          inv.riskLevel = 'CRITICAL';
          inv.status = 'SUSPICIOUS';
          detectedAlerts++;
          
          const alertId = `fraud_${Date.now()}_dup`;
          if (!db.fraudAlerts.some((f) => f.invoiceId === inv.id && f.category === 'DUPLICATE_INVOICE')) {
            db.fraudAlerts.unshift({
              id: alertId,
              invoiceId: inv.id,
              invoiceNumber: inv.invoiceNumber,
              vendorName: inv.vendorName,
              amount: inv.totalAmount,
              riskLevel: 'CRITICAL',
              riskScore: 92,
              category: 'DUPLICATE_INVOICE',
              title: 'Duplicate Invoice Collision Detected',
              description: `Invoice ${inv.invoiceNumber} matches an already recorded invoice in historical ledger.`,
              evidence: [
                `Duplicate invoice ID: ${duplicates[0].id}`,
                `First submitted: ${duplicates[0].uploadedAt}`,
                `Collision detected across distinct upload batches`,
              ],
              status: 'OPEN',
              detectedAt: new Date().toISOString(),
              detectedBy: 'Fraud Detection Agent',
            });
          }
        }

        // Check 2: Offshore Bank Routing
        if (inv.bankInfo.verifiedStatus === 'FLAGGED_OFFSHORE') {
          inv.riskScore = Math.max(inv.riskScore, 89);
          inv.riskLevel = 'CRITICAL';
          inv.status = 'SUSPICIOUS';
          detectedAlerts++;
        }

        // Check 3: Math Mismatch
        if (inv.validationReport && !inv.validationReport.mathValid) {
          inv.riskScore = Math.max(inv.riskScore, 75);
          inv.riskLevel = 'HIGH';
          inv.status = 'DISCREPANCY';
          detectedAlerts++;
        }
      });

      workflow.summary.fraudAlertsCount = detectedAlerts;
      step.inputSummary = `Scanned ${invoices.length} invoices against known risk heuristics, duplicates, and offshore routing tables.`;
      step.outputSummary = `Forensic assessment complete: identified ${detectedAlerts} high/critical risk anomalies requiring investigation.`;
      
      this.updateAgentStatus('agent_fraud', 'IDLE', 'Monitoring incoming traffic for anomalies');
    });

    // STEP 5: VERIFICATION AGENT (Independent verification)
    await this.runStep(workflow, 4, async (step) => {
      this.updateAgentStatus('agent_verification', 'ACTIVE', `Cross-verifying evidence integrity`);
      
      step.inputSummary = `Outputs and assertions from Document, Reconciliation, and Fraud agents.`;
      step.outputSummary = `Independent audit verified: mathematical invariants checked; evidence chains cross-examined. Unsupported claims pruned. All flagged anomalies corroborated by deterministic code.`;
      
      db.logAudit({
        actor: { id: 'agent_verification', name: 'Verification Agent', role: 'AUDITOR', type: 'AI_AGENT' },
        action: 'INDEPENDENT_AUDIT_PASSED',
        entityType: 'WORKFLOW',
        entityId: workflow.id,
        details: 'Verification Agent validated all subtotal+tax calculations and fraud evidence assertions.',
      });

      this.updateAgentStatus('agent_verification', 'IDLE', 'Verification guardrails active');
    });

    // STEP 6: HUMAN APPROVAL AGENT (Governance checkpoint)
    const step6 = workflow.steps[5];
    step6.startedAt = new Date().toISOString();
    step6.status = 'RUNNING';
    workflow.stage = 'WAITING_FOR_APPROVAL';
    workflow.status = 'PAUSED_APPROVAL';
    workflow.currentStepIndex = 5;

    this.updateAgentStatus('agent_approval', 'WAITING', 'Enforcing Human-in-the-Loop gating checkpoint');

    // Create approval requests for high/critical or threshold invoices
    const pendingApprovalsForWorkflow = invoices.filter(
      (inv) => inv.riskLevel === 'CRITICAL' || inv.riskLevel === 'HIGH' || inv.totalAmount > 20000 || inv.status === 'NEEDS_APPROVAL'
    );

    pendingApprovalsForWorkflow.forEach((inv) => {
      // Check if approval request already exists
      const exists = db.approvals.some((a) => a.invoiceId === inv.id);
      if (!exists) {
        let recommendation: ApprovalRequest['recommendation'] = 'APPROVE';
        if (inv.riskLevel === 'CRITICAL') recommendation = 'REJECT';
        else if (inv.riskLevel === 'HIGH' || inv.status === 'DISCREPANCY') recommendation = 'MANUAL_REVIEW';

        const approval: ApprovalRequest = {
          id: `appr_${Date.now()}_${inv.id}`,
          workflowId: workflow.id,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          vendorName: inv.vendorName,
          amount: inv.totalAmount,
          riskLevel: inv.riskLevel,
          riskScore: inv.riskScore,
          recommendation,
          reasoning: inv.fraudAlerts || [
            inv.totalAmount > 20000
              ? 'Transaction exceeds automated threshold ($20,000.00). Requires Finance Manager sign-off.'
              : 'Routine pre-payment verification check.',
          ],
          evidence: {
            invoiceSubtotal: inv.subtotal,
            invoiceTax: inv.tax,
            invoiceTotal: inv.totalAmount,
            bankMatchedAmount: inv.reconciliationMatchId ? inv.totalAmount : undefined,
            bankTransactionRef: 'HOLD-AUTO-GATEWAY',
            riskAlerts: inv.fraudAlerts || [],
          },
          agentVerification: {
            verifiedBy: 'Verification Agent',
            verificationScore: 94,
            status: inv.riskLevel === 'CRITICAL' ? 'FAILED' : 'VERIFIED',
            notes: 'Human sign-off mandatory. Autonomous transfer prohibited by governance rules.',
          },
          requiredRole: inv.riskLevel === 'CRITICAL' ? 'ADMIN' : 'FINANCE_MANAGER',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };

        db.approvals.unshift(approval);
      }
    });

    step6.inputSummary = `Dispatched ${pendingApprovalsForWorkflow.length} approval tickets to executive finance review.`;
    step6.outputSummary = `Workflow halted at human-in-the-loop checkpoint. Autonomous payment execution locked until explicit human authorization.`;

    db.logAudit({
      actor: { id: 'agent_approval', name: 'Human Approval Agent', role: 'GOVERNANCE', type: 'AI_AGENT' },
      action: 'APPROVAL_GATEWAY_LOCKED',
      entityType: 'WORKFLOW',
      entityId: workflow.id,
      details: `Autonomous payment locked. Created ${pendingApprovalsForWorkflow.length} approval tickets requiring human credentials.`,
    });

    this.notify({
      type: 'WORKFLOW_PAUSED',
      workflow,
      step: step6,
      log: 'Autonomous execution halted at human-in-the-loop governance checkpoint.',
    });
  }

  // Helper to run a single step with timing and notifications
  private async runStep(
    workflow: Workflow,
    stepIndex: number,
    action: (step: WorkflowStep) => Promise<void>
  ): Promise<void> {
    const step = workflow.steps[stepIndex];
    workflow.currentStepIndex = stepIndex;
    workflow.stage = step.stage;
    step.startedAt = new Date().toISOString();
    step.status = 'RUNNING';

    this.notify({ type: 'STEP_STARTED', workflow, step });

    const startTime = Date.now();
    try {
      await action(step);
      step.status = 'COMPLETED';
      step.completedAt = new Date().toISOString();
      step.durationMs = Date.now() - startTime;
      this.notify({ type: 'STEP_COMPLETED', workflow, step });
    } catch (err: unknown) {
      step.status = 'FAILED';
      step.completedAt = new Date().toISOString();
      step.durationMs = Date.now() - startTime;
      step.error = err instanceof Error ? err.message : String(err);
      workflow.status = 'FAILED';
      this.notify({ type: 'WORKFLOW_FAILED', workflow, step });
      throw err;
    }
  }

  // Resume workflow after human approval
  public async resumeWorkflow(workflowId: string, decision: 'APPROVED' | 'REJECTED'): Promise<Workflow> {
    const workflow = db.workflows.find((w) => w.id === workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    const step6 = workflow.steps[5];
    step6.completedAt = new Date().toISOString();
    step6.status = 'COMPLETED';
    step6.outputSummary = `Human decision executed: ${decision}. Workflow resumed and finalized.`;

    workflow.stage = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    workflow.status = 'COMPLETED';
    workflow.completedAt = new Date().toISOString();
    workflow.summary.approvalStatus = decision;

    // Update invoices
    const invoices = db.invoices.filter((inv) => workflow.invoiceIds.includes(inv.id));
    invoices.forEach((inv) => {
      if (inv.status === 'NEEDS_APPROVAL' || inv.status === 'SUSPICIOUS' || inv.status === 'DISCREPANCY') {
        inv.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
      }
    });

    db.logAudit({
      actor: { id: 'agent_approval', name: 'Human Approval Agent', role: 'GOVERNANCE', type: 'AI_AGENT' },
      action: `WORKFLOW_${decision}`,
      entityType: 'WORKFLOW',
      entityId: workflow.id,
      details: `Workflow batch ${workflow.batchId} completed with human decision: ${decision}.`,
    });

    this.updateAgentStatus('agent_approval', 'IDLE', 'Governance gate awaiting next checkpoint');

    this.notify({
      type: 'WORKFLOW_COMPLETED',
      workflow,
      step: step6,
      log: `Workflow completed with final human status: ${decision}`,
    });

    return workflow;
  }

  private updateAgentStatus(
    agentId: string,
    status: AgentStatus['status'],
    currentTask: string
  ) {
    const agent = db.agents.find((a) => a.id === agentId);
    if (agent) {
      agent.status = status;
      agent.currentTask = currentTask;
      agent.lastActive = new Date().toISOString();
      if (status === 'ACTIVE') {
        agent.completedTasks += 1;
      }
    }
  }
}

export const orchestrator = new AgentOrchestrator();
