import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Send, Bot, Check, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onStateUpdated: (projects: any[], tasks: any[]) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
  onStateUpdated
}) => {
  const t = translations[lang];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseLog, setResponseLog] = useState<Array<{ sender: 'user' | 'assistant'; text: string; action?: any }>>([
    {
      sender: 'assistant',
      text: lang === 'km'
        ? 'សួស្តី! ខ្ញុំជាជំនួយការសំឡេងគ្រប់គ្រងគម្រោងរបស់អ្នក។ តើអ្នកចង់បង្កើតគម្រោងថ្មី បន្ថែមកិច្ចការ ឬកត់ត្រាម៉ោងការងារដែរឬទេ?'
        : 'Hello! I am your AI Project Voice Assistant. Speak or type to create projects, assign tasks, or track project hours.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'km' ? 'km-KH' : 'en-US';

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        handleSendQuery(text);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = lang === 'km' ? 'km-KH' : 'en-US';
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
          setIsListening(false);
        }
      } else {
        // Fallback simulation for unsupported browsers
        setIsListening(true);
        setTimeout(() => {
          const sample = lang === 'km'
            ? 'បង្កើតគម្រោង Mobile App សម្រាប់អតិថិជន Tech Corp'
            : 'Create project Mobile App for Tech Corp';
          setTranscript(sample);
          setIsListening(false);
          handleSendQuery(sample);
        }, 2000);
      }
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || transcript;
    if (!textToSend.trim()) return;

    setResponseLog(prev => [...prev, { sender: 'user', text: textToSend }]);
    setTranscript('');
    setLoading(true);

    try {
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToSend, language: lang })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process voice command');

      setResponseLog(prev => [
        ...prev,
        { sender: 'assistant', text: data.responseText, action: data.actionResult }
      ]);

      if (data.projects && data.tasks) {
        onStateUpdated(data.projects, data.tasks);
      }

      // Voice TTS feedback in browser
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.responseText);
        utterance.lang = lang === 'km' ? 'km-KH' : 'en-US';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      setResponseLog(prev => [
        ...prev,
        { sender: 'assistant', text: `Error: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t.voiceModalTitle}</h3>
              <p className="text-[11px] text-blue-100">{t.voiceModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Logs */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[360px] bg-slate-50 dark:bg-slate-950">
          {responseLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs shadow-xs'
                }`}
              >
                <div>{msg.text}</div>
                {msg.action && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? 'បានអនុវត្តលើកន្លែងការងារ:' : 'Action Applied to Workspace:'} {msg.action.type}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>{lang === 'km' ? 'កំពុងដំណើរការបញ្ជាសំឡេងជាមួយ AI...' : 'Processing voice command with Gemini...'}</span>
            </div>
          )}
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
          <span className="text-slate-400 font-semibold text-[10px]">{lang === 'km' ? 'សាកល្បង:' : 'Try:'}</span>
          <button
            onClick={() => handleSendQuery(t.voiceExamplePrompt1)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-[11px]"
          >
            "{t.voiceExamplePrompt1}"
          </button>
          <button
            onClick={() => handleSendQuery(t.voiceExamplePrompt2)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-[11px]"
          >
            "{t.voiceExamplePrompt2}"
          </button>
          <button
            onClick={() => handleSendQuery(t.voiceExamplePrompt3)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-[11px]"
          >
            "{t.voiceExamplePrompt3}"
          </button>
        </div>

        {/* Microphone and Text Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          {/* Microphone Action Button */}
          <button
            onClick={toggleListening}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/20 shadow-lg shadow-rose-500/30'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-95'
            }`}
            title={isListening ? (lang === 'km' ? 'បញ្ឈប់ការស្តាប់' : 'Stop listening') : (lang === 'km' ? 'ចុចដើម្បីនិយាយ' : 'Start speaking')}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input alternative */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendQuery()}
              placeholder={isListening ? t.listening : (lang === 'km' ? 'និយាយ ឬវាយបញ្ចូលបញ្ជាគម្រោង...' : 'Speak or type a project command...')}
              className="w-full pl-3 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={() => handleSendQuery()}
              disabled={!transcript.trim()}
              className="absolute right-2 top-2 p-1.5 rounded-xl bg-blue-600 text-white disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
