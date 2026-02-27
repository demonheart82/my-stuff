
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { SafetyStatus, SecurityMode } from '../types';

interface GUITool {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  category: string;
  modes: SecurityMode[];
  isService?: boolean;
  serviceName?: string;
  hasPreview?: boolean;
}

const TOOLS: GUITool[] = [
  // --- RED TEAM TOOLS ---
  { 
    id: 'nmap-gui', 
    name: 'Nmap Visualizer', 
    category: 'Information Gathering',
    modes: [SecurityMode.RED_TEAM, SecurityMode.BLUE_TEAM],
    description: 'Graphical Nmap interface with radar and service tables.', 
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', 
    prompt: 'A high-tech Nmap graphical interface. Shows a circular radar scanning the network, a list of discovered hosts on the left, and a detailed port table (Port, State, Service, Version) in the center. Glowing cyan and white accents on a dark slate background.',
    isService: false
  },
  { 
    id: 'set-toolkit', 
    name: 'SET Dashboard', 
    category: 'Social Engineering',
    modes: [SecurityMode.RED_TEAM],
    description: 'Phishing campaign & credential harvester.', 
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', 
    prompt: 'A dark hacker-themed dashboard for the Social Engineering Toolkit (SET). Shows "Active Lures" in a sidebar and glowing dots for victim IPs.',
    isService: true,
    serviceName: 'setoolkit'
  },
  { 
    id: 'msf-exploit-lab', 
    name: 'Metasploit Console', 
    category: 'Exploitation',
    modes: [SecurityMode.RED_TEAM],
    description: 'Visual exploit execution & stack monitor.', 
    icon: 'M13 10V3L4 14h7v7l9-11h-7z', 
    prompt: 'A Metasploit exploitation interface showing memory stack diagrams and successful meterpreter session spawns.',
    isService: true,
    serviceName: 'msfconsole'
  },
  { 
    id: 'apache-control', 
    name: 'Apache Web Server', 
    category: 'Infrastructure',
    modes: [SecurityMode.BLUE_TEAM, SecurityMode.RED_TEAM],
    description: 'Control host Apache2 server for lures or hosting.', 
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', 
    prompt: 'Apache management console showing server status, port 80/443 activity, and access log stream.',
    isService: true,
    serviceName: 'apache2',
    hasPreview: true
  },
  { 
    id: 'wireshark', 
    name: 'Wireshark Live', 
    category: 'Sniffing',
    modes: [SecurityMode.RED_TEAM, SecurityMode.BLUE_TEAM],
    description: 'Monitor network packets in real-time.', 
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
    prompt: 'Wireshark packet stream with highlighted TCP handshakes and TLS decryption status.' 
  }
];

