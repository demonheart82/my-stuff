
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SecurityAuditResult {
  vulnerability: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  remediation: string;
  refactoringSuggestions?: string;
  secureCodingBestPractices?: string[];
}

export interface ToolSuggestion {
  name: string;
  command: string;
  purpose: string;
  link?: string;
  tags: SecurityMode[];
}

export interface NetworkActivity {
  id: string;
  timestamp: number;
  type: 'SCAN' | 'LOGIN_ATTEMPT' | 'DATA_TRANSFER' | 'PORT_ACCESS';
  sourceIp: string;
  targetIp: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface GuidanceMessage {
  id: string;
  timestamp: number;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  content: string;
  anomalyScore?: number;
  relatedActivityId?: string;
}

export interface HostActivity {
  id: string;
  timestamp: number;
  type: 'FILE_ACCESS' | 'PROCESS_EXECUTION' | 'PRIVILEGE_ESCALATION' | 'SOFTWARE_INSTALL' | 'SYSTEM_LOG';
  process: string;
  user: string;
  path?: string;
  event: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface HostGuidanceMessage {
  id: string;
  timestamp: number;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  content: string;
  anomalyScore?: number;
  relatedHostActivityId?: string;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  TERMINAL = 'terminal',
  VNC = 'vnc',
  CHAT = 'chat',
  AUDIT = 'audit',
  COMMAND_HELPER = 'commands',
  RESOURCES = 'resources',
  REALTIME_GUIDANCE = 'realtime_guidance',
  HOST_MONITORING = 'host_monitoring',
  DEPLOY = 'deploy',
  LAUNCHER = 'launcher',
  GUI_TOOLS = 'gui_tools',
  SYSTEM_MONITOR = 'system_monitor'
}

export enum SecurityMode {
  BLUE_TEAM = 'blue_team',
  RED_TEAM = 'red_team',
  PURPLE_DEV = 'purple_dev'
}

export enum SafetyStatus {
  STRICT = 'strict',
  OVERRIDE = 'override'
}

export enum NetworkType {
  WIFI = 'wifi',
  MOBILE_DATA = 'mobile_data'
}
