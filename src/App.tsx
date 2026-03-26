import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, CheckCircle2, Info, Activity, Lock, Globe, Database, Terminal, Zap, Search, Filter, Plus, ChevronRight, FileText, BarChart3, Users, Settings, LogOut, Menu, X, ArrowUpRight, TrendingUp } from 'lucide-react';
import { cn } from './lib/utils';
import { useSimulation, LogEntry, ThreatIntel } from './hooks/useSimulation';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- UI Components ---

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
    <button className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50', variants[variant], className)} {...props}>
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
          { label: 'Compliance Score', value: `${stats.compliance}%`, change: '+2.1% this week', color: 'teal' },
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
                    <Button variant="ghost" className="text-[10px] py-1 h-auto">PII Leak</Button>
                    <Button variant="ghost" className="text-[10px] py-1 h-auto">AML Bypass</Button>
                    <Button variant="primary" className="text-[10px] py-1 h-auto">Run Simulation</Button>
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
                    <span className="text-xs font-medium">{row.name}</span>
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
            <div className="bg-black/40 p-4 font-mono text-xs h-[300px] overflow-y-auto space-y-1">
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
            <div className="p-4 border-b border-card-border bg-teal-accent/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-accent flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Security Sentinel</h3>
                  <p className="text-[10px] text-teal-accent uppercase font-bold tracking-widest">Active Guardrail</p>
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
                    msg.role === 'user' ? 'bg-teal-accent text-white' : 'bg-card-border text-text-primary'
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
                  className="flex-1 bg-background border border-card-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-teal-accent"
                  placeholder="Ask Sentinel..."
                />
                <Button onClick={handleSend} className="p-2 h-auto"><Zap className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-teal-accent shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = React.useState(0);
  const simulation = useSimulation();

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
        <main className="flex-1 ml-[220px] p-8 bg-background">
          {/* Tab Nav */}
          <nav className="flex items-center gap-1 border-b border-card-border mb-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0",
                  activeTab === tab.id 
                    ? "border-teal-accent text-teal-accent bg-teal-accent/5" 
                    : "border-transparent text-text-muted hover:text-text-primary hover:bg-card-border/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && <Badge variant={tab.badge === 'SHIELD' ? 'teal' : 'blue'} className="text-[8px] px-1.5 py-0">{tab.badge}</Badge>}
              </button>
            ))}
          </nav>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
            <ul className="text-xs text-text-primary font-bold space-y-2">
              <li>OSFI Guideline E-21</li>
              <li>PIPEDA Compliance</li>
              <li>FINTRAC AML/ATF</li>
              <li>AIDA / Bill C-27</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Security Resources</h4>
            <ul className="text-xs text-text-primary font-bold space-y-2">
              <li>Threat Intelligence Feed</li>
              <li>Red Team Methodology</li>
              <li>Vulnerability Disclosure</li>
              <li>Audit Log Verification</li>
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
            <a href="#" className="hover:text-teal-accent">Privacy Policy</a>
            <a href="#" className="hover:text-teal-accent">Terms of Service</a>
            <a href="#" className="hover:text-teal-accent">Cookie Settings</a>
          </div>
        </div>
      </footer>

      <AIChatWidget />
    </div>
  );
}
