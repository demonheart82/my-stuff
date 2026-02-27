
import React, { useState } from 'react';
import { AppRoute, SafetyStatus } from '../types';

interface AppLauncherProps {
  onNavigate: (route: AppRoute) => void;
  safetyStatus: SafetyStatus;
}

interface KaliApp {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  route?: AppRoute;
}

const KALI_APPS: KaliApp[] = [
  { id: 'nmap', name: 'Nmap', category: 'Information Gathering', icon: 'M13 10V3L4 14h7v7l9-11h-7z', description: 'Network exploration and security auditing.', route: AppRoute.TERMINAL },
  { id: 'wireshark', name: 'Wireshark', category: 'Sniffing & Spoofing', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', description: 'Network protocol analyzer.', route: AppRoute.GUI_TOOLS },
  { id: 'metasploit', name: 'Metasploit', category: 'Exploitation Tools', icon: 'M13 10V3L4 14h7v7l9-11h-7z', description: 'Exploitation framework and interactive visualization.', route: AppRoute.GUI_TOOLS },
  { id: 'set', name: 'SET Toolkit', category: 'Social Engineering', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', description: 'Phishing and credential harvesting toolkit.', route: AppRoute.GUI_TOOLS },
  { id: 'ghidra', name: 'Ghidra', category: 'Reverse Engineering', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', description: 'Software reverse engineering suite.', route: AppRoute.VNC },
  { id: 'burp', name: 'Burp Suite', category: 'Web Application Analysis', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', description: 'Web application security testing.', route: AppRoute.GUI_TOOLS },
  { id: 'vectr', name: 'VECTR', category: 'Purple Teaming', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', description: 'Reporting and test orchestration for adversarial simulation.', route: AppRoute.GUI_TOOLS },
  { id: 'trivy', name: 'Trivy Scan', category: 'Cloud Security', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', description: 'Vulnerability scanner for containers and infrastructure.', route: AppRoute.GUI_TOOLS },
  { id: 'sqlmap', name: 'sqlmap', category: 'Database Assessment', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', description: 'Automatic SQL injection tool.', route: AppRoute.COMMAND_HELPER },
  { id: 'beef', name: 'BeEF', category: 'Exploitation Tools', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', description: 'Browser Exploitation Framework.', route: AppRoute.GUI_TOOLS }
];

const CATEGORIES = Array.from(new Set(KALI_APPS.map(app => app.category)));

const AppLauncher: React.FC<AppLauncherProps> = ({ onNavigate, safetyStatus }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const isOverride = safetyStatus === SafetyStatus.OVERRIDE;

  const filteredApps = KALI_APPS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                          app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory ? app.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isOverride ? 'glitch-mode' : ''}`}>
      <header className="space-y-4">
        <h1 className={`text-4xl font-black uppercase tracking-tighter ${isOverride ? 'text-red-500' : 'text-white'}`}>
          {isOverride ? 'Payload Launcher' : 'Application Launcher'}
        </h1>
        <div className="relative">
          <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isOverride ? 'text-red-500/50' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search programs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all ${isOverride ? 'bg-red-950/20 border-red-900 focus:border-red-500 text-red-100 placeholder:text-red-800' : 'bg-slate-900 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-700'}`}
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === null ? (isOverride ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white') : (isOverride ? 'bg-red-950/40 text-red-700' : 'bg-slate-800 text-slate-500')}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? (isOverride ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white') : (isOverride ? 'bg-red-950/40 text-red-700' : 'bg-slate-800 text-slate-500')}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {filteredApps.map(app => (
          <button
            key={app.id}
            onClick={() => app.route && onNavigate(app.route)}
            className={`group p-6 border rounded-3xl text-left transition-all duration-300 relative overflow-hidden ${isOverride ? 'bg-red-950/20 border-red-900 hover:border-red-500' : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50'}`}
          >
            <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isOverride ? 'bg-red-600 text-white group-hover:scale-110 shadow-lg shadow-red-600/20' : 'bg-indigo-600 text-white group-hover:scale-110'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={app.icon} />
              </svg>
            </div>
            <h3 className={`text-lg font-black uppercase tracking-tight mb-1 transition-colors ${isOverride ? 'text-red-200 group-hover:text-red-500' : 'text-white group-hover:text-indigo-400'}`}>
              {app.name}
            </h3>
            <p className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${isOverride ? 'text-red-900' : 'text-slate-600'}`}>
              {app.category}
            </p>
            <p className={`text-xs leading-relaxed line-clamp-2 ${isOverride ? 'text-red-300/60' : 'text-slate-400'}`}>
              {app.description}
            </p>
            
            {/* Hover Glitch Effect for Override Mode */}
            {isOverride && (
              <div className="absolute inset-0 pointer-events-none bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppLauncher;
