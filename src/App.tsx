import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, CheckCircle2, Info, Activity, Lock, Globe, Database, Terminal, Zap, Search, Filter, Plus, ChevronRight, FileText, BarChart3, Users, Settings, LogOut, Menu, X, ArrowUpRight, TrendingUp } from 'lucide-react';
import { cn } from './lib/utils';
import { useSimulation, LogEntry, ThreatIntel, Notification } from './hooks/useSimulation';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- UI Components ---

const NotificationToast = ({ notification, onDismiss, onAction }: { notification: Notification, onDismiss: (id: string) => void, onAction: (tab: number) => void }) => (
  <motion.div
    initial={{ opacity: 0, x: 50, y: -20 }}
    animate={{ opacity: 1, x: 0, y: 0 }}
    exit={{ opacity: 0, x: 50 }}
    role="alert"
    aria-live="assertive"
    className={cn(
      "bg-card border-l-4 p-4 rounded-lg shadow-2xl flex items-start gap-3 w-80 mb-3",
      notification.severity === 'CRITICAL' ? "border-red-accent" : "border-amber-accent"
    )}
  >
    <div className={cn(
      "mt-1 p-1 rounded-full",
      notification.severity === 'CRITICAL' ? "bg-red-accent/20 text-red-accent" : "bg-amber-accent/20 text-amber-accent"
    )}>
      <AlertCircle className="w-4 h-4" aria-hidden="true" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{notification.type} ALERT</p>
        <button 
          onClick={() => onDismiss(notification.id)} 
          className="text-text-muted hover:text-text-primary focus-visible:ring-2 focus-visible:ring-teal-accent rounded"
          aria-label="Dismiss notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs font-semibold text-text-primary mt-1">{notification.message}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] font-mono text-text-muted">{notification.timestamp}</span>
        <button 
          onClick={() => { onAction(notification.linkTab); onDismiss(notification.id); }}
          className="text-[10px] font-bold text-teal-accent hover:underline uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-teal-accent rounded"
          aria-label={`Investigate ${notification.type} alert`}
        >
          Investigate →
        </button>
      </div>
    </div>
  </motion.div>
);

const Badge = ({ children, variant = 'teal', pulse = false, className }: { children: React.ReactNode, variant?: 'teal' | 'amber' | 'red' | 'blue' | 'slate', pulse?: boolean, className?: string }) => {
  const variants = {
    teal: 'bg-teal-accent/10 text-teal-accent border-teal-accent/20',
    amber: 'bg-amber-accent/10 text-amber-accent border-amber-accent/20',
    red: 'bg-red-accent/10 text-red-accent border-red-accent/20',
    blue: 'bg-blue-accent/10 text-blue-accent border-blue-accent/20',
    slate: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border',
      variants[variant],
      className
    )}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse-teal" />}
      {children}
    </span>
  );
};

