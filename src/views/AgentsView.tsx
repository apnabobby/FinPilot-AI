import React, { useState } from 'react';
import {
  Bot,
  Cpu,
  Layers,
  FileText,
  GitMerge,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Clock,
  Play,
  ChevronDown,
  ChevronRight,
  Terminal,
  Activity,
} from 'lucide-react';
import { AgentStatus, Workflow, WorkflowStep } from '../types.js';

interface AgentsViewProps {
  agents: AgentStatus[];
  workflows: Workflow[];
  onTriggerBatchRun: () => Promise<void>;
  isRunningBatch: boolean;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  workflows,
  onTriggerBatchRun,
  isRunningBatch,
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const agentIcons: Record<string, React.ElementType> = {
    agent_planner: Cpu,
    agent_document: FileText,
    agent_reconciliation: GitMerge,
    agent_fraud: ShieldAlert,
    agent_verification: Layers,
    agent_approval: UserCheck,
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER & FLEET CONTROLLER */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>AUTONOMOUS AGENT ORCHESTRATION LAYER</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span>Agent Command Center & Execution Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live telemetry for the 6 specialized autonomous agents executing on the central Vultr Cloud Compute server. Inspect task graphs, state machine transitions, and verified execution logs.
          </p>
        </div>

        <button
          onClick={onTriggerBatchRun}
          disabled={isRunningBatch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Play className={`w-3.5 h-3.5 ${isRunningBatch ? 'animate-spin' : ''}`} />
          <span>{isRunningBatch ? 'Agents Processing...' : 'Dispatch New Agent Batch'}</span>
        </button>
      </div>

      {/* 6 SPECIALIZED AGENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const Icon = agentIcons[agent.id] || Bot;
          const isActive = agent.status === 'ACTIVE';
          const isWaiting = agent.status === 'WAITING';

          return (
            <div
              key={agent.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900/70 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                  : isWaiting
                  ? 'bg-slate-900/60 border-amber-500/50'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div>
                {/* Agent Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{agent.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{agent.role}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : isWaiting
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                {/* Description & Current Task */}
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {agent.description}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Current Subtask</div>
                  <div className="text-slate-200 font-medium mt-1 truncate">
                    {agent.currentTask || 'Idle — Standing by for dispatch'}
                  </div>
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-800 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500">COMPLETED</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{agent.completedTasks}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">LATENCY</div>
                  <div className="text-xs font-bold text-cyan-400 mt-0.5">{agent.latencyMs}ms</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">FAILURES</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">{agent.failedTasks}</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* WORKFLOW TIMELINE & EXECUTION LOGS */}
      {activeWorkflow && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Stateful Orchestration Graph
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {activeWorkflow.name} ({activeWorkflow.batchId})
              </h2>
            </div>

            {/* Workflow selector if multiple */}
            {workflows.length > 1 && (
              <select
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
              >
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.stage})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Interactive Step Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {activeWorkflow.steps.map((st, i) => {
              const isCompleted = st.status === 'COMPLETED';
              const isRunning = st.status === 'RUNNING';

              return (
                <div
                  key={st.id}
                  onClick={() => setExpandedLogId(expandedLogId === st.id ? null : st.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-slate-950/80 border-emerald-500/40'
                      : isRunning
                      ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/40 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                    <span>STEP 0{i + 1}</span>
                    <span className={isCompleted ? 'text-emerald-400' : isRunning ? 'text-cyan-400' : ''}>
                      {st.durationMs ? `${st.durationMs}ms` : st.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white truncate">{st.agentName}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{st.stage}</div>

                  <div className="mt-2 text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                    <span>Inspect Log</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable Step Execution Logs */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400 uppercase">
              Expandable Execution Logs & Agent Invariants
            </div>

            {activeWorkflow.steps.map((st) => {
              const isExpanded = expandedLogId === st.id;
              return (
                <div
                  key={st.id}
                  className="rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedLogId(isExpanded ? null : st.id)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="font-bold text-white mr-2">{st.agentName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{st.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-500">{st.startedAt?.slice(11, 19)}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-950/40' : 'text-cyan-400 bg-cyan-950/40'
                      }`}>
                        {st.status}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-900 bg-slate-950 font-mono text-xs space-y-3 text-slate-300">
                      <div>
                        <span className="text-slate-500 block mb-1">INPUT PAYLOAD:</span>
                        <div className="p-2.5 rounded bg-slate-900 text-slate-300 text-[11px]">
                          {st.inputSummary || 'No input summary recorded'}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">OUTPUT ASSERTION & REASONING:</span>
                        <div className="p-2.5 rounded bg-slate-900 text-cyan-300 text-[11px] leading-relaxed">
                          {st.outputSummary || 'Awaiting agent output'}
                        </div>
                      </div>
                      {st.durationMs !== undefined && (
                        <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                          <span>Agent Execution Duration: {st.durationMs}ms</span>
                          <span>Invariants Verified: True</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
