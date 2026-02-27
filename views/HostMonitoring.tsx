
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HostActivity, HostGuidanceMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type HostLogEntry = HostActivity | HostGuidanceMessage;

const HostMonitoring: React.FC = () => {
  const [hostLogs, setHostLogs] = useState<HostLogEntry[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isGeneratingGuidance, setIsGeneratingGuidance] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [hostLogs]);

  const normalHostActivities: HostActivity[] = [
    { id: 'host-001', timestamp: Date.now(), type: 'PROCESS_EXECUTION', process: 'systemd', user: 'root', event: 'Core system service initialization.', severity: 'INFO' },
    { id: 'host-002', timestamp: Date.now(), type: 'FILE_ACCESS', process: 'bash', user: 'john.doe', path: '/home/john.doe/.bashrc', event: 'User loaded bash configuration.', severity: 'INFO' },
    { id: 'host-003', timestamp: Date.now(), type: 'SYSTEM_LOG', process: 'kernel', user: 'system', event: 'Kernel message: CPU temperature normal.', severity: 'INFO' }
  ];

  const anomalousHostActivities: HostActivity[] = [
    { id: 'anom-host-001', timestamp: Date.now(), type: 'PRIVILEGE_ESCALATION', process: 'exploit_script.sh', user: 'devuser', path: '/tmp/exploit_script.sh', event: 'Successful sudo to root via unknown script.', severity: 'CRITICAL' },
    { id: 'anom-host-002', timestamp: Date.now(), type: 'FILE_ACCESS', process: 'malicious_app', user: 'www-data', path: '/etc/passwd', event: 'Sensitive file modification attempt.', severity: 'CRITICAL' }
  ];

  const generateMockHostActivity = (): HostActivity => {
    const isAnomaly = Math.random() < 0.3;
    const activities = isAnomaly ? anomalousHostActivities : normalHostActivities;
    const activity = activities[Math.floor(Math.random() * activities.length)];
    return { ...activity, id: `host-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, timestamp: Date.now() };
  };

  const startMonitoring = () => {
    if (isMonitoring) return;
    setIsMonitoring(true);
    setIsGeneratingGuidance(true);

    intervalRef.current = window.setInterval(async () => {
      const newActivity = generateMockHostActivity();
      setHostLogs(prev => {
        const recent = prev.filter((log): log is HostActivity => 'process' in log).slice(-10);
        geminiService.getHostRealtimeGuidance(newActivity, recent)
          .then(guidance => setHostLogs(curr => [...curr, guidance]))
          .catch(() => setHostLogs(curr => [...curr, { id: `host-error-${Date.now()}`, timestamp: Date.now(), type: 'WARNING', content: 'Analysis error.', anomalyScore: 0 }]))
          .finally(() => setIsGeneratingGuidance(false));
        return [...prev, newActivity];
      });
      setIsGeneratingGuidance(true);
    }, 4000);
  };

  const stopMonitoring = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsMonitoring(false);
    setIsGeneratingGuidance(false);
  };

  const clearLogs = () => {
    setHostLogs([]);
    stopMonitoring();
  };

  const getSeverityColorClass = (severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    switch (severity) {
      case 'INFO': return 'text-sky-400 bg-sky-400/10';
      case 'WARNING': return 'text-amber-400 bg-amber-400/10';
      case 'CRITICAL': return 'text-rose-400 bg-rose-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getAnomalyScoreColor = (score: number) => {
    if (score >= 80) return 'bg-rose-600/20 text-rose-300';
    if (score >= 50) return 'bg-amber-600/20 text-amber-300';
    if (score >= 20) return 'bg-sky-600/20 text-sky-300';
    return 'bg-slate-700/20 text-slate-400';
  };

  const aggregatedData = useMemo(() => {
    const activityCounts: { [key: string]: number } = {};
    const processCounts: { [key: string]: number } = {};
    let total = 0;
    let criticals = 0;

    hostLogs.forEach(log => {
      if ('process' in log) {
        total++;
        activityCounts[log.type] = (activityCounts[log.type] || 0) + 1;
        processCounts[log.process] = (processCounts[log.process] || 0) + 1;
      } else if (log.type === 'CRITICAL') {
        criticals++;
      }
    });

    return {
      totalHostActivities: total,
      criticalGuidanceCount: criticals,
      activityTypeDistribution: Object.entries(activityCounts).map(([name, value]) => ({ name, value })),
      topProcesses: Object.entries(processCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }))
    };
  }, [hostLogs]);

  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Host Monitoring</h1>
          <p className="text-slate-400 mt-1">Real-time AI analysis of simulated local system activities.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={startMonitoring} disabled={isMonitoring} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center space-x-2"><span>Start Monitoring</span></button>
          <button onClick={stopMonitoring} disabled={!isMonitoring} className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center space-x-2"><span>Stop Monitoring</span></button>
          <button onClick={clearLogs} className="px-4 py-3 bg-slate-700 text-white rounded-xl font-bold"><span>Clear Logs</span></button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm"><p className="text-slate-500 text-sm uppercase">Total Activities</p><h3 className="text-2xl font-bold text-white mt-2">{aggregatedData.totalHostActivities}</h3></div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm"><p className="text-slate-500 text-sm uppercase">Critical Guidance</p><h3 className="text-2xl font-bold text-rose-400 mt-2">{aggregatedData.criticalGuidanceCount}</h3></div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm"><p className="text-slate-500 text-sm uppercase">Top Processes</p><div className="mt-2 space-y-1">{aggregatedData.topProcesses.map((p, i) => <p key={i} className="text-sm text-white truncate">{p.name} ({p.count})</p>)}</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Activity Type Distribution</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={aggregatedData.activityTypeDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {aggregatedData.activityTypeDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px'}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl h-[calc(100vh-22rem)] overflow-hidden flex flex-col">
          <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex items-center justify-between"><h2 className="text-lg font-bold text-white">Host Activity Log</h2></div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm custom-scrollbar">
            {hostLogs.map((entry, index) => (
              <div key={index} className={`p-3 rounded-lg border ${'process' in entry ? 'bg-slate-800 border-slate-700' : 'bg-slate-700 border-slate-600'}`}>
                {'process' in entry ? (
                  <div className="text-slate-300"><span className="text-slate-500 pr-2">{new Date(entry.timestamp).toLocaleTimeString()}</span><span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getSeverityColorClass(entry.severity)}`}>{entry.severity}</span> <span className="ml-2 font-bold text-white">{entry.type}</span> by <span className="text-indigo-400">{entry.user}</span>: {entry.event}</div>
                ) : (
                  <div className={`flex items-start space-x-2 ${getSeverityColorClass(entry.type)}`}><div className="flex-1"><span className="text-slate-500 pr-2">{new Date(entry.timestamp).toLocaleTimeString()}</span><strong className="uppercase">{entry.type} Host Guidance:</strong> {entry.content} <span className={`ml-3 px-2 py-0.5 rounded-md text-xs font-bold ${getAnomalyScoreColor(entry.anomalyScore || 0)}`}>Score: {entry.anomalyScore}</span></div></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostMonitoring;
