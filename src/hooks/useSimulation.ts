import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

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

export interface Notification {
  id: string;
  type: 'THREAT' | 'DRIFT';
  severity: 'CRITICAL' | 'HIGH';
  message: string;
  timestamp: string;
  linkTab: number;
}

export function useSimulation() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    events: 1847,
    riskAvoided: 2.3,
    compliance: 94.2,
  });
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!showNotifications) return;
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-CA', { hour12: false }),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
    
    // Placeholder for email alert
    console.log(`[EMAIL ALERT SIMULATION] To: security-ops@bastion-audit.ca | Subject: ${notif.severity} ALERT: ${notif.message}`);
  }, [showNotifications]);

  const addLog = useCallback(async (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-CA', { hour12: false }),
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 50));

    // Write to Firestore if user is authenticated to populate the live feed
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'audit_logs'), {
          timestamp: serverTimestamp(),
          user: entry.agent,
          action: entry.action,
          status: entry.status === 'PASSED' || entry.status === 'INFO' ? 'SUCCESS' : 'WARNING',
          details: entry.details,
          uid: auth.currentUser.uid
        });
      } catch (error) {
        console.error("Manual log failed to write to Firestore:", error);
      }
    }
  }, []);

  useEffect(() => {
    const logInterval = setInterval(async () => {
      const agents = ['Fraud Detection v3.2', 'AML Screener v2.4', 'Mortgage Adjudicator v4.1', 'Customer Service LLM'];
      const actions = ['Input Validation', 'PII Scan', 'Prompt Injection Check', 'Bias Analysis', 'FINTRAC Compliance Check'];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const status = Math.random() > 0.1 ? 'PASSED' : 'INFO';
      const details = `Request analyzed for ${agent} - No anomalies detected.`;
      
      addLog({
        agent,
        action,
        status,
        details,
      });

      // Occasionally increment stats
      if (Math.random() > 0.7) {
        setStats(prev => ({
          ...prev,
          events: prev.events + 1,
          riskAvoided: +(prev.riskAvoided + 0.01).toFixed(2)
        }));
      }
    }, 30000); // Increased from 1200ms to 30000ms (30 seconds) to save Firestore quota

    const threatInterval = setInterval(() => {
      const isCritical = Math.random() > 0.7;
      const severity = isCritical ? 'CRITICAL' : 'HIGH';
      const title = Math.random() > 0.5 ? 'Attempted Prompt Injection' : 'Potential SIN Exfiltration';
      
      const newThreat: ThreatIntel = {
        id: Math.random().toString(36).substr(2, 9),
        severity,
        title,
        time: 'Just now',
      };
      setThreats(prev => [newThreat, ...prev].slice(0, 5));

      if (isCritical) {
        addNotification({
          type: 'THREAT',
          severity: 'CRITICAL',
          message: `CRITICAL THREAT: ${title} detected in live traffic.`,
          linkTab: 0
        });
      }
    }, 15000);

    // Simulate Drift Alert
    const driftInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        addNotification({
          type: 'DRIFT',
          severity: 'HIGH',
          message: `BEHAVIORAL DRIFT: Mortgage Adjudicator v4.1 showing anomalous bias patterns.`,
          linkTab: 4
        });
      }
    }, 45000);

    return () => {
      clearInterval(logInterval);
      clearInterval(threatInterval);
      clearInterval(driftInterval);
    };
  }, [addLog, addNotification]);

  useEffect(() => {
    if (!showNotifications) {
      setNotifications([]);
    }
  }, [showNotifications]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { logs, threats, notifications, stats, isKillSwitchActive, setIsKillSwitchActive, showNotifications, setShowNotifications, addLog, dismissNotification };
}
