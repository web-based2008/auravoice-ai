import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, Play, Pause, Download, Copy, RefreshCw, 
  Sparkles, CheckCircle2, ChevronRight, HelpCircle, AudioLines, Music 
} from 'lucide-react';
import { AppLanguage, VoiceRecord } from '../types';
import { translations } from '../utils/translations';
import { useToast } from './Toast';

function convertRawPcmToWav(pcmBytes: Uint8Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + pcmBytes.length);
  const view = new DataView(buffer);
  
  // Helper to write string ASCII bytes
  const writeStringBytes = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeStringBytes(0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + pcmBytes.length, true);
  /* RIFF type */
  writeStringBytes(8, 'WAVE');
  
  /* format chunk identifier */
  writeStringBytes(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (1 = Linear PCM) */
  view.setUint16(20, 1, true);
  /* channel count (1 = Mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample (16-bit) */
  view.setUint16(34, 16, true);
  
  /* data chunk identifier */
  writeStringBytes(36, 'data');
  /* data chunk length */
  view.setUint32(40, pcmBytes.length, true);
  
  // Write actual PCM bytes
  const pcmView = new Uint8Array(buffer, 44);
  pcmView.set(pcmBytes);
  
  return new Blob([buffer], { type: 'audio/wav' });
}

interface VoiceGeneratorProps {
  lang: AppLanguage;
  apiKeys: { gemini: { key: string; status: string } };
  addVoiceRecord: (record: VoiceRecord) => void;
  serverKeyAvailable: boolean;
}

