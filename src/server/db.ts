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
} from './types.js';

// Predefined Demo Users
export const DEMO_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Alexandria Chen',
    email: 'alex.chen@finpilot.vultr.internal',
    role: 'ADMIN',
    department: 'Executive Finance & Ops',
  },
  {
    id: 'usr_finmgr_1',
    name: 'Marcus Vance',
    email: 'm.vance@finpilot.vultr.internal',
    role: 'FINANCE_MANAGER',
    department: 'Accounts Payable & Treasury',
  },
  {
    id: 'usr_acct_1',
    name: 'Sarah Lindqvist',
    email: 'sarah.l@finpilot.vultr.internal',
    role: 'ACCOUNTANT',
    department: 'General Ledger Operations',
  },
  {
    id: 'usr_audit_1',
    name: 'David O’Connor',
    email: 'd.oconnor@finpilot.vultr.internal',
    role: 'AUDITOR',
    department: 'Risk, Regulatory & Compliance',
  },
];

export const INITIAL_AGENTS: AgentStatus[] = [
  {
    id: 'agent_planner',
    name: 'Planner Agent',
    role: 'Task Orchestration & Dependency Engine',
    status: 'ACTIVE',
    currentTask: 'Idle — Ready for next financial batch dispatch',
    completedTasks: 142,
    failedTasks: 0,
    lastActive: new Date().toISOString(),
    latencyMs: 124,
    model: 'gemini-3.8-flash',
    description: 'Decomposes financial processing tasks, builds execution graph, manages task dependencies and fallback paths.',
  },
  {
    id: 'agent_document',
    name: 'Document Intelligence Agent',
    role: 'OCR & Multimodal Structured Extractor',
    status: 'ACTIVE',
    currentTask: 'Extracting semantic metadata from invoices',
    completedTasks: 384,
    failedTasks: 2,
    lastActive: new Date().toISOString(),
    latencyMs: 380,
    model: 'gemini-3.8-flash + Deterministic OCR',
    description: 'Parses PDF, PNG, and JPG invoices to structured schemas, computes field-level confidence, and normalizes totals.',
  },
  {
    id: 'agent_reconciliation',
    name: 'Reconciliation Agent',
    role: 'Autonomous Matching & Ledger Linker',
    status: 'ACTIVE',
    currentTask: 'Evaluating fuzzy vendor and amount match probabilities',
    completedTasks: 310,
    failedTasks: 1,
    lastActive: new Date().toISOString(),
    latencyMs: 145,
    model: 'Deterministic Fuzzy Engine + Semantic Vector Matching',
    description: 'Matches bank transaction records against accounts payable invoices with dual exact/fuzzy scoring algorithms.',
  },
  {
    id: 'agent_fraud',
    name: 'Fraud Detection Agent',
    role: 'Anomaly Investigator & Risk Scorer',
    status: 'ACTIVE',
    currentTask: 'Scanning for duplicate invoice collisions and routing changes',
    completedTasks: 298,
    failedTasks: 0,
    lastActive: new Date().toISOString(),
    latencyMs: 210,
    model: 'gemini-3.8-flash + Rule-based Forensic Engine',
    description: 'Scans transaction velocity, unverified offshore bank routing, duplicate billing, and suspicious vendor modifications.',
  },
  {
    id: 'agent_verification',
    name: 'Verification Agent',
    role: 'Independent Multi-Agent Audit Check',
    status: 'ACTIVE',
    currentTask: 'Recalculating subtotal + tax consistency on active queue',
    completedTasks: 275,
    failedTasks: 3,
    lastActive: new Date().toISOString(),
    latencyMs: 95,
    model: 'Deterministic Verification & Consistency Guardrails',
    description: 'Independently inspects previous agent outputs, checks mathematical invariants, and rejects unsupported conclusions.',
  },
  {
    id: 'agent_approval',
    name: 'Human Approval Agent',
    role: 'Governance Gatekeeper & Decision Broker',
    status: 'WAITING',
    currentTask: 'Enforcing human-in-the-loop checkpoints for high-risk actions',
    completedTasks: 189,
    failedTasks: 0,
    lastActive: new Date().toISOString(),
    latencyMs: 65,
    model: 'Stateful Authorization Guardrail',
    description: 'Strictly blocks autonomous payment execution; generates structured approval cards with comprehensive evidence.',
  },
];

