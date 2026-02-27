
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { SafetyStatus } from '../types';

interface CommandHistoryEntry {
  query: string;
  command: string;
  timestamp: number;
}

interface CommandHelperProps {
  safetyStatus: SafetyStatus;
}

const CommandHelper: React.FC<CommandHelperProps> = ({ safetyStatus }) => {
  const [query, setQuery] = useState('');
  const [command, setCommand] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(true); // State to toggle history visibility

  const historyRef = useRef<HTMLDivElement>(null); // Ref for history section

  useEffect(() => {
    // Load command history from localStorage on component mount
    try {
      const storedHistory = localStorage.getItem('kaliEthicalCommandHistory');
      if (storedHistory) {
        setCommandHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load command history from localStorage:", error);
      // Fallback to empty history if parsing fails
      setCommandHistory([]);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom of history when new items are added, but only if history is shown
    if (showHistory && historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [commandHistory, showHistory]);


  const generate = async () => {
    if (!query.trim()) return;
    setIsGenerating(true);
    try {
      const result = await geminiService.generateCommand(query);
      setCommand(result);

      const newHistoryEntry: CommandHistoryEntry = {
        query: query,
        command: result,
        timestamp: Date.now(),
      };

      setCommandHistory(prevHistory => {
        const updatedHistory = [newHistoryEntry, ...prevHistory].slice(0, 20); // Keep last 20 entries
        localStorage.setItem('kaliEthicalCommandHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (error) {
      setCommand('Error generating command.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all command history?")) {
      setCommandHistory([]);
      localStorage.removeItem('kaliEthicalCommandHistory');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12"> {/* Added pb-12 for bottom padding */}
      <header className="text-center">
        <h1 className="text-4xl font-black text-white tracking-tighter">Command Laboratory</h1>
        <p className="text-slate-400 mt-2 text-lg">Natural language to terminal syntax translator.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <label htmlFor="command-query" className="text-sm font-medium text-slate-400 uppercase tracking-widest ml-1">Intent</label>
            <input
              id="command-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="e.g. Scan 192.168.1.1 for open ports without being detected"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 text-white text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
              aria-label="Enter your command intent"
            />
          </div>

          <button
            onClick={generate}
            disabled={isGenerating || !query.trim()}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center space-x-3"
            aria-label={isGenerating ? 'Generating command' : 'Forge command'}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Decrypting Intent...</span>
              </>
            ) : (
              'Forge Command'
            )}
          </button>

          {command && (
            <div className="mt-8 space-y-2 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-emerald-400 uppercase tracking-widest">Synthesized Output</label>
                <button 
                  onClick={() => copyToClipboard(command)}
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  aria-label="Copy generated command to clipboard"
                >
                  {copied ? (
                    <span className="text-emerald-400">Copied!</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-400 overflow-x-auto">
                <pre><code>{command}</code></pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Command History</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-slate-400 hover:text-white uppercase tracking-tighter flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showHistory ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
              <span>{showHistory ? 'Hide' : 'Show'} History</span>
            </button>
            <button
              onClick={clearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 uppercase tracking-tighter flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear All</span>
            </button>
          </div>
        </div>
        {showHistory && (
          <div ref={historyRef} className="bg-slate-900 border border-slate-800 rounded-2xl h-80 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {commandHistory.length === 0 ? (
              <p className="text-center text-slate-600 py-8">No command history yet.</p>
            ) : (
              commandHistory.map((entry, index) => (
                <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-slate-500 font-mono flex items-center justify-between">
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    <button 
                      onClick={() => copyToClipboard(entry.command)}
                      className="text-indigo-400 hover:text-white flex items-center space-x-1"
                      aria-label="Copy command from history"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy</span>
                    </button>
                  </p>
                  <p className="text-slate-300 text-sm">Query: <span className="text-white font-medium">{entry.query}</span></p>
                  <div className="bg-black p-3 rounded-md font-mono text-xs text-emerald-400 overflow-x-auto">
                    <pre><code>{entry.command}</code></pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandHelper;