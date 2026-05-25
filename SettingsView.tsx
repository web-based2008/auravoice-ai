import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, Globe, Moon, Sun, MonitorPlay, Zap, 
  Trash2, Sliders, Smartphone, AlertTriangle 
} from 'lucide-react';
import { AppLanguage, AppSettings } from '../types';
import { translations } from '../utils/translations';
import { useToast } from './Toast';

interface SettingsViewProps {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  clearAllCache: () => void;
}

export default function SettingsView({ 
  lang, 
  setLang, 
  settings, 
  setSettings, 
  clearAllCache 
}: SettingsViewProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { showToast } = useToast();

  const handleLangChange = (newLang: AppLanguage) => {
    setLang(newLang);
    setSettings(prev => ({ ...prev, lang: newLang }));
    localStorage.setItem('auravoice_lang', newLang);
    showToast(newLang === 'en' ? 'Core system Switched to English.' : 'تم تحويل النظام بالكامل للغة العربية.', 'success');
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('auravoice_theme', theme);
    showToast(theme === 'dark' ? 'Cyber Slate theme activated' : 'Ice Glass light theme activated', 'info');
  };

  const handleToggleMotion = () => {
    const newValue = !settings.motionEnabled;
    setSettings(prev => ({ ...prev, motionEnabled: newValue }));
    localStorage.setItem('auravoice_motion', String(newValue));
    showToast(newValue ? t.animationLabel + ' ' + t.animationEnabled : t.animationLabel + ' ' + t.animationDisabled, 'success');
  };

  const handleToggleMobileOpt = () => {
    const newValue = !settings.isMobileOptimized;
    setSettings(prev => ({ ...prev, isMobileOptimized: newValue }));
    localStorage.setItem('auravoice_mobile_opt', String(newValue));
    showToast(lang === 'en' ? 'Mobile Optimizations refreshed.' : 'تم تجديد تحسينات شاشات الموبايل.', 'success');
  };

  const handleClearCacheData = () => {
    const confirmWipe = window.confirm(lang === 'en' ? "This will erase all local files, logs, and settings cache. Continue?" : "سيقوم هذا بمسح كافة الذاكرة الموقتة، والمفاتيح، وحذف جميع العمليات المسجلة. هل ترغب بالاستمرار؟");
    if (confirmWipe) {
      clearAllCache();
      showToast(t.alertClearedCache, 'success');
    }
  };

  return (
    <div className="w-full pb-12 animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Title */}
      <div className="mb-8 select-none">
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.settingsTitleLarge}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">{t.settingsSub}</p>
      </div>

      <div className="max-w-3xl space-y-6">
        
        {/* Localization & Language */}
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4 select-none">
            <Globe className="text-cyan-400" size={18} />
            <span className="text-sm font-bold text-white">{t.langLabel}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-sans">
            <button
              onClick={() => handleLangChange('en')}
              className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                lang === 'en' 
                  ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                  : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>🇺🇸 English (US Language Core)</span>
            </button>

            <button
              onClick={() => handleLangChange('ar')}
              className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                lang === 'ar' 
                  ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                  : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>🇸🇦 العربية (بصمة النطق الفورية)</span>
            </button>
          </div>
        </div>

        {/* Theme select (Cyber Dark / Ice Light) */}
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4 select-none">
            <Moon className="text-cyan-400" size={18} />
            <span className="text-sm font-bold text-white">{t.themeLabel}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-sans">
            <button
              onClick={() => handleThemeChange('dark')}
              className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                settings.theme === 'dark' 
                  ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                  : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Moon size={14} />
              <span>{t.darkTheme}</span>
            </button>

            <button
              onClick={() => handleThemeChange('light')}
              className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                settings.theme === 'light' 
                  ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                  : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Sun size={14} />
              <span>{t.lightTheme}</span>
            </button>
          </div>
        </div>

        {/* Animation Toggles and Mobile settings */}
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md space-y-6 select-none font-sans">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-start gap-3">
              <MonitorPlay className="text-cyan-400 mt-0.5" size={18} />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">{t.animationLabel}</span>
                <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">
                  {lang === 'en' ? "Cinematic page sweeps. Disable on older devices to save processors." : "إيقاف أو تشغيل الحركات المعقدة لحفظ شحنات بطارية الهواتف القديمة."}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleMotion}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                settings.motionEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <span className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-slate-950 transition-all ${
                isRtl 
                  ? settings.motionEnabled ? 'left-6.5' : 'left-1'
                  : settings.motionEnabled ? 'right-1' : 'right-6.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Smartphone className="text-cyan-400 mt-0.5" size={18} />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">{t.mobileOptLabel}</span>
                <span className="text-[10px] text-slate-500 leading-normal block mt-0.5">
                  {lang === 'en' ? "Enable tiny margins, compact paddings, and smooth scrolling containers." : "تفعيل تخفيض مساحة الهوامش، وزيادة كثافة محاذاة الصناديق لتلائم الهواتف."}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleMobileOpt}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                settings.isMobileOptimized ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <span className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-slate-950 transition-all ${
                isRtl 
                  ? settings.isMobileOptimized ? 'left-6.5' : 'left-1'
                  : settings.isMobileOptimized ? 'right-1' : 'right-6.5'
              }`} />
            </button>
          </div>

        </div>

        {/* Clear cache */}
        <div className="p-6 rounded-2xl bg-rose-950/5 border border-rose-500/20 backdrop-blur-md font-sans">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-rose-400 shrink-0 mt-0.5 animate-pulse" size={18} />
            <div className="flex-1">
              <span className="text-xs sm:text-sm font-bold text-rose-300 block">{t.cacheLabel}</span>
              <p className="text-[10px] text-slate-500 leading-normal mt-1">
                {lang === 'en' 
                  ? "Erasing cache eliminates credentials, logs, and state history. This action cannot be undone." 
                  : "سحق الذاكرة يزيل جميع مفاتيح APIs والصوتيات المسجلة محلياً في البرنامج بصورة نهائية."}
              </p>
              
              <button
                onClick={handleClearCacheData}
                className="mt-4 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>{t.clearText}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