// Helper to generate seed invoices (100 realistic invoices)
function generateSeedInvoices(): Invoice[] {
  const vendors = [
    { name: 'Vultr Cloud Infrastructure LLC', cat: 'Cloud Hosting & Bare Metal', taxId: 'US-82910482', prefix: 'VULTR' },
    { name: 'Datadog Enterprise Monitoring', cat: 'Observability & APM', taxId: 'US-99382104', prefix: 'DDG' },
    { name: 'Snowflake Computing Inc.', cat: 'Data Warehousing', taxId: 'US-44729104', prefix: 'SNOW' },
    { name: 'CrowdStrike Falcon Security', cat: 'Endpoint Protection', taxId: 'US-10294821', prefix: 'CRWD' },
    { name: 'Twilio Cloud Communications', cat: 'Telephony & SMS', taxId: 'US-77291024', prefix: 'TWLO' },
    { name: 'Stripe Payments Processing', cat: 'Merchant Services', taxId: 'US-38291049', prefix: 'STRP' },
    { name: 'Oracle Cloud ERP Systems', cat: 'Enterprise Software', taxId: 'US-55492019', prefix: 'ORCL' },
    { name: 'GitHub Enterprise Suite', cat: 'Developer Tooling', taxId: 'US-66291044', prefix: 'GHUB' },
    { name: 'PagerDuty Incident Command', cat: 'DevOps & Reliability', taxId: 'US-33920194', prefix: 'PGRD' },
    { name: 'MongoDB Atlas Global Cloud', cat: 'Distributed Database', taxId: 'US-12948201', prefix: 'MDB' },
    { name: 'Apex Global Logistics Holdings', cat: 'Freight & Hauling', taxId: 'BVI-8829102', prefix: 'APEX' }, // Suspicious vendor
    { name: 'CloudFlare Edge Protection', cat: 'CDN & DDoS Shield', taxId: 'US-88291048', prefix: 'CFLR' },
  ];

  const invoices: Invoice[] = [];

  for (let i = 1; i <= 100; i++) {
    const vIndex = i % vendors.length;
    const vendor = vendors[vIndex];
    const isSpecialCase = i <= 12; // first 12 have specific test scenarios

    let amount = Math.round((450 + (i * 317) % 24500) * 100) / 100;
    let taxRate = 0.0825;
    let subtotal = Math.round((amount / (1 + taxRate)) * 100) / 100;
    let tax = Math.round((amount - subtotal) * 100) / 100;
    let riskScore = 8 + (i * 7) % 25;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let status: Invoice['status'] = 'VALIDATED';
    let fraudAlerts: string[] = [];
    let bankVerified: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED_OFFSHORE' = 'VERIFIED';
    let mathValid = true;

    const invoiceNum = `${vendor.prefix}-2026-${(1000 + i).toString().padStart(4, '0')}`;
    const invoiceDate = `2026-10-${((i % 28) + 1).toString().padStart(2, '0')}`;
    const dueDate = `2026-11-${((i % 28) + 1).toString().padStart(2, '0')}`;

    // Specific deliberate scenarios for Hackathon Demonstration
    if (i === 1) {
      // Scenario 1: Critical Duplicate Invoice
      riskScore = 94;
      riskLevel = 'CRITICAL';
      status = 'SUSPICIOUS';
      fraudAlerts = ['Duplicate invoice number detected: identical invoice submitted 48 hours earlier', 'Double billing anomaly'];
    } else if (i === 2) {
      // Scenario 2: High Amount Mismatch against Bank Record
      amount = 18450.00;
      subtotal = 17000.00;
      tax = 1450.00;
      riskScore = 82;
      riskLevel = 'HIGH';
      status = 'DISCREPANCY';
      fraudAlerts = ['Amount mismatch: Bank transaction record reflects $21,950.00 (+19% variance)'];
    } else if (i === 3) {
      // Scenario 3: Suspicious Vendor / Offshore Routing
      amount = 34900.00;
      subtotal = 32000.00;
      tax = 2900.00;
      riskScore = 89;
      riskLevel = 'CRITICAL';
      status = 'SUSPICIOUS';
      bankVerified = 'FLAGGED_OFFSHORE';
      fraudAlerts = [
        'Unverified offshore beneficiary bank routing (Cayman Islands branch)',
        'Vendor tax ID registration non-compliant with standard IRS W-9 database',
      ];
    } else if (i === 4) {
      // Scenario 4: Calculation / Math Inconsistency (Detected by Validation Agent)
      amount = 8920.00;
      subtotal = 7000.00;
      tax = 500.00; // 7000 + 500 != 8920
      mathValid = false;
      riskScore = 74;
      riskLevel = 'HIGH';
      status = 'DISCREPANCY';
      fraudAlerts = ['Mathematical discrepancy: Subtotal ($7,000.00) + Tax ($500.00) does not equal declared total ($8,920.00)'];
    } else if (i === 5) {
      // Scenario 5: High Value Clean Invoice Waiting Approval
      amount = 45800.00;
      subtotal = 42200.00;
      tax = 3600.00;
      riskScore = 35;
      riskLevel = 'MEDIUM';
      status = 'NEEDS_APPROVAL';
    } else if (i === 6) {
      // Scenario 6: Reconciled & Approved
      status = 'APPROVED';
      riskScore = 12;
      riskLevel = 'LOW';
    } else if (i > 6 && i <= 20) {
      status = 'RECONCILED';
      riskScore = 15;
    }

    invoices.push({
      id: `inv_${i.toString().padStart(3, '0')}`,
      invoiceNumber: invoiceNum,
      vendorName: vendor.name,
      vendorTaxId: vendor.taxId,
      vendorCategory: vendor.cat,
      invoiceDate,
      dueDate,
      subtotal,
      tax,
      totalAmount: amount,
      currency: 'USD',
      items: [
        {
          id: `item_${i}_1`,
          description: `${vendor.cat} - Tier 1 Enterprise Allocation`,
          quantity: 1,
          unitPrice: subtotal * 0.7,
          total: subtotal * 0.7,
        },
        {
          id: `item_${i}_2`,
          description: `Dedicated Premium SLA Support & Managed Infrastructure`,
          quantity: 1,
          unitPrice: subtotal * 0.3,
          total: subtotal * 0.3,
        },
      ],
      bankInfo: {
        bankName: bankVerified === 'FLAGGED_OFFSHORE' ? 'First Offshore Trust Bank, Georgetown' : 'JPMorgan Chase Commercial Banking',
        accountNumber: `***${(3819 + i * 4).toString().slice(-4)}`,
        routingNumber: bankVerified === 'FLAGGED_OFFSHORE' ? '021000089' : '021000021',
        swift: bankVerified === 'FLAGGED_OFFSHORE' ? 'FOTBKYG1' : 'CHASUS33',
        verifiedStatus: bankVerified,
      },
      confidence: {
        vendorName: 0.99,
        invoiceNumber: 0.98,
        invoiceDate: 0.97,
        dueDate: 0.96,
        subtotal: mathValid ? 0.99 : 0.65,
        tax: 0.95,
        totalAmount: 0.99,
        bankAccount: bankVerified === 'VERIFIED' ? 0.96 : 0.42,
        overall: mathValid ? 0.97 : 0.71,
      },
      status,
      validationReport: {
        mathValid,
        calculatedTotal: subtotal + tax,
        declaredTotal: amount,
        taxRatePercent: 8.25,
        missingFields: [],
        duplicateWarnings: i === 1 ? ['Duplicate submission: Invoice number match found'] : [],
        vendorRiskFlags: fraudAlerts,
        timestamp: new Date().toISOString(),
      },
      fileName: `${vendor.prefix.toLowerCase()}_invoice_${(1000 + i)}.pdf`,
      fileType: 'pdf',
      uploadedAt: new Date(Date.now() - (100 - i) * 3600000 * 4).toISOString(),
      riskScore,
      riskLevel,
      fraudAlerts: fraudAlerts.length > 0 ? fraudAlerts : undefined,
      tags: ['Enterprise AP', vendor.prefix, 'Vultr Ops'],
    });
  }

  return invoices;
}