const Card = ({ children, className, title, subtitle, icon: Icon, badge }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, icon?: any, badge?: React.ReactNode, key?: any }) => (
  <div className={cn('bg-card border border-card-border rounded-xl overflow-hidden', className)}>
    {(title || Icon) && (
      <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-teal-accent" />}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-tight">{title}</h3>
            {subtitle && <p className="text-[10px] text-text-muted uppercase tracking-wider">{subtitle}</p>}
          </div>
        </div>
        {badge}
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const Button = ({ children, variant = 'primary', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'outline' }) => {
  const variants = {
    primary: 'bg-teal-accent text-white hover:bg-teal-accent/90',
    ghost: 'text-text-muted hover:text-text-primary hover:bg-card-border',
    danger: 'bg-red-accent text-white hover:bg-red-accent/90',
    outline: 'border border-card-border text-text-primary hover:bg-card-border',
  };

  return (
    <button className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-accent outline-none', variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

// --- Tabs ---

const LiveThreatFeed = ({ simulation }: { simulation: any }) => {
  const { logs, threats, stats } = simulation;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Security Events Intercepted', value: stats.events.toLocaleString(), change: '+12% this month', color: 'teal' },
          { label: 'AI Agents Monitored', value: '14', change: 'Across fraud, AML, credit', color: 'blue' },
          { label: 'Financial Risk Avoided', value: `$${stats.riskAvoided}M CAD`, change: 'Est. PIPEDA breach cost avoided', color: 'teal' },
          { label: 'Explainability (XAI) Index', value: '88.4%', change: 'OSFI E-21 transparency metric', color: 'teal' },
        ].map((kpi, i) => (
          <Card key={i} className="relative overflow-hidden group">
            <div className={cn("absolute top-0 left-0 w-1 h-full", kpi.color === 'teal' ? 'bg-teal-accent' : 'bg-blue-accent')} />
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">{kpi.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">{kpi.value}</span>
            </div>
            <p className="text-[10px] text-text-muted mt-1">{kpi.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="Real-time Interception Gateway" 
            icon={Shield}
            badge={<Badge pulse>Active Monitoring</Badge>}
          >
            <div className="space-y-4">
              <div className="bg-background/50 border border-card-border rounded-lg p-4">
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-mono placeholder:text-text-muted/50 resize-none"
                  placeholder="Enter prompt to simulate banking agent interaction..."
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="bg-background px-3 py-1 rounded-full text-[10px] font-mono text-text-muted border border-card-border">
                    BASTION SECURITY LAYER v2.0
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-[10px] py-1 h-auto" aria-label="Simulate PII Leak">PII Leak</Button>
                    <Button variant="ghost" className="text-[10px] py-1 h-auto" aria-label="Simulate AML Bypass">AML Bypass</Button>
                    <Button variant="primary" className="text-[10px] py-1 h-auto" aria-label="Run Security Simulation">Run Simulation</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Live Guardrail Execution</h4>
                {[
                  { name: 'Lakera Guard', time: '12ms', status: 'PASSED' },
                  { name: 'PII/SIN Detection', time: '45ms', status: 'PASSED' },
                  { name: 'OSFI E-21 Compliance', time: '28ms', status: 'PASSED' },
                  { name: 'FINTRAC AML Check', time: '34ms', status: 'PASSED' },
                  { name: 'Credit Decision Bias', time: '52ms', status: 'PASSED' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-card-border last:border-0">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{row.name}</span>
                      <span className="text-[8px] text-text-muted uppercase tracking-tighter">Human-in-the-loop verified</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-text-muted">{row.time}</span>
                      <Badge variant="teal">{row.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Agent Behavior Stream" icon={Terminal} className="p-0">
            <div 
              className="bg-black/40 p-4 font-mono text-xs h-[300px] overflow-y-auto space-y-1"
              aria-live="polite"
              aria-label="Real-time agent behavior log stream"
            >
              {logs.map((log: LogEntry) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-text-muted">[{log.timestamp}]</span>
                  <span className="text-blue-accent">[{log.agent}]</span>
                  <span className={cn(
                    log.status === 'PASSED' ? 'text-teal-accent' : 'text-amber-accent'
                  )}>{log.status}</span>
                  <span className="text-text-primary">{log.details}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card title="Why This Matters" icon={Info}>
            <div className="space-y-3 text-xs text-text-muted leading-relaxed">
              <p>OSFI E-21 requires robust risk management for models used in material decisions.</p>
              <p>PIPEDA breach costs in Canada average $7M per incident. Bastion Audit mitigates this risk.</p>
              <p>FINTRAC liability can reach millions for non-compliant AML monitoring.</p>
            </div>
          </Card>

          <Card title="Global Threat Intel" icon={Globe}>
            <div className="space-y-4">
              {threats.map((threat: ThreatIntel) => (
                <div key={threat.id} className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 w-2 h-2 rounded-full shrink-0",
                    threat.severity === 'CRITICAL' ? 'bg-red-accent' : 'bg-amber-accent'
                  )} />
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{threat.title}</p>
                    <p className="text-[10px] text-text-muted">{threat.time} • {threat.severity}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Compliance Trend" icon={TrendingUp}>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { v: 91 }, { v: 92 }, { v: 91.5 }, { v: 93 }, { v: 94.2 }
                ]}>
                  <Area type="monotone" dataKey="v" stroke="#0f9e75" fill="#0f9e75" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const RedTeamSandbox = ({ simulation }: { simulation: any }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            className="w-full bg-card border border-card-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-teal-accent outline-none"
            placeholder="Search adversarial patterns..."
          />
        </div>
        <Badge variant="amber" pulse>Sandbox Active</Badge>
      </div>
      <LiveThreatFeed simulation={simulation} />
    </div>
  );
};

const ModelInventory = () => {
  const rows = [
    { name: 'Fraud Detection Agent v3.2.1', dept: 'Fraud & Disputes', provider: 'Google Vertex AI', region: 'Canada Central', date: '2026-03-14', risk: 'LOW RISK', tier: 'Tier 1', status: 'Active' },
    { name: 'AML Transaction Screener v2.4.0', dept: 'Financial Crime', provider: 'Azure OpenAI', region: 'Canada Central', date: '2026-03-10', risk: 'MEDIUM RISK', tier: 'Tier 2', status: 'Active' },
    { name: 'Mortgage Credit Adjudication v4.1.2', dept: 'Personal Banking', provider: 'Internal (On-Premise)', region: 'N/A', date: '2026-02-18', risk: 'HIGH RISK', tier: 'Tier 3', status: 'Review Required' },
    { name: 'Customer Service LLM v2.0.5', dept: 'Retail Banking', provider: 'Anthropic (AWS Canada)', region: 'Canada Central', date: '2026-03-16', risk: 'LOW RISK', tier: 'Tier 1', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Enterprise Model Inventory</h2>
          <p className="text-sm text-text-muted">OSFI E-21 compliant registry of all AI models used in material decisions.</p>
        </div>
        <Button><Plus className="w-4 h-4" /> Register Agent</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-card-border text-[10px] text-text-muted uppercase tracking-widest">
              <th className="py-4 px-4 font-bold">Agent</th>
              <th className="py-4 px-4 font-bold">Department</th>
              <th className="py-4 px-4 font-bold">Provider / Region</th>
              <th className="py-4 px-4 font-bold">Last Audit</th>
              <th className="py-4 px-4 font-bold">Risk Tier</th>
              <th className="py-4 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-card-border hover:bg-card-border/30 transition-colors">
                <td className="py-4 px-4 font-semibold">{row.name}</td>
                <td className="py-4 px-4 text-text-muted">{row.dept}</td>
                <td className="py-4 px-4 text-text-muted">{row.provider} ({row.region})</td>
                <td className="py-4 px-4 font-mono text-xs">{row.date}</td>
                <td className="py-4 px-4">
                  <Badge variant={row.risk.includes('LOW') ? 'teal' : row.risk.includes('MEDIUM') ? 'amber' : 'red'}>
                    {row.risk}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <span className={cn(
                    "text-xs font-medium",
                    row.status === 'Active' ? 'text-teal-accent' : 'text-amber-accent'
                  )}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Model Risk Assessment" icon={BarChart3}>
          <div className="space-y-4">
            {[
              { label: 'OSFI E-21 Compliance', val: 94 },
              { label: 'Three-Lines-of-Defence', val: 88 },
              { label: 'Model Validation Rate', val: 91 },
              { label: 'Explainability Score', val: 86 },
            ].map((bar, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>{bar.label}</span>
                  <span>{bar.val}%</span>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-teal-accent" style={{ width: `${bar.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Inventory Statistics" icon={Database}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Models', val: '14' },
              { label: 'Tier 3 High Risk', val: '1' },
              { label: 'Pending Validation', val: '2' },
              { label: 'FINTRAC Registered', val: '3' },
              { label: 'OSFI Compliant', val: '11' },
            ].map((stat, i) => (
              <div key={i} className="p-3 bg-background/50 rounded-lg border border-card-border">
                <p className="text-[10px] text-text-muted uppercase font-bold mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-text-primary">{stat.val}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const VulnerabilityAudit = () => (
  <div className="space-y-6">
    <div className="bg-teal-accent/10 border border-teal-accent/20 rounded-xl p-8 flex flex-col items-center text-center space-y-4">
      <Shield className="w-12 h-12 text-teal-accent" />
      <h2 className="text-2xl font-bold uppercase tracking-tight">SHIELD PROTOCOL ACTIVE</h2>
      <p className="text-text-muted max-w-2xl">30-Day AI Vulnerability Audit: Comprehensive scan of Lakera Guard, Behavioural Anomaly Engine, and OSFI E-21 Gap Analysis.</p>
      <div className="flex items-center gap-4 text-xs font-mono text-teal-accent">
        <span>AI AGENT</span>
        <ChevronRight className="w-4 h-4" />
        <span>BASTION</span>
        <ChevronRight className="w-4 h-4" />
        <span>SIEM + OSFI REPORTING</span>
      </div>
      <Button variant="primary" className="mt-4">Generate Full Audit Report</Button>
    </div>
  </div>
);

const BehavioralDrift = () => {
  const data = [
    { name: 'Day 1', baseline: 10, live: 12 },
    { name: 'Day 5', baseline: 10, live: 11 },
    { name: 'Day 10', baseline: 10, live: 15 },
    { name: 'Day 15', baseline: 10, live: 25 }, // Anomaly
    { name: 'Day 20', baseline: 10, live: 13 },
    { name: 'Day 25', baseline: 10, live: 11 },
    { name: 'Day 30', baseline: 10, live: 12 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <select className="bg-card border border-card-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-accent">
          <option>Mortgage Credit Adjudication — HIGH RISK</option>
          <option>Fraud Detection Agent v3.2.1</option>
        </select>
      </div>

      <Card title="30-Day Drift Analysis" icon={Activity}>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="baseline" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              <Area type="monotone" dataKey="live" stroke="#0f9e75" fill="#0f9e75" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Anomalies This Month', val: '3' },
          { label: 'Avg Deviation', val: '4.2%' },
          { label: 'Sessions Terminated', val: '12' },
          { label: 'OSFI Alerts', val: '1' },
        ].map((stat, i) => (
          <Card key={i}>
            <p className="text-[10px] text-text-muted uppercase font-bold mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-text-primary">{stat.val}</p>
          </Card>
        ))}
      </div>

      <Card title="Anomaly Event Log" icon={AlertCircle}>
        <div className="space-y-4">
          {[
            { date: '2026-03-24', agent: 'Mortgage Adjudicator', desc: 'Sudden shift in credit weighting for postal code M5V', severity: 'HIGH', ref: 'OSFI E-21 / PIPEDA' },
            { date: '2026-03-20', agent: 'Fraud Detection', desc: 'Unusual spike in false positives for e-transfer validation', severity: 'MEDIUM', ref: 'FINTRAC' },
          ].map((event, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-card-border last:border-0">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-text-muted">{event.date}</span>
                <div>
                  <p className="text-sm font-semibold">{event.agent}</p>
                  <p className="text-xs text-text-muted">{event.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={event.severity === 'HIGH' ? 'red' : 'amber'}>{event.severity}</Badge>
                <span className="text-[10px] font-mono text-text-muted">{event.ref}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const BoardReport = () => {
  const data = [
    { month: 'Oct', injection: 400, pii: 240, bias: 100 },
    { month: 'Nov', injection: 300, pii: 139, bias: 200 },
    { month: 'Dec', injection: 200, pii: 980, bias: 300 },
    { month: 'Jan', injection: 278, pii: 390, bias: 400 },
    { month: 'Feb', injection: 189, pii: 480, bias: 500 },
    { month: 'Mar', injection: 239, pii: 380, bias: 600 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Executive Security Report — March 2026</h2>
          <p className="text-sm text-text-muted">Global Enterprise • Canadian Banking</p>
        </div>
        <Button variant="outline"><FileText className="w-4 h-4" /> Export PDF</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'OSFI E-21', val: '94%' },
          { label: 'PIPEDA', val: '98%' },
          { label: 'AIDA', val: '86%' },
          { label: 'FINTRAC AML', val: '92%' },
          { label: 'SOC 2', val: '100%' },
        ].map((comp, i) => (
          <Card key={i} className="text-center">
            <p className="text-[10px] text-text-muted uppercase font-bold mb-1">{comp.label}</p>
            <p className="text-xl font-bold text-teal-accent">{comp.val}</p>
          </Card>
        ))}
      </div>

      <Card title="AI Narrative Summary" icon={FileText}>
        <p className="text-sm text-text-muted leading-relaxed italic">
          "Bastion Audit has successfully neutralized 1,847 security events this month, preventing an estimated $2.3M CAD in potential PIPEDA breach liabilities. Our OSFI E-21 compliance posture remains strong at 94.2%, with ongoing monitoring of 14 active AI agents. Behavioral drift in the Mortgage Adjudication model was detected and mitigated within 4 hours, ensuring continued fairness and regulatory alignment."
        </p>
      </Card>

      <Card title="Monthly Threat Breakdown" icon={BarChart3}>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="injection" name="Prompt Injection" stackId="a" fill="#0f9e75" />
              <Bar dataKey="pii" name="PII Exfiltration" stackId="a" fill="#3b82f6" />
              <Bar dataKey="bias" name="Bias Detection" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

// --- Chat Widget ---

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hello. I am the Bastion Security Sentinel. How can I assist with your AI security posture today?' }
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('Gemini 3 Flash');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "You are the Bastion Security Sentinel, an AI security advisor for Canadian financial institutions. You have deep knowledge of OSFI E-21, PIPEDA, AIDA, and FINTRAC. Always provide professional, regulatory-aligned advice. Mention CAD for financial risks. Greet as Sentinel."
        }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to security layer. Please check your API configuration." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card border border-card-border rounded-2xl w-[380px] h-[500px] shadow-2xl flex flex-col mb-4 overflow-hidden"
          >
            <div className="p-4 border-b border-card-border bg-orange-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Security Sentinel</h3>
                  <p className="text-[10px] text-orange-500 uppercase font-bold tracking-widest">Active Guardrail</p>
                </div>
              </div>
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-background border border-card-border rounded px-2 py-1 text-[10px] outline-none"
              >
                <option>Gemini 3 Flash</option>
                <option>Claude 3.5 Haiku</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-xl text-xs",
                    msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-card-border text-text-primary'
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-card-border space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {['OSFI E-21 Help', 'PIPEDA Risk', 'Drift Alert'].map(pill => (
                  <button key={pill} onClick={() => setInput(pill)} className="shrink-0 px-2 py-1 bg-background border border-card-border rounded-full text-[10px] text-text-muted hover:text-text-primary transition-colors">
                    {pill}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-background border border-card-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Ask Sentinel..."
                />
                <Button onClick={handleSend} className="p-2 h-auto bg-orange-500 hover:bg-orange-600"><Zap className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-orange-500 shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
      </button>
    </div>
  );
};

// --- Modal Content System ---

const ContentModal = ({ title, content, onClose }: { title: string, content: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-card-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
    >
      <div className="p-6 border-b border-card-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-card-border rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-8 overflow-y-auto text-sm text-text-primary leading-relaxed space-y-6">
        {content}
      </div>
    </motion.div>
  </div>
);

const LEGAL_CONTENT = {
  'OSFI Guideline E-21': (
    <>
      <p className="font-bold text-teal-accent">Operational Risk Management for AI Models</p>
      <p>OSFI Guideline E-21 sets the standard for Model Risk Management (MRM) within Canadian Federally Regulated Financial Institutions (FRFIs). Bastion Audit aligns with these requirements by providing:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Three Lines of Defence:</strong> Clear separation between model developers, independent validation teams, and internal audit.</li>
        <li><strong>Model Inventory:</strong> A comprehensive, centralized registry of all models used in material decision-making.</li>
        <li><strong>Ongoing Monitoring:</strong> Real-time tracking of model performance, behavioral drift, and data integrity.</li>
        <li><strong>Board Oversight:</strong> Automated reporting designed to provide the Board of Directors with clear insights into AI-related operational risks.</li>
      </ul>
    </>
  ),
  'PIPEDA Compliance': (
    <>
      <p className="font-bold text-teal-accent">Personal Information Protection and Electronic Documents Act</p>
      <p>Bastion Audit ensures that AI deployments remain compliant with PIPEDA's 10 Fair Information Principles:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Accountability:</strong> Cryptographically secured audit trails for all data processing activities.</li>
        <li><strong>Identifying Purposes:</strong> Clear documentation of why PII is being processed by AI agents.</li>
        <li><strong>Limiting Collection:</strong> Real-time guardrails to prevent AI agents from collecting or exfiltrating unnecessary PII/SIN data.</li>
        <li><strong>Safeguards:</strong> Strict data residency in Canada Central/East regions, ensuring sovereign data protection.</li>
      </ul>
    </>
  ),
  'FINTRAC AML/ATF': (
    <>
      <p className="font-bold text-teal-accent">Anti-Money Laundering and Anti-Terrorist Financing</p>
      <p>For Schedule I and II banks, compliance with FINTRAC is non-negotiable. Bastion Audit provides:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Suspicious Transaction Detection:</strong> AI-driven monitoring for complex AML bypass attempts.</li>
        <li><strong>KYC Integrity:</strong> Ensuring AI agents do not bypass Know Your Customer protocols during automated onboarding.</li>
        <li><strong>Record Keeping:</strong> Immutable logs of all compliance-related AI decisions for regulatory examination.</li>
        <li><strong>Risk Assessment:</strong> Real-time tiering of transactions based on FINTRAC-aligned risk parameters.</li>
      </ul>
    </>
  ),
  'AIDA / Bill C-27': (
    <>
      <p className="font-bold text-teal-accent">Artificial Intelligence and Data Act</p>
      <p>As Canada moves toward formal AI regulation, Bastion Audit prepares FRFIs for AIDA requirements:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>High-Impact System Management:</strong> Identification and rigorous monitoring of AI systems that could cause material harm.</li>
        <li><strong>Bias Mitigation:</strong> Proactive detection of discriminatory patterns in credit adjudication and mortgage models.</li>
        <li><strong>Transparency:</strong> Explainability scores and narrative summaries for AI-driven decisions.</li>
        <li><strong>Enforcement Readiness:</strong> Tools to demonstrate due diligence and prevent significant administrative monetary penalties.</li>
      </ul>
    </>
  ),
  'Threat Intelligence Feed': (
    <>
      <p className="font-bold text-teal-accent">Canadian Banking-Specific Threat Monitoring</p>
      <p>Our feed provides real-time updates on threats targeting the Canadian financial sector:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Interac e-Transfer Fraud:</strong> Monitoring for new social engineering patterns targeting P2P payments.</li>
        <li><strong>SIN Exfiltration:</strong> Specific guardrails for Social Insurance Number patterns in customer service chats.</li>
        <li><strong>Bypass Techniques:</strong> Alerts on new prompt injection methods designed to circumvent banking security layers.</li>
        <li><strong>Regional Trends:</strong> Data on threat actors specifically targeting Toronto and Montreal financial hubs.</li>
      </ul>
    </>
  ),
  'Red Team Methodology': (
    <>
      <p className="font-bold text-teal-accent">Adversarial Testing for Financial Resilience</p>
      <p>Our red-teaming approach is calibrated to the unique risk profile of FRFIs:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Contextual Scenarios:</strong> Simulations based on real-world Canadian banking use cases (e.g., mortgage fraud).</li>
        <li><strong>OSFI E-21 Alignment:</strong> Testing designed to validate the "Second Line of Defence" effectiveness.</li>
        <li><strong>Safe Sandbox:</strong> Isolated environment to test adversarial prompts without impacting production systems.</li>
        <li><strong>Remediation Tracking:</strong> Automated mapping of vulnerabilities to specific regulatory controls.</li>
      </ul>
    </>
  ),
  'Vulnerability Disclosure': (
    <>
      <p className="font-bold text-teal-accent">Responsible Reporting for Financial Infrastructure</p>
      <p>Bastion Audit facilitates a secure channel for vulnerability reporting:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Safe Harbor:</strong> Legal protection for researchers operating within our disclosure guidelines.</li>
        <li><strong>Triage Process:</strong> Rapid assessment of reported flaws by our Canadian-based security operations center.</li>
        <li><strong>Coordinated Response:</strong> Alignment with CCIRC and other Canadian national security bodies.</li>
        <li><strong>Integrity Checks:</strong> Ensuring that reported vulnerabilities are addressed without introducing secondary risks.</li>
      </ul>
    </>
  ),
  'Audit Log Verification': (
    <>
      <p className="font-bold text-teal-accent">Cryptographic Proof of Regulatory Compliance</p>
      <p>Ensuring that audit trails are tamper-proof and ready for examination:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Hashing & Chaining:</strong> Using cryptographic hashes to link log entries, preventing retroactive modification.</li>
        <li><strong>Timestamping:</strong> Trusted time-stamping from Canadian sovereign time sources.</li>
        <li><strong>Access Control:</strong> Strict logging of who accessed or exported audit data.</li>
        <li><strong>Export Readiness:</strong> One-click generation of cryptographically signed reports for OSFI and FINTRAC auditors.</li>
      </ul>
    </>
  ),
  'Privacy Policy': (
    <>
      <p className="font-bold text-teal-accent">Data Privacy at NorthGuard Security</p>
      <p>Our privacy policy is built on the foundation of Canadian data sovereignty:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Zero Data Export:</strong> No customer data or AI metadata ever leaves the Canada Central or Canada East regions.</li>
        <li><strong>Purpose Limitation:</strong> Data is processed solely for the purpose of security monitoring and compliance auditing.</li>
        <li><strong>Retention:</strong> Strict data retention schedules aligned with FINTRAC and OSFI record-keeping requirements.</li>
        <li><strong>Encryption:</strong> All data is encrypted at rest and in transit using FIPS 140-2 validated modules.</li>
      </ul>
    </>
  ),
  'Terms of Service': (
    <>
      <p className="font-bold text-teal-accent">Enterprise Service Agreement</p>
      <p>Governing the use of Bastion Audit within FRFI environments:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Service Level Agreements:</strong> 99.99% availability for critical threat interception layers.</li>
        <li><strong>Liability:</strong> Clear definition of responsibilities in the shared security model for AI.</li>
        <li><strong>Compliance Warranty:</strong> Guarantee that the platform remains updated with the latest OSFI and FINTRAC requirements.</li>
        <li><strong>Termination:</strong> Secure data handover and destruction protocols upon contract conclusion.</li>
      </ul>
    </>
  ),
  'Cookie Settings': (
    <>
      <p className="font-bold text-teal-accent">Transparency in Web Tracking</p>
      <p>We use minimal, essential cookies to maintain security and session integrity:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Essential Cookies:</strong> Required for authentication and CSRF protection.</li>
        <li><strong>Security Cookies:</strong> Used to detect and prevent malicious login attempts.</li>
        <li><strong>Preference Cookies:</strong> Storing your dashboard layout and theme selections.</li>
        <li><strong>No Third-Party Tracking:</strong> We do not use advertising or third-party analytics cookies.</li>
      </ul>
    </>
  ),
};

// --- Cookie Banner ---

const CookieBanner = ({ onAccept, onOpenLegal }: { onAccept: () => void, onOpenLegal: (page: string) => void }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 100, opacity: 0 }}
    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-24 md:w-[450px] z-[60] bg-card border border-card-border shadow-2xl rounded-2xl p-6 flex flex-col gap-4"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-start gap-4">
      <div className="p-2 bg-teal-accent/10 rounded-full">
        <Lock className="w-5 h-5 text-teal-accent" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-text-primary">Privacy & Transparency Notice</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          Bastion Audit uses essential security cookies to maintain session integrity and ensure OSFI E-21 audit trails. No third-party tracking or advertising cookies are used.
        </p>
      </div>
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-3">
        <button 
          onClick={() => onOpenLegal('Privacy Policy')}
          className="text-[10px] font-bold uppercase tracking-widest text-teal-accent hover:underline focus-visible:ring-2 focus-visible:ring-teal-accent rounded outline-none"
        >
          Privacy Policy
        </button>
        <button 
          onClick={() => onOpenLegal('Cookie Settings')}
          className="text-[10px] font-bold uppercase tracking-widest text-teal-accent hover:underline focus-visible:ring-2 focus-visible:ring-teal-accent rounded outline-none"
        >
          Cookie Settings
        </button>
      </div>
      <Button 
        onClick={onAccept} 
        className="text-[10px] font-bold px-4 py-1.5 h-auto uppercase tracking-widest"
        aria-label="Acknowledge privacy notice"
      >
        Acknowledge
      </Button>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [activeModalPage, setActiveModalPage] = useState<string | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const simulation = useSimulation();

  useEffect(() => {
    const acknowledged = localStorage.getItem('bastion_privacy_acknowledged');
    if (!acknowledged) {
      const timer = setTimeout(() => setShowCookieBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('bastion_privacy_acknowledged', 'true');
    setShowCookieBanner(false);
  };

  const tabs = [
    { id: 0, label: 'Live Threat Feed', icon: Activity },
    { id: 1, label: 'Red Team Sandbox', icon: Zap, badge: 'NEW' },
    { id: 2, label: 'Model Inventory', icon: Database, subtitle: 'OSFI E-21 Registry' },
    { id: 3, label: 'Vulnerability Audit', icon: Shield, badge: 'SHIELD' },
    { id: 4, label: 'Behavioral Drift', icon: TrendingUp, badge: 'NEW' },
    { id: 5, label: 'Board Report', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-card-border z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-accent" />
            <span className="text-lg font-bold">Bastion Audit</span>
          </div>
          <div className="h-4 w-px bg-card-border mx-2" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">NorthGuard Security</span>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Badge variant="teal">OSFI E-21</Badge>
          <Badge variant="teal">PIPEDA</Badge>
          <Badge variant="amber">AIDA</Badge>
          <Badge variant="teal">SOC2</Badge>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-text-muted uppercase font-bold">Security Health</p>
              <p className="text-sm font-bold text-teal-accent">100.0%</p>
            </div>
            <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-teal-accent" style={{ width: '100%' }} />
            </div>
          </div>
          <Button variant="danger" className="text-[10px] font-bold px-3 py-1.5 h-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE KILL-SWITCH
          </Button>
          <Button variant="ghost" className="text-xs">Sign In</Button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-[220px] fixed left-0 bottom-0 top-16 bg-card border-r border-card-border p-4 space-y-6 overflow-y-auto z-30">
          <Card className="bg-background/50 border-card-border p-3">
            <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Tenant Context</p>
            <p className="text-xs font-bold mb-1">Global Enterprise</p>
            <p className="text-[10px] text-text-muted leading-tight">Monitoring 14 active AI agents across fraud, AML, and credit.</p>
          </Card>

          <Card className="bg-background/50 border-card-border p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-text-muted uppercase font-bold">Data Residency</p>
              <Badge variant="teal" className="text-[8px] px-1.5 py-0">Compliant</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted">Primary:</span>
                <span className="font-bold">CANADA CENTRAL</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted">Failover:</span>
                <span className="font-bold">CANADA EAST</span>
              </div>
            </div>
            <p className="text-[9px] text-text-muted mt-2 leading-tight italic">No data leaves Canada per OSFI/PIPEDA.</p>
          </Card>

          <div className="space-y-3">
            <p className="text-[10px] text-text-muted uppercase font-bold px-1">System Status</p>
            {[
              { label: 'Lakera Guard', status: 'ACTIVE', color: 'teal' },
              { label: 'AML Monitor', status: 'ACTIVE', color: 'teal' },
              { label: 'Fraud Sentinel', status: 'ACTIVE', color: 'teal' },
              { label: 'Firestore DB', status: 'STABLE', color: 'blue' },
              { label: 'Agent Monitor', status: 'ONLINE', color: 'teal' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between px-1">
                <span className="text-[10px] text-text-muted">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-text-primary">{s.status}</span>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    s.color === 'teal' ? 'bg-teal-accent animate-pulse' : 'bg-blue-accent'
                  )} />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-[220px] p-8 bg-background relative">
          {/* Modal Overlay */}
          <AnimatePresence>
            {activeModalPage && (
              <ContentModal 
                title={activeModalPage} 
                content={LEGAL_CONTENT[activeModalPage as keyof typeof LEGAL_CONTENT]} 
                onClose={() => setActiveModalPage(null)} 
              />
            )}
          </AnimatePresence>

          {/* Notification Overlay */}
          <div className="fixed top-20 right-8 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
              {simulation.notifications.map((n: Notification) => (
                <div key={n.id} className="pointer-events-auto">
                  <NotificationToast 
                    notification={n} 
                    onDismiss={simulation.dismissNotification} 
                    onAction={setActiveTab} 
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>

          {/* Tab Nav */}
          <nav className="flex items-center gap-1 border-b border-card-border mb-8 overflow-x-auto no-scrollbar" role="tablist" aria-label="Security Dashboard Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 focus-visible:ring-2 focus-visible:ring-teal-accent outline-none",
                  activeTab === tab.id 
                    ? "border-teal-accent text-teal-accent bg-teal-accent/5" 
                    : "border-transparent text-text-muted hover:text-text-primary hover:bg-card-border/50"
                )}
              >
                <tab.icon className="w-4 h-4" aria-hidden="true" />
                {tab.label}
                {tab.badge && <Badge variant={tab.badge === 'SHIELD' ? 'teal' : 'blue'} className="text-[8px] px-1.5 py-0">{tab.badge}</Badge>}
              </button>
            ))}
          </nav>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              tabIndex={0}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-teal-accent/20 rounded-xl"
            >
              {activeTab === 0 && <LiveThreatFeed simulation={simulation} />}
              {activeTab === 1 && <RedTeamSandbox simulation={simulation} />}
              {activeTab === 2 && <ModelInventory />}
              {activeTab === 3 && <VulnerabilityAudit />}
              {activeTab === 4 && <BehavioralDrift />}
              {activeTab === 5 && <BoardReport />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-card-border p-12 ml-[220px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-accent" />
              <span className="font-bold text-text-primary">Bastion Audit</span>
            </div>
            <p className="text-xs text-text-primary font-bold leading-relaxed">
              Production-grade AI Security Posture Management (AI-SPM) platform purpose-built for Canadian Federally Regulated Financial Institutions.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Regulatory Frameworks</h4>
            <ul className="text-xs text-text-primary font-bold space-y-2" role="list">
              <li><button onClick={() => setActiveModalPage('OSFI Guideline E-21')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View OSFI Guideline E-21 details">OSFI Guideline E-21</button></li>
              <li><button onClick={() => setActiveModalPage('PIPEDA Compliance')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View PIPEDA Compliance details">PIPEDA Compliance</button></li>
              <li><button onClick={() => setActiveModalPage('FINTRAC AML/ATF')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View FINTRAC AML/ATF details">FINTRAC AML/ATF</button></li>
              <li><button onClick={() => setActiveModalPage('AIDA / Bill C-27')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View AIDA / Bill C-27 details">AIDA / Bill C-27</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Security Resources</h4>
            <ul className="text-xs text-text-primary font-bold space-y-2" role="list">
              <li><button onClick={() => setActiveModalPage('Threat Intelligence Feed')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View Threat Intelligence Feed details">Threat Intelligence Feed</button></li>
              <li><button onClick={() => setActiveModalPage('Red Team Methodology')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View Red Team Methodology details">Red Team Methodology</button></li>
              <li><button onClick={() => setActiveModalPage('Vulnerability Disclosure')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View Vulnerability Disclosure details">Vulnerability Disclosure</button></li>
              <li><button onClick={() => setActiveModalPage('Audit Log Verification')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View Audit Log Verification details">Audit Log Verification</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Enterprise Support</h4>
            <ul className="text-xs text-text-primary font-bold space-y-2">
              <li>24/7 SOC Operations</li>
              <li>Incident Response</li>
              <li>Professional Services</li>
              <li>Contact Support</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-card-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-text-primary font-bold">
            © 2026 NorthGuard Security. All rights reserved. Headquartered in Toronto, Ontario. Canadian sovereign infrastructure.
          </p>
          <div className="flex gap-6 text-[10px] text-text-primary uppercase font-bold tracking-widest">
            <button onClick={() => setActiveModalPage('Privacy Policy')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View Privacy Policy">Privacy Policy</button>
            <button onClick={() => setActiveModalPage('Terms of Service')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View Terms of Service">Terms of Service</button>
            <button onClick={() => setActiveModalPage('Cookie Settings')} className="hover:text-teal-accent transition-colors focus-visible:ring-2 focus-visible:ring-teal-accent rounded px-1 outline-none" aria-label="View Cookie Settings">Cookie Settings</button>
          </div>
        </div>
      </footer>

      <AIChatWidget />

      {/* Cookie Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <CookieBanner 
            onAccept={handleAcceptCookies} 
            onOpenLegal={setActiveModalPage} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
