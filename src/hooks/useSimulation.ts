import { useState, useEffect, useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'INFO';
  details: string;
}

export interface ThreatIntel {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  time: string;
}

export function useSimulation() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [stats, setStats] = useState({
    events: 1847,
    riskAvoided: 2.3,
    compliance: 94.2,
  });
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-CA', { hour12: false }),
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const agents = ['Fraud Detection v3.2', 'AML Screener v2.4', 'Mortgage Adjudicator v4.1', 'Customer Service LLM'];
      const actions = ['Input Validation', 'PII Scan', 'Prompt Injection Check', 'Bias Analysis', 'FINTRAC Compliance Check'];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      addLog({
        agent,
        action,
        status: Math.random() > 0.1 ? 'PASSED' : 'INFO',
        details: `Request analyzed for ${agent} - No anomalies detected.`,
      });

      // Occasionally increment stats
      if (Math.random() > 0.7) {
        setStats(prev => ({
          ...prev,
          events: prev.events + 1,
          riskAvoided: +(prev.riskAvoided + 0.01).toFixed(2)
        }));
      }
    }, 3000);

    const threatInterval = setInterval(() => {
      const newThreat: ThreatIntel = {
        id: Math.random().toString(36).substr(2, 9),
        severity: Math.random() > 0.7 ? 'CRITICAL' : 'HIGH',
        title: Math.random() > 0.5 ? 'Attempted Prompt Injection' : 'Potential SIN Exfiltration',
        time: 'Just now',
      };
      setThreats(prev => [newThreat, ...prev].slice(0, 5));
    }, 15000);

    return () => {
      clearInterval(logInterval);
      clearInterval(threatInterval);
    };
  }, [addLog]);

  return { logs, threats, stats, isKillSwitchActive, setIsKillSwitchActive, addLog };
}
