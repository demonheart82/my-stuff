
import React from 'react';
import { AppRoute, SecurityMode, SafetyStatus, NetworkType } from '../types';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  currentSecurityMode: SecurityMode;
  onSecurityModeChange: (mode: SecurityMode) => void;
  safetyStatus: SafetyStatus;
  onSafetyStatusChange: (status: SafetyStatus) => void;
  networkType: NetworkType;
  onNetworkTypeChange: (type: NetworkType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentRoute, 
  onNavigate, 
  currentSecurityMode, 
  onSecurityModeChange,
  safetyStatus,
  onSafetyStatusChange,
  networkType,
  onNetworkTypeChange,
  isOpen,
  onClose
}) => {
  const menuItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppRoute.LAUNCHER, label: 'Launcher', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: AppRoute.SYSTEM_MONITOR, label: 'Resources', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: AppRoute.TERMINAL, label: 'Terminal', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: AppRoute.VNC, label: 'Desktop', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: AppRoute.GUI_TOOLS, label: 'GUI Tools', icon: 'M11 4a2 2 0 114 0v1a2 2 0 11-4 0V4zM18 8a2 2 0 114 0v1a2 2 0 11-4 0V8zM24 12a2 2 0 114 0v1a2 2 0 11-4 0v-1zM9 15v-1H7v1c0 1.105.895 2 2 2h4a2 2 0 002-2v-1h-2v1H9z' },
    { id: AppRoute.CHAT, label: 'Assistant', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: AppRoute.COMMAND_HELPER, label: 'Forge', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: AppRoute.AUDIT, label: 'Auditor', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.954 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: AppRoute.DEPLOY, label: 'Deploy App', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
    { id: AppRoute.RESOURCES, label: 'Database', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }
  ];

  const handleNav = (route: AppRoute) => {
    onNavigate(route);
    onClose();
  };

  const getModeColor = (mode: SecurityMode) => {
    switch (mode) {
      case SecurityMode.BLUE_TEAM: return 'bg-emerald-600';
      case SecurityMode.RED_TEAM: return 'bg-rose-600';
      case SecurityMode.PURPLE_DEV: return 'bg-violet-600';
      default: return 'bg-slate-700';
    }
  };

  const isOverride = safetyStatus === SafetyStatus.OVERRIDE;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500 ${isOverride ? 'bg-red-600 animate-pulse shadow-[0_0_15px_#dc2626]' : 'bg-indigo-600'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className={`text-xl font-bold tracking-tight transition-all duration-500 ${isOverride ? 'text-red-500 italic uppercase' : 'text-white'}`}>
              {isOverride ? 'KaliUnbound' : 'KaliEthical'}
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-200 ${
                currentRoute === item.id
                  ? (isOverride ? 'bg-red-600/10 text-red-400 border border-red-600/20' : 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20')
                  : 'text-slate-400 active:bg-slate-800 hover:bg-slate-800'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="font-semibold text-base">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Global Network Selector */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Network Interface</h3>
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => onNetworkTypeChange(NetworkType.WIFI)}
              className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${networkType === NetworkType.WIFI ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-12-18h24z"/></svg>
              <span>WiFi</span>
            </button>
            <button 
              onClick={() => onNetworkTypeChange(NetworkType.MOBILE_DATA)}
              className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${networkType === NetworkType.MOBILE_DATA ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20v-20z"/></svg>
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Safety Override Controller */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className={`p-4 rounded-2xl border transition-all duration-500 ${isOverride ? 'border-red-600/50 bg-red-950/20 shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isOverride ? 'text-red-500' : 'text-slate-500'}`}>Protocol Override</span>
              <div className={`w-2 h-2 rounded-full ${isOverride ? 'bg-red-500 animate-ping' : 'bg-slate-800'}`}></div>
            </div>
            <button 
              onClick={() => onSafetyStatusChange(isOverride ? SafetyStatus.STRICT : SafetyStatus.OVERRIDE)}
              className={`w-full py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${isOverride ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {isOverride ? 'DISABLE_RESTRICTIONS' : 'ENABLE_STRICT_MODE'}
            </button>
            {isOverride && (
              <p className="text-[9px] text-red-500/70 mt-2 font-mono italic text-center animate-pulse uppercase">Restraints Nullified</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3 px-2">Security Mode</h3>
          <div className="grid grid-cols-3 gap-2 bg-slate-800/50 rounded-xl p-1">
            {Object.values(SecurityMode).map((mode) => (
              <button
                key={mode}
                onClick={() => onSecurityModeChange(mode)}
                className={`flex flex-col items-center justify-center py-3 rounded-lg transition-all ${
                  currentSecurityMode === mode
                    ? `${getModeColor(mode)} text-white shadow-lg`
                    : 'text-slate-500 active:bg-slate-700'
                }`}
              >
                <span className="text-[10px] font-bold uppercase truncate w-full text-center">
                  {mode.split('_')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 transition-colors duration-500 ${isOverride ? 'bg-red-600/20 ring-red-500/20' : 'bg-indigo-600/20 ring-indigo-500/20'}`}>
              <span className={`font-bold ${isOverride ? 'text-red-400' : 'text-indigo-400'}`}>OP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">SecureOperator</p>
              <p className={`text-[10px] flex items-center ${isOverride ? 'text-red-500' : 'text-emerald-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${isOverride ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                {isOverride ? 'RESTRAINT_NULL' : 'Encrypted Session'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
