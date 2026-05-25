import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Copy, Trash2, Cpu, Sparkles, 
  User, Clipboard, Check, RefreshCw 
} from 'lucide-react';
import { AppLanguage, ChatMessage, ChatSession } from '../types';
import { translations } from '../utils/translations';
import { useToast } from './Toast';

interface AIChatProps {
  lang: AppLanguage;
  apiKeys: { gemini: { key: string; status: string } };
  addChatSession: (session: ChatSession) => void;
  activeSession: ChatSession | null;
  setActiveSession: (session: ChatSession | null) => void;
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  serverKeyAvailable: boolean;
}

// Simple bulletproof Markdown and code parser codeblock helper
function renderMessageContent(content: string) {
  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const codeLines = part.slice(3, -3).trim().split('\n');
      const language = codeLines[0] && codeLines[0].length < 15 ? codeLines[0] : 'code';
      const code = language === 'code' ? codeLines.join('\n') : codeLines.slice(1).join('\n');
      
      return <div key={index}><CodeBlock code={code} language={language} /></div>;
    }
    
    // Normal paragraphs, bold markers (**text**), and lines
    return (
      <div key={index} className="space-y-2 mt-1 leading-relaxed font-sans text-[13px] sm:text-sm">
        {part.split('\n').map((line, lidx) => {
          if (!line.trim()) return <div key={lidx} className="h-2" />;
          
          // Bullet point lists
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <ul key={lidx} className="list-disc pl-5 list-inside text-slate-300">
                <li>{parseBoldText(line.replace(/^[-*]\s+/, ''))}</li>
              </ul>
            );
          }
          
          return <p key={lidx} className="text-slate-100">{parseBoldText(line)}</p>;
        })}
      </div>
    );
  });
}