const GUITools: React.FC<{ safetyStatus: SafetyStatus, currentSecurityMode: SecurityMode }> = ({ safetyStatus, currentSecurityMode }) => {
  const [activeTool, setActiveTool] = useState<GUITool | null>(null);
  const [frame, setFrame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tacticalLogs, setTacticalLogs] = useState<string[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<Record<string, 'ACTIVE' | 'INACTIVE' | 'PENDING'>>({});
  
  const isOverride = safetyStatus === SafetyStatus.OVERRIDE;
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [tacticalLogs]);

  useEffect(() => {
    const checkServices = async () => {
      const statuses: any = {};
      for (const tool of TOOLS) {
        if (tool.serviceName) {
          try {
            const result = await geminiService.executeVirtualCommand(`service ${tool.serviceName} status | grep Active`);
            statuses[tool.id] = result.output.includes('running') || result.output.includes('active') ? 'ACTIVE' : 'INACTIVE';
          } catch {
            statuses[tool.id] = 'INACTIVE';
          }
        }
      }
      setServiceStatus(statuses);
    };

    const interval = setInterval(checkServices, 10000);
    checkServices();
    return () => clearInterval(interval);
  }, []);

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => tool.modes.includes(currentSecurityMode));
  }, [currentSecurityMode]);

  const addLog = (msg: string) => {
    setTacticalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-50));
  };

  const launchTool = async (tool: GUITool) => {
    setActiveTool(tool);
    setIsLoading(true);
    setFrame(null);
    setShowPreview(false);
    setTacticalLogs([]);
    addLog(`INIT_SEQUENCE: Mode=${isLiveMode ? 'LIVE_HOST' : 'VIRTUAL_SIM'} Target=${tool.name}`);
    
    try {
      const toolFrame = await geminiService.generateDesktopFrame(
        isLiveMode 
          ? `Fully functional, high-fidelity UI for ${tool.name} in operational mode. ${tool.prompt}` 
          : `Educational virtual tutorial interface for ${tool.name}. Highlight key features with training overlays. ${tool.prompt}`
      );
      setFrame(toolFrame);
      
      if (isLiveMode && tool.isService) {
        addLog(`HOST_BRIDGE: Establishing control pipe to ${tool.serviceName}...`);
        const result = await geminiService.executeVirtualCommand(
          tool.id === 'apache-control' ? 'tail -n 10 /var/log/apache2/access.log' :
          tool.id === 'set-toolkit' ? 'setoolkit --help | head -n 5' : 
          'msfconsole -v'
        );
        addLog(result.output);
      } else if (!isLiveMode) {
        addLog(`SIM_ENGINE: Loading virtual sandbox for training...`);
        addLog(`V-MODULE: ${tool.name} ready for demonstration.`);
      }
    } catch (e) {
      addLog(`ERR: Session initialization failed.`);
    } finally {
      setIsLoading(false);
    }
  };

  const executeServiceAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!activeTool || !activeTool.serviceName) return;
    if (!isLiveMode) {
      addLog(`VIRTUAL_ACTION: Simulated ${action} for ${activeTool.name} training.`);
      return;
    }
    addLog(`LIVE_ACTION: Executing sudo service ${activeTool.serviceName} ${action}`);
    setIsLoading(true);
    try {
      const result = await geminiService.executeVirtualCommand(`sudo service ${activeTool.serviceName} ${action}`);
      addLog(result.output || `Successfully executed ${action}.`);
    } catch (e) {
      addLog(`ERR: Privilege violation or bridge severed.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      addLog(`PREVIEW: Establishing HTTP tunnel to virtual browser...`);
    }
  };

  const themeColor = isOverride ? 'red' : 
                    currentSecurityMode === SecurityMode.BLUE_TEAM ? 'sky' : 
                    currentSecurityMode === SecurityMode.RED_TEAM ? 'rose' : 'violet';

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isOverride ? 'glitch-mode' : ''}`}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className={`text-4xl font-black uppercase tracking-tighter text-${themeColor}-400`}>
            {isOverride ? 'Master Control Hub' : `${currentSecurityMode.replace('_', ' ')} GUI`}
          </h1>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mt-2">
            Integrated Hub for Host-Linked Services and Virtual Training Modules.
          </p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
           <button 
             onClick={() => setIsLiveMode(false)}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${!isLiveMode ? `bg-${themeColor}-600 text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
           >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             <span>Virtual Mode</span>
           </button>
           <button 
             onClick={() => setIsLiveMode(true)}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${isLiveMode ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             <span>Operational Live</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Available Modules</h2>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border border-${themeColor}-800/50 text-${themeColor}-500/50 bg-${themeColor}-900/10`}>
              {filteredTools.length} Total
            </span>
          </div>
          
          <div className="flex flex-col space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredTools.map(tool => {
              const isActive = activeTool?.id === tool.id;
              const isOnline = serviceStatus[tool.id] === 'ACTIVE';
              
              return (
                <button
                  key={tool.id}
                  onClick={() => launchTool(tool)}
                  className={`p-3.5 rounded-2xl border text-left transition-all group relative overflow-hidden ${isActive 
                    ? `bg-${themeColor}-600 border-${themeColor}-500 text-white shadow-lg` 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center space-x-3 relative z-10">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-white/20' : `bg-${themeColor}-900/30`}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-tight truncate pr-2">{tool.name}</h3>
                        {tool.serviceName && isLiveMode && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                        )}
                      </div>
                      <p className={`text-[9px] font-mono opacity-50 uppercase ${isActive ? 'text-white' : ''}`}>{tool.category}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`lg:col-span-3 min-h-[600px] rounded-[2.5rem] border flex flex-col relative overflow-hidden transition-all duration-700 ${activeTool ? 'bg-black border-slate-800' : 'bg-slate-900/40 border-slate-800 shadow-2xl'}`}>
          {!activeTool ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-600">
               <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-slate-800 flex items-center justify-center mb-8 text-slate-800 animate-pulse">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
               </div>
               <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-3 text-slate-500">Master Console IDLE</h3>
               <p className="max-w-xs text-xs uppercase tracking-widest leading-loose">Initialize module to engage virtual sandbox or host operational bridge.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
               <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between backdrop-blur-xl">
                  <div className="flex items-center space-x-4">
                     <div className={`w-3 h-3 rounded-full ${isLiveMode && serviceStatus[activeTool.id] === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : !isLiveMode ? 'bg-sky-500 shadow-[0_0_8px_#0ea5e9]' : 'bg-slate-700'}`}></div>
                     <div className="flex flex-col">
                       <span className={`text-[11px] font-black uppercase tracking-[0.3em] text-${themeColor}-400`}>
                         {activeTool.name} : {isLiveMode ? 'OPERATIONAL' : 'VIRTUAL_LAB'}
                       </span>
                       <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                         Session: {Math.random().toString(16).slice(2, 10).toUpperCase()} | Mode: {isLiveMode ? 'REAL_TIME' : 'SIMULATED'}
                       </span>
                     </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {activeTool.hasPreview && (
                      <button 
                        onClick={handlePreviewToggle}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 border ${showPreview ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                         <span>{showPreview ? 'Close Preview' : 'HTTP Preview'}</span>
                      </button>
                    )}
                    {activeTool.isService && (
                      <div className="flex bg-black/60 p-1 rounded-xl border border-white/5">
                         <button onClick={() => executeServiceAction('start')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></button>
                         <button onClick={() => executeServiceAction('stop')} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg></button>
                         <button onClick={() => executeServiceAction('restart')} className="p-2 text-sky-500 hover:bg-sky-500/10 rounded-lg transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                      </div>
                    )}
                  </div>
               </div>
               
               <div className="flex-1 flex flex-col min-h-0">
                  <div className="h-3/5 relative group overflow-hidden border-b border-slate-900 bg-slate-950">
                    {isLoading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <svg className={`animate-spin h-12 w-12 mb-4 text-${themeColor}-500`} viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 animate-pulse">Synchronizing Buffer...</span>
                      </div>
                    ) : showPreview ? (
                      <div className="w-full h-full bg-slate-100 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                         <div className="bg-slate-200 p-2 flex items-center space-x-2 border-b border-slate-300">
                            <div className="flex space-x-1">
                               <div className="w-2.5 h-2.5 bg-rose-400 rounded-full"></div>
                               <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
                               <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                            </div>
                            <div className="flex-1 bg-white rounded-lg px-3 py-1 text-[11px] font-mono text-slate-500 flex items-center">
                               <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                               http://localhost:80
                            </div>
                         </div>
                         <div className="flex-1 overflow-y-auto bg-white p-8">
                            <h2 className="text-2xl font-black text-slate-800 mb-4">It Works!</h2>
                            <p className="text-slate-600 mb-4">This is the default web page for the Apache HTTP server on this system.</p>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                               <p className="text-xs text-slate-500 italic">Previewing active lure/landing page from the linked host.</p>
                            </div>
                         </div>
                      </div>
                    ) : frame ? (
                      <div className="w-full h-full relative">
                        <img src={frame} alt="Tool Simulation" className="w-full h-full object-cover opacity-90 transition-all group-hover:scale-[1.01]" />
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_#ffffff10_0%,_transparent_70%)]"></div>
                      </div>
                    ) : null}
                    
                    {!showPreview && (
                      <div className="absolute top-6 left-6 flex flex-col space-y-2">
                        <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 text-[9px] font-mono text-white/50 uppercase tracking-widest shadow-2xl">
                            STATUS: {isLiveMode ? 'CONNECTED' : 'EMULATED'}
                        </div>
                        {!isLiveMode && (
                          <div className="bg-sky-600/20 backdrop-blur-xl px-4 py-2 rounded-xl border border-sky-500/30 text-[9px] font-black text-sky-400 uppercase tracking-[0.2em] shadow-2xl">
                              Learning Overlay Active
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="h-2/5 bg-slate-950 p-6 flex flex-col min-h-0 border-t border-slate-900">
                     <div className="flex items-center justify-between mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 border-b border-white/5 pb-3">
                        <span>{isLiveMode ? 'Tactical Host STDOUT' : 'Simulated Sandbox Log'}</span>
                        <div className="flex items-center space-x-2">
                           <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isLiveMode ? 'bg-amber-500' : 'bg-sky-500'}`}></div>
                           <span>ACTIVE_PIPE</span>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar scroll-smooth font-mono text-[11px]">
                        {tacticalLogs.length === 0 ? (
                           <div className="text-slate-800 italic uppercase">Awaiting operational buffer...</div>
                        ) : (
                          tacticalLogs.map((log, i) => (
                            <div key={i} className={`whitespace-pre-wrap ${log.includes('ERR') || log.includes('error') ? 'text-rose-500' : log.includes('[') ? 'text-slate-700' : isLiveMode ? 'text-emerald-400 opacity-90' : 'text-sky-400/80'}`}>
                               {log}
                            </div>
                          ))
                        )}
                        <div ref={logEndRef} />
                     </div>
                  </div>
               </div>
               
               <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 grid grid-cols-3 gap-8">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Link Engine</span>
                    <span className={`text-[10px] font-mono ${isLiveMode ? 'text-amber-500' : 'text-sky-500'}`}>
                      {isLiveMode ? 'KALI_UNBOUND_BRIDGE' : 'VIRTUAL_LAB_SANDBOX'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Latency</span>
                    <span className="text-[10px] font-mono text-indigo-400">
                      {isLiveMode ? '0.04ms (LOCAL)' : 'AI_THINKING_LAG'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Target Mode</span>
                    <span className="text-[10px] font-mono text-indigo-400">
                      {currentSecurityMode.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GUITools;
