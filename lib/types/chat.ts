export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatContext {
  habits: any[];
  moodHistory: any[];
  currentStreaks: { [habitId: string]: number };
}

export interface AIInsight {
  id: string;
  type: 'pattern' | 'suggestion' | 'achievement' | 'warning';
  title: string;
  description: string;
  data?: any;
  createdAt: string;
}

export interface StreakPrediction {
  habitId: string;
  habitName: string;
  currentStreak: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
  factors: string[];
  suggestions: string[];
}