// Helper to generate seed bank transactions (120 realistic bank records)
function generateSeedTransactions(invoices: Invoice[]): BankTransaction[] {
  const transactions: BankTransaction[] = [];

  // Match corresponding invoices
  invoices.forEach((inv, index) => {
    // Exact or slightly matched
    let txAmount = inv.totalAmount;
    let status: BankTransaction['status'] = 'MATCHED';
    let matchedId: string | undefined = inv.id;

    if (inv.id === 'inv_002') {
      // Intentional mismatch
      txAmount = 21950.00;
      status = 'FLAGGED';
    } else if (inv.id === 'inv_001') {
      // Duplicate payment attempt
      status = 'FLAGGED';
    } else if (index > 75) {
      // Unmatched invoices
      status = 'UNMATCHED';
      matchedId = undefined;
    }

    transactions.push({
      id: `tx_${(index + 1).toString().padStart(3, '0')}`,
      date: inv.invoiceDate,
      description: `ACH DEBIT ${inv.vendorName.toUpperCase().slice(0, 22)} REF#${inv.invoiceNumber}`,
      referenceNumber: `REF-ACH-${883920 + index}`,
      amount: txAmount,
      type: 'DEBIT',
      counterparty: inv.vendorName,
      accountNumber: '****9812',
      status,
      matchedInvoiceId: matchedId,
      confidenceScore: inv.id === 'inv_002' ? 0.45 : (status === 'MATCHED' ? 0.98 : undefined),
      reconciledAt: status === 'MATCHED' ? new Date().toISOString() : undefined,
    });
  });

  // Add 20 extra unmatched / standalone transactions (utility, interest, merchant refunds, ghost debits)
  for (let j = 101; j <= 120; j++) {
    const isSuspicious = j === 115 || j === 119;
    transactions.push({
      id: `tx_${j.toString().padStart(3, '0')}`,
      date: `2026-10-${((j % 28) + 1).toString().padStart(2, '0')}`,
      description: isSuspicious
        ? 'WIRE XFR APEX OFFSHORE CAPITAL LLC REF#UNAUTH-9912'
        : `FEDWIRE BANK FEE / UTILITY ACH ${j * 17}`,
      referenceNumber: `WIRE-${994800 + j}`,
      amount: isSuspicious ? 49500.00 : Math.round((120 + (j * 43) % 1800) * 100) / 100,
      type: 'DEBIT',
      counterparty: isSuspicious ? 'Apex Offshore Capital Ltd.' : 'Consolidated Edison / Bank Services',
      accountNumber: '****9812',
      status: isSuspicious ? 'FLAGGED' : 'UNMATCHED',
    });
  }

  return transactions;
}

