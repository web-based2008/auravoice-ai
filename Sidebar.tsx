import React from 'react';
import { 
  Sparkles, Cpu, Volume2, MessageSquare, Brain, 
  Wrench, Key, History, Settings, Globe, Menu, X, Radio
} from 'lucide-react';
import { AppLanguage, AppSettings } from '../types';
import { translations } from '../utils/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  settings: AppSettings;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  serverKeyAvailable: boolean;
  geminiKeyConfigured: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  settings,
  sidebarOpen,
  setSidebarOpen,
  serverKeyAvailable,
  geminiKeyConfigured
}: SidebarProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const menuItems = [
    { id: 'landing', label: t.navLanding, icon: Sparkles },
    { id: 'dashboard', label: t.navDashboard, icon: Cpu },
    { id: 'voice-gen', label: t.navVoiceGen, icon: Volume2 },
    { id: 'voice-mimic', label: t.navVoiceMimic, icon: Radio },
    { id: 'chat', label: t.navChat, icon: MessageSquare },
    { id: 'assistant', label: t.navAssistant, icon: Brain },
    { id: 'text-tools', label: t.navTextTools, icon: Wrench },
    { id: 'api-manager', label: t.navApiManager, icon: Key },
    { id: 'history', label: t.navHistory, icon: History },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false); // Close on mobile
  };

  const hasAnyKey = serverKeyAvailable || geminiKeyConfigured;

  return (
    <>
      {/* Mobile Top Bar (Only visible on mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/10 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <span className="text-cyan-400 font-black text-sm">AV</span>
            </div>
          </div>
          <span className="text-white font-bold tracking-tight text-md">AuraVoice</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Fast language switcher */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-cyan-300 hover:bg-white/10 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white/5 text-slate-100 hover:text-cyan-400 transition-colors border border-white/10"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Primary Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 ${isRtl ? 'right-0' : 'left-0'} 
          ${sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-72 h-screen bg-slate-950 border-r border-cyan-500/10 z-50 transition-transform duration-300 flex flex-col pt-16 md:pt-0 shrink-0 select-none`}
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        {/* Logo Banner */}
        <div className="hidden md:flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center p-[1px] shadow-lg shadow-cyan-500/15">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <span className="text-cyan-400 font-extrabold text-base">HΩ</span>
              </div>
            </div>
            <div>
              <h1 className="text-white font-extrabold tracking-tight text-lg leading-tight">AuraVoice AI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[9px] text-emerald-400 tracking-wider uppercase font-semibold">
                  {t.platformStatus}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors duration-200 border border-transparent hover:border-cyan-500/20"
            title={lang === 'en' ? 'Switch to Arabic' : 'تحويل للغة الإنجليزية'}
          >
            <Globe className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Dynamic Warning if Key Missing */}
        <div className="px-5 pt-4 pb-1">
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 backdrop-blur-md ${
            hasAnyKey 
              ? 'bg-cyan-950/20 border-cyan-500/30' 
              : 'bg-amber-950/20 border-amber-500/30'
          }`}>
            <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${hasAnyKey ? 'bg-cyan-400 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            <div className="text-[11px] font-medium leading-normal">
              <p className="text-slate-100 font-bold">{t.freeBadge}</p>
              <p className="text-slate-400 mt-0.5 font-sans">
                {hasAnyKey ? t.freeBadgeDesc : t.apiHelpTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-l-2 border-cyan-400 text-cyan-400 shadow-[inset_1px_1px_5px_rgba(34,211,238,0.03)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-100'}`} />
                  <span className="font-sans">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer/Exit widget */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <div className="text-center font-mono text-[9px] text-slate-500">
            AuraVoice Suite © 2026. v1.1
          </div>
        </div>
      </aside>
    </>
  );
}
