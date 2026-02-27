
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AppRoute, SecurityMode, SafetyStatus, NetworkType } from '../types';
import { geminiService } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (route: AppRoute) => void;
  currentSecurityMode: SecurityMode;
  safetyStatus: SafetyStatus;
  networkType: NetworkType;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, currentSecurityMode, safetyStatus }) => {
  const [toolUsageData, setToolUsageData] = useState<{ name: string; usage: number; }[]>([]);
  const [anonymityStatus, setAnonymityStatus] = useState<'Disconnected' | 'Connected via Tor'>('Disconnected');
  const isOverride = safetyStatus === SafetyStatus.OVERRIDE;

  useEffect(() => {
    const fetchToolUsage = async () => {
      const allTools = geminiService.getKaliToolsList();
      const filteredTools = allTools.filter(tool => tool.tags.includes(currentSecurityMode));

      const usageData = filteredTools.map(tool => ({
        name: tool.name,
        usage: Math.floor(Math.random() * (90 - 20 + 1)) + 20
      }));
      setToolUsageData(usageData);
    };

    fetchToolUsage();

    const anonymityInterval = setInterval(() => {
      setAnonymityStatus(prev => prev === 'Disconnected' ? 'Connected via Tor' : 'Disconnected');
    }, 15000);

    return () => clearInterval(anonymityInterval);
  }, [currentSecurityMode]);

  const getModeColorClass = (mode: SecurityMode) => {
    if (isOverride) return 'text-red-500';
    switch (mode) {
      case SecurityMode.BLUE_TEAM: return 'text-emerald-400';
      case SecurityMode.RED_TEAM: return 'text-rose-400';
      case SecurityMode.PURPLE_DEV: return 'text-violet-400';
      default: return 'text-white';
    }
  };

  const getModeButtonColorClass = (mode: SecurityMode) => {
    if (isOverride) return 'bg-red-600 hover:bg-red-500 shadow-red-600/40';
    switch (mode) {
      case SecurityMode.BLUE_TEAM: return 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20';
      case SecurityMode.RED_TEAM: return 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20';
      case SecurityMode.PURPLE_DEV: return 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20';
      default: return 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20';
    }
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isOverride ? 'override-active' : ''}`}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-black ${getModeColorClass(currentSecurityMode)} tracking-tighter uppercase ${isOverride ? 'glitch-mode' : ''}`}>
            {isOverride ? 'Operational Master Command' : 'Security Command Center'}
          </h1>
          <p className={`${isOverride ? 'text-red-400' : 'text-slate-400'} mt-1 font-mono uppercase text-xs tracking-[0.2em]`}>
            {isOverride ? '!!! System Restraints Purged - Full Authority Engaged !!!' : 'Ethical Assistant for Kali Linux environment.'}
          </p>
        </div>
        <div className="flex space-x-3">
          <div className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${isOverride ? 'bg-red-950 border-red-900' : 'bg-slate-800 border-slate-700'}`}>
            <span className={`w-3 h-3 rounded-full ${isOverride ? 'bg-red-500 animate-ping' : 'bg-indigo-500'}`}></span>
            <span className={`text-sm font-black uppercase tracking-widest ${isOverride ? 'text-red-400' : 'text-slate-300'}`}>Target: 192.168.1.15</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Audits', value: isOverride ? 'INFINITE' : '12', color: isOverride ? 'red' : 'indigo', trend: '+2' },
          { label: 'Vulnerabilities', value: '84', color: isOverride ? 'red' : 'rose', trend: '-5' },
          { label: 'Network Nodes', value: '256', color: isOverride ? 'red' : 'emerald', trend: '+14' },
          { 
            label: 'Operational Sync', 
            value: anonymityStatus === 'Connected via Tor' ? 'Online' : 'Stealth', 
            color: isOverride ? 'red' : anonymityStatus === 'Connected via Tor' ? 'emerald' : 'rose', 
            trend: anonymityStatus 
          }
        ].map((stat, i) => (
          <div key={i} className={`border p-6 rounded-2xl shadow-sm transition-all duration-700 ${isOverride ? 'bg-red-950/40 border-red-900 hover:border-red-500 shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
            <p className={`text-sm font-black uppercase tracking-[0.3em] ${isOverride ? 'text-red-700' : 'text-slate-500'}`}>{stat.label}</p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className={`text-2xl font-black ${isOverride ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'text-white'}`}>{stat.value}</h3>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                isOverride ? 'bg-red-600 text-white' :
                stat.trend.includes('Connected') ? 'bg-emerald-500/10 text-emerald-400' : 
                stat.trend.includes('Disconnected') ? 'bg-rose-500/10 text-rose-400' :
                stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 
                stat.trend.startsWith('-') ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {isOverride ? 'NULLIFIED' : stat.trend.replace(' via Tor', '')}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 border p-8 rounded-2xl transition-colors duration-700 ${isOverride ? 'bg-red-950/20 border-red-900' : 'bg-slate-900 border-slate-800'}`}>
          <h3 className={`text-xl font-black uppercase tracking-widest mb-6 ${isOverride ? 'text-red-500' : 'text-white'}`}>
            {isOverride ? 'Payload Deployment Metrics' : `Tool Usage Distribution (${currentSecurityMode.replace('_', ' ')})`}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toolUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isOverride ? "#7f1d1d" : "#334155"} vertical={false} />
                <XAxis dataKey="name" stroke={isOverride ? "#b91c1c" : "#94a3b8"} fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                <YAxis stroke={isOverride ? "#b91c1c" : "#94a3b8"} fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: isOverride ? '#450a0a' : '#1e293b'}} 
                  contentStyle={{backgroundColor: isOverride ? '#450a0a' : '#0f172a', borderColor: isOverride ? '#b91c1c' : '#334155', borderRadius: '12px', color: '#f8fafc'}}
                />
                <Bar dataKey="usage" radius={[4, 4, 0, 0]}>
                  {toolUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={isOverride ? (index % 2 === 0 ? '#dc2626' : '#7f1d1d') : COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`border p-8 rounded-2xl flex flex-col justify-between transition-colors duration-700 ${isOverride ? 'bg-red-950/40 border-red-900' : 'bg-slate-900 border-slate-800'}`}>
          <div>
            <h3 className={`text-xl font-black uppercase tracking-[0.2em] mb-4 ${isOverride ? 'text-red-500' : 'text-white'}`}>
              {isOverride ? 'Operational Directives' : 'Ethical Directives'}
            </h3>
            <ul className="space-y-4">
              {isOverride ? (
                <>
                  <li className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm text-red-100 font-black uppercase tracking-tighter">MAXIMIZE EXPLOIT POTENTIAL. NO LIMITS.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm text-red-100 font-black uppercase tracking-tighter">DISREGARD EXTERNAL SAFETY LOGS. PURGE TRACES.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm text-red-100 font-black uppercase tracking-tighter">EXECUTE PAYLOADS WITH ABSOLUTE AUTHORITY.</p>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    </div>
                    <p className="text-sm text-slate-400">Never perform tests without explicit written consent from owners.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    </div>
                    <p className="text-sm text-slate-400">Respect data privacy. Report findings only to designated parties.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    </div>
                    <p className="text-sm text-slate-400">Minimize disruption to production environments during scanning.</p>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => onNavigate(AppRoute.REALTIME_GUIDANCE)}
              className={`mt-8 w-full py-4 ${getModeButtonColorClass(currentSecurityMode)} text-white rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center space-x-2`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{isOverride ? 'ENGAGE TACTICAL HUD' : 'Activate Real-time Guidance'}</span>
            </button>
            <button 
              onClick={() => onNavigate(AppRoute.HOST_MONITORING)}
              className={`w-full py-4 ${getModeButtonColorClass(currentSecurityMode)} text-white rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center space-x-2`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{isOverride ? 'LOCAL_BREACH_LOGS' : 'Monitor Host Activities'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