// In-Memory Database Store Class
class FinPilotDatabase {
  public users: User[] = [...DEMO_USERS];
  public agents: AgentStatus[] = [...INITIAL_AGENTS];
  public invoices: Invoice[] = [];
  public transactions: BankTransaction[] = [];
  public reconciliationMatches: ReconciliationMatch[] = [];
  public fraudAlerts: FraudAlert[] = [];
  public workflows: Workflow[] = [];
  public approvals: ApprovalRequest[] = [];
  public auditEvents: AuditEvent[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.invoices = generateSeedInvoices();
    this.transactions = generateSeedTransactions(this.invoices);
    this.generateInitialMatches();
    this.generateInitialFraudAlerts();
    this.generateInitialApprovals();
    this.generateInitialWorkflows();
    this.generateInitialAuditEvents();
  }

  private generateInitialMatches() {
    this.reconciliationMatches = [];
    this.invoices.slice(0, 75).forEach((inv, idx) => {
      const tx = this.transactions.find((t) => t.matchedInvoiceId === inv.id);
      if (tx) {
        const isDiscrepancy = inv.id === 'inv_002';
        this.reconciliationMatches.push({
          id: `match_${(idx + 1).toString().padStart(3, '0')}`,
          invoiceId: inv.id,
          transactionId: tx.id,
          invoiceNumber: inv.invoiceNumber,
          vendorName: inv.vendorName,
          transactionCounterparty: tx.counterparty,
          invoiceAmount: inv.totalAmount,
          transactionAmount: tx.amount,
          amountDifference: Math.abs(inv.totalAmount - tx.amount),
          matchConfidence: isDiscrepancy ? 48 : 98,
          matchType: isDiscrepancy ? 'DISCREPANCY' : 'EXACT',
          status: isDiscrepancy ? 'DISPUTED' : 'VERIFIED',
          reconciledBy: 'AI_RECONCILIATION_AGENT',
          reconciledAt: new Date(Date.now() - idx * 3600000 * 2).toISOString(),
          notes: isDiscrepancy ? 'Invoice total differs from ACH clearing value by $3,500.00' : 'Exact match on invoice # and amount',
        });
      }
    });
  }

