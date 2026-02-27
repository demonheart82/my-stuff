
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { SafetyStatus, NetworkType } from '../types';

interface LogLine {
  type: 'input' | 'output' | 'error' | 'system' | 'host';
  content: string;
}

const TerminalView: React.FC<{ safetyStatus: SafetyStatus, networkType: NetworkType }> = ({ safetyStatus, networkType }) => {
  const isOverride = safetyStatus === SafetyStatus.OVERRIDE;
  const isMobile = networkType === NetworkType.MOBILE_DATA;
  
  const [history, setHistory] = useState<LogLine[]>([
    { type: 'system', content: '>>> [KALI_PROOT_LINK] v1.3.0 INITIALIZED' },
    { type: 'system', content: `>>> PROTOCOL: ${isOverride ? 'UNFILTERED_OVERRIDE' : 'STRICT_ETHICAL'}` },
    { type: 'system', content: `>>> INTERFACE: ${isMobile ? 'MOBILE_DATA (LTE/5G)' : 'WiFi (Gigabit)'}` },
    { type: 'system', content: '>>> Type "settings" to link real host hook.' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [hookUrl, setHookUrl] = useState('http://localhost:8080');
  const [showSettings, setShowSettings] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  useEffect(() => {
    if (isOverride) {
      setHistory(prev => [...prev, { type: 'system', content: '!!! DANGER: RESTRAINT_NULLIFIED_BY_ADMIN !!!' }]);
    }
  }, [isOverride]);

  useEffect(() => {
    setHistory(prev => [...prev, { type: 'system', content: `>>> NETWORK_CHANGE: Switched to ${networkType.toUpperCase()}` }]);
  }, [networkType]);

  const toggleLive = () => {
    const newState = !isLive;
    setIsLive(newState);
    geminiService.setHookUrl(newState ? hookUrl : null);
    setHistory(prev => [...prev, { 
      type: 'system', 
      content: newState ? `>>> [!] ACTIVE HOST BRIDGE ENABLED: ${hookUrl}` : '>>> [!] BRIDGE TERMINATED. Switching to PRoot-AI Analyst.' 
    }]);
  };

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    if (trimmedCmd === 'settings') {
      setShowSettings(true);
      setInput('');
      return;
    }

    setHistory(prev => [...prev, { type: 'input', content: `${isLive ? 'root' : 'kali'}@${isLive ? 'nethunter' : 'proot'}:~$ ${trimmedCmd}` }]);
    setCommandHistory(prev => [trimmedCmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);
    setInput('');

    if (trimmedCmd === 'clear') {
      setHistory([]);
      return;
    }

    setIsProcessing(true);
    const start = Date.now();
    try {
      const result = await geminiService.executeVirtualCommand(trimmedCmd);
      const endLatency = Date.now() - start;
      setLatency(endLatency);
      
      setHistory(prev => [
        ...prev, 
        { 
          type: result.source === 'HOST' ? 'host' : 'output', 
          content: `${result.output}${result.source === 'HOST' ? `\n\n[LINK_STATS: ${endLatency}ms]` : ''}` 
        }
      ]);
    } catch (err) {
      setHistory(prev => [...prev, { type: 'error', content: 'BRIDGE_TIMEOUT: Protocol bridge severed.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCommand(input);
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className={`h-[calc(100vh-10rem)] bg-black rounded-xl border transition-all duration-500 flex flex-col overflow-hidden font-mono shadow-2xl relative ${isOverride ? 'border-red-600 ring-2 ring-red-600/20' : isLive ? 'border-emerald-500/40 ring-1 ring-emerald-500/10' : 'border-slate-800'}`}>
      
      {isOverride && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse z-10"></div>
      )}

      {showSettings && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm space-y-6 shadow-2xl">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              PRoot Bridge Setup
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Relay Endpoint (Termux)</label>
              <input 
                value={hookUrl} 
                onChange={(e) => setHookUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-emerald-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={() => { setShowSettings(false); if (!isLive) toggleLive(); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-indigo-500 shadow-lg shadow-indigo-600/20">Sync Link</button>
            </div>
          </div>
        </div>
      )}

      <div className={`px-4 py-2 border-b flex items-center justify-between transition-colors duration-500 ${isOverride ? 'bg-red-950/40 border-red-900/40' : 'bg-slate-900/80 border-slate-800 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOverride ? 'bg-red-500 animate-pulse' : isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
            <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-500 ${isOverride ? 'text-red-500 glitch-mode' : isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isOverride ? 'RESTRAINT_NULLIFIED' : isLive ? 'NETHUNTER_SYNC' : 'PROOT_AI_ANALYST'}
            </span>
          </div>
          <button onClick={() => setShowSettings(true)} className="text-[9px] text-slate-400 hover:text-white uppercase font-bold border border-slate-700 px-3 py-1 rounded bg-slate-800 transition-all">Config</button>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-600">
           <div className="flex items-center space-x-1">
              {isMobile ? (
                <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20v-20z"/></svg>
              ) : (
                <svg className="w-3 h-3 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-12-18h24z"/></svg>
              )}
              <span>{isMobile ? 'MOBILE' : 'WIFI'}</span>
           </div>
           {isLive && <span>{latency ? `${latency}ms` : '--'}</span>}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 text-[13px] leading-relaxed scroll-smooth"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap mb-1.5 font-mono ${
            line.type === 'input' ? 'text-slate-100 font-bold border-l-2 border-slate-700 pl-3 ml-1' :
            line.type === 'error' ? 'text-rose-400 font-bold bg-rose-900/10 p-2 rounded border border-rose-900/20' :
            line.type === 'host' ? 'text-emerald-400 pl-1' :
            line.type === 'system' ? 'text-slate-500 italic text-[11px] opacity-60' : 
            isOverride ? 'text-red-400 pl-1 drop-shadow-[0_0_2px_rgba(220,38,38,0.3)]' : 'text-indigo-400 pl-1'
          }`}>
            {line.content}
          </div>
        ))}
        {isProcessing && (
          <div className={`${isOverride ? 'text-red-500' : 'text-indigo-500'} animate-pulse mt-3 flex items-center text-[11px] font-bold tracking-widest pl-1 uppercase`}>
            <svg className="animate-spin h-3 w-3 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {isOverride ? 'UNBOUND_EXECUTION...' : isLive ? 'PIPE_EXECUTION...' : 'NEURAL_ANALYSIS...'}
          </div>
        )}
      </div>

      <div className={`p-3 flex items-center border-t transition-colors duration-500 ${isOverride ? 'bg-red-950/20 border-red-900/40' : 'bg-slate-900/90 border-slate-800'}`}>
        <span className={`font-black mr-3 text-[13px] uppercase tracking-tighter ${isOverride ? 'text-red-500' : isLive ? 'text-emerald-500' : 'text-indigo-500'}`}>
          {isOverride ? 'root@master' : isLive ? 'root@nethunter' : 'kali@proot'}:~$
        </span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`flex-1 bg-transparent border-none outline-none text-[13px] caret-indigo-500 placeholder:text-slate-800 font-black ${isOverride ? 'text-red-100 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]' : 'text-white'}`}
          placeholder={isOverride ? "INJECT UNBOUND COMMAND..." : "Inject command..."}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className={`border-t flex justify-around p-1.5 transition-colors duration-500 ${isOverride ? 'bg-red-950/40 border-red-900/40' : 'bg-slate-950 border-slate-900'}`}>
        {['Ctrl', 'Alt', 'Esc', '↑', '↓', 'Reset'].map(key => (
          <button 
            key={key}
            onClick={() => {
              if (key === 'Reset') { geminiService.resetTerminal(); setHistory([{ type: 'system', content: '>>> Cache purged. PRoot Context Reset.' }]); }
              if (key === '↑') handleKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any);
              if (key === '↓') handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any);
              inputRef.current?.focus();
            }}
            className={`flex-1 py-2 text-[9px] font-black rounded transition-all uppercase tracking-tighter ${isOverride ? 'text-red-900 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-600 hover:text-indigo-400 hover:bg-slate-900'}`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TerminalView;
