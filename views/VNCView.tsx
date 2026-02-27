
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { SafetyStatus, NetworkType } from '../types';

type VNCMode = 'SSH_BRIDGE' | 'CHROOT_SSH' | 'PROOT_LINK';
type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'AUTHENTICATING' | 'CONNECTED' | 'ERROR';
type AuthMethod = 'PASSWORD' | 'PRIVATE_KEY';

const VNCView: React.FC<{ safetyStatus: SafetyStatus, networkType: NetworkType }> = ({ safetyStatus, networkType }) => {
  const [mode, setMode] = useState<VNCMode>('PROOT_LINK');
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('PASSWORD');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoadingFrame, setIsLoadingFrame] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);
  const [showExtendedKeys, setShowExtendedKeys] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTrackpad, setShowTrackpad] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  
  // Virtual Cursor State
  const [cursorPos, setCursorPos] = useState({ x: 960, y: 540 });
  const trackpadRef = useRef<HTMLDivElement>(null);

  // Connection State
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('22');
  const [user, setUser] = useState('kali');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [chrootPath, setChrootPath] = useState('/mnt/kali_root');

  const logsEndRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [connectionLogs]);

  const addLog = (msg: string) => {
    setConnectionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleConnect = async () => {
    setStatus('CONNECTING');
    setErrorMessage(null);
    setConnectionLogs([]);
    addLog(`INITIATING ${mode} SEQUENCE...`);
    addLog(`TRANSPORT: ${networkType === NetworkType.WIFI ? 'IEEE 802.11 Link' : 'Cellular/LTE-A 5G Link'}`);
    addLog(`RESOLVING TARGET: ${host}...`);
    
    await new Promise(r => setTimeout(r, 800));
    
    if (mode === 'SSH_BRIDGE' || mode === 'CHROOT_SSH') {
      addLog(`SSH-2.0-OpenSSH_9.2p1 Kali-hp1`);
      addLog(`KEX_INIT: Negotiating encryption algorithms...`);
      await new Promise(r => setTimeout(r, 500));
      addLog(`ECDH Key Exchange complete. Server identity verified.`);
      setStatus('AUTHENTICATING');
      addLog(`AUTHENTICATION_REQUEST: Method=${authMethod} User=${user}`);
      
      try {
        await new Promise(r => setTimeout(r, 1500));
        
        if (host === '0.0.0.0') throw new Error("Connection refused: No route to host.");
        
        if (authMethod === 'PRIVATE_KEY' && !privateKey.includes('BEGIN')) {
          throw new Error("Authentication failed: Invalid Private Key format.");
        }
        
        if (authMethod === 'PASSWORD' && !password && host !== '127.0.0.1') {
          throw new Error("Authentication failed: Invalid credentials.");
        }

        if (mode === 'CHROOT_SSH') {
          addLog(`CHROOT_LINK: Accessing jail root at ${chrootPath}...`);
          addLog(`JAIL_VERIFY: Checking for /bin/bash and /etc/shadow...`);
          await new Promise(r => setTimeout(r, 600));
          addLog(`MOUNTING: Binding /proc, /sys, /dev, /dev/pts into jail environment...`);
          await new Promise(r => setTimeout(r, 800));
          addLog(`ENV_SYNC: Mapping X11 socket from host to ${chrootPath}/tmp/.X11-unix...`);
          addLog(`CHROOT_EXEC: Switching root context to ${chrootPath}...`);
        }
        
        if (networkType === NetworkType.MOBILE_DATA) {
          addLog(`DATA_SYNC: Optimizing packet size for cellular jitter...`);
        }

        addLog(`ACCESS_GRANTED: Establishing X11 Tunnel...`);
        addLog(`ALLOCATING_VIRTUAL_FRAMEBUFFER: 1920x1080@60Hz`);
        
        const prompt = mode === 'CHROOT_SSH' 
          ? `Isolated Chroot SSH Session for ${user}@${host} at ${chrootPath}. Kali Linux XFCE desktop environment. The terminal should show a prompt like 'root@chroot-kali:/#'. The background should feature the Kali Dragon logo.`
          : `Remote SSH X11 Session for ${user}@${host}. Standard Kali XFCE Desktop. Show a terminal window open.`;
          
        const sshFrame = await geminiService.generateDesktopFrame(prompt);
        setCurrentFrame(sshFrame);
        setStatus('CONNECTED');
        
        // Simulate network characteristics
        const baseLatency = networkType === NetworkType.WIFI ? 20 : 120;
        setLatency(Math.floor(Math.random() * 40) + baseLatency);
        
        addLog(`CONNECTION_STABLE: Virtual pipe active.`);
      } catch (error: any) {
        setErrorMessage(error.message || "Protocol negotiation failed.");
        addLog(`FATAL: ${error.message || "Connection refused."}`);
        setStatus('ERROR');
      }
    } else if (mode === 'PROOT_LINK') {
      setStatus('AUTHENTICATING');
      addLog(`PROOT_LINK: Searching for local NetHunter socket at ${host}:${port}...`);
      try {
        await new Promise(r => setTimeout(r, 1200));
        addLog(`HANDSHAKE: NetHunter-Rootless v3.0 detected.`);
        addLog(`MAPPING_DMA_BUF: Direct Access enabled.`);
        const frame = await geminiService.generateDesktopFrame(`NetHunter PRoot local desktop for ${user}. Mobile resolution, Kali branding.`);
        setCurrentFrame(frame);
        setStatus('CONNECTED');
        setLatency(networkType === NetworkType.WIFI ? 5 : 45);
        addLog(`LOCAL_BRIDGE_ACTIVE.`);
      } catch (error) {
        setErrorMessage("PRoot bridge unreachable. Check NetHunter service status.");
        addLog(`ERR: Bridge handshake timeout.`);
        setStatus('ERROR');
      }
    }
  };

  const handleSpecialKey = async (key: string) => {
    if (status !== 'CONNECTED' || isLoadingFrame) return;
    setIsLoadingFrame(true);
    addLog(`SIGNAL_INJECTION: Key="${key}"`);
    const start = Date.now();
    try {
      const prompt = `User pressed "${key}" on the remote desktop. Update visuals to show feedback. Current cursor position is (${cursorPos.x}, ${cursorPos.y}).`;
      const newFrame = await geminiService.generateDesktopFrame(prompt);
      setCurrentFrame(newFrame);
      setLatency(Date.now() - start);
    } catch (error) {
      addLog(`ERR: Signal loss during relay.`);
    } finally {
      setIsLoadingFrame(false);
    }
  };

  const performClick = useCallback(async (type: 'left' | 'right' | 'middle' = 'left', x = cursorPos.x, y = cursorPos.y) => {
    if (status !== 'CONNECTED' || isLoadingFrame) return;
    setIsLoadingFrame(true);
    addLog(`INPUT_EVENT: ${type.toUpperCase()}_CLICK(${x}, ${y})`);
    const start = Date.now();
    try {
      const prompt = `User performed a ${type} click at (${x}, ${y}) on the remote ${mode} desktop. Update the desktop state accordingly.`;
      const newFrame = await geminiService.generateDesktopFrame(prompt);
      setCurrentFrame(newFrame);
      setLatency(Date.now() - start);
    } catch (error) {
      addLog(`ERR: Click sync lost.`);
    } finally {
      setIsLoadingFrame(false);
    }
  }, [status, isLoadingFrame, cursorPos, mode]);

  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    const relX = Math.round((x / rect.width) * 1920);
    const relY = Math.round((y / rect.height) * 1080);
    
    setCursorPos({ x: relX, y: relY });
    await performClick('left', relX, relY);
  };

  const handleTrackpadMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!trackpadRef.current) return;
    const rect = trackpadRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    setCursorPos({
      x: Math.round(x * 1920),
      y: Math.round(y * 1080)
    });
  };

  const handleClipboard = async (action: 'cut' | 'copy' | 'paste') => {
    if (status !== 'CONNECTED' || isLoadingFrame) return;
    setIsLoadingFrame(true);
    addLog(`CLIPBOARD_EVENT: ${action.toUpperCase()}`);
    const start = Date.now();
    try {
      let prompt = '';
      if (action === 'cut') prompt = `The user triggered a "Cut" operation (Ctrl+X) on the remote desktop at (${cursorPos.x}, ${cursorPos.y}). Update desktop visuals.`;
      if (action === 'copy') prompt = `The user triggered a "Copy" operation (Ctrl+C) on the remote desktop at (${cursorPos.x}, ${cursorPos.y}). Update desktop visuals.`;
      if (action === 'paste') prompt = `The user triggered a "Paste" operation (Ctrl+V) on the remote desktop at (${cursorPos.x}, ${cursorPos.y}). Show text being pasted if relevant.`;
      
      const newFrame = await geminiService.generateDesktopFrame(prompt);
      setCurrentFrame(newFrame);
      setLatency(Date.now() - start);
    } catch (error) {
      addLog(`ERR: Clipboard sync failure.`);
    } finally {
      setIsLoadingFrame(false);
    }
  };

  const handleSystemPaste = async () => {
    if (status !== 'CONNECTED' || isLoadingFrame || isPasting) return;
    setIsPasting(true);
    addLog(`CLIPBOARD_SYNC: Accessing local system buffer...`);
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        addLog(`CLIPBOARD_WARN: Buffer empty.`);
        return;
      }
      addLog(`CLIPBOARD_DATA: Injecting ${text.length} characters...`);
      setIsLoadingFrame(true);
      const prompt = `The user is pasting the following text from their host machine into the remote Kali session at cursor (${cursorPos.x}, ${cursorPos.y}): "${text}". Update the terminal/editor on screen to show the content.`;
      const newFrame = await geminiService.generateDesktopFrame(prompt);
      setCurrentFrame(newFrame);
    } catch (error) {
      addLog(`CLIPBOARD_ERR: Permission denied or protocol mismatch.`);
    } finally {
      setIsPasting(false);
      setIsLoadingFrame(false);
    }
  };

  const sendInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoadingFrame || status !== 'CONNECTED') return;

    const cmd = input;
    setInput('');
    setIsLoadingFrame(true);
    addLog(`KBD_INJECT: "${cmd}"`);
    const start = Date.now();
    try {
      const prompt = `User typed the following text into the remote Kali session at cursor position (${cursorPos.x}, ${cursorPos.y}): "${cmd}". Update the screen to reflect the typed text.`;
      const newFrame = await geminiService.generateDesktopFrame(prompt);
      setCurrentFrame(newFrame);
      setLatency(Date.now() - start);
    } catch (error) {
      addLog(`ERR: Injection failure.`);
    } finally {
      setIsLoadingFrame(false);
    }
  };

  const fKeys = Array.from({ length: 12 }, (_, i) => `F${i + 1}`);
  const navKeys = ['Home', 'End', 'PgUp', 'PgDn', 'Ins', 'Del'];

  const statusInfo = {
    CONNECTING: { text: 'HANDSHAKING...', color: 'text-amber-400', bg: 'bg-amber-500/10', pulse: true, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    AUTHENTICATING: { text: 'CHALLENGING...', color: 'text-indigo-400', bg: 'bg-indigo-500/10', pulse: true, icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    CONNECTED: { text: 'LINK_ESTABLISHED', color: 'text-emerald-400', bg: 'bg-emerald-500/10', pulse: false, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    ERROR: { text: 'LINK_SEVERED', color: 'text-rose-500', bg: 'bg-rose-500/10', pulse: false, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    DISCONNECTED: { text: 'IDLE', color: 'text-slate-500', bg: 'bg-slate-500/10', pulse: false, icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' }
  }[status];

  return (
    <div className={`h-[calc(100vh-10rem)] bg-slate-950 rounded-2xl border flex flex-col overflow-hidden shadow-2xl relative transition-all duration-500 ${status === 'CONNECTED' ? (mode === 'CHROOT_SSH' ? 'border-violet-500/50' : 'border-indigo-500/50') : 'border-slate-800'}`}>
      
      {/* HUD Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${status === 'CONNECTED' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-950 border-slate-900'}`}>
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${statusInfo.bg} ${statusInfo.color.replace('text-', 'border-').replace('400', '400/30').replace('500', '500/30')}`}>
             <svg className={`w-5 h-5 ${statusInfo.color} ${statusInfo.pulse ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusInfo.icon} />
             </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${statusInfo.color} ${statusInfo.pulse ? 'animate-pulse' : ''}`}>
                {statusInfo.text}
              </span>
              {status === 'CONNECTED' && (
                <div className="flex items-center space-x-1 ml-2">
                   <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                   <span className="text-[9px] font-mono text-emerald-500/70">SYNC_OK</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-mono tracking-tighter truncate max-w-[180px]">
              {status === 'CONNECTED' ? `${user}@${host}:${port}` : 'Waiting for connection initialization...'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {status === 'CONNECTED' && (
            <div className="flex items-center space-x-4">
               <div className="hidden sm:flex items-center bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mr-2">Link:</span>
                  <div className="flex items-center space-x-1.5">
                    {networkType === NetworkType.WIFI ? (
                       <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-12-18h24z"/></svg>
                    ) : (
                       <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20v-20z"/></svg>
                    )}
                    <span className="text-[10px] font-mono text-indigo-400">{latency ? `${latency}ms` : '--'}</span>
                  </div>
               </div>
            </div>
          )}
          {status !== 'DISCONNECTED' && (
            <button onClick={() => setStatus('DISCONNECTED')} className="p-2 bg-rose-600/10 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {(status === 'DISCONNECTED' || status === 'ERROR') ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900 overflow-y-auto custom-scrollbar">
          {status === 'ERROR' && (
            <div className="mb-8 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl max-w-sm animate-in zoom-in">
               <p className="text-rose-400 text-xs font-mono uppercase tracking-widest mb-1">Critical Fail</p>
               <p className="text-white text-sm">{errorMessage}</p>
            </div>
          )}
          
          <div className="bg-slate-800 p-1 rounded-2xl mb-8 w-full max-w-md flex border border-slate-700">
            {['PROOT_LINK', 'SSH_BRIDGE', 'CHROOT_SSH'].map(m => (
              <button key={m} onClick={() => setMode(m as VNCMode)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                {m.split('_')[0]}
              </button>
            ))}
          </div>
          
          <div className="w-full max-w-sm space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3 text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Target Host</label>
                <input value={host} onChange={e => setHost(e.target.value)} className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm text-indigo-400 focus:border-indigo-500 transition-colors" />
              </div>
              <div className="text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Port</label>
                <input value={port} onChange={e => setPort(e.target.value)} className="w-full bg-black border border-slate-800 rounded-xl px-2 py-3 text-sm text-center text-indigo-400" />
              </div>
            </div>

            <div className="text-left">
              <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">User</label>
              <input value={user} onChange={e => setUser(e.target.value)} className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm text-indigo-400" />
            </div>

            {mode === 'CHROOT_SSH' && (
              <div className="text-left animate-in fade-in slide-in-from-top-2 border-l-2 border-violet-500 pl-4 py-1">
                <label className="text-[10px] text-violet-400 font-bold uppercase ml-1">Jail Path</label>
                <input value={chrootPath} onChange={e => setChrootPath(e.target.value)} className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm text-violet-300 font-mono" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => setAuthMethod('PASSWORD')} className={`py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${authMethod === 'PASSWORD' ? 'bg-slate-700 border-indigo-500 text-white' : 'border-slate-800 text-slate-500'}`}>Password</button>
               <button onClick={() => setAuthMethod('PRIVATE_KEY')} className={`py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${authMethod === 'PRIVATE_KEY' ? 'bg-slate-700 border-indigo-500 text-white' : 'border-slate-800 text-slate-500'}`}>SSH Key</button>
            </div>

            {authMethod === 'PASSWORD' ? (
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="PASSWORD" className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm text-indigo-400" />
            ) : (
              <textarea value={privateKey} onChange={e => setPrivateKey(e.target.value)} placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-[10px] text-emerald-500 font-mono h-24 resize-none" />
            )}

            <button onClick={handleConnect} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs mt-4 shadow-xl active:scale-95 transition-all">
              Initialize_Link
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
            {/* Connection Handshake Overlay */}
            {(status === 'CONNECTING' || status === 'AUTHENTICATING') && (
              <div className="absolute inset-0 z-40 bg-slate-950 p-8 font-mono text-[11px] text-emerald-400 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="mb-6 flex items-center justify-between border-b border-emerald-900/30 pb-4">
                   <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                      <span className="font-black uppercase tracking-[0.2em]">Negotiating Virtual Tunnel</span>
                   </div>
                   <span className="text-slate-600 font-bold uppercase text-[9px]">IFACE: {networkType} | MTU: 1500</span>
                </div>
                <div className="space-y-1.5 opacity-80">
                  {connectionLogs.map((log, i) => <div key={i} className="animate-in fade-in slide-in-from-left-4 duration-300">{log}</div>)}
                </div>
                <div className="mt-auto pt-8 flex items-center justify-center">
                   <div className="flex flex-col items-center">
                      <div className="flex space-x-1 mb-2">
                        {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                      </div>
                      <span className="text-[9px] uppercase tracking-widest font-black opacity-40 italic text-center">Awaiting peer response...</span>
                   </div>
                </div>
                <div ref={logsEndRef} />
              </div>
            )}

            {/* Desktop Canvas */}
            {currentFrame && status === 'CONNECTED' && (
              <div className="relative group h-full w-full flex items-center justify-center bg-slate-900 overflow-hidden">
                <img ref={imageRef} src={currentFrame} onClick={handleImageClick} className={`max-w-full max-h-full object-contain transition-all duration-300 ${isLoadingFrame ? 'opacity-20 blur-md scale-95 grayscale' : 'scale-100'}`} />
                
                {/* Virtual Cursor Indicator */}
                <div 
                  className="absolute pointer-events-none transition-all duration-200 ease-out z-30"
                  style={{ 
                    left: `${(cursorPos.x / 1920) * 100}%`, 
                    top: `${(cursorPos.y / 1080) * 100}%`,
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 border-2 border-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                       <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute top-5 left-5 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-white whitespace-nowrap border border-white/10">
                      {cursorPos.x}, {cursorPos.y}
                    </div>
                  </div>
                </div>

                {/* Overlays */}
                {showOverlays && !isLoadingFrame && (
                  <div className="absolute left-4 bottom-20 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {['Esc', 'Tab', 'Ctrl', 'Alt', 'Super'].map(k => (
                      <button key={k} onClick={() => handleSpecialKey(k)} className="w-11 h-11 bg-slate-900/90 border border-slate-700 rounded-2xl text-[9px] font-black text-white hover:bg-indigo-600 transition-all shadow-xl active:scale-90 flex items-center justify-center backdrop-blur-md uppercase tracking-tighter">{k}</button>
                    ))}
                    <button onClick={() => handleSpecialKey('Ctrl+C')} className="w-11 h-11 bg-rose-600/90 border border-rose-500 rounded-2xl text-[9px] font-black text-white hover:bg-rose-500 transition-all shadow-xl active:scale-90 flex items-center justify-center backdrop-blur-md">^C</button>
                  </div>
                )}

                {/* HUD Elements */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className={`bg-black/70 px-4 py-2 rounded-xl border border-white/10 text-[9px] font-black tracking-[0.2em] shadow-2xl backdrop-blur-xl flex items-center ${mode === 'CHROOT_SSH' ? 'text-violet-400 border-violet-500/30' : 'text-emerald-400 border-emerald-500/30'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2.5 animate-ping ${mode === 'CHROOT_SSH' ? 'bg-violet-500' : 'bg-emerald-500'}`}></span>
                    {mode.replace('_', ' ')}
                  </div>
                  <button onClick={() => setShowOverlays(!showOverlays)} className="bg-black/70 p-2.5 rounded-xl border border-white/10 text-white hover:bg-slate-800 transition-colors backdrop-blur-xl shadow-2xl">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>

                {/* Virtual Trackpad Overlay */}
                {showTrackpad && (
                  <div className="absolute right-4 bottom-20 w-64 h-48 bg-slate-900/95 rounded-3xl border border-indigo-500/40 p-1 flex flex-col shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right-10 overflow-hidden">
                    <div 
                      ref={trackpadRef}
                      onMouseMove={(e) => e.buttons === 1 && handleTrackpadMove(e)}
                      onTouchMove={handleTrackpadMove}
                      onMouseDown={handleTrackpadMove}
                      className="flex-1 rounded-2xl bg-black cursor-none relative overflow-hidden group/pad"
                    >
                      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #6366f1 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-indigo-500/50 uppercase tracking-widest">Precision_Trackpad</div>
                      {/* Local cursor preview on trackpad */}
                      <div 
                        className="absolute w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"
                        style={{ left: `${(cursorPos.x / 1920) * 100}%`, top: `${(cursorPos.y / 1080) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex h-12 p-1 space-x-1">
                      <button onMouseDown={() => performClick('left')} className="flex-1 bg-slate-800 hover:bg-indigo-600 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">L</button>
                      <button onMouseDown={() => performClick('middle')} className="w-12 bg-slate-800 hover:bg-amber-600 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">M</button>
                      <button onMouseDown={() => performClick('right')} className="flex-1 bg-slate-800 hover:bg-indigo-600 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">R</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Syncing State */}
            {isLoadingFrame && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="bg-slate-950/90 px-10 py-6 rounded-[2.5rem] border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex flex-col items-center backdrop-blur-xl">
                  <div className="relative mb-6">
                    <svg className="animate-spin h-10 w-10 text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">SYNC</div>
                  </div>
                  <div className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mb-1">Synchronizing</div>
                  <div className="text-[8px] text-slate-500 font-mono uppercase italic">Refining Pixel Buffer...</div>
                </div>
              </div>
            )}
          </div>

          {/* Controller Area */}
          <div className="bg-slate-950 border-t border-slate-900">
            <div className="flex items-center space-x-2 p-2 overflow-x-auto custom-scrollbar no-scrollbar">
              <button onClick={() => setShowTrackpad(!showTrackpad)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 flex items-center space-x-2 ${showTrackpad ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.22 0 2.383.218 3.46.616m.835 1.908c.256.351.496.722.718 1.111m.445 4.131A8.939 8.939 0 0118 10.197m0 0A8.939 8.939 0 0118 10.197m0 0a8.939 8.939 0 01-1.891 5.423M7 12c0 1.25.32 2.425.882 3.444" /></svg>
                <span>Trackpad</span>
              </button>
              <button onClick={() => setShowExtendedKeys(!showExtendedKeys)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${showExtendedKeys ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Tools</button>
              
              <div className="h-4 w-px bg-slate-800 shrink-0"></div>
              
              {/* Clipboard Quick Actions */}
              <div className="flex space-x-1 shrink-0">
                <button onClick={() => handleClipboard('cut')} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold hover:bg-rose-600 transition-colors uppercase">Cut</button>
                <button onClick={() => handleClipboard('copy')} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold hover:bg-indigo-600 transition-colors uppercase">Copy</button>
                <button onClick={() => handleClipboard('paste')} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold hover:bg-emerald-600 transition-colors uppercase">Paste</button>
                <button 
                  onClick={handleSystemPaste} 
                  disabled={isPasting}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-sky-400 font-black hover:bg-sky-600 hover:text-white transition-all uppercase flex items-center space-x-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  <span>Host_Buffer</span>
                </button>
              </div>

              <div className="h-4 w-px bg-slate-800 shrink-0"></div>

              {showExtendedKeys ? (
                <>
                  <div className="flex space-x-1">
                    {fKeys.map(fk => (
                      <button key={fk} onClick={() => handleSpecialKey(fk)} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold hover:bg-indigo-600 transition-colors shrink-0 uppercase">{fk}</button>
                    ))}
                  </div>
                  <div className="h-4 w-px bg-slate-800 shrink-0"></div>
                  <div className="flex space-x-1">
                    {navKeys.map(nk => (
                      <button key={nk} onClick={() => handleSpecialKey(nk)} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold hover:bg-emerald-600 transition-colors shrink-0 uppercase">{nk}</button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex space-x-1">
                  {['Tab', '↑', '↓', '←', '→', 'Enter'].map(k => (
                    <button key={k} onClick={() => handleSpecialKey(k)} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-bold hover:bg-slate-800 transition-colors shrink-0">{k}</button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-900/40 border-t border-slate-900 backdrop-blur-md">
              <form onSubmit={sendInteraction} className="flex space-x-3">
                <div className="flex-1 relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-indigo-500/50">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                   </div>
                   <input value={input} onChange={e => setInput(e.target.value)} placeholder="TYPE REMOTE COMMAND OR TEXT HERE..." className="w-full bg-black border border-slate-800 rounded-2xl pl-10 pr-5 py-4 text-xs text-emerald-500 font-mono focus:outline-none focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-800 placeholder:font-black tracking-widest" />
                </div>
                <button type="submit" disabled={isLoadingFrame || !input.trim()} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-8 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">Send Input</button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VNCView;
