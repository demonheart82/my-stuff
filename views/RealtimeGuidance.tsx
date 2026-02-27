
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NetworkActivity, GuidanceMessage } from '../types';
import { geminiService } from '../services/geminiService';

type LogEntry = NetworkActivity | GuidanceMessage;

interface GraphNode { ip: string; x: number; y: number; isSource: boolean; }
interface GraphEdge { id: string; sourceIp: string; targetIp: string; type: NetworkActivity['type']; guidanceType: GuidanceMessage['type']; anomalyScore: number; }

const RealtimeGuidance: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const intervalRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const generateMockActivity = (): NetworkActivity => {
    const ips = ['192.168.1.10', '192.168.1.15', '203.0.113.45', '172.16.0.3'];
    return {
      id: `net-${Date.now()}`,
      timestamp: Date.now(),
      type: 'SCAN',
      sourceIp: ips[Math.floor(Math.random() * ips.length)],
      targetIp: '192.168.1.5',
      details: 'Probe activity detected.',
      severity: Math.random() > 0.8 ? 'CRITICAL' : 'INFO'
    };
  };

  const startMonitoring = () => {
    if (isMonitoring) return;
    setIsMonitoring(true);
    intervalRef.current = window.setInterval(async () => {
      const activity = generateMockActivity();
      setLogs(prev => [...prev, activity]);
      const guidance = await geminiService.getRealtimeGuidance(activity, []);
      setLogs(prev => [...prev, guidance]);
    }, 4000);
  };

  const NetworkGraph: React.FC = () => (
    <div className="w-full bg-slate-950/50 rounded-xl overflow-hidden border border-slate-800 h-64">
      <svg viewBox="0 0 400 200" className="w-full h-full">
        <text x="200" y="100" textAnchor="middle" fill="#475569" fontSize="12" className="animate-pulse">Monitoring Live Packets...</text>
        {/* Simplified visual representation for mobile performance */}
        <circle cx="200" cy="100" r="40" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="4 2">
          <animateTransform attributeName="transform" type="rotate" from="0 200 100" to="360 200 100" dur="10s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Net Alerts</h1>
        <div className="flex space-x-2">
          <button onClick={startMonitoring} className={`px-4 py-2 rounded-lg text-sm font-bold ${isMonitoring ? 'bg-rose-600' : 'bg-emerald-600'}`}>
            {isMonitoring ? 'Active' : 'Start'}
          </button>
          <button onClick={() => setLogs([])} className="px-4 py-2 bg-slate-800 rounded-lg text-sm">Clear</button>
        </div>
      </header>
      <NetworkGraph />
      <div ref={scrollRef} className="h-96 overflow-y-auto space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-xs">
        {logs.map((log, i) => (
          <div key={i} className={`p-2 rounded border ${'sourceIp' in log ? 'border-slate-800 bg-slate-800/50' : 'border-indigo-900/50 bg-indigo-950/20 text-indigo-300'}`}>
            {'sourceIp' in log ? `[${log.type}] ${log.sourceIp} -> ${log.targetIp}` : `>> AI: ${log.content}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealtimeGuidance;
