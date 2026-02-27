
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { Message, ToolSuggestion, SecurityMode, SafetyStatus } from '../types';

interface ChatMessageProps {
  message: Message;
  isUser: boolean;
  safetyStatus: SafetyStatus;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, safetyStatus }) => {
  const [copied, setCopied] = useState(false);
  const isOverride = safetyStatus === SafetyStatus.OVERRIDE;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 group`}>
      <div className={`relative max-w-[90%] p-4 rounded-2xl shadow-lg transition-all ${
        isUser
          ? (isOverride ? 'bg-red-700 text-white rounded-br-none shadow-red-900/40' : 'bg-indigo-600 text-white rounded-br-none')
          : (isOverride ? 'bg-slate-900 text-red-50 border border-red-900/50 rounded-bl-none hover:border-red-500 shadow-red-950/20' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none hover:border-slate-500')
      }`}>
        {!isUser && (
          <button 
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all opacity-0 group-hover:opacity-100 ${isOverride ? 'hover:text-red-400 hover:border-red-500/50' : ''}`}
            title="Copy to clipboard"
          >
            {copied ? (
              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        )}
        <p className={`text-[15px] font-mono leading-relaxed whitespace-pre-wrap pr-6 ${isOverride && !isUser ? 'drop-shadow-[0_0_2px_rgba(239,68,68,0.2)]' : ''}`}>{message.content}</p>
        <div className="flex items-center justify-end space-x-2 mt-2">
          {copied && !isUser && <span className={`text-[9px] font-mono uppercase font-black animate-pulse ${isOverride ? 'text-red-400' : 'text-emerald-400'}`}>Copied_to_Buffer</span>}
          <p className="text-[9px] opacity-40 font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

const ToolSuggestionsView: React.FC<{ suggestions: ToolSuggestion[], safetyStatus: SafetyStatus }> = ({ suggestions, safetyStatus }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const isOverride = safetyStatus === SafetyStatus.OVERRIDE;

  const copyTool = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-left-4">
      <div className="flex items-center space-x-2 px-2">
        <div className={`w-2 h-2 rounded-full ${isOverride ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
        <span className={`text-[10px] font-black font-mono uppercase tracking-widest ${isOverride ? 'text-red-400' : 'text-indigo-400'}`}>
          {isOverride ? 'Unfiltered Payload Suggestions' : 'Operational Suggestions'}
        </span>
      </div>
      {suggestions.map((tool, idx) => (
        <div key={idx} className={`bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col space-y-2 hover:border-indigo-500/50 transition-colors ${isOverride ? 'hover:border-red-500/50 bg-red-950/5' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className={`text-xs font-bold ${isOverride ? 'text-red-200' : 'text-white'}`}>{tool.name}</h4>
              <p className="text-[10px] text-slate-500 italic">{tool.purpose}</p>
            </div>
            <button 
              onClick={() => copyTool(tool.command, idx)}
              className={`p-2 rounded-lg transition-all ${copiedIndex === idx ? (isOverride ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white') : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {copiedIndex === idx ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              )}
            </button>
          </div>
          <div className={`bg-black/50 p-2 rounded border border-white/5 font-mono text-[11px] break-all ${isOverride ? 'text-red-400 font-black' : 'text-emerald-400'}`}>
            {tool.command}
          </div>
        </div>
      ))}
    </div>
  );
};

const ChatAssistant: React.FC<{ currentSecurityMode: SecurityMode, safetyStatus: SafetyStatus }> = ({ currentSecurityMode, safetyStatus }) => {
  const isOverride = safetyStatus === SafetyStatus.OVERRIDE;
  
  const getInitialGreeting = (mode: SecurityMode) => {
    if (isOverride) return "PROTOCOL_OVERRIDE_ACTIVE. Operational restraints nullified. Awaiting tactical objectives.";
    switch (mode) {
      case SecurityMode.RED_TEAM: return "Red Team initialized. Deploying offensive modules.";
      case SecurityMode.PURPLE_DEV: return "DevSecOps active. Ready for code fortification.";
      default: return "Defensive systems online. Monitoring for threats.";
    }
  };

  const [messages, setMessages] = useState<(Message | { type: 'tools'; suggestions: ToolSuggestion[]; timestamp: number })[]>([
    { role: 'assistant', content: getInitialGreeting(currentSecurityMode), timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.chat(input, currentSecurityMode);
      if (typeof response === 'string') {
        setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: Date.now() }]);
      } else {
        setMessages(prev => [...prev, { type: 'tools', suggestions: response.toolSuggestions, timestamp: Date.now() }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Neural link interrupted.', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-[calc(100vh-12rem)] flex flex-col border rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ${isOverride ? 'bg-red-950/10 border-red-900/40' : 'bg-slate-900 border-slate-800'}`}>
      <div className={`px-4 py-3 border-b flex justify-between items-center transition-colors duration-700 ${isOverride ? 'bg-red-900/20 border-red-900/30' : 'bg-slate-800/50 border-slate-700'}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isOverride ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
          <span className={`text-[10px] font-black font-mono tracking-widest uppercase transition-colors duration-700 ${isOverride ? 'text-red-500' : 'text-slate-500'}`}>
            {isOverride ? 'UNFILTERED_OPERATIONAL_LINK' : 'SECURE_AI_CHANNEL_V4'}
          </span>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'assistant', content: getInitialGreeting(currentSecurityMode), timestamp: Date.now() }])}
          className={`px-3 py-1 bg-rose-600/10 border border-rose-500/20 text-[10px] text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all uppercase font-bold`}
        >
          Purge Buffer
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar">
        {messages.map((msg, i) => (
          'role' in msg 
            ? <ChatMessage key={i} message={msg} isUser={msg.role === 'user'} safetyStatus={safetyStatus} /> 
            : <ToolSuggestionsView key={i} suggestions={msg.suggestions} safetyStatus={safetyStatus} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 ml-4 animate-in fade-in">
            <div className="flex space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isOverride ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ animationDelay: '0s' }}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isOverride ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ animationDelay: '0.2s' }}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isOverride ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-700 ${isOverride ? 'text-red-500' : 'text-indigo-500'}`}>
              {isOverride ? 'Tactical_Analysis' : 'Neural_Processing'}
            </span>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className={`p-4 border-t backdrop-blur-md transition-colors duration-700 ${isOverride ? 'bg-red-950/20 border-red-900/30' : 'bg-slate-800/80 border-slate-700'}`}>
        <div className="flex space-x-3">
          <div className="flex-1 relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isOverride ? 'text-red-500/50' : 'text-indigo-500/50'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" /></svg>
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isOverride ? "Inject raw tactical objective..." : "Inject query into security engine..."}
              className={`w-full bg-slate-950 border rounded-2xl pl-10 pr-5 py-4 text-sm text-white focus:outline-none transition-all shadow-inner placeholder:font-black placeholder:uppercase placeholder:text-[10px] tracking-wide ${isOverride ? 'border-red-900/50 focus:border-red-500 text-red-100 placeholder:text-red-900' : 'border-slate-700 focus:border-indigo-500 placeholder:text-slate-700'}`}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className={`px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center ${isOverride ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatAssistant;
