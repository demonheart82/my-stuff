
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { SecurityAuditResult } from '../types';

const ScriptAudit: React.FC = () => {
  const [script, setScript] = useState('');
  const [results, setResults] = useState<SecurityAuditResult[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAudit = async () => {
    if (!script.trim() || isAuditing) return;
    setIsAuditing(true);
    setResults([]);
    try {
      const auditJson = await geminiService.auditScript(script);
      setResults(JSON.parse(auditJson));
    } catch (error) {
      console.error('Audit failed', error);
      setResults([{
        vulnerability: "AI Audit Error",
        severity: "Critical",
        description: "Failed to process script. Please check the console for details or try again.",
        remediation: "Ensure your script is well-formed and try simplifying complex sections if the error persists. There might be an issue with the AI service communication.",
        refactoringSuggestions: "Consider breaking down large scripts into smaller, more manageable functions or modules to improve parseability and error handling.",
        secureCodingBestPractices: ["Verify API key configuration.", "Check network connectivity.", "Review script for syntactical issues that might confuse the AI."]
      }]);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Security Auditor</h1>
        <p className="text-slate-400 mt-1">Deep analysis of scripts, payloads, and configuration files.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Input Vector</span>
              <button 
                onClick={() => setScript('')}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="# Paste your Bash, Python, or configuration here..."
              className="flex-1 bg-slate-950 p-6 font-mono text-sm text-emerald-400 focus:outline-none resize-none leading-relaxed"
            />
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <button
                onClick={runAudit}
                disabled={isAuditing || !script.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                {isAuditing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Running AI Analysis...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Scan for Vulnerabilities</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {results.length === 0 && !isAuditing ? (
            <div className="h-full bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h4 className="text-white font-bold">Ready for Triage</h4>
              <p className="text-slate-500 text-sm mt-2">Paste code to see findings here.</p>
            </div>
          ) : (
            results.map((finding, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <h4 className="text-lg font-bold text-white">{finding.vulnerability}</h4>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    finding.severity === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                    finding.severity === 'High' ? 'bg-orange-500/10 text-orange-500' :
                    finding.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {finding.severity}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{finding.description}</p>
                
                <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Remediation</p>
                  <p className="text-sm text-slate-300">{finding.remediation}</p>
                </div>

                {finding.refactoringSuggestions && (
                  <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-xs font-mono text-sky-400 uppercase tracking-widest mb-2">Refactoring Suggestions</p>
                    <p className="text-sm text-slate-300">{finding.refactoringSuggestions}</p>
                  </div>
                )}

                {finding.secureCodingBestPractices && finding.secureCodingBestPractices.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">Secure Coding Best Practices</p>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                      {finding.secureCodingBestPractices.map((practice, pIdx) => (
                        <li key={pIdx}>{practice}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptAudit;