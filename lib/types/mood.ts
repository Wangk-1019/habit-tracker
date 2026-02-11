export type MoodType = 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent';

export interface MoodEntry {
  id: string;
  date: string; // ISO date string
  time: string; // ISO time string
  mood: MoodType;
  note?: string;
  activities?: string[];
}

export interface MoodEmoji {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  score: number; // 1-5
}

export const MOOD_CONFIG: MoodEmoji[] = [
  { type: 'terrible', emoji: '', label: 'Terrible', color: 'rose-500', score: 1 },
  { type: 'bad', emoji: '', label: 'Bad', color: 'orange-500', score: 2 },
  { type: 'neutral', emoji: '', label: 'Neutral', color: 'yellow-500', score: 3 },
  { type: 'good', emoji: '', label: 'Good', color: 'emerald-500', score: 4 },
  { type: 'excellent', emoji: '', label: 'Excellent', color: 'green-600', score: 5 },
];
