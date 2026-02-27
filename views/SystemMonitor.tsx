
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResourceStats {
  cpu: number;
  ram: number;
  disk: number;
  wifiDown: number;
  wifiUp: number;
  mobileDown: number;
  mobileUp: number;
  timestamp: number;
}

const SystemMonitor: React.FC = () => {
  const [history, setHistory] = useState<ResourceStats[]>([]);
  const [stats, setStats] = useState<ResourceStats>({
    cpu: 0, ram: 0, disk: 82, 
    wifiDown: 0, wifiUp: 0, 
    mobileDown: 0, mobileUp: 0, 
    timestamp: Date.now()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newStats: ResourceStats = {
        cpu: Math.floor(Math.random() * 45) + 5,
        ram: Math.floor(Math.random() * 20) + 40,
        disk: 82,
        wifiDown: Math.floor(Math.random() * 1200) + 100,
        wifiUp: Math.floor(Math.random() * 400) + 20,
        mobileDown: Math.floor(Math.random() * 300) + 10,
        mobileUp: Math.floor(Math.random() * 100) + 5,
        timestamp: Date.now()
      };
      setStats(newStats);
      setHistory(prev => [...prev.slice(-19), newStats]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (kb: number) => {
    if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB/s`;
    return `${kb} KB/s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Resource Intelligence</h1>
        <p className="text-slate-400 mt-1 font-mono uppercase text-xs tracking-widest">Real-time system health and network bandwidth metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'CPU Usage', value: `${stats.cpu}%`, color: 'sky', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { label: 'RAM Allocation', value: `${stats.ram}%`, color: 'violet', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { label: 'Storage Matrix', value: `${stats.disk}%`, color: 'rose', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-sm flex items-center space-x-6">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center border border-${stat.color}-500/20`}>
               <svg className={`w-7 h-7 text-${stat.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
               </svg>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bandwidth Usage Section */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-black uppercase tracking-widest text-white">Bandwidth Throughput</h3>
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-mono text-emerald-500/70">MONITOR_LIVE</span>
             </div>
          </div>

          <div className="space-y-6">
             <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                   <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-12-18h24z"/></svg>
                      <span className="text-sm font-black uppercase text-sky-400 tracking-tighter">WLAN_IEEE_802_11</span>
                   </div>
                   <span className="text-[10px] font-mono text-slate-500">Connected</span>
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Downstream</p>
                      <p className="text-xl font-mono text-white">{formatBytes(stats.wifiDown)}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Upstream</p>
                      <p className="text-xl font-mono text-white">{formatBytes(stats.wifiUp)}</p>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                   <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20v-20z"/></svg>
                      <span className="text-sm font-black uppercase text-amber-500 tracking-tighter">CELL_WWAN_LTE_5G</span>
                   </div>
                   <span className="text-[10px] font-mono text-slate-500">Standby</span>
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Downstream</p>
                      <p className="text-xl font-mono text-white">{formatBytes(stats.mobileDown)}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Upstream</p>
                      <p className="text-xl font-mono text-white">{formatBytes(stats.mobileUp)}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Load History Chart */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col">
           <h3 className="text-lg font-black uppercase tracking-widest text-white mb-8">Load History (Last 60s)</h3>
           <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#f8fafc' }}
                    labelFormatter={() => ''}
                  />
                  <Area type="monotone" dataKey="cpu" name="CPU" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={3} />
                  <Area type="monotone" dataKey="ram" name="RAM" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRam)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
           <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                 <div className="w-3 h-1 bg-sky-500 rounded-full"></div>
                 <span className="text-[10px] font-black uppercase text-slate-500">CPU Load</span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="w-3 h-1 bg-violet-500 rounded-full"></div>
                 <span className="text-[10px] font-black uppercase text-slate-500">Memory Pressure</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
