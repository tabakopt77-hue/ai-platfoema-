export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TERMINAL = 'TERMINAL',
  AI_ASSISTANT = 'AI_ASSISTANT',
  SETTINGS = 'SETTINGS'
}

export interface MetricData {
  time: string;
  cpu: number;
  memory: number;
  network: number;
}

export interface TerminalLog {
  timestamp: string;
  command: string;
  output: string;
  status: 'success' | 'error' | 'pending';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isScript?: boolean;
  sources?: { uri: string; title: string }[];
  // New: Artifacts for the "Minimax" feel
  artifact?: {
    type: 'terminal' | 'code' | 'file_tree' | 'status' | 'alert';
    title?: string;
    content?: string;
    logs?: TerminalLog[];
    data?: any;
  };
}

export interface ServerNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  ip: string;
  region: string;
}

export interface KnowledgeItem {
  id: string;
  cluster: string; // e.g., "Security", "Performance", "Docker"
  content: string;
  addedAt: Date;
  confidence: number; // 0-100%
  type: 'beneficial' | 'harmful' | 'neutral'; // Filtering flag
  sourceUrl?: string;
}

export interface AgentSkill {
  name: string;
  level: number; // 1-10
  progress: number; // 0-100% to next level
  description: string;
}

export type AgentType = 'USER_SIDE' | 'WATCHDOG' | 'LEARNING' | 'ADMIN';

export interface AgentProfile {
  id: string;
  name: string;
  role: string; // e.g., "DevOps Engineer", "Security Auditor"
  type: AgentType; // STRICT ToR Classification
  avatar: string; // color or icon code
  level: number;
  xp: number;
  nextLevelXp: number;
  skills: AgentSkill[];
  totalActions: number;
  systemPrompt?: string;
}

export interface LearningResult {
  facts: string[];
  skillUpdates: {
    skillName: string;
    xpGained: number;
  }[];
}

export interface ResearchResult {
  items: KnowledgeItem[];
  summary: string;
  processedCount: number;
}

// New Types for Platform UI
export interface ProcessStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  agentId: string;
  lastModified: Date;
  messages: ChatMessage[];
}