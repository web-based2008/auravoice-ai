import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Brain, FileText, Sparkles, Languages, Check, Copy, 
  RefreshCw, Lightbulb, Play 
} from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../utils/translations';
import { useToast } from './Toast';

function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-cyan-300 font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

interface AIAssistantProps {
  lang: AppLanguage;
  apiKeys: { gemini: { key: string; status: string } };
  addHistoryItem: (item: any) => void;
  serverKeyAvailable: boolean;
}

export default function AIAssistant({ 
  lang, 
  apiKeys, 
  addHistoryItem,
  serverKeyAvailable
}: AIAssistantProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<'summarize' | 'rewrite' | 'translate' | 'brainstorm'>('summarize');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [executing, setExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const toolsConfig = {
    summarize: {
      title: lang === 'en' ? "Summarize Material" : "تلخيص المحتوى المكتوب",
      prompt: "Condense this text into clear, action-oriented bullet point summaries. Use bold markdown for key outcomes. Keep it brief and professional:\n\n",
      placeholder: lang === 'en' ? "Paste essays, news articles, or raw transcript blocks here..." : "الصق المقالات، أو المحاضرات المكتوبة، أو نصوص المقابلات الطويلة لتلخيصها..."
    },
    rewrite: {
      title: lang === 'en' ? "Polish & Rewrite" : "إعادة صياغة وتنقيح الأسلوب",
      prompt: "Polish and rewrite this content. Improve the syntax, correct spelling, and elevate the overall style so that it sounds extremely sleek, modern, and engaging. Return the polished result directly with no conversational fluff:\n\n",
      placeholder: lang === 'en' ? "Type draft text, drafts of emails, or bullet points to expand..." : "اكتب مسودات الرسائل، أو منشورات قصيرة لإعادة صياغتها بلغة فصيحة وراقية..."
    },
    translate: {
      title: lang === 'en' ? "Fluent Translator" : "المترجم الذكي المزدوج",
      prompt: "Translate this content accurately. If the input is in English, translate it to clear natural Arabic holding appropriate idioms. If the input is in Arabic, translate it to pristine modern English. Return only the translated results:\n\n",
      placeholder: lang === 'en' ? "Enter text you want to translate between Arabic and English..." : "أدخل العبارات التي ترغب بمطابقتها وترجمتها بين السلسلتين العربية والإنجليزية..."
    },
    brainstorm: {
      title: lang === 'en' ? "Brainstorm Ideas" : "توليد وابتكار الأفكار",
      prompt: "Brainstorm 5 highly creative, fresh, and modern names/ideas based on this concept. Include brief, catchy tagline explanations for each. Add visual styled markdown:\n\n",
      placeholder: lang === 'en' ? "Write a concept name, business goal, or app theme you want ideas for..." : "اكتب اسم مشروع، أو فكرة تطبيق، أو موضوع مقال ترغب بتوليد أفكار حوله..."
    }
  };

  const handleExecute = async () => {
    if (!inputText.trim()) {
      showToast(lang === 'en' ? "Please type some input first" : "يرجى إدخال محتوى أولاً", "warning");
      return;
    }

    const hasKey = serverKeyAvailable || apiKeys.gemini.status === 'valid';
    if (!hasKey) {
      showToast(t.alertRequiredKey, 'error');
      return;
    }

    setExecuting(true);
    setResult('');

    const activeConfig = toolsConfig[activeCategory];
    const promptPayload = `${activeConfig.prompt}${inputText.trim()}`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptPayload,
          customKey: apiKeys.gemini.key || undefined,
          systemInstruction: "You are the specialized AuraVoice Assistant Core. Provide directly compiled results without leading commentary like 'Sure, here is your output:'."
        })
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setResult(data.text);
        
        // Register transaction in Local Storage History
        addHistoryItem({
          id: Math.random().toString(36).substring(2, 9),
          type: 'assistant',
          title: activeConfig.title,
          subtitle: inputText.substring(0, 48) + (inputText.length > 48 ? '...' : ''),
          details: data.text,
          timestamp: new Date().toLocaleTimeString()
        });

      } else {
        throw new Error(data.error || "Generation error.");
      }

    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to parse query.", "error");
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    showToast(t.alertCopied, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full pb-12" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Header */}
      <div className="mb-8 select-none">
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.assistantTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">{t.assistantSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left side Categories rail */}
        <div className="space-y-2 select-none">
          <button
            onClick={() => { setActiveCategory('summarize'); setResult(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeCategory === 'summarize' 
                ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <FileText size={16} />
            <span>{lang === 'en' ? "Summarizer" : "مُلخّص المحتوى"}</span>
          </button>

          <button
            onClick={() => { setActiveCategory('rewrite'); setResult(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeCategory === 'rewrite' 
                ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Sparkles size={16} />
            <span>{lang === 'en' ? "Polish Engine" : "منقح الصياغة والأخطاء"}</span>
          </button>

          <button
            onClick={() => { setActiveCategory('translate'); setResult(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeCategory === 'translate' 
                ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Languages size={15} />
            <span>{lang === 'en' ? "Smart Translator" : "المترجم الذكي"}</span>
          </button>

          <button
            onClick={() => { setActiveCategory('brainstorm'); setResult(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeCategory === 'brainstorm' 
                ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Lightbulb size={16} />
            <span>{lang === 'en' ? "Idea Generator" : "مُولد وابتكار الأفكار"}</span>
          </button>
        </div>

        {/* Right Input and Output Sandbox */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md space-y-4">
            
            <h4 className="text-xs font-mono font-extrabold text-cyan-400 uppercase tracking-widest leading-none">
              {toolsConfig[activeCategory].title}
            </h4>

            {/* Input parameters */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={toolsConfig[activeCategory].placeholder}
              rows={5}
              className="w-full p-4 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-0 resize-none transition-all duration-200"
            />

            <div className="flex justify-end gap-2 pr-1 font-sans">
              <button
                onClick={handleExecute}
                disabled={executing || !inputText.trim()}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {executing ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                <span>{executing ? t.btnExecuting : t.btnExecute}</span>
              </button>
            </div>
          </div>

          {/* Render Result Panel */}
          {(result || executing) && (
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md relative">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <span className="text-xs font-bold text-slate-400 font-sans">{t.resultLabel}</span>
                
                {result && (
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy output'}</span>
                  </button>
                )}
              </div>

              {executing ? (
                <div className="py-8 flex items-center justify-center flex-col text-slate-500 gap-3 font-sans">
                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                  <span className="text-xs">{t.btnExecuting}</span>
                </div>
              ) : (
                <div className="space-y-3 prose prose-invert overflow-x-auto leading-relaxed max-w-full text-slate-200 text-sm font-sans pr-4">
                  {result.split('\n').map((paragraph, index) => {
                    if (!paragraph.trim()) return <div key={index} className="h-2" />;
                    
                    // List rendering
                    if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
                      return (
                        <ul key={index} className="list-disc pl-5 list-inside text-slate-300">
                          <li>{parseBoldText(paragraph.replace(/^[-*]\s+/, ''))}</li>
                        </ul>
                      );
                    }
                    
                    return <p key={index}>{parseBoldText(paragraph)}</p>;
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
