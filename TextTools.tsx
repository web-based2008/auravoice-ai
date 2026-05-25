import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, ShieldCheck, HelpCircle, Loader2, Play, CheckCircle2, 
  XCircle, RefreshCw, Copy, Check, Wand2, FileText, Search, Share2, Type 
} from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../utils/translations';
import { useToast } from './Toast';

interface TextToolsProps {
  lang: AppLanguage;
  apiKeys: { gemini: { key: string; status: string } };
  addHistoryItem: (item: any) => void;
  serverKeyAvailable: boolean;
}

export default function TextTools({ 
  lang, 
  apiKeys, 
  addHistoryItem,
  serverKeyAvailable 
}: TextToolsProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { showToast } = useToast();

  const [activeTool, setActiveTool] = useState('enhancer');
  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: 'enhancer',
      icon: Wand2,
      name: { en: "Prompt Enhancer", ar: "مُحسّن الأوامر البرمجية" },
      description: { en: "Turn basic, short writing prompts into highly detailed, context-rich instructions for any AI model.", ar: "حول الأوامر البسيطة والقصيرة لتفاصيل صياغية دقيقة غنية بالتعليمات المدعومة." },
      prompt: "Act as an expert prompt engineer. Take this basic input prompt and expand it into a high-quality system prompt with role background, constraints, guidelines, and an evaluation format. Write the prompt beautifully:\n\n",
      placeholder: { en: "e.g. Write a marketing email...", ar: "مثال: اكتب بريد تسويقي..." }
    },
    {
      id: 'cleaner',
      icon: FileText,
      name: { en: "Text Cleaner", ar: "مُنظّف ومُرتّب النصوص" },
      description: { en: "Remove unnecessary formatting, weird linebreaks, code residuals, or duplicate lines from raw clipboard text.", ar: "احذف الفراغات المكررة، والفواصل الطويلة، والرموز البرمجية غير المرغوبة من نصوصك." },
      prompt: "Act as a text formatting utility. Standardize spacing, remove formatting debris, double spacing, odd linebreaks, and clear syntax lines from the following content. Output the clean text directly without conversational summaries:\n\n",
      placeholder: { en: "Paste cluttered text containing HTML tags or double linebreaks...", ar: "الصق النصوص المبعثرة التي تحتوي على فواصل غريبة أو ترميز HTML..." }
    },
    {
      id: 'grammar',
      icon: CheckCircle2,
      name: { en: "Grammar Fixer", ar: "المُصحّح والمدقق اللغوي" },
      description: { en: "Identify and instantly fix common speech mistakes, spelling faults, tense issues, or Arabic syntax errors.", ar: "تبين وصحح فوراً أخطاء التدقيق الصياغي، والقواعد اللغوية، وعلامات الترقيم بدقة." },
      prompt: "Identify and correct all grammar mistakes, spelling faults, and punctuation errors. Return ONLY the fully corrected copy without commentary:\n\n",
      placeholder: { en: "e.g. He do not went to school yesterday...", ar: "مثال: هو لم يذهبون إلى المدرسة أمس..." }
    },
    {
      id: 'seo',
      icon: Search,
      name: { en: "SEO Keyword Optimizer", ar: "مُحسّن كلمات الـ SEO" },
      description: { en: "Analyze input titles or snippets and suggest highly engaging meta tag descriptions and high-traffic tags.", ar: "حلل العناوين والمستندات واقترح كلمات دلالية ووسوم بحثية ذات ترتيب مرتفع." },
      prompt: "Act as an SEO expert. Take this text and compile a list of 10 high-ranking keyword search tags, paired with a compelling meta-description tag (under 160 characters) optimal for search ranking results. Provide clear tidy headers:\n\n",
      placeholder: { en: "Paste a blog title, short draft, or topic key terms...", ar: "الصق عنوان المقال لتوليد قائمة الوسوم وكلمات البحث الذكية..." }
    },
    {
      id: 'social',
      icon: Share2,
      name: { en: "Social Caption Hook", ar: "مُولّد خطافات شبكات التواصل" },
      description: { en: "Create catchy captions, bullet lists, call-to-actions, and tags optimized for LinkedIn, Twitter, or IG.", ar: "صمم منشورات جاذبة وشيقة مع وسوم ملائمة للمنصات الرقمية لزيادة التفاعل." },
      prompt: "Generate 3 highly compelling social media caption hooks with appropriate emojis, line spacing, and tags. Include a clear engagement call-to-action:\n\n",
      placeholder: { en: "Write the topic or headline of your share post...", ar: "أدخل فكرة المنشور، أو الخدمة التي ترغب بجذب الجمهور إليها..." }
    },
    {
      id: 'titles',
      icon: Type,
      name: { en: "Clickable Title Generator", ar: "ابتكار العناوين الجاذبة" },
      description: { en: "Brainstorm highly magnetic, clicks-inducing titles and bullet headers for articles, courses, or videos.", ar: "توليد باقة من العناوين الإبداعية المشوقة لجذب القراء والمشاهدين." },
      prompt: "Suggest 5 highly creative, clickable, magnetic titles appropriate for this theme. Avoid hyper-clickbait but maintain maximum curiosity:\n\n",
      placeholder: { en: "Write your current draft headline, video script topic, or app concept...", ar: "اكتب عنواناً لمسودتك، أو موضوع الفيديو لمطابقة العناوين المقترحة..." }
    }
  ];

  const handleToolRun = async () => {
    if (!inputText.trim()) {
      showToast(lang === 'en' ? "Please insert your raw text first" : "يرجى كتابة نص المدخلات أولاً", "warning");
      return;
    }

    const hasKey = serverKeyAvailable || apiKeys.gemini.status === 'valid';
    if (!hasKey) {
      showToast(t.alertRequiredKey, 'error');
      return;
    }

    setLoading(true);
    setResultText('');

    const targetTool = tools.find(t => t.id === activeTool)!;
    const promptPayload = `${targetTool.prompt}${inputText.trim()}`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptPayload,
          customKey: apiKeys.gemini.key || undefined,
          systemInstruction: "You are the advanced AuraVoice Generative Text Suite. Output cleanly structured assets directly."
        })
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setResultText(data.text);

        // Save entry in history logs
        addHistoryItem({
          id: Math.random().toString(36).substring(2, 9),
          type: 'text-tool',
          title: targetTool.name[lang],
          subtitle: inputText.substring(0, 48) + (inputText.length > 48 ? '...' : ''),
          details: data.text,
          timestamp: new Date().toLocaleTimeString()
        });

      } else {
        throw new Error(data.error || "Generation limit error.");
      }

    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Verification link failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    showToast(t.alertCopied, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTool = tools.find(t => t.id === activeTool)!;

  return (
    <div className="w-full pb-12" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Title */}
      <div className="mb-6 select-none">
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.textToolsTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">{t.textToolsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left selector cards scroll bar */}
        <div className="lg:col-span-1 space-y-2 select-none h-40 lg:h-auto overflow-y-auto pr-1">
          {tools.map((tl) => {
            const Icon = tl.icon;
            const active = activeTool === tl.id;
            return (
              <button
                key={tl.id}
                onClick={() => { setActiveTool(tl.id); setResultText(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                  active 
                    ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-cyan-500/30 text-cyan-300' 
                    : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{tl.name[lang]}</span>
              </button>
            );
          })}
        </div>

        {/* Right workspace interactive box */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md space-y-4">
            
            <div>
              <h4 className="text-sm font-bold text-white leading-normal">{currentTool.name[lang]}</h4>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">{currentTool.description[lang]}</p>
            </div>

            {/* Input area */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentTool.placeholder[lang]}
              rows={4}
              className="w-full p-4 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-0 resize-none transition-all duration-200"
            />

            <div className="flex justify-end gap-2 pr-1 font-sans">
              <button
                onClick={handleToolRun}
                disabled={loading || !inputText.trim()}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                <span>{loading ? t.btnExecuting : (lang === 'en' ? 'Refine Text' : 'تشغيل الأداة')}</span>
              </button>
            </div>
          </div>

          {/* Outputs */}
          {(resultText || loading) && (
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md relative">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 select-none">
                <span className="text-xs font-bold text-slate-400 font-sans">{t.resultLabel}</span>
                
                {resultText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-8 flex items-center justify-center flex-col text-slate-500 gap-3 font-sans">
                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                  <span className="text-xs">{t.btnExecuting}</span>
                </div>
              ) : (
                <div className="space-y-2 font-sans text-sm text-slate-200 leading-relaxed pr-4">
                  {resultText.split('\n').map((line, index) => {
                    if (!line.trim()) return <div key={index} className="h-2" />;
                    return <p key={index}>{line}</p>;
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
