import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Video, Languages, FileText, Loader2, Volume2,
  History, LayoutDashboard, Settings, Copy, CheckCircle2,
  GraduationCap, BookOpen, Sparkles, Zap, Brain, Globe, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface TranslateResult {
  id?: string;
  title: string;
  duration: number;
  transcript: string;
  summary: string;
  translation: string;
  audio_url: string;
  date?: string;
}

const LANGUAGES = [
  { value: "english",  label: "English",  flag: "🇺🇸" },
  { value: "telugu",   label: "Telugu",   flag: "🇮🇳" },
  { value: "hindi",    label: "Hindi",    flag: "🇮🇳" },
  { value: "spanish",  label: "Spanish",  flag: "🇪🇸" },
  { value: "french",   label: "French",   flag: "🇫🇷" },
];

const STEPS = [
  { label: "Extracting video audio",   icon: Video },
  { label: "Uploading to AI engine",   icon: Brain },
  { label: "Transcribing & translating", icon: Globe },
  { label: "Synthesizing speech",      icon: Volume2 },
];

function App() {
  const [url, setUrl] = useState("");
  const [targetLang, setTargetLang] = useState("telugu");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [history, setHistory] = useState<TranslateResult[]>([]);
  const [statusStep, setStatusStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'translation' | 'summary' | 'transcript'>('translation');
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('student_translator_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Animate through steps while loading
  useEffect(() => {
    if (!isLoading) { setStatusStep(0); return; }
    const interval = setInterval(() => {
      setStatusStep(s => (s < STEPS.length - 1 ? s + 1 : s));
    }, 18000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);
    setResult(null);
    setStatusStep(0);
    try {
      const response = await axios.post("http://localhost:8000/analyze", {
        url, target_language: targetLang,
      }, { timeout: 600000 });
      const newResult = { ...response.data, id: Date.now().toString(), date: new Date().toLocaleString() };
      setResult(newResult);
      const newHistory = [newResult, ...history].slice(0, 15);
      setHistory(newHistory);
      localStorage.setItem('student_translator_history', JSON.stringify(newHistory));
      setActiveTab('translation');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTabContent = () => {
    if (!result) return '';
    if (activeTab === 'translation') return result.translation;
    if (activeTab === 'summary') return result.summary;
    return result.transcript;
  };

  return (
    <div className="flex edu-bg circuit-grid min-h-screen">

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar w-64 flex flex-col h-screen sticky top-0 z-30">
        {/* Logo */}
        <div className="p-7 pb-5 border-b border-[rgba(108,99,255,0.12)]">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.03 }}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(108,99,255,0.5)]">
                <GraduationCap size={22} className="text-white" />
              </div>
              <Sparkles size={10} className="text-cyan-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <p className="font-bold text-lg text-white leading-none tracking-tight" style={{fontFamily:'Space Grotesk'}}>ScholarAI</p>
              <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Pro Translator</p>
            </div>
          </motion.div>
        </div>

        {/* Nav */}
        <nav className="flex-grow p-4 mt-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-3">Navigation</p>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'history',   label: 'Study History', icon: History },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                view === item.id
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 shadow-[0_0_15px_rgba(108,99,255,0.1)]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/3'
              }`}
            >
              <item.icon size={18} className={view === item.id ? 'text-indigo-400' : ''} />
              {item.label}
              {item.id === 'history' && history.length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {history.length}
                </span>
              )}
            </button>
          ))}

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-300 hover:bg-white/3 transition-all duration-200">
            <Settings size={18} /> Settings
          </button>
        </nav>

        {/* Stats */}
        <div className="p-4">
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="orb absolute -top-8 -right-8 w-24 h-24 bg-indigo-600/20"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
              <Zap size={10} /> Student Pro Plan
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">{history.length}</p>
                <p className="text-[10px] text-slate-500 font-semibold">Sessions</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">{LANGUAGES.length}</p>
                <p className="text-[10px] text-slate-500 font-semibold">Languages</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-grow flex flex-col min-h-screen overflow-x-hidden">

        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-[rgba(108,99,255,0.1)] bg-[rgba(6,8,24,0.7)] backdrop-blur-2xl px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white" style={{fontFamily:'Space Grotesk'}}>
              {view === 'dashboard' ? 'Video Intelligence Workspace' : 'Study History'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Powered by Gemini 2.5 Flash AI</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="badge-active px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
              API Connected
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-[0_0_12px_rgba(108,99,255,0.4)]">
              S
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full flex-grow">
          <AnimatePresence mode="wait">
            {view === 'dashboard' ? (
              <motion.div key="dashboard" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.35}} className="space-y-8">

                {/* Hero */}
                <div className="relative">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BookOpen size={12} /> Universal Video Translator
                  </p>
                  <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white mb-2" style={{fontFamily:'Space Grotesk'}}>
                    Learn Smarter with <br />
                    <span className="grad-text">AI Translation.</span>
                  </h2>
                  <p className="text-slate-500 text-base max-w-xl leading-relaxed">
                    Drop any YouTube URL — instantly get a full transcript, intelligent summary, and voice-synthesized translation in your target language.
                  </p>
                </div>

                {/* Input Card */}
                <div className="glass-card glass-card-hover rounded-3xl p-8 relative overflow-hidden">
                  <div className="orb absolute -top-16 -right-16 w-48 h-48 bg-indigo-700/15"></div>
                  <div className="orb absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-700/10"></div>

                  <form onSubmit={handleSubmit} className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* URL Input */}
                      <div className="lg:col-span-7">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-2">
                          <Video size={11} className="text-indigo-400"/> YouTube Video URL
                        </label>
                        <div className="edu-input rounded-2xl px-5 py-4 flex items-center gap-3">
                          <Video size={18} className="text-indigo-500 flex-shrink-0" />
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="bg-transparent border-none outline-none w-full text-white font-medium text-base placeholder:text-slate-600"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Language */}
                      <div className="lg:col-span-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-2">
                          <Globe size={11} className="text-cyan-400"/> Target Language
                        </label>
                        <div className="edu-input rounded-2xl px-5 py-4">
                          <select
                            className="bg-transparent border-none outline-none w-full text-white font-semibold text-base appearance-none cursor-pointer"
                            value={targetLang}
                            onChange={e => setTargetLang(e.target.value)}
                          >
                            {LANGUAGES.map(l => (
                              <option key={l.value} value={l.value} className="bg-slate-900">
                                {l.flag} {l.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="lg:col-span-2 flex items-end">
                        <button
                          type="submit"
                          disabled={isLoading || !url}
                          className="btn-primary w-full h-[58px] text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 text-sm"
                        >
                          {isLoading
                            ? <><Loader2 className="animate-spin" size={18}/> Processing...</>
                            : <><Zap size={18}/> Analyze</>
                          }
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Progress */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="mt-6 overflow-hidden relative z-10">
                        <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-2xl p-6">
                          <div className="flex items-center gap-4 mb-5">
                            <Loader2 size={20} className="text-indigo-400 animate-spin flex-shrink-0"/>
                            <span className="text-indigo-100 font-bold text-base">{STEPS[statusStep].label}...</span>
                            <span className="ml-auto text-xs font-bold text-indigo-500">{statusStep + 1}/{STEPS.length}</span>
                          </div>

                          {/* Steps visual */}
                          <div className="flex items-center gap-2 mb-5">
                            {STEPS.map((step, i) => (
                              <div key={i} className="flex items-center flex-1">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border text-xs font-bold transition-all duration-500 ${
                                  i < statusStep ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_10px_rgba(108,99,255,0.5)]' :
                                  i === statusStep ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse' :
                                  'bg-slate-800 border-slate-700 text-slate-600'
                                }`}>
                                  {i < statusStep ? <CheckCircle2 size={14}/> : <step.icon size={13}/>}
                                </div>
                                {i < STEPS.length - 1 && (
                                  <div className={`flex-1 h-px mx-2 transition-all duration-700 ${i < statusStep ? 'bg-indigo-500' : 'bg-slate-700'}`}/>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Animated progress bar */}
                          <div className="relative w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <motion.div
                              initial={{width:'5%'}}
                              animate={{width:'90%'}}
                              transition={{duration:50, ease:'easeOut'}}
                              className="absolute inset-y-0 left-0 shimmer-bar bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                            />
                          </div>
                          <p className="text-slate-600 text-xs mt-3 font-medium">
                            This process typically takes 1-3 minutes depending on video length.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Results */}
                <AnimatePresence>
                  {result && !isLoading && (
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                      {/* Left Panel */}
                      <div className="lg:col-span-4 space-y-5">

                        {/* Video Meta */}
                        <div className="glass-card glass-card-hover rounded-3xl p-6">
                          <div className="flex items-center gap-2 mb-5">
                            <Video size={18} className="text-indigo-400"/>
                            <h3 className="font-bold text-white text-base" style={{fontFamily:'Space Grotesk'}}>Source Video</h3>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Title</p>
                              <p className="text-sm font-bold text-slate-200 leading-snug">{result.title}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Analyzed At</p>
                              <p className="text-sm font-semibold text-slate-400">{result.date}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">Target Language</p>
                              <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-300">
                                <Globe size={11}/> {LANGUAGES.find(l => l.value === targetLang)?.flag} {LANGUAGES.find(l => l.value === targetLang)?.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Audio Player */}
                        <div className="glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden">
                          <div className="orb absolute -top-10 -right-10 w-28 h-28 bg-indigo-600/20"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                  <Play size={14} className="text-white ml-0.5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">Audio Translation</p>
                                  <p className="text-[10px] text-slate-500 font-medium">AI-Synthesized Speech</p>
                                </div>
                              </div>
                              <Volume2 size={16} className="text-cyan-400"/>
                            </div>
                            {result.audio_url ? (
                              <audio
                                src={result.audio_url}
                                controls
                                className="w-full"
                                style={{accentColor:'#6c63ff', height:'36px'}}
                              />
                            ) : (
                              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-500">Audio synthesis unavailable due to network constraints.</p>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Right Panel - Tabs */}
                      <div className="lg:col-span-8 glass-card rounded-3xl overflow-hidden flex flex-col">

                        {/* Tab Bar */}
                        <div className="border-b border-[rgba(108,99,255,0.12)] bg-[rgba(13,17,48,0.5)] flex">
                          {[
                            { id:'translation', label:'Translation',  icon: Languages },
                            { id:'summary',     label:'Key Notes',     icon: Brain },
                            { id:'transcript',  label:'Raw Transcript', icon: FileText },
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all duration-200 ${
                                activeTab === tab.id
                                  ? 'tab-active border-indigo-500'
                                  : 'border-transparent text-slate-600 hover:text-slate-400'
                              }`}
                            >
                              <tab.icon size={15}/>
                              <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                          ))}

                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy(getTabContent())}
                            className={`ml-auto px-5 py-4 flex items-center gap-2 text-xs font-bold transition-all duration-200 ${copied ? 'text-green-400' : 'text-slate-600 hover:text-indigo-400'}`}
                          >
                            {copied ? <><CheckCircle2 size={14}/> Copied!</> : <><Copy size={14}/> Copy</>}
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow p-8 overflow-y-auto">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeTab}
                              initial={{opacity:0, x:8}}
                              animate={{opacity:1, x:0}}
                              exit={{opacity:0, x:-8}}
                              transition={{duration:0.2}}
                            >
                              <div className="flex items-center gap-3 mb-5">
                                {activeTab === 'translation' && <><Languages size={18} className="text-indigo-400"/><h4 className="font-bold text-white" style={{fontFamily:'Space Grotesk'}}>Localized Translation</h4></>}
                                {activeTab === 'summary'     && <><Brain size={18} className="text-cyan-400"/><h4 className="font-bold text-white" style={{fontFamily:'Space Grotesk'}}>Key Learning Notes</h4></>}
                                {activeTab === 'transcript'  && <><FileText size={18} className="text-purple-400"/><h4 className="font-bold text-white" style={{fontFamily:'Space Grotesk'}}>Original Transcript</h4></>}
                              </div>

                              <div className="bg-[rgba(13,17,48,0.5)] border border-[rgba(108,99,255,0.1)] rounded-2xl p-6 text-slate-300 text-[0.95rem] leading-relaxed font-medium whitespace-pre-wrap">
                                {getTabContent()}
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            ) : (
              /* HISTORY VIEW */
              <motion.div key="history" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.35}}>
                <div className="flex items-center gap-3 mb-8">
                  <History size={24} className="text-indigo-400"/>
                  <h2 className="text-3xl font-black text-white" style={{fontFamily:'Space Grotesk'}}>Study Sessions</h2>
                  <span className="badge-active px-3 py-1 rounded-full text-xs font-bold">{history.length} sessions</span>
                </div>

                <div className="glass-card rounded-3xl overflow-hidden">
                  {history.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead className="border-b border-[rgba(108,99,255,0.12)]">
                        <tr>
                          {['Status','Video Title','Date','Action'].map(h => (
                            <th key={h} className="px-7 py-5 text-[10px] font-black uppercase tracking-widest text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(108,99,255,0.06)]">
                        {history.map(item => (
                          <tr
                            key={item.id}
                            className="hover:bg-indigo-500/4 transition-all cursor-pointer group"
                            onClick={() => { setResult(item); setView('dashboard'); }}
                          >
                            <td className="px-7 py-5">
                              <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold w-fit">
                                <CheckCircle2 size={12}/> Processed
                              </span>
                            </td>
                            <td className="px-7 py-5 font-semibold text-slate-300 max-w-xs truncate text-sm">{item.title}</td>
                            <td className="px-7 py-5 text-sm text-slate-600 font-medium">{item.date}</td>
                            <td className="px-7 py-5">
                              <button className="opacity-0 group-hover:opacity-100 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-500/20 transition-all">
                                View →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-28 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(108,99,255,0.1)]">
                        <BookOpen size={36} className="text-indigo-500" />
                      </div>
                      <h4 className="text-2xl font-black text-white mb-2" style={{fontFamily:'Space Grotesk'}}>No Study Sessions Yet</h4>
                      <p className="text-slate-600 text-base max-w-sm">Your translated video sessions will appear here. Start by analyzing a YouTube video!</p>
                      <button
                        onClick={() => setView('dashboard')}
                        className="mt-6 btn-primary px-6 py-3 rounded-xl text-white text-sm font-bold flex items-center gap-2"
                      >
                        <Zap size={16}/> Start Analyzing
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="border-t border-[rgba(108,99,255,0.08)] bg-[rgba(6,8,24,0.5)] backdrop-blur-md px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <GraduationCap size={15} className="text-indigo-500"/>
            <span className="font-semibold">ScholarAI Translator</span>
            <span className="text-slate-700">•</span>
            <span>Powered by Gemini 2.5 Flash</span>
          </div>
          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-700">
            <a href="#" className="hover:text-indigo-400 transition-colors">Docs</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
          </div>
        </footer>

      </main>
    </div>
  );
}

export default App;