function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-cyan-300 font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/5 bg-slate-950 font-mono text-xs text-slate-300">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-white/5 select-none text-[10px] font-bold">
        <span className="text-cyan-400 font-mono uppercase tracking-widest">{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Clipboard size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function AIChat({ 
  lang, 
  apiKeys, 
  addChatSession,
  activeSession,
  setActiveSession,
  chatSessions,
  setChatSessions,
  serverKeyAvailable
}: AIChatProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { showToast } = useToast();

  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll down
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, sending]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    const hasKey = serverKeyAvailable || apiKeys.gemini.status === 'valid';
    if (!hasKey) {
      showToast(t.alertRequiredKey, 'error');
      setSending(false);
      return;
    }

    // Determine current active session, or compile new session if null
    let currentSession = activeSession;
    if (!currentSession) {
      const newSessionId = Math.random().toString(36).substring(2, 9);
      currentSession = {
        id: newSessionId,
        title: userText.substring(0, 32) + (userText.length > 32 ? '...' : ''),
        messages: [],
        lastUpdated: new Date().toLocaleTimeString()
      };
      
      setChatSessions(prev => [currentSession!, ...prev]);
      setActiveSession(currentSession);
    }

    // Append user message
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    updateSessionLocal(currentSession.id, updatedMessages);

    try {
      // Call Gemini API Route proxy
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          // Limit history depth to keep context fast and cheap
          history: updatedMessages.slice(-8, -1), 
          customKey: apiKeys.gemini.key || undefined,
          systemInstruction: "You are the advanced AuraVoice AI, a helpful, futuristic linguistic intellect. Maintain fluent English and Arabic prose."
        })
      });

      const data = await response.json();

      if (response.ok && data.text) {
        // AI response message
        const aiMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'model',
          content: data.text,
          timestamp: new Date().toLocaleTimeString()
        };

        const finalMessages = [...updatedMessages, aiMessage];
        updateSessionLocal(currentSession.id, finalMessages);
      } else {
        throw new Error(data.error || "The model response came up empty.");
      }

    } catch (err: any) {
      console.error(err);
      
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'model',
        content: `⚠️ *Access Error:* ${err.message || "We could not construct connection arrays. Please try again."}`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      updateSessionLocal(currentSession.id, [...updatedMessages, errorMessage]);
      showToast(lang === 'en' ? 'Connection dropped' : 'انقطع الاتصال', 'error');
    } finally {
      setSending(false);
    }
  };

  const updateSessionLocal = (sessionId: string, messages: ChatMessage[]) => {
    setChatSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          const fresh = {
            ...s,
            messages,
            lastUpdated: new Date().toLocaleTimeString()
          };
          if (activeSession && activeSession.id === sessionId) {
            setActiveSession(fresh);
          }
          return fresh;
        }
        return s;
      });
      // Save sessions index in cache
      localStorage.setItem('auravoice_chat_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateNewChat = () => {
    setActiveSession(null);
    showToast(lang === 'en' ? 'Brainstorm terminal cleared. Ask away!' : 'تم مسح محطة العقل التفاعلية!', 'success');
  };

  const handleClearAllChats = () => {
    setChatSessions([]);
    setActiveSession(null);
    localStorage.removeItem('auravoice_chat_sessions');
    showToast(t.alertChatReset, 'info');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t.alertCopied, 'success');
  };

  return (
    <div className="w-full h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-6 pb-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Sidebar Chat archives (Mobile Hidden or top scrolling) */}
      <div className="w-full lg:w-64 bg-slate-900/10 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shrink-0 h-40 lg:h-full overflow-hidden select-none">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare size={13} />
            <span>{t.historyChats}</span>
          </h4>
          
          <button 
            onClick={handleCreateNewChat}
            className="p-1 px-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-[10px] font-bold text-cyan-400 transition-colors cursor-pointer"
          >
            {lang === 'en' ? "+ New" : "+ جديد"}
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-x-auto lg:overflow-x-hidden overflow-y-auto py-3 space-x-2 lg:space-x-0 lg:space-y-1.5 flex lg:flex-col items-center lg:items-stretch h-full">
          {chatSessions.length === 0 ? (
            <p className="text-[11px] text-slate-600 text-center py-4 font-sans select-none w-full">
              {lang === 'en' ? "Empty Archives" : "السجلات فارغة"}
            </p>
          ) : (
            chatSessions.map((session) => {
              const active = activeSession?.id === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => setActiveSession(session)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer truncate shrink-0 w-36 lg:w-auto ${
                    active 
                      ? 'bg-gradient-to-r from-cyan-950/20 to-purple-950/10 border border-cyan-500/20 text-cyan-300' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  <span className="block truncate pr-2">{session.title}</span>
                  <span className="text-[9px] text-slate-600 font-mono tracking-wide mt-0.5 block">{session.lastUpdated}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Bulk delete */}
        {chatSessions.length > 0 && (
          <button
            onClick={handleClearAllChats}
            className="w-full py-2 border border-rose-500/10 hover:bg-rose-950/15 text-[10px] font-bold text-rose-400 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 size={11} />
            <span>{lang === 'en' ? 'Purge Chats' : 'حذف السجلات'}</span>
          </button>
        )}
      </div>

      {/* Primary chat terminal flow */}
      <div className="flex-1 bg-slate-900/20 border border-white/5 rounded-2xl flex flex-col justify-between overflow-hidden relative backdrop-blur-md">
        
        {/* Chat info status banner */}
        <div className="px-5 py-3 border-b border-white/5 select-none bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-400 animate-pulse" size={16} />
            <div>
              <h4 className="text-xs font-bold text-white leading-normal">{t.chatTitle}</h4>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">{t.chatSubtitle}</p>
            </div>
          </div>
          
          <span className="text-[9px] font-mono rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 font-bold uppercase tracking-wider">
            Gemini Flash
          </span>
        </div>

        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center flex-col text-center p-6 select-none leading-relaxed transition-all duration-300">
              <Sparkles className="w-10 h-10 text-cyan-400 animate-spin-slow mb-4 opacity-50 stroke-[1.5]" />
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm font-sans font-medium">
                {t.chatEmptyState}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeSession.messages.map((message) => {
                const isAI = message.role === 'model';
                return (
                  <div 
                    key={message.id}
                    className={`flex items-start gap-3.5 max-w-3xl ${
                      isAI ? '' : isRtl ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row-reverse'
                    }`}
                  >
                    {/* Speaker Icon */}
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center p-[1px] ${
                      isAI 
                        ? 'bg-gradient-to-br from-cyan-400 to-purple-500 shadow-md shadow-cyan-500/10' 
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                        {isAI ? <Cpu size={14} className="text-cyan-400" /> : <User size={13} className="text-purple-400" />}
                      </div>
                    </div>

                    {/* Message Bubble */}
                    <div className="flex-1 space-y-1">
                      <div className={`p-4 rounded-2xl relative border ${
                        isAI 
                          ? 'bg-slate-900/40 border-white/5' 
                          : 'bg-slate-900/60 border-cyan-400/20 shadow-lg shadow-cyan-500/5'
                      }`}>
                        
                        {/* Copy click absolute corner */}
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-cyan-400 transition-colors rounded hover:bg-white/5"
                          title="Copy block"
                        >
                          <Copy size={11} />
                        </button>

                        <div className="pr-4">
                          {renderMessageContent(message.content)}
                        </div>
                      </div>

                      {/* Msg Timestamp */}
                      <span className="text-[9px] font-mono text-slate-600 block px-1 tracking-wide">
                        {message.timestamp}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Typing Loading placeholder */}
          {sending && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 p-[1px] shrink-0 animate-pulse">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Cpu size={14} className="text-cyan-400" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5 max-w-sm flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold ml-1 animate-pulse">thinking...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Text Form footer */}
        <form 
          onSubmit={handleSendMessage}
          className="p-4 border-t border-white/5 bg-slate-950/40 font-sans"
        >
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t.chatPlaceholder}
              disabled={sending}
              className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-sm placeholder:text-slate-500 text-slate-100 font-sans focus:border-cyan-400 focus:outline-none transition-all duration-200"
            />
            
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="absolute right-2.5 top-2.5 p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 text-slate-950 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 cursor-pointer text-center"
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
