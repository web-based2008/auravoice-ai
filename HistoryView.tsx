import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, Search, Trash2, Volume2, MessageSquare, 
  Brain, Wrench, Play, Trash, Info, Download 
} from 'lucide-react';
import { AppLanguage, VoiceRecord, HistoryItem } from '../types';
import { translations } from '../utils/translations';
import { useToast } from './Toast';

interface HistoryViewProps {
  lang: AppLanguage;
  voiceHistory: VoiceRecord[];
  toolHistory: HistoryItem[];
  clearHistory: () => void;
}

export default function HistoryView({ 
  lang, 
  voiceHistory, 
  toolHistory, 
  clearHistory 
}: HistoryViewProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'voice' | 'chat' | 'assistant' | 'text-tool'>('all');

  // Unified items structure
  const voiceItems: HistoryItem[] = voiceHistory.map(v => ({
    id: v.id,
    type: 'voice',
    title: t.itemVoice,
    subtitle: v.text, // Script text
    details: `Voice Persona: ${v.speaker} | Tone: ${v.emotion}`,
    timestamp: v.date,
    metadata: { audioUrl: v.audioUrl }
  }));

  const allItems = [...voiceItems, ...toolHistory].sort((a, b) => {
    // Sort in reverse chronological order
    return b.timestamp.localeCompare(a.timestamp);
  });

  const filteredItems = allItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = searchQuery.trim() === '' || 
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handlePlayVoiceFile = (audioUrl: string) => {
    if (audioUrl === 'local-stream') {
      showToast(lang === 'en' ? "This offline local speech does not have block media files stored." : "هذا النطق المحلي لا يحتوي على ملف تخزيني سحابي قابل للتحميل.", "info");
      return;
    }
    const audio = new Audio(audioUrl);
    audio.play();
    showToast(lang === 'en' ? "Replaying synthesized vocal tract..." : "جاري إعادة تشغيل الملف الصوتي...", "success");
  };

  const handleClearHistory = () => {
    const confirmWipe = window.confirm(lang === 'en' ? "Purge all saved voice tracks & tool histories from this sandbox?" : "هل أنت متأكد من مسح وحذف كافة أرشيفات الملفات الصوتية والنصوص محلياً؟");
    if (confirmWipe) {
      clearHistory();
      showToast(t.alertClearedCache, 'success');
    }
  };

  return (
    <div className="w-full pb-12" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Title */}
      <div className="mb-6 select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{t.historyTitleLarge}</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">{t.historySubtitle}</p>
        </div>

        {allItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-rose-950/20 hover:bg-rose-950/40 text-xs font-bold text-rose-400 border border-rose-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 size={13} />
            <span>{t.clearHistory}</span>
          </button>
        )}
      </div>

      {/* Lookup controls */}
      <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 backdrop-blur-md mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input bar */}
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchHistoryPlaceholder}
            className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
          <Search className="absolute right-3.5 top-3.5 text-slate-500" size={13} />
        </div>

        {/* Filter categories tabs */}
        <div className="flex flex-wrap items-center gap-2 select-none w-full md:w-auto">
          {(['all', 'voice', 'chat', 'assistant', 'text-tool'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                filterType === type 
                  ? 'bg-gradient-to-r from-cyan-950/20 to-purple-950/10 text-cyan-300 border border-cyan-500/20 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {type === 'all' && (lang === 'en' ? 'All' : 'الكل')}
              {type === 'voice' && (lang === 'en' ? 'Voice Studio' : 'الاستوديو')}
              {type === 'chat' && (lang === 'en' ? 'Chats' : 'المحادثات')}
              {type === 'assistant' && (lang === 'en' ? 'Assistant' : 'المساعد')}
              {type === 'text-tool' && (lang === 'en' ? 'Tools' : 'الأدوات')}
            </button>
          ))}
        </div>

      </div>

      {/* Render History Flow list */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 rounded-2xl border border-white/5 bg-slate-950/40 text-center select-none font-sans flex flex-col items-center justify-center gap-2">
            <Info className="w-8 h-8 text-slate-600 animate-pulse stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-400">{t.noHistoryFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => {
              let Icon = History;
              let iconTheme = 'bg-cyan-500/10 text-cyan-400';

              if (item.type === 'voice') {
                Icon = Volume2;
                iconTheme = 'bg-cyan-500/10 text-cyan-400';
              } else if (item.type === 'chat') {
                Icon = MessageSquare;
                iconTheme = 'bg-purple-500/10 text-purple-400';
              } else if (item.type === 'assistant') {
                Icon = Brain;
                iconTheme = 'bg-fuchsia-500/10 text-fuchsia-400';
              } else if (item.type === 'text-tool') {
                Icon = Wrench;
                iconTheme = 'bg-amber-400/10 text-amber-400';
              }

              return (
                <div 
                  key={item.id}
                  className="p-5 rounded-xl bg-slate-900/10 border border-white/5 hover:border-white/10 transition-all flex items-start gap-4"
                >
                  {/* Category icon */}
                  <div className={`p-2.5 rounded-xl shrink-0 ${iconTheme}`}>
                    <Icon size={18} />
                  </div>

                  {/* Context elements */}
                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-white text-xs">{item.title}</span>
                      <span className="font-mono text-[10px] text-slate-500 tracking-wider font-semibold">{item.timestamp}</span>
                    </div>

                    <p className="text-slate-300 font-medium text-xs sm:text-sm line-clamp-2 italic leading-relaxed">
                      "{item.subtitle}"
                    </p>

                    <p className="text-[11px] text-slate-500 mt-2">
                      {item.details}
                    </p>

                    {/* Expandable Voice Action */}
                    {item.type === 'voice' && item.metadata?.audioUrl && (
                      <div className="mt-3.5 flex items-center gap-2">
                        <button
                          onClick={() => handlePlayVoiceFile(item.metadata!.audioUrl)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-950/20 hover:bg-cyan-950/40 text-[10px] font-bold text-cyan-300 border border-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Play size={10} />
                          <span>{lang === 'en' ? "Replay Vocals" : "إعادة تشغيل الصوت"}</span>
                        </button>

                        {item.metadata.audioUrl !== 'local-stream' && (
                          <a
                            href={item.metadata.audioUrl}
                            download={`auravoice-history-${item.id}.wav`}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            title={t.downloadAudio}
                          >
                            <Download size={11} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
