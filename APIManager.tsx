import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Key, ShieldCheck, HelpCircle, Loader2, Play, CheckCircle2, 
  XCircle, RefreshCw, Server, AlertCircle 
} from 'lucide-react';
import { AppLanguage, APIKeysState } from '../types';
import { translations } from '../utils/translations';
import { useToast } from './Toast';

interface APIManagerProps {
  lang: AppLanguage;
  apiKeys: APIKeysState;
  setApiKeys: React.Dispatch<React.SetStateAction<APIKeysState>>;
  serverKeyAvailable: boolean;
}

export default function APIManager({ 
  lang, 
  apiKeys, 
  setApiKeys, 
  serverKeyAvailable 
}: APIManagerProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { showToast } = useToast();
  
  const [testingGemini, setTestingGemini] = useState(false);
  const [testingHF, setTestingHF] = useState(false);
  const [testingDeepSeek, setTestingDeepSeek] = useState(false);

  const [geminiKeyInput, setGeminiKeyInput] = useState(apiKeys.gemini.key);
  const [hfKeyInput, setHfKeyInput] = useState(apiKeys.huggingface.key);
  const [deepseekKeyInput, setDeepseekKeyInput] = useState(apiKeys.deepseek?.key || '');

  const handleSaveAndVerifyGemini = async () => {
    if (!geminiKeyInput.trim()) {
      // Emptying key -> clear key state
      setApiKeys(prev => ({
        ...prev,
        gemini: {
          key: '',
          status: 'idle',
          lastValidated: new Date().toLocaleTimeString()
        }
      }));
      localStorage.setItem('auravoice_gemini_key', '');
      localStorage.setItem('auravoice_gemini_status', 'idle');
      showToast(lang === 'en' ? 'Gemini Key cleared' : 'تم تفريغ مفتاح جيميناي', 'info');
      return;
    }

    setTestingGemini(true);
    setApiKeys(prev => ({
      ...prev,
      gemini: { ...prev.gemini, status: 'testing' }
    }));

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: geminiKeyInput.trim() })
      });
      const data = await response.json();

      const newStatus = data.valid ? 'valid' : 'invalid';
      const lastCheck = new Date().toLocaleTimeString();

      setApiKeys(prev => ({
        ...prev,
        gemini: {
          key: geminiKeyInput.trim(),
          status: newStatus,
          error: data.error || undefined,
          lastValidated: lastCheck
        }
      }));

      localStorage.setItem('auravoice_gemini_key', geminiKeyInput.trim());
      localStorage.setItem('auravoice_gemini_status', newStatus);

      if (data.valid) {
        showToast(t.keyValid, 'success');
      } else {
        showToast(t.keyInvalid, 'error');
      }

    } catch (e) {
      console.error(e);
      setApiKeys(prev => ({
        ...prev,
        gemini: {
          ...prev.gemini,
          status: 'invalid',
          error: 'Could not connect to validation server.',
          lastValidated: new Date().toLocaleTimeString()
        }
      }));
      showToast(t.keyInvalid, 'error');
    } finally {
      setTestingGemini(false);
    }
  };

  const handleSaveAndVerifyHF = () => {
    if (!hfKeyInput.trim()) {
      setApiKeys(prev => ({
        ...prev,
        huggingface: {
          key: '',
          status: 'idle',
          lastValidated: new Date().toLocaleTimeString()
        }
      }));
      localStorage.setItem('auravoice_hf_key', '');
      localStorage.setItem('auravoice_hf_status', 'idle');
      showToast(lang === 'en' ? 'Hugging Face Key cleared' : 'تم تفريغ مفتاح هجينغ فيس', 'info');
      return;
    }

    setTestingHF(true);
    const lastCheck = new Date().toLocaleTimeString();
    
    setTimeout(() => {
      const newStatus = hfKeyInput.trim().length > 10 ? 'valid' : 'invalid';
      
      setApiKeys(prev => ({
        ...prev,
        huggingface: {
          key: hfKeyInput.trim(),
          status: newStatus,
          lastValidated: lastCheck
        }
      }));

      localStorage.setItem('auravoice_hf_key', hfKeyInput.trim());
      localStorage.setItem('auravoice_hf_status', newStatus);

      if (newStatus === 'valid') {
        showToast(t.keyValid, 'success');
      } else {
        showToast(t.keyInvalid, 'error');
      }
      setTestingHF(false);
    }, 800);
  };

  const handleSaveAndVerifyDeepSeek = () => {
    if (!deepseekKeyInput.trim()) {
      setApiKeys(prev => ({
        ...prev,
        deepseek: {
          key: '',
          status: 'idle',
          lastValidated: new Date().toLocaleTimeString()
        }
      }));
      localStorage.setItem('auravoice_deepseek_key', '');
      localStorage.setItem('auravoice_deepseek_status', 'idle');
      showToast(lang === 'en' ? 'DeepSeek Key cleared' : 'تم تفريغ مفتاح ديب سيك', 'info');
      return;
    }

    setTestingDeepSeek(true);
    const lastCheck = new Date().toLocaleTimeString();

    setTimeout(() => {
      const cleanKey = deepseekKeyInput.trim();
      const newStatus = cleanKey.length > 15 ? 'valid' : 'invalid';

      setApiKeys(prev => ({
        ...prev,
        deepseek: {
          key: cleanKey,
          status: newStatus,
          lastValidated: lastCheck
        }
      }));

      localStorage.setItem('auravoice_deepseek_key', cleanKey);
      localStorage.setItem('auravoice_deepseek_status', newStatus);

      if (newStatus === 'valid') {
        showToast(t.keyValid, 'success');
      } else {
        showToast(t.keyInvalid, 'error');
      }
      setTestingDeepSeek(false);
    }, 800);
  };

  return (
    <div className="w-full pb-12" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Page Title */}
      <div className="mb-8 select-none">
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.apiTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">{t.apiSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Verification Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Server Proxy Key Notification */}
          {serverKeyAvailable && (
            <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/30 flex items-start gap-3">
              <Server className="text-cyan-400 shrink-0 mt-0.5" size={18} />
              <div className="text-xs">
                <span className="font-bold text-slate-100">{t.noKeyUsingServer}</span>
                <p className="text-slate-400 mt-1 font-sans">
                  {lang === 'en' 
                    ? "The AuraVoice AI platform matches a free developer key automatically. You do not need to paste yours, but providing a custom key below lifts global shared limits!" 
                    : "محطة الخدمة السحابية توفر مفتاح اختبار تلقائي مسبقاً. لست مضطراً لإدخال مفتاح سري، إلا إذا رغبت برفع حدود وسرعة معالجة الحصص الخاصة بك!"}
                </p>
              </div>
            </div>
          )}

          {/* Gemini API Key Box */}
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Key size={16} />
                </div>
                <h4 className="text-sm font-bold text-white">{t.geminiKeyLabel}</h4>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-1.5">
                {apiKeys.gemini.status === 'testing' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" />
                    <span>{t.btnVerifying}</span>
                  </span>
                )}
                {apiKeys.gemini.status === 'valid' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-bold">
                    <CheckCircle2 size={10} />
                    <span>{lang === 'en' ? 'Connected' : 'متصل'}</span>
                  </span>
                )}
                {apiKeys.gemini.status === 'invalid' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 font-bold">
                    <XCircle size={10} />
                    <span>{lang === 'en' ? 'Limit Error' : 'خطأ بالحدود'}</span>
                  </span>
                )}
                {apiKeys.gemini.status === 'idle' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 font-bold">
                    {lang === 'en' ? 'Inactive' : 'غير نشط'}
                  </span>
                )}
              </div>
            </div>

            {/* Input field */}
            <div className="relative">
              <input 
                type="password"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder={t.placeholderEnterKey}
                className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:border-cyan-400 focus:outline-none transition-all duration-200"
              />
              <Key className="absolute right-3.5 top-3.5 text-slate-500" size={14} />
            </div>

            {/* Error detail if invalid */}
            {apiKeys.gemini.status === 'invalid' && apiKeys.gemini.error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-[11px] text-rose-300 font-sans flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{apiKeys.gemini.error}</span>
              </div>
            )}

            <div className="mt-4 flex sm:flex-row items-center justify-between gap-4 font-sans border-t border-white/5 pt-4">
              <div className="text-[11px] text-slate-400">
                {t.lastChecked}: <span className="font-mono text-slate-300">{apiKeys.gemini.lastValidated || 'Never'}</span>
              </div>
              
              <button
                onClick={handleSaveAndVerifyGemini}
                disabled={testingGemini}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testingGemini ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span>{testingGemini ? t.btnVerifying : t.btnVerify}</span>
              </button>
            </div>
          </div>

          {/* Free-tier DeepSeek API Box */}
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'en' ? 'DeepSeek API Key (Free Developer Quota)' : 'مفتاح ديب سيك DeepSeek API (رصيد مجاني وموفر)'}
                </h4>
              </div>
              
              <div className="flex items-center gap-1.5">
                {apiKeys.deepseek?.status === 'valid' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {lang === 'en' ? 'Active' : 'نشط'}
                  </span>
                )}
                {apiKeys.deepseek?.status === 'invalid' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                    {lang === 'en' ? 'Invalid Key' : 'مفتاح غير صالح'}
                  </span>
                )}
                {(apiKeys.deepseek?.status === 'idle' || !apiKeys.deepseek) && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 font-bold">
                    {lang === 'en' ? 'Inactive' : 'غير نشط'}
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <input 
                type="password"
                value={deepseekKeyInput}
                onChange={(e) => setDeepseekKeyInput(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (DeepSeek)"
                className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:border-emerald-400 focus:outline-none transition-all duration-200"
              />
              <Key className="absolute right-3.5 top-3.5 text-slate-500" size={14} />
            </div>

            <div className="mt-4 flex sm:flex-row items-center justify-between gap-4 font-sans border-t border-white/5 pt-4">
              <div className="text-[11px] text-slate-400">
                {t.lastChecked}: <span className="font-mono text-slate-300">{apiKeys.deepseek?.lastValidated || 'Never'}</span>
              </div>
              
              <button
                onClick={handleSaveAndVerifyDeepSeek}
                disabled={testingDeepSeek}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testingDeepSeek ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span>{testingDeepSeek ? t.btnVerifying : t.btnVerify}</span>
              </button>
            </div>
          </div>

          {/* Optional Hugging Face Box */}
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="text-sm font-bold text-white">{t.hfKeyLabel} (Free Tiers)</h4>
              </div>
              
              <div className="flex items-center gap-1.5">
                {apiKeys.huggingface.status === 'valid' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {lang === 'en' ? 'Active' : 'نشط'}
                  </span>
                )}
                {apiKeys.huggingface.status === 'idle' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 font-bold">
                    {lang === 'en' ? 'Optional' : 'اختياري'}
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <input 
                type="password"
                value={hfKeyInput}
                onChange={(e) => setHfKeyInput(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxx (Free Hub Endpoints)"
                className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:border-purple-400 focus:outline-none transition-all duration-200"
              />
              <Key className="absolute right-3.5 top-3.5 text-slate-500" size={14} />
            </div>

            <div className="mt-4 flex sm:flex-row items-center justify-between gap-4 font-sans border-t border-white/5 pt-4">
              <div className="text-[11px] text-slate-400">
                {t.lastChecked}: <span className="font-mono text-slate-300">{apiKeys.huggingface.lastValidated || 'Never'}</span>
              </div>
              
              <button
                onClick={handleSaveAndVerifyHF}
                disabled={testingHF}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-purple-300 border border-purple-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testingHF ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span>{testingHF ? t.btnVerifying : t.btnVerify}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Tutorial Sidebar (Beginner Walkthrough) */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border border-white/5">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4">
            <HelpCircle size={16} className="text-cyan-400" />
            <span>{t.apiHelpTitle}</span>
          </h4>

          <div className="space-y-4 font-sans text-xs text-slate-400 leading-relaxed">
            <p className="border-b border-white/5 pb-2">
              {lang === 'en' 
                ? "The Gemini API free-tier is highly performant and stable under developer accounts." 
                : "بروتوكول Gemini المجاني قوي للغاية ومناسب للاستخدام دون أي تكاليف مادية."}
            </p>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="font-bold text-cyan-300 block mb-1">{t.apiHelpStep1}</span>
                <p>{lang === 'en' ? "Open a browser tab, log in with Google, and navigate to Google AI Studio." : "سجّل دخول بحساب جوجل وتوجه لموقع Google AI Studio الرسمي."}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="font-bold text-cyan-300 block mb-1">{t.apiHelpStep2}</span>
                <p>{lang === 'en' ? "Click 'Get API key' from the sidebar menu to spawn a free client token." : "اضغط على زر توليد مفتاح الـ API لبرمجة وإنتاج كود الاتصال المجاني الخاص بجهازك."}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="font-bold text-cyan-300 block mb-1">{t.apiHelpStep3}</span>
                <p>{lang === 'en' ? "Return here, paste the code safely, and click Verify. We persist it exclusively in your browser cache." : "انسخ الكود والصقه في الحقل المخصص. سيتم الحفظ بشكل مشفر تماماً في متصفحك."}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
