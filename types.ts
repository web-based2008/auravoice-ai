export type AppLanguage = 'en' | 'ar';

export interface AppSettings {
  theme: 'dark' | 'light';
  lang: AppLanguage;
  motionEnabled: boolean;
  audioQuality: 'standard' | 'high';
  isMobileOptimized: boolean;
  useServerDefaultKey: boolean;
}

export type APIKeyStatus = 'idle' | 'valid' | 'invalid' | 'testing';

export interface APIConfig {
  key: string;
  status: APIKeyStatus;
  error?: string;
  lastValidated?: string;
}

export interface APIKeysState {
  gemini: APIConfig;
  huggingface: APIConfig;
  deepseek: APIConfig;
}

export interface VoiceRecord {
  id: string;
  text: string;
  lang: AppLanguage;
  speaker: string; // Puck, Charon, Kore, Fenrir, Zephyr, or Native names
  emotion: string; // Neutral, Cheerful, Serious, Whispering, Energetic
  audioUrl: string; // Base64 or Blob url
  date: string;
  source: 'gemini' | 'local';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface HistoryItem {
  id: string;
  type: 'voice' | 'chat' | 'assistant' | 'text-tool';
  title: string;
  subtitle: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AssistantTool {
  id: string;
  icon: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  category: 'summarize' | 'rewrite' | 'translate' | 'brainstorm';
  promptTemplate: string;
  placeholder: { en: string; ar: string };
}

export interface TextUtility {
  id: string;
  icon: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  placeholder: { en: string; ar: string };
  promptTemplate: string;
}
