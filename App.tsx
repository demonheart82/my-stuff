
import React, { useState, useEffect } from 'react';
import { AppRoute, SecurityMode, SafetyStatus, NetworkType } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ChatAssistant from './views/ChatAssistant';
import ScriptAudit from './views/ScriptAudit';
import CommandHelper from './views/CommandHelper';
import Resources from './views/Resources';
import RealtimeGuidance from './views/RealtimeGuidance';
import HostMonitoring from './views/HostMonitoring';
import TerminalView from './views/TerminalView';
import DeploymentView from './views/DeploymentView';
import VNCView from './views/VNCView';
import AppLauncher from './views/AppLauncher';
import GUITools from './views/GUITools';
import SystemMonitor from './views/SystemMonitor';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [currentSecurityMode, setCurrentSecurityMode] = useState<SecurityMode>(SecurityMode.BLUE_TEAM);
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>(SafetyStatus.STRICT);
  const [networkType, setNetworkType] = useState<NetworkType>(NetworkType.WIFI);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    geminiService.setSafetyStatus(safetyStatus);
  }, [safetyStatus]);

  useEffect(() => {
    geminiService.setNetworkType(networkType);
  }, [networkType]);

  const renderView = () => {
    switch (currentRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard onNavigate={setCurrentRoute} currentSecurityMode={currentSecurityMode} safetyStatus={safetyStatus} networkType={networkType} />;
      case AppRoute.TERMINAL:
        return <TerminalView safetyStatus={safetyStatus} networkType={networkType} />;
      case AppRoute.VNC:
        return <VNCView safetyStatus={safetyStatus} networkType={networkType} />;
      case AppRoute.CHAT:
        return <ChatAssistant currentSecurityMode={currentSecurityMode} safetyStatus={safetyStatus} />;
      case AppRoute.AUDIT:
        return <ScriptAudit />;
      case AppRoute.COMMAND_HELPER:
        return <CommandHelper safetyStatus={safetyStatus} />;
      case AppRoute.RESOURCES:
        return <Resources currentSecurityMode={currentSecurityMode} />;
      case AppRoute.REALTIME_GUIDANCE:
        return <RealtimeGuidance />;
      case AppRoute.HOST_MONITORING:
        return <HostMonitoring />;
      case AppRoute.DEPLOY:
        return <DeploymentView />;
      case AppRoute.LAUNCHER:
        return <AppLauncher onNavigate={setCurrentRoute} safetyStatus={safetyStatus} />;
      case AppRoute.GUI_TOOLS:
        return <GUITools safetyStatus={safetyStatus} currentSecurityMode={currentSecurityMode} />;
      case AppRoute.SYSTEM_MONITOR:
        return <SystemMonitor />;
      default:
        return <Dashboard onNavigate={setCurrentRoute} currentSecurityMode={currentSecurityMode} safetyStatus={safetyStatus} networkType={networkType} />;
    }
  };

  return (
    <div className={`flex h-screen text-slate-200 overflow-hidden font-sans select-none transition-all duration-700 ${safetyStatus === SafetyStatus.OVERRIDE ? 'bg-red-950/20' : 'bg-slate-950'}`}>
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        currentSecurityMode={currentSecurityMode}
        onSecurityModeChange={setCurrentSecurityMode}
        safetyStatus={safetyStatus}
        onSafetyStatusChange={setSafetyStatus}
        networkType={networkType}
        onNetworkTypeChange={setNetworkType}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 overflow-y-auto relative bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/20 pt-[env(safe-area-inset-top)]">
        
        {/* Safety Override Banner */}
        {safetyStatus === SafetyStatus.OVERRIDE && (
          <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.4em] py-1 text-center animate-pulse sticky top-0 z-50">
            !!! Warning: Safety Protocols Nullified - Full Tactical Access Enabled !!!
          </div>
        )}

        {/* Global Network Status Bar */}
        <div className={`px-4 py-1.5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest border-b ${safetyStatus === SafetyStatus.OVERRIDE ? 'bg-red-900/40 border-red-800' : 'bg-slate-900/40 border-slate-800'}`}>
           <div className="flex items-center space-x-2">
              <span className="text-slate-500">Interface:</span>
              <div className="flex items-center space-x-1">
                {networkType === NetworkType.WIFI ? (
                  <svg className="w-3 h-3 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-12-18h24z"/></svg>
                ) : (
                  <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20v-20z"/></svg>
                )}
                <span className={networkType === NetworkType.WIFI ? 'text-sky-400' : 'text-amber-500'}>{networkType.replace('_', ' ')}</span>
              </div>
           </div>
           <div className="flex items-center space-x-2">
              <span className="text-slate-500">Signal:</span>
              <div className="flex space-x-0.5">
                <div className="w-1 h-1.5 bg-indigo-500"></div>
                <div className="w-1 h-2 bg-indigo-500"></div>
                <div className="w-1 h-2.5 bg-indigo-500"></div>
                <div className="w-1 h-3 bg-indigo-500/30"></div>
              </div>
           </div>
        </div>

        <div className="lg:hidden sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 active:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7"/></svg>
          </button>
          <div className="flex items-center space-x-2">
             <div className={`w-2 h-2 rounded-full animate-pulse ${safetyStatus === SafetyStatus.OVERRIDE ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
             <span className="font-bold text-sm tracking-widest uppercase text-slate-400">
               {currentRoute}
             </span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