  private generateInitialFraudAlerts() {
    this.fraudAlerts = [
      {
        id: 'fraud_001',
        invoiceId: 'inv_001',
        invoiceNumber: 'VULTR-2026-1001',
        vendorName: 'Vultr Cloud Infrastructure LLC',
        amount: 812.00,
        riskLevel: 'CRITICAL',
        riskScore: 94,
        category: 'DUPLICATE_INVOICE',
        title: 'Duplicate Invoice Collision Detected',
        description: 'Invoice number VULTR-2026-1001 was submitted twice with identical hash within 48 hours.',
        evidence: [
          'First submitted: 2026-10-02 09:14 UTC (Approved)',
          'Resubmitted: 2026-10-04 11:22 UTC (Flagged)',
          'Bank hash matches previous cleared batch #44910',
        ],
        status: 'OPEN',
        detectedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        detectedBy: 'Fraud Detection Agent',
      },
      {
        id: 'fraud_002',
        invoiceId: 'inv_002',
        invoiceNumber: 'DDG-2026-1002',
        vendorName: 'Datadog Enterprise Monitoring',
        amount: 18450.00,
        riskLevel: 'HIGH',
        riskScore: 82,
        category: 'AMOUNT_MISMATCH',
        title: 'Clearing Variance Exceeds 15% Threshold',
        description: 'Declared invoice amount ($18,450.00) differs from bank settlement debit ($21,950.00).',
        evidence: [
          'Invoice Subtotal: $17,000.00 + Tax: $1,450.00 = $18,450.00',
          'Bank ACH debit settled at: $21,950.00',
          'Unexplained variance: +$3,500.00 (+18.9%)',
        ],
        status: 'INVESTIGATING',
        detectedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        detectedBy: 'Reconciliation Agent',
      },
      {
        id: 'fraud_003',
        invoiceId: 'inv_003',
        invoiceNumber: 'APEX-2026-1003',
        vendorName: 'Apex Global Logistics Holdings',
        amount: 34900.00,
        riskLevel: 'CRITICAL',
        riskScore: 89,
        category: 'UNVERIFIED_BANK_ROUTING',
        title: 'Offshore Routing & New Remittance Account',
        description: 'Beneficiary remittance instructions point to unverified Georgetown Cayman account not listed in master vendor agreement.',
        evidence: [
          'Master vendor registry specifies Chase US Account ****3319',
          'Invoice submitted with SWIFT FOTBKYG1 (First Offshore Trust Bank)',
          'Vendor registered jurisdiction: British Virgin Islands',
        ],
        status: 'OPEN',
        detectedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        detectedBy: 'Fraud Detection Agent',
      },
      {
        id: 'fraud_004',
        invoiceId: 'inv_004',
        invoiceNumber: 'SNOW-2026-1004',
        vendorName: 'Snowflake Computing Inc.',
        amount: 8920.00,
        riskLevel: 'HIGH',
        riskScore: 74,
        category: 'CALCULATION_FORGERY',
        title: 'Line Item Mathematical Inconsistency',
        description: 'Sum of itemized lines and tax rates does not equal header grand total.',
        evidence: [
          'Item total: $7,000.00',
          'Reported tax: $500.00 (7.14%)',
          'Header grand total states: $8,920.00 ($1,420 unexplained inflation)',
        ],
        status: 'OPEN',
        detectedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        detectedBy: 'Verification Agent',
      },
    ];
  }

