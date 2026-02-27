
import React from 'react';
import { SecurityMode } from '../types';

interface ResourcesProps {
  currentSecurityMode: SecurityMode;
}

const Resources: React.FC<ResourcesProps> = ({ currentSecurityMode }) => {
  const officialTools = [
    { name: 'Nmap', url: 'https://nmap.org', desc: 'Network mapper & security scanner.' },
    { name: 'Burp Suite', url: 'https://portswigger.net', desc: 'Web vulnerability scanner.' },
    { name: 'Metasploit', url: 'https://metasploit.com', desc: 'Penetration testing framework.' },
    { name: 'Wireshark', url: 'https://wireshark.org', desc: 'Network protocol analyzer.' },
  ];

  const blueTeamTools = [
    { name: 'Lynis', url: 'https://cisofy.com/lynis/', desc: 'Security auditing tool for Unix-like systems.' },
    { name: 'Rootkit Hunter', url: 'http://rkhunter.sourceforge.net/', desc: 'Scans for rootkits, backdoors, and local exploits.' },
    { name: 'Auditd', url: 'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/security_guide/chap-system_auditing', desc: 'Linux Auditing System for security-relevant logging.' },
    { name: 'OSSEC', url: 'https://www.ossec.net/', desc: 'Host-based Intrusion Detection System (HIDS).' },
  ];

  const getModeAccentColor = (mode: SecurityMode) => {
    switch (mode) {
      case SecurityMode.BLUE_TEAM: return 'text-emerald-400';
      case SecurityMode.RED_TEAM: return 'text-rose-400';
      case SecurityMode.PURPLE_DEV: return 'text-violet-400';
      default: return 'text-indigo-400';
    }
  };

  const getModeBgColor = (mode: SecurityMode) => {
    switch (mode) {
      case SecurityMode.BLUE_TEAM: return 'bg-emerald-600/20';
      case SecurityMode.RED_TEAM: return 'bg-rose-600/20';
      case SecurityMode.PURPLE_DEV: return 'bg-violet-600/20';
      default: return 'bg-indigo-600/20';
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <header>
        <h1 className={`text-3xl font-bold ${getModeAccentColor(currentSecurityMode)} tracking-tight`}>Intelligence Database</h1>
        <p className="text-slate-400 mt-1">Curated links and documentation for security professionals.</p>
      </header>

      {/* NEW PROOT SECTION */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className={`w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center mr-3`}>
            <svg className={`w-5 h-5 text-indigo-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </span>
          PRoot Kali Implementation (Termux)
        </h2>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-white">1. Setup PRoot Distro</h4>
              <p className="text-sm text-slate-400">Install the proot manager and the Kali distribution on your Android device via Termux.</p>
              <div className="bg-black p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-400 overflow-x-auto shadow-inner">
                <pre><code>{`pkg update && pkg upgrade
pkg install proot-distro
proot-distro install kali
proot-distro login kali`}</code></pre>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white">2. Hook KaliEthical AI</h4>
              <p className="text-sm text-slate-400">Create a bridge script inside your PRoot session to query this assistant directly.</p>
              <div className="bg-black p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner">
                <pre><code>{`# Run inside Kali PRoot
apt update && apt install curl jq -y
cat <<EOF > /usr/local/bin/k-ai
#!/bin/bash
curl -s -X POST "https://api.kaliethical.io/v1/hook" \\
  -d "{\\"prompt\\": \\"\$*\\"}" | jq -r .response
EOF
chmod +x /usr/local/bin/k-ai`}</code></pre>
              </div>
            </div>
          </div>
          <div className="p-4 bg-indigo-600/5 border border-indigo-500/20 rounded-xl">
             <p className="text-xs text-indigo-300"><strong>Note:</strong> PRoot simulation in this app is for training. For actual scanning, always use the real PRoot session established via the Termux instructions above.</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className={`w-8 h-8 bg-sky-600/20 rounded-lg flex items-center justify-center mr-3`}>
            <svg className={`w-5 h-5 text-sky-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </span>
          Web Access & PWA Installation
        </h2>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs">Browser Access</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                You can access this assistant from any modern web browser. Use the <strong>Shared App URL</strong> to view the production-ready interface without the development environment.
              </p>
              <div className="flex flex-col space-y-2">
                <div className="p-3 bg-black rounded-xl border border-slate-800 flex items-center justify-between">
                  <code className="text-[10px] text-sky-400 truncate mr-2">{window.location.origin}</code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(window.location.origin)}
                    className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs">Install as App (PWA)</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                This assistant is a Progressive Web App. You can install it on your Desktop or Mobile home screen for a full-screen, native-like experience.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                <li><strong>Desktop:</strong> Click the "Install" icon in the address bar (Chrome/Edge).</li>
                <li><strong>iOS:</strong> Tap "Share" → "Add to Home Screen" (Safari).</li>
                <li><strong>Android:</strong> Tap "Menu" → "Install App" or "Add to Home Screen".</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className={`w-8 h-8 ${getModeBgColor(currentSecurityMode)} rounded-lg flex items-center justify-center mr-3`}>
            <svg className={`w-5 h-5 ${getModeAccentColor(currentSecurityMode)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </span>
          Core Offensive Toolset
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {officialTools.map((tool, i) => (
            <a 
              key={i} 
              href={tool.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group`}
            >
              <h3 className={`text-lg font-bold text-white group-hover:${getModeAccentColor(currentSecurityMode)} transition-colors`}>{tool.name}</h3>
              <p className="text-sm text-slate-400 mt-2">{tool.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className={`w-8 h-8 ${getModeBgColor(currentSecurityMode)} rounded-lg flex items-center justify-center mr-3`}>
            <svg className={`w-5 h-5 ${getModeAccentColor(currentSecurityMode)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          Blue Team & Host Forensics Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blueTeamTools.map((tool, i) => (
            <a 
              key={i} 
              href={tool.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group`}
            >
              <h3 className={`text-lg font-bold text-white group-hover:${getModeAccentColor(currentSecurityMode)} transition-colors`}>{tool.name}</h3>
              <p className="text-sm text-slate-400 mt-2">{tool.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Resources;
