import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Play, Pause, ArrowRight, HelpCircle, 
  ChevronDown, MessageSquare, Volume2, Key, History, Globe 
} from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../utils/translations';
import FloatingParticles from './FloatingParticles';
import AuraLogoCore from './AuraLogoCore';

interface LandingPageProps {
  lang: AppLanguage;
  setLang: React.Dispatch<React.SetStateAction<AppLanguage>>;
  onStart: () => void;
}

export default function LandingPage({ lang, setLang, onStart }: LandingPageProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  
  // FAQs state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Demo speech synthesis state
  const [isPlayingEn, setIsPlayingEn] = useState(false);
  const [isPlayingAr, setIsPlayingAr] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSpeak = (text: string, langCode: 'en' | 'ar', playerType: 'en' | 'ar') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      if (playerType === 'en' && isPlayingEn) {
        setIsPlayingEn(false);
        return;
      }
      if (playerType === 'ar' && isPlayingAr) {
        setIsPlayingAr(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'ar' ? 'ar-SA' : 'en-US';
      
      utterance.onend = () => {
        setIsPlayingEn(false);
        setIsPlayingAr(false);
      };
      
      utterance.onerror = () => {
        setIsPlayingEn(false);
        setIsPlayingAr(false);
      };

      if (playerType === 'en') {
        setIsPlayingEn(true);
        setIsPlayingAr(false);
      } else {
        setIsPlayingAr(true);
        setIsPlayingEn(false);
      }

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser. Please open in a tab or try Chrome/Safari.");
    }
  };

  const faqItems = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
  ];

  const showcaseFeatures = [
    {
      icon: Volume2,
      title: lang === 'en' ? "Neural Voice Studio" : "استوديو الصوت العصبوني",
      desc: lang === 'en' ? "Translate written scripts into professional audio output in seconds with configurable speaker styles." : "حوّل نصوصك إلى صوت حواري فائق الجودة باللغتين العربية والإنجليزية بلمح البصر.",
      gradient: "from-cyan-500 to-teal-400"
    },
    {
      icon: MessageSquare,
      title: lang === 'en' ? "Smart Gemini Chat" : "محادثة جيميناي الذكية",
      desc: lang === 'en' ? "An interactive interface for deep dialect brainstorms, code writing, and comprehensive document layouts." : "مساعد ذكي للمحادثات، كتابة الأكواد، وتنسيق الأوراق والمستندات بمرونة عالية.",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: Key,
      title: lang === 'en' ? "Secure API Sandboxing" : "بيئة تشغيل API آمنة",
      desc: lang === 'en' ? "Fully client-safe LocalStorage model keys to test connection latency and avoid premium plan walls." : "تخزين محلي معزول 100% لمفاتيح الـ API لتجنب الدفع وتجربة المنصة فوراً وبسرعة قصوى.",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="w-full text-slate-100 font-sans pb-12 overflow-x-hidden relative" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 1. Animated Mesh/Dotted Grid Background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,#090d16_0%,transparent_100%)] pointer-events-none -z-30 min-h-screen" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-25"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. Interactive Network & Floating Particle Canvas */}
      <FloatingParticles />

      {/* 3. 3D Parallax floating neon blur blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <motion.div 
          animate={{
            y: [0, -40, 0],
            x: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[8%] left-[10%] w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[90px]"
        />
        <motion.div 
          animate={{
            y: [0, 45, 0],
            x: [0, -35, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
          className="absolute top-[35%] right-[12%] w-[420px] h-[420px] rounded-full bg-purple-500/10 blur-[110px]"
        />
        <motion.div 
          animate={{
            y: [0, -50, 0],
            x: [0, -25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-[20%] left-[15%] w-[380px] h-[380px] rounded-full bg-emerald-500/5 blur-[95px]"
        />
        <motion.div 
          animate={{
            y: [0, 35, 0],
            x: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-[8%] right-[20%] w-[325px] h-[325px] rounded-full bg-rose-500/5 blur-[85px]"
        />
      </div>

      {/* Premium Navigation Header with Language Pill */}
      <header className="max-w-6xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-500 p-[1.5px] shadow-lg shadow-cyan-500/10 hover:rotate-6 transition-all duration-300">
            <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center font-mono font-black text-cyan-400 text-lg tracking-wider">
              A
            </div>
          </div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent flex items-center gap-1.5">
            AuraVoice
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest hidden sm:inline-block">
              Studio
            </span>
          </span>
        </div>

        {/* Premium sliding selector pill */}
        <div className="flex items-center gap-1 bg-slate-950/70 border border-white/10 p-1 rounded-full backdrop-blur-lg">
          <button
            onClick={() => {
              setLang('en');
              localStorage.setItem('auravoice_lang', 'en');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1 ${
              lang === 'en' 
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={11} />
            <span>EN</span>
          </button>
          <button
            onClick={() => {
              setLang('ar');
              localStorage.setItem('auravoice_lang', 'ar');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              lang === 'ar' 
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            العربية
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.12,
              delayChildren: 0.05
            }
          }
        }}
        className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24 text-center relative z-10"
      >
        {/* Glowing Badge */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { 
              opacity: 1, 
              scale: 1,
              transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
            }
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/45 border border-cyan-400/30 mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span className="font-mono text-[9px] sm:text-[10px] font-extrabold text-cyan-300 uppercase tracking-widest">
            {t.freeBadge}
          </span>
        </motion.div>

        {/* Catchy Hero Text */}
        <motion.h1 
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
            }
          }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight sm:leading-none bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
        >
          {t.heroTitle}
        </motion.h1>
        
        <motion.p 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            }
          }}
          className="mt-6 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          {t.heroSubtitle}
        </motion.p>

        {/* Cinematic Animated CSS/SVG Centerpiece Aura Logo */}
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.85, y: 15 },
            visible: { 
              opacity: 1, 
              scale: 1,
              y: 0,
              transition: { duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }
            }
          }}
        >
          <AuraLogoCore />
        </motion.div>

        {/* CTAs */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            }
          }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-9 py-4.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 border-b-[6px] border-cyan-700 hover:border-b-[3px] active:border-b-0 hover:translate-y-[3px] active:translate-y-[6px] shadow-[0_4px_20px_rgba(34,211,238,0.15)] hover:shadow-[0_8px_25px_rgba(34,211,238,0.3)] transition-all duration-100 ease-out cursor-pointer flex items-center justify-center gap-2 text-sm select-none"
          >
            <span>{t.startFree}</span>
            <ArrowRight size={18} className={isRtl ? "rotate-180" : ""} />
          </button>
          
          <a
            href="#demo-section"
            className="w-full sm:w-auto px-9 py-4.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white border border-white/10 border-b-[5px] border-b-slate-700 hover:border-b-[2px] active:border-b-0 hover:translate-y-[3px] active:translate-y-[5px] transition-all duration-100 ease-out text-center text-sm select-none block"
          >
            {t.exploreFeatures}
          </a>
        </motion.div>
      </motion.section>

      {/* Demo Vocal Preview Laboratory */}
      <section id="demo-section" className="max-w-4xl mx-auto px-6 mt-20 sm:mt-28 relative z-10 animate-fade-in">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Volume2 className="text-cyan-400 animate-pulse" />
                <span>{lang === 'en' ? "Instant Vocal Playback Demo" : "عرض الاستماع الصوتي التجريبي الفوري"}</span>
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {lang === 'en' ? "Synthesize offline English and Arabic text blocks instantly on this machine." : "جرّب النطق الصوتي الفوري مجاناً دون الحاجة لمفاتيح APIs مخصصة الآن."}
              </p>
            </div>
            
            <span className="self-start md:self-auto px-2.5 py-1 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              {t.platformStatusSub}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {/* English Player Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-between gap-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">English (US Engine)</span>
              <p className="text-sm font-sans italic text-slate-300 leading-relaxed font-semibold">
                "{t.demoScriptEn}"
              </p>
              <button
                onClick={() => handleSpeak(t.demoScriptEn, 'en', 'en')}
                className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-100 cursor-pointer select-none ${
                  isPlayingEn 
                    ? 'bg-rose-950/40 border border-rose-500/30 border-b-[4px] border-b-rose-700 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px] text-rose-300' 
                    : 'bg-slate-900 border border-white/10 border-b-[4px] border-b-cyan-500/30 hover:border-b-[2px] active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px] text-slate-200 hover:bg-slate-800 hover:border-cyan-400/20 shadow-sm'
                }`}
              >
                {isPlayingEn ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlayingEn ? (lang === 'en' ? 'Stop Synthesis' : 'إيقاف الصياغة') : (lang === 'en' ? 'Play Demo Voice' : 'تشغيل الصوت التجريبي')}</span>
              </button>
            </div>

            {/* Arabic Player Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-between gap-4" style={{ direction: 'rtl' }}>
              <span className="text-[11px] font-mono text-purple-400 uppercase font-bold float-right">اللغة العربية (سلسلة النطق الفوري)</span>
              <p className="text-sm font-sans italic text-slate-300 leading-relaxed font-bold">
                "{t.demoScriptAr}"
              </p>
              <button
                onClick={() => handleSpeak(t.demoScriptAr, 'ar', 'ar')}
                className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-100 cursor-pointer select-none ${
                  isPlayingAr 
                    ? 'bg-rose-950/40 border border-rose-500/30 border-b-[4px] border-b-rose-700 active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px] text-rose-300' 
                    : 'bg-slate-900 border border-white/10 border-b-[4px] border-b-purple-500/30 hover:border-b-[2px] active:border-b-0 hover:translate-y-[2px] active:translate-y-[4px] text-slate-200 hover:bg-slate-800 hover:border-purple-400/20 shadow-sm'
                }`}
              >
                {isPlayingAr ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlayingAr ? 'إيقاف الصياغة' : 'تشغيل الصوت التجريبي'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-6xl mx-auto px-6 mt-24">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight">
          {lang === 'en' ? "Designed for Creators, Optimized for Speed" : "مصمم للمبدعين، ومحسن للسرعة الفائقة"}
        </h2>
        <p className="text-sm text-slate-400 text-center mt-2 max-w-xl mx-auto">
          {lang === 'en' ? "Unleash client-side AI performance without continuous paid subscription demands." : "أطلق العنان لقوة الحوسبة والذكاء الاصطناعي دون الحاجة لتجديد اشتراكات شهرية باهظة الثمن."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {showcaseFeatures.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 hover:border-cyan-500/20 hover:bg-slate-900/50 transition-all duration-300 group flex flex-col gap-4 relative"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} p-2.5 text-slate-950 flex items-center justify-center`}>
                  <IconComponent size={24} />
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-sm text-slate-400 leading-normal font-sans">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions (FAQs) */}
      <section className="max-w-3xl mx-auto px-6 mt-28">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center flex items-center justify-center gap-2 mb-8">
          <HelpCircle className="text-cyan-400" />
          <span>{t.faqTitle}</span>
        </h2>

        <div className="space-y-4">
          {faqItems.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="rounded-xl border border-white/5 bg-slate-900/25 overflow-hidden transition-colors hover:border-white/10"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  <span className="text-sm sm:text-base leading-tight pr-4">{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-cyan-400 shrink-0 transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-400 border-t border-white/5 leading-relaxed font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Start Free Studio CTA Card */}
      <section className="max-w-4xl mx-auto px-6 mt-28">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-cyan-950/50 via-slate-900/50 to-purple-950/20 border border-cyan-500/20 text-center relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-12 w-48 h-48 bg-cyan-400/5 rounded-full blur-[80px]" />
          
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {lang === 'en' ? "Open the Futuristic Command Center" : "افتح لوحة تحكم الاستوديو المستقبلي"}
          </h2>
          <p className="text-sm text-slate-400 mt-3 max-w-xl mx-auto">
            {lang === 'en' ? "Engage modular text pipelines, voice studios, and intelligent developer API settings immediately." : "ابدأ على الفور بتنفيذ معالجات الصوتيات المتقدمة، وخدمات الكود وتلخيص النصوص مجاناً وبسرعة كاملة."}
          </p>
          
          <button
            onClick={onStart}
            className="mt-8 px-10 py-4.5 rounded-xl font-black bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 border-b-[6px] border-cyan-700 hover:border-b-[3px] active:border-b-0 hover:translate-y-[3px] active:translate-y-[6px] shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/30 transition-all duration-100 ease-out cursor-pointer select-none inline-block text-sm"
          >
            {t.startFree}
          </button>
        </div>
      </section>
    </div>
  );
}
