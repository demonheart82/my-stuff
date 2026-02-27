
import React, { useState, useEffect } from 'react';

const DeploymentView: React.FC = () => {
  const [swStatus, setSwStatus] = useState<'Checking' | 'Active' | 'Not Supported'>('Checking');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwStatus('Active'));
    } else {
      setSwStatus('Not Supported');
    }
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const bridgeScript = `import http.server
import json
import subprocess

class KaliBridgeHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/execute':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            command = json.loads(post_data).get('command')
            
            print(f"[*] Executing: {command}")
            try:
                result = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, timeout=30)
                output = result.decode('utf-8')
            except subprocess.CalledProcessError as e:
                output = e.output.decode('utf-8')
            except Exception as e:
                output = str(e)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'output': output}).encode())

if __name__ == "__main__":
    server = http.server.HTTPServer(('0.0.0.0', 8080), KaliBridgeHandler)
    print("AI Agent Bridge: Listening on port 8080...")
    server.serve_forever()`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Active Operation Bridge</h1>
        <p className="text-slate-400 mt-1">Deploy these hooks to your Kali machine to enable real-time tool control.</p>
      </header>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Python Relay Bridge</h2>
            <p className="text-xs text-slate-500 font-mono">Run this in your Kali/NetHunter terminal.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-[11px] text-amber-300 font-bold uppercase tracking-widest mb-1 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              Security Warning
            </p>
            <p className="text-[10px] text-amber-200/70 leading-relaxed">This script allows remote command execution. Only run it on a secure local network. In NetHunter (Android), use "localhost" for highest security.</p>
          </div>

          <div className="relative group">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => copyToClipboard(bridgeScript, 'bridge')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all flex items-center space-x-2 border border-slate-700"
              >
                <span>{copied === 'bridge' ? 'Copied' : 'Copy Code'}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
            </div>
            <div className="bg-black p-6 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner max-h-96 custom-scrollbar">
              <pre><code>{bridgeScript}</code></pre>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
           <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Android / Termux Hook</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">If using NetHunter Rootless, install Python and run the script inside your Kali session. Then configure the Terminal view in this app to use <code className="text-indigo-400">http://localhost:8080</code>.</p>
           </div>
           <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Verification</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">After starting the script, type <code className="text-emerald-400">whoami</code> in the Terminal view. If you see your Kali username with a latency tag, the Active Bridge is functional.</p>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4">Offline PWA Sync</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Local Service</span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${swStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {swStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Cloud AI Assist</h3>
            <p className="text-xs text-slate-400 italic">Gemini-3-Pro engine providing context for active commands.</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentView;
