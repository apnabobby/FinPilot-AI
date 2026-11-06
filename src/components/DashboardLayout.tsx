import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  GitMerge,
  UserCheck,
  Bot,
  FileCheck2,
  Settings,
  ShieldCheck,
  Server,
  Play,
  RotateCcw,
  LogOut,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { User, UserRole } from '../types.js';

interface DashboardLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onBackToLanding: () => void;
  currentUser: User;
  availableRoles: User[];
  onSwitchRole: (role: UserRole) => void;
  pendingApprovalsCount: number;
  onTriggerDemo: () => void;
  onResetDemo: () => void;
  isDemoRunning: boolean;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onSelectTab,
  onBackToLanding,
  currentUser,
  availableRoles,
  onSwitchRole,
  pendingApprovalsCount,
  onTriggerDemo,
  onResetDemo,
  isDemoRunning,
  children,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoice Intelligence', icon: FileText },
    { id: 'reconciliation', label: 'Reconciliation Center', icon: GitMerge },
    {
      id: 'approvals',
      label: 'Approval Center',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'agents', label: 'Agent Command Center', icon: Bot },
    { id: 'audit', label: 'Audit Trail & Reports', icon: FileCheck2 },
    { id: 'settings', label: 'Vultr Specs & Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* SIDEBAR NAVIGATION (260px) */}
      <aside className="w-full md:w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col shrink-0 z-30">
        
        {/* Brand Lockup */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                FinPilot <span className="text-cyan-400">AI</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">Autonomous Operations</div>
            </div>
          </div>
        </div>

        {/* Vultr Host Badge */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vultr Ubuntu VM</span>
          </div>
          <span className="text-emerald-400">ONLINE</span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Role & Profile Switcher */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 relative">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            Simulated Auth Role
          </div>

          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] font-mono text-cyan-400">{currentUser.role}</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Role Dropdown */}
            {roleDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase">
                  Select User Role
                </div>
                {availableRoles.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchRole(u.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between cursor-pointer ${
                      u.role === currentUser.role
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onBackToLanding}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Landing Page</span>
          </button>
        </div>

      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP BAR / BREADCRUMB HEADER */}
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 px-6 lg:px-8 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
          
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">FinPilot AI</span>
            <span>/</span>
            <span className="capitalize text-slate-200 font-medium">
              {navItems.find((n) => n.id === currentTab)?.label || 'Console'}
            </span>
            <span>/</span>
            <span className="font-mono text-cyan-400 text-[11px]">Production Vultr Cluster</span>
          </div>

          {/* Quick Actions (Demo Trigger & Seed Reset) */}
          <div className="flex items-center gap-3">
            <button
              onClick={onResetDemo}
              title="Reset sample invoices, transactions and alerts to initial demo state"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Seed Data</span>
            </button>

            <button
              onClick={onTriggerDemo}
              disabled={isDemoRunning}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-950 shadow-sm transition-all cursor-pointer ${
                isDemoRunning
                  ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-cyan-500/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isDemoRunning ? 'animate-spin' : ''}`} />
              <span>{isDemoRunning ? 'Agents Running...' : 'Run Autonomous Batch'}</span>
            </button>
          </div>

        </header>

        {/* CONTENT CANVAS */}
        <main className="p-6 lg:p-8 flex-1">
          {children}
        </main>

      </div>

    </div>
  );
};