export default function VoiceGenerator({ 
  lang, 
  apiKeys, 
  addVoiceRecord,
  serverKeyAvailable
}: VoiceGeneratorProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { showToast } = useToast();

  const [text, setText] = useState('');
  const [engine, setEngine] = useState<'neural' | 'local'>('neural');
  const [speaker, setSpeaker] = useState('Kore'); // Default prebuilt TTS voice
  const [emotion, setEmotion] = useState('Neutral');
  const [dialect, setDialect] = useState('standard');
  const [synthesizing, setSynthesizing] = useState(false);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize default inputs based on active language
  useEffect(() => {
    setText(isRtl ? 'أهلاً بكم في استوديو أورافويس. منصة الصوتيات المستقبلية بالذكاء الاصطناعي.' : 'Welcome to AuraVoice AI Study. Synthesizing responsive voices with extreme fidelity.');
  }, [lang]);

  // Audio lifecycle
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onLoadedMetadata = () => setDuration(audio.duration || 0);
      const onEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, [audioUrl]);

  const handleCopyText = () => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    showToast(t.alertCopied, 'success');
  };

  const handleSynthesize = async () => {
    if (!text.trim()) {
      showToast(lang === 'en' ? "Please type a script first" : "يرجى كتابة نص أولاً", "warning");
      return;
    }

    setSynthesizing(true);
    setIsPlaying(false);
    
    // Clear old URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    if (engine === 'local') {
      // 1. LOCAL MACHINE fallback Speech synthesis
      try {
        if (!('speechSynthesis' in window)) {
          throw new Error("Local speech synthesis is not supported on this platform.");
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find suitable local language and speaker
        utterance.lang = isRtl ? 'ar-SA' : 'en-US';
        
        // Configure speed based on emotion
        if (emotion === 'Energetic') {
          utterance.rate = 1.25;
          utterance.pitch = 1.1;
        } else if (emotion === 'Whispering') {
          utterance.rate = 0.8;
          utterance.pitch = 0.95;
        } else if (emotion === 'Serious') {
          utterance.rate = 0.95;
          utterance.pitch = 0.85;
        } else {
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
        }

        // Mock synthesized file generation using SpeechSynthesis utterance recording if possible.
        // Since Web Speech SpeechSynthesis doesn't natively yield an MP3 blob directly from a simple speak call, we create a gorgeous auditory play response on-the-fly and register the transaction successfully.
        
        // Register Voice Record
        const recordId = Math.random().toString(36).substring(2, 9);
        const record: VoiceRecord = {
          id: recordId,
          text: text,
          lang: lang,
          speaker: `Local (${isRtl ? 'Ar-Female' : 'En-Male'})`,
          emotion: emotion,
          audioUrl: 'local-stream',
          date: new Date().toLocaleTimeString(),
          source: 'local'
        };

        utterance.onstart = () => {
          setSynthesizing(false);
          setIsPlaying(true);
          addVoiceRecord(record);
          showToast(t.alertSynthSuccess, 'success');
        };

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = (e) => {
          setSynthesizing(false);
          setIsPlaying(false);
          console.error(e);
        };

        window.speechSynthesis.speak(utterance);

      } catch (err: any) {
        setSynthesizing(false);
        showToast(err.message || 'Speech synthesis failed', 'error');
      }

    } else {
      // 2. NEURAL CLOUD PREVIEW TTS
      const hasKey = serverKeyAvailable || apiKeys.gemini.status === 'valid';

      if (!hasKey) {
        showToast(t.alertRequiredKey, 'error');
        setSynthesizing(false);
        return;
      }

      try {
        const response = await fetch('/api/gemini/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            voiceName: speaker,
            emotion: emotion,
            dialect: dialect,
            customKey: apiKeys.gemini.key || undefined,
            lang: lang
          })
        });

        const data = await response.json();
        
        if (response.ok && data.audio) {
          // Decode Base64 Raw PCM-16bit and pack into standard WAV container
          const binary = atob(data.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = convertRawPcmToWav(bytes, 24000);
          const url = URL.createObjectURL(blob);
          
          setAudioUrl(url);

          // Save transaction record
          const recordId = Math.random().toString(36).substring(2, 9);
          const record: VoiceRecord = {
            id: recordId,
            text: text,
            lang: lang,
            speaker: speaker,
            emotion: emotion,
            audioUrl: url,
            date: new Date().toLocaleTimeString(),
            source: 'gemini'
          };
          addVoiceRecord(record);
          
          showToast(t.alertSynthSuccess, 'success');
          
          // Trigger autoplay
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play();
              setIsPlaying(true);
            }
          }, 200);

        } else {
          throw new Error(data.error || "The voice request came up empty.");
        }
      } catch (err: any) {
        console.error(err);
        showToast(err.message || "Failed to make neural call.", "error");
      } finally {
        setSynthesizing(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (engine === 'local') {
      // Speech synthesis speech control
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          handleSynthesize();
        }
      }
    } else {
      // HTML5 natural Audio elements
      if (audioRef.current && audioUrl) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        handleSynthesize();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current && engine !== 'local') {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Prebuilt speaker config maps
  const speakers = [
    { name: 'Kore', label: lang === 'en' ? 'Core Female (Default)' : 'كوري - صوتي أنثوي متزن' },
    { name: 'Zephyr', label: lang === 'en' ? 'Zephyr Male (Warm)' : 'زفير - صوتي ذكوري ناعم' },
    { name: 'Puck', label: lang === 'en' ? 'Puck Male (Youthful)' : 'باك - صوت ذكوري شاب' },
    { name: 'Charon', label: lang === 'en' ? 'Charon Deep (Executive)' : 'شارون - ذكوري عميق فخم' },
    { name: 'Fenrir', label: lang === 'en' ? 'Fenrir Grave (Dramatic)' : 'فينرير - ذكوري ممتلئ غليظ' }
  ];

  const emotions = [
    { id: 'Neutral', label: t.emotionNeutral },
    { id: 'Happy', label: t.emotionHappy },
    { id: 'Sad', label: t.emotionSad },
    { id: 'Cheerful', label: t.emotionCheerful },
    { id: 'Serious', label: t.emotionSerious },
    { id: 'Whispering', label: t.emotionWhispering },
    { id: 'Energetic', label: t.emotionEnergetic }
  ];

  const dialects = [
    { id: 'standard', label: t.dialectStandard },
    { id: 'sa', label: t.dialectSaudi },
    { id: 'eg', label: t.dialectEgyptian }
  ];

  return (
    <div className="w-full pb-12" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Title */}
      <div className="mb-8 select-none">
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.voiceTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">{t.voiceSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left main form controls (Input and selections) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
            
            {/* Engine Tabs Selection */}
            <div className="mb-6">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {t.voiceEngineLabel}
              </label>
              
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => { setEngine('neural'); setIsPlaying(false); window.speechSynthesis.cancel(); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    engine === 'neural' 
                      ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-l border-t border-cyan-500/30 text-cyan-300' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>{t.geminiNeuralTTS}</span>
                </button>

                <button
                  onClick={() => { setEngine('local'); setIsPlaying(false); if (audioRef.current) audioRef.current.pause(); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    engine === 'local' 
                      ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/25 border-l border-t border-cyan-500/30 text-cyan-300' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Volume2 size={13} />
                  <span>{t.localSynthesizers}</span>
                </button>
              </div>
            </div>

            {/* Speaker Selections (Only show if Neural Cloud TTS is active) */}
            {engine === 'neural' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {t.speakerLabel}
                  </label>
                  <select
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-100 font-semibold focus:border-cyan-400 focus:outline-none cursor-pointer"
                  >
                    {speakers.map((s) => (
                      <option key={s.name} value={s.name}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {t.emotionLabel}
                  </label>
                  <select
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-100 font-semibold focus:border-cyan-400 focus:outline-none cursor-pointer"
                  >
                    {emotions.map((em) => (
                      <option key={em.id} value={em.id}>{em.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {t.dialectLabel}
                  </label>
                  <select
                    value={dialect}
                    onChange={(e) => setDialect(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-100 font-semibold focus:border-cyan-400 focus:outline-none cursor-pointer"
                  >
                    {dialects.map((dl) => (
                      <option key={dl.id} value={dl.id}>{dl.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {engine === 'local' && (
              <div className="p-3 rounded-xl bg-cyan-950/15 border border-cyan-500/20 text-xs text-cyan-300 mb-5 font-sans leading-relaxed">
                ℹ️ <strong>{t.localFallbackActive}:</strong> {lang === 'en' 
                  ? "Uses responsive local speech-to-vocals. Perfect for limitless instant previews. Supported in all mobile and desktop browsers entirely free of rate limitations." 
                  : "يحاكي تحويل النصوص لأصوات محلياً بذكاء بدون الحاجة لأية اتصالات بالشبكة، وتجاوز حدود الاستهلاك ومجاني 100%!"}
              </div>
            )}

            {/* Script Text Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  {t.inputLabel}
                </label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopyText}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Copy size={11} />
                    <span>{t.copyText}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isRtl ? t.placeholderVoiceInputAr : t.placeholderVoiceInputEn}
                rows={4}
                className="w-full p-4 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-0 resize-none transition-all duration-200"
              />
            </div>

            {/* Action and Loader */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
              <span className="text-xs text-slate-500 font-mono">
                {lang === 'en' ? "Audio rate mapped to 24000Hz (HD Mono)" : "تنقية ومعالجة التردد 24000 هرتز (HD)"}
              </span>

              <button
                onClick={handleSynthesize}
                disabled={synthesizing || !text.trim()}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 border-b-[5px] border-cyan-700 active:border-b-0 hover:border-b-[2px] active:translate-y-[5px] hover:translate-y-[3px] transition-all duration-100 ease-out flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:translate-y-0 disabled:border-b-[5px]"
              >
                {synthesizing ? <RefreshCw size={14} className="animate-spin" /> : <Volume2 size={14} />}
                <span>{synthesizing ? t.btnSynthesizing : t.btnSynthesize}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right audio wave visualizer player */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4 select-none">
              <AudioLines size={16} className="text-cyan-400" />
              <span>{lang === 'en' ? "Acoustic Signatures" : "البصمة الصوتية والموجة"}</span>
            </h4>

            {/* Waveform graphic boxes */}
            <div className="h-28 flex items-center justify-center gap-1 bg-slate-950/80 rounded-xl border border-white/5 relative overflow-hidden my-4 px-6">
              
              {/* Bouncing Visual Waveform */}
              {isPlaying ? (
                <div className="flex items-end gap-1.5 h-16">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const animationDelay = `${idx * 0.1}s`;
                    const heightClass = [
                      'h-12', 'h-10', 'h-14', 'h-8', 'h-16', 'h-6', 
                      'h-11', 'h-9', 'h-15', 'h-7', 'h-13', 'h-10'
                    ][idx];
                    
                    return (
                      <motion.span
                        key={idx}
                        animate={{ 
                          height: ["20%", "90%", "20%"],
                          backgroundColor: ["rgb(34,211,238)", "rgb(147,51,234)", "rgb(34,211,238)"]
                        }}
                        transition={{ 
                          duration: 1.1,
                          repeat: Infinity,
                          delay: idx * 0.08,
                          ease: "easeInOut"
                        }}
                        className="w-1.5 rounded-full bg-cyan-400 shrink-0"
                        style={{ height: "40%" }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-center flex-col text-slate-600">
                  <Music className="w-8 h-8 opacity-50 stroke-[1.5]" />
                  <span className="text-[10px] font-mono tracking-wider">
                    {synthesizing ? "VOICE SYNTHESIS IN PROGRESS" : "AUDIO SENSORS SLEEPING"}
                  </span>
                </div>
              )}
            </div>

            {/* Display status details */}
            <div className="space-y-2 mt-4 text-xs font-sans">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">{lang === 'en' ? "Voice Preset" : "اسم نبرة الصوت"}</span>
                <span className="text-slate-200 font-bold">{engine === 'local' ? 'Machine Native' : speaker}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">{lang === 'en' ? "Emotion Modifier" : "نبرات المشاعر"}</span>
                <span className="text-cyan-400 font-bold">{emotion}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">{t.dialectLabel}</span>
                <span className="text-emerald-400 font-bold">
                  {dialects.find(d => d.id === dialect)?.label || dialect}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'en' ? "Source" : "محطة الانطلاق"}</span>
                <span className="text-purple-400 font-mono font-bold tracking-wider">{engine.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Inline audio driver controls */}
          <div className="mt-8 pt-4 border-t border-white/5">
            {engine !== 'local' && audioUrl ? (
              <div className="space-y-4">
                {/* Duration scrub slider */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                />

                <div className="flex items-center gap-3">
                  {/* Play Button */}
                  <button
                    onClick={handlePlayPause}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                    <span>{isPlaying ? (lang === 'en' ? 'Pause' : 'إيقاف') : (lang === 'en' ? 'Play Sound' : 'تشغيل الصوت')}</span>
                  </button>

                  {/* Download Link */}
                  <a
                    href={audioUrl}
                    download={`auravoice-${Date.now()}.wav`}
                    className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-center flex items-center justify-center"
                    title={t.downloadAudio}
                  >
                    <Download size={15} />
                  </a>
                </div>
              </div>
            ) : engine === 'local' && isPlaying ? (
              <button
                onClick={handlePlayPause}
                className="w-full py-2.5 rounded-xl bg-rose-950/25 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pause size={13} />
                <span>{lang === 'en' ? 'Mute Speech Stream' : 'كتم تدفق النطق الفوري'}</span>
              </button>
            ) : (
              <p className="text-xs text-slate-500 text-center font-sans">
                {t.noAudioGeneratedYey}
              </p>
            )}

            {/* Hidden HTML Audio Element */}
            {audioUrl && engine !== 'local' && (
              <audio ref={audioRef} src={audioUrl} className="hidden" />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
