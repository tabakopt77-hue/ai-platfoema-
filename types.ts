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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isScript?: boolean;
  sources?: { uri: string; title: string }[];
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
  category: 'server' | 'project' | 'preference';
  content: string;
  addedAt: Date;
}