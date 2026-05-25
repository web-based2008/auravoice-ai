import React from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, MessageSquare, Brain, Wrench, Key, History, Settings, Sparkles, Radio
} from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../utils/translations';

interface DashboardProps {
  lang: AppLanguage;
  setActiveTab: (tab: string) => void;
  serverKeyAvailable: boolean;
  geminiKeyConfigured: boolean;
}

export default function Dashboard({ 
  lang, 
  setActiveTab, 
  serverKeyAvailable, 
  geminiKeyConfigured 
}: DashboardProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const cards = [
    {
      id: 'voice-gen',
      title: t.navVoiceGen,
      desc: t.voiceGenDesc,
      icon: Volume2,
      gradient: "from-cyan-400 to-teal-400",
      glowColor: "shadow-cyan-500/10 hover:shadow-cyan-400/20"
    },
    {
      id: 'voice-mimic',
      title: t.navVoiceMimic,
      desc: isRtl ? "سجل صوتك أو ارفع عينة نطق، وسيقوم المحاكي العصبي باستنساخ نبرتك لنطق أي نصوص بدقة مذهلة." : "Record your voice sample or drag and drop an audio clip to securely clone and mimic your tone.",
      icon: Radio,
      gradient: "from-teal-400 to-emerald-500",
      glowColor: "shadow-teal-500/10 hover:shadow-teal-400/20"
    },
    {
      id: 'chat',
      title: t.navChat,
      desc: t.chatDesc,
      icon: MessageSquare,
      gradient: "from-purple-500 to-indigo-500",
      glowColor: "shadow-purple-500/10 hover:shadow-purple-400/20"
    },
    {
      id: 'assistant',
      title: t.navAssistant,
      desc: t.assistantDesc,
      icon: Brain,
      gradient: "from-fuchsia-500 to-pink-500",
      glowColor: "shadow-fuchsia-500/10 hover:shadow-fuchsia-400/20"
    },
    {
      id: 'text-tools',
      title: t.navTextTools,
      desc: t.textToolsDesc,
      icon: Wrench,
      gradient: "from-amber-400 to-orange-500",
      glowColor: "shadow-amber-500/10 hover:shadow-amber-400/20"
    },
    {
      id: 'api-manager',
      title: t.navApiManager,
      desc: t.apiManagerDesc,
      icon: Key,
      gradient: "from-red-400 to-rose-500",
      glowColor: "shadow-red-500/10 hover:shadow-red-400/20"
    },
    {
      id: 'history',
      title: t.navHistory,
      desc: t.historyDesc,
      icon: History,
      gradient: "from-blue-400 to-indigo-600",
      glowColor: "shadow-blue-500/10 hover:shadow-blue-400/20"
    },
    {
      id: 'settings',
      title: t.navSettings,
      desc: t.settingsDesc,
      icon: Settings,
      gradient: "from-slate-400 to-slate-600",
      glowColor: "shadow-slate-500/10 hover:shadow-slate-400/20"
    }
  ];

  const hasAnyKey = serverKeyAvailable || geminiKeyConfigured;

  return (
    <div className="w-full pb-12" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Upper Welcome Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 border border-white/5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px]" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
              <span>{lang === 'en' ? "Welcome to Command Center" : "مرحباً بكم في مركز التحكم الرئيسي"}</span>
              <Sparkles className="text-cyan-400" size={18} />
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-medium font-sans">
              {lang === 'en' 
                ? "Manage your offline and cloud processes securely. Every workflow uses free developer connections."
                : "أدر كافة بروتوكول معالجة النصوص والصوتيات الفائقة محلياً عبر المسارت المذكورة مجاناً."}
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-400/20 bg-cyan-950/20 font-mono text-xs font-bold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{hasAnyKey ? t.freeBadgeDesc : t.apiHelpTitle}</span>
          </div>
        </div>
      </div>

      {/* Grid of Modular Sub-tool Pages */}
      <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-widest mb-6 px-1">
        {lang === 'en' ? "Modular Applications Available" : "الوظائف والأنظمة البرمجية المتاحة"}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className={`p-6 rounded-2xl bg-slate-900/30 border border-white/5 hover:border-cyan-500/20 hover:bg-slate-900/50 transition-all duration-300 group flex flex-col justify-between gap-6 cursor-pointer relative overflow-hidden shadow-lg ${card.glowColor}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} p-2 text-slate-900 flex items-center justify-center`}>
                  <IconComponent size={20} />
                </div>
                
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-500 group-hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? "Isolated Panel" : "لوحة معزولة"}
                </span>
              </div>

              <div>
                <h4 className="text-md font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-400 leading-normal font-sans mt-1.5 line-clamp-2">
                  {card.desc}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-slate-100 transition-colors">
                <span>{lang === 'en' ? "Open Workspace" : "فتح مساحة العمل"}</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
