/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastProvider, useToast } from './components/Toast';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import VoiceGenerator from './components/VoiceGenerator';
import VoiceMimic from './components/VoiceMimic';
import AIChat from './components/AIChat';
import AIAssistant from './components/AIAssistant';
import TextTools from './components/TextTools';
import APIManager from './components/APIManager';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import { AppLanguage, AppSettings, APIKeysState, VoiceRecord, ChatSession, HistoryItem } from './types';

function MainAppShell() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [serverKeyAvailable, setServerKeyAvailable] = useState<boolean>(false);

  // 1. Initial Language loading
  const [lang, setLang] = useState<AppLanguage>(() => {
    return (localStorage.getItem('auravoice_lang') as AppLanguage) || 'en';
  });

  // 2. Initial Settings loading
  const [settings, setSettings] = useState<AppSettings>(() => {
    return {
      theme: (localStorage.getItem('auravoice_theme') as 'dark' | 'light') || 'dark',
      lang: (localStorage.getItem('auravoice_lang') as AppLanguage) || 'en',
      motionEnabled: localStorage.getItem('auravoice_motion') !== 'false',
      audioQuality: 'high',
      isMobileOptimized: localStorage.getItem('auravoice_mobile_opt') === 'true',
      useServerDefaultKey: true
    };
  });

  // 3. Initial Local API Keys loading
  const [apiKeys, setApiKeys] = useState<APIKeysState>(() => {
    return {
      gemini: {
        key: localStorage.getItem('auravoice_gemini_key') || '',
        status: (localStorage.getItem('auravoice_gemini_status') as any) || 'idle'
      },
      huggingface: {
        key: localStorage.getItem('auravoice_hf_key') || '',
        status: (localStorage.getItem('auravoice_hf_status') as any) || 'idle'
      },
      deepseek: {
        key: localStorage.getItem('auravoice_deepseek_key') || '',
        status: (localStorage.getItem('auravoice_deepseek_status') as any) || 'idle'
      }
    };
  });

  // 4. Voice Studio runs history cache loading
  const [voiceHistory, setVoiceHistory] = useState<VoiceRecord[]>(() => {
    const raw = localStorage.getItem('auravoice_voices_history');
    return raw ? JSON.parse(raw) : [];
  });

  // 5. Intelligent Assistant history cache loading
  const [toolHistory, setToolHistory] = useState<HistoryItem[]>(() => {
    const raw = localStorage.getItem('auravoice_tool_history');
    return raw ? JSON.parse(raw) : [];
  });

  // 6. Conversational Chat sessions history loading
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const raw = localStorage.getItem('auravoice_chat_sessions');
    return raw ? JSON.parse(raw) : [];
  });
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

  // Check backend server proxy health and default key existence
  useEffect(() => {
    async function checkServerHealth() {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setServerKeyAvailable(data.serverKeyAvailable || false);
        }
      } catch (err) {
        console.warn("Backend server connection could not be verified automatically.", err);
      }
    }
    checkServerHealth();
  }, []);

  // Synced local saves
  const addVoiceRecord = (record: VoiceRecord) => {
    setVoiceHistory(prev => {
      const updated = [record, ...prev];
      localStorage.setItem('auravoice_voices_history', JSON.stringify(updated));
      return updated;
    });
  };

  const addHistoryItem = (item: HistoryItem) => {
    setToolHistory(prev => {
      const updated = [item, ...prev];
      localStorage.setItem('auravoice_tool_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllCache = () => {
    localStorage.clear();
    setVoiceHistory([]);
    setToolHistory([]);
    setChatSessions([]);
    setActiveSession(null);
    setApiKeys({
      gemini: { key: '', status: 'idle' },
      huggingface: { key: '', status: 'idle' }
    });
    setLang('en');
    setSettings({
      theme: 'dark',
      lang: 'en',
      motionEnabled: true,
      audioQuality: 'high',
      isMobileOptimized: false,
      useServerDefaultKey: true
    });
    setActiveTab('landing');
  };

  const clearHistoryOnly = () => {
    localStorage.removeItem('auravoice_voices_history');
    localStorage.removeItem('auravoice_tool_history');
    setVoiceHistory([]);
    setToolHistory([]);
  };

  const geminiKeyConfigured = apiKeys.gemini.status === 'valid';

  return (
    <div 
      className={`min-h-screen text-slate-100 font-sans flex transition-colors duration-300 ${
        settings.theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#030712] text-slate-100'
      }`}
    >
      {/* Absolute Decorative elements (only visible on darker mode) */}
      {settings.theme === 'dark' && (
        <div className="absolute top-0 right-0 left-0 h-[500px] bg-gradient-to-b from-purple-500/5 via-cyan-500/0 to-transparent pointer-events-none -z-10" />
      )}

      {/* Primary Sidebar Layout (No sidebar in Welcome/Landing tab for full width cinematic effect) */}
      {activeTab !== 'landing' && (
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          setLang={setLang}
          settings={settings}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          serverKeyAvailable={serverKeyAvailable}
          geminiKeyConfigured={geminiKeyConfigured}
        />
      )}

      {/* Main Container Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Cinematic content container spacing */}
        <div className={`flex-1 ${
          activeTab === 'landing' 
            ? 'px-4 py-8' 
            : settings.isMobileOptimized 
              ? 'px-4 py-20 md:py-8' 
              : 'px-6 py-20 md:py-10 max-w-7xl mx-auto w-full'
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {activeTab === 'landing' && (
                <LandingPage 
                  lang={lang} 
                  setLang={setLang}
                  onStart={() => setActiveTab('dashboard')} 
                />
              )}

              {activeTab === 'dashboard' && (
                <Dashboard 
                  lang={lang} 
                  setActiveTab={setActiveTab} 
                  serverKeyAvailable={serverKeyAvailable}
                  geminiKeyConfigured={geminiKeyConfigured}
                />
              )}

              {activeTab === 'voice-gen' && (
                <VoiceGenerator 
                  lang={lang} 
                  apiKeys={apiKeys} 
                  addVoiceRecord={addVoiceRecord}
                  serverKeyAvailable={serverKeyAvailable}
                />
              )}

              {activeTab === 'voice-mimic' && (
                <VoiceMimic 
                  lang={lang} 
                  apiKeys={apiKeys} 
                  addVoiceRecord={addVoiceRecord}
                  serverKeyAvailable={serverKeyAvailable}
                />
              )}

              {activeTab === 'chat' && (
                <AIChat 
                  lang={lang} 
                  apiKeys={apiKeys} 
                  addChatSession={setActiveSession}
                  activeSession={activeSession}
                  setActiveSession={setActiveSession}
                  chatSessions={chatSessions}
                  setChatSessions={setChatSessions}
                  serverKeyAvailable={serverKeyAvailable}
                />
              )}

              {activeTab === 'assistant' && (
                <AIAssistant 
                  lang={lang} 
                  apiKeys={apiKeys} 
                  addHistoryItem={addHistoryItem}
                  serverKeyAvailable={serverKeyAvailable}
                />
              )}

              {activeTab === 'text-tools' && (
                <TextTools 
                  lang={lang} 
                  apiKeys={apiKeys} 
                  addHistoryItem={addHistoryItem}
                  serverKeyAvailable={serverKeyAvailable}
                />
              )}

              {activeTab === 'api-manager' && (
                <APIManager 
                  lang={lang} 
                  apiKeys={apiKeys} 
                  setApiKeys={setApiKeys}
                  serverKeyAvailable={serverKeyAvailable}
                />
              )}

              {activeTab === 'history' && (
                <HistoryView 
                  lang={lang} 
                  voiceHistory={voiceHistory} 
                  toolHistory={toolHistory} 
                  clearHistory={clearHistoryOnly}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView 
                  lang={lang} 
                  setLang={setLang} 
                  settings={settings} 
                  setSettings={setSettings} 
                  clearAllCache={clearAllCache}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  // Always wrap App in Toast Provider holding active language setting
  const [lang, setLang] = useState<AppLanguage>(() => {
    return (localStorage.getItem('auravoice_lang') as AppLanguage) || 'en';
  });

  useEffect(() => {
    const checkLang = () => {
      const cur = (localStorage.getItem('auravoice_lang') as AppLanguage) || 'en';
      if (cur !== lang) setLang(cur);
    };
    window.addEventListener('storage', checkLang);
    return () => window.removeEventListener('storage', checkLang);
  }, [lang]);

  return (
    <ToastProvider lang={lang}>
      <MainAppShell />
    </ToastProvider>
  );
}