  private generateInitialApprovals() {
    this.approvals = [
      {
        id: 'appr_001',
        workflowId: 'wf_demo_001',
        invoiceId: 'inv_003',
        invoiceNumber: 'APEX-2026-1003',
        vendorName: 'Apex Global Logistics Holdings',
        amount: 34900.00,
        riskLevel: 'CRITICAL',
        riskScore: 89,
        recommendation: 'REJECT',
        reasoning: [
          'High probability of wire redirection / vendor email compromise (VEC).',
          'Beneficiary account routing changed from US domestic to offshore Cayman branch.',
          'Invoice exceeds automated clearance threshold of $10,000.00.',
        ],
        evidence: {
          invoiceSubtotal: 32000.00,
          invoiceTax: 2900.00,
          invoiceTotal: 34900.00,
          bankMatchedAmount: undefined,
          bankTransactionRef: 'HOLD-APEX-WIRE',
          riskAlerts: ['Offshore unverified wire instructions', 'Vendor jurisdiction discrepancy'],
        },
        agentVerification: {
          verifiedBy: 'Verification Agent',
          verificationScore: 92,
          status: 'FAILED',
          notes: 'Agent consensus: Reject payment and freeze vendor routing until secondary verbal confirmation.',
        },
        requiredRole: 'ADMIN',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: 'appr_002',
        workflowId: 'wf_demo_001',
        invoiceId: 'inv_002',
        invoiceNumber: 'DDG-2026-1002',
        vendorName: 'Datadog Enterprise Monitoring',
        amount: 18450.00,
        riskLevel: 'HIGH',
        riskScore: 82,
        recommendation: 'MANUAL_REVIEW',
        reasoning: [
          'Bank clearing statement has $3,500.00 variance over declared invoice total.',
          'Possible annual enterprise true-up fee not itemized in preliminary invoice PDF.',
        ],
        evidence: {
          invoiceSubtotal: 17000.00,
          invoiceTax: 1450.00,
          invoiceTotal: 18450.00,
          bankMatchedAmount: 21950.00,
          bankTransactionRef: 'REF-ACH-883921',
          discrepancy: 3500.00,
          riskAlerts: ['Clearing variance exceeds 15% threshold'],
        },
        agentVerification: {
          verifiedBy: 'Verification Agent',
          verificationScore: 78,
          status: 'CONDITIONAL',
          notes: 'Requires Finance Manager confirmation of supplemental service order.',
        },
        requiredRole: 'FINANCE_MANAGER',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'appr_003',
        workflowId: 'wf_demo_002',
        invoiceId: 'inv_005',
        invoiceNumber: 'TWLO-2026-1005',
        vendorName: 'Twilio Cloud Communications',
        amount: 45800.00,
        riskLevel: 'MEDIUM',
        riskScore: 35,
        recommendation: 'APPROVE',
        reasoning: [
          'Clean invoice extraction and valid mathematical subtotal.',
          'Vendor bank routing verified with Chase Treasury master record.',
          'Held strictly due to enterprise single-invoice amount policy (> $25,000.00).',
        ],
        evidence: {
          invoiceSubtotal: 42200.00,
          invoiceTax: 3600.00,
          invoiceTotal: 45800.00,
          bankMatchedAmount: 45800.00,
          bankTransactionRef: 'REF-ACH-883924',
          discrepancy: 0,
          riskAlerts: ['High value invoice policy threshold'],
        },
        agentVerification: {
          verifiedBy: 'Verification Agent',
          verificationScore: 99,
          status: 'VERIFIED',
          notes: 'Full multi-agent consensus for approval. Safe for execution release.',
        },
        requiredRole: 'FINANCE_MANAGER',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ];
  }

  private generateInitialWorkflows() {
    this.workflows = [
      {
        id: 'wf_batch_101',
        name: 'Automated AP Ingestion Batch #101',
        batchId: 'BATCH-2026-OCT-101',
        invoiceIds: ['inv_001', 'inv_002', 'inv_003', 'inv_004', 'inv_005'],
        stage: 'WAITING_FOR_APPROVAL',
        status: 'PAUSED_APPROVAL',
        currentStepIndex: 5,
        startedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        createdBy: 'Autonomous Vultr Scheduler',
        summary: {
          invoicesCount: 5,
          totalAmount: 108882.00,
          matchedCount: 3,
          fraudAlertsCount: 4,
          approvalStatus: 'PENDING',
        },
        steps: [
          {
            id: 'step_1',
            agentName: 'Planner Agent',
            agentId: 'agent_planner',
            stage: 'PLANNING',
            title: 'Decompose batch & configure dependencies',
            status: 'COMPLETED',
            startedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
            completedAt: new Date(Date.now() - 6 * 3600000 + 420).toISOString(),
            durationMs: 420,
            inputSummary: '5 invoice documents queued for end-to-end processing',
            outputSummary: 'Formulated 5-step topological execution graph; prioritized high-value documents.',
          },
          {
            id: 'step_2',
            agentName: 'Document Intelligence Agent',
            agentId: 'agent_document',
            stage: 'PROCESSING',
            title: 'Multimodal OCR and schema normalization',
            status: 'COMPLETED',
            startedAt: new Date(Date.now() - 6 * 3600000 + 430).toISOString(),
            completedAt: new Date(Date.now() - 6 * 3600000 + 1920).toISOString(),
            durationMs: 1490,
            inputSummary: 'Raw invoice files (PDF/PNG)',
            outputSummary: 'Extracted 32 structured fields; average confidence 94.6%.',
          },
          {
            id: 'step_3',
            agentName: 'Reconciliation Agent',
            agentId: 'agent_reconciliation',
            stage: 'RECONCILING',
            title: 'Bank transaction reconciliation match',
            status: 'COMPLETED',
            startedAt: new Date(Date.now() - 6 * 3600000 + 1930).toISOString(),
            completedAt: new Date(Date.now() - 6 * 3600000 + 2610).toISOString(),
            durationMs: 680,
            inputSummary: 'Accounts payable line items vs Bank ACH debits',
            outputSummary: '3 exact matches found; 1 amount variance flagged ($3,500 mismatch on DDG-2026-1002).',
          },
          {
            id: 'step_4',
            agentName: 'Fraud Detection Agent',
            agentId: 'agent_fraud',
            stage: 'FRAUD_CHECK',
            title: 'Multi-vector anomaly & fraud investigation',
            status: 'COMPLETED',
            startedAt: new Date(Date.now() - 6 * 3600000 + 2620).toISOString(),
            completedAt: new Date(Date.now() - 6 * 3600000 + 3550).toISOString(),
            durationMs: 930,
            inputSummary: 'Historical transaction records, vendor bank whitelist, hash database',
            outputSummary: 'Flagged 1 duplicate invoice, 1 unverified offshore bank routing, 1 math mismatch.',
          },
          {
            id: 'step_5',
            agentName: 'Verification Agent',
            agentId: 'agent_verification',
            stage: 'VERIFYING',
            title: 'Independent mathematical and evidence verification',
            status: 'COMPLETED',
            startedAt: new Date(Date.now() - 6 * 3600000 + 3560).toISOString(),
            completedAt: new Date(Date.now() - 6 * 3600000 + 4010).toISOString(),
            durationMs: 450,
            inputSummary: 'Prior agent output assertions & evidence sets',
            outputSummary: 'Mathematical checks failed on SNOW-2026-1004. Fraud alerts verified with 95% evidence confidence.',
          },
          {
            id: 'step_6',
            agentName: 'Human Approval Agent',
            agentId: 'agent_approval',
            stage: 'WAITING_FOR_APPROVAL',
            title: 'Enforce human-in-the-loop checkpoint',
            status: 'RUNNING',
            startedAt: new Date(Date.now() - 6 * 3600000 + 4020).toISOString(),
            inputSummary: '3 approval requests generated for executive human review',
            outputSummary: 'Workflow halted. Autonomous payment disabled until explicit human sign-off.',
          },
        ],
      },
    ];
  }

  private generateInitialAuditEvents() {
    this.auditEvents = [
      {
        id: 'audit_001',
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        actor: { id: 'agent_planner', name: 'Planner Agent', role: 'ORCHESTRATOR', type: 'AI_AGENT' },
        action: 'WORKFLOW_DISPATCH',
        entityType: 'WORKFLOW',
        entityId: 'wf_batch_101',
        details: 'Dispatched automated multi-agent batch #101 containing 5 invoices totaling $108,882.00.',
      },
      {
        id: 'audit_002',
        timestamp: new Date(Date.now() - 6 * 3600000 + 3550).toISOString(),
        actor: { id: 'agent_fraud', name: 'Fraud Detection Agent', role: 'SECURITY', type: 'AI_AGENT' },
        action: 'FRAUD_ALERT_GENERATED',
        entityType: 'INVOICE',
        entityId: 'inv_003',
        details: 'Generated CRITICAL fraud alert for unverified offshore bank routing on vendor Apex Global Logistics.',
        evidenceSnapshot: {
          vendor: 'Apex Global Logistics Holdings',
          declaredAccount: 'FOTBKYG1',
          riskScore: 89,
        },
      },
      {
        id: 'audit_003',
        timestamp: new Date(Date.now() - 6 * 3600000 + 4020).toISOString(),
        actor: { id: 'agent_approval', name: 'Human Approval Agent', role: 'GOVERNANCE', type: 'AI_AGENT' },
        action: 'APPROVAL_CHECKPOINT_ENGAGED',
        entityType: 'APPROVAL',
        entityId: 'appr_001',
        details: 'Halted autonomous execution. Escalated APEX-2026-1003 to Administrator queue for mandatory human sign-off.',
      },
      {
        id: 'audit_004',
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
        actor: { id: 'usr_admin_1', name: 'Alexandria Chen', role: 'ADMIN', type: 'HUMAN' },
        action: 'ROLE_SWITCH',
        entityType: 'SYSTEM',
        entityId: 'session_usr_admin_1',
        details: 'Admin logged into FinPilot AI command interface from Vultr Cloud Compute secure IP.',
      },
    ];
  }

  // Audit event logger
  public logAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const newEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.auditEvents.unshift(newEvent);
    // Keep max 500 audit events
    if (this.auditEvents.length > 500) {
      this.auditEvents.pop();
    }
    return newEvent;
  }
}

export const db = new FinPilotDatabase();
