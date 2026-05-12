/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Send, 
  RefreshCw, 
  Globe, 
  Building2, 
  Rocket, 
  User, 
  DollarSign, 
  History, 
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { generateFundingGuide, generateFollowUp, UserAnswers } from "./services/gemini";
import Markdown from "react-markdown";

const QUESTIONS = [
  { 
    id: "country", 
    question: "What country are you planning to start or grow your business in?", 
    placeholder: "e.g., United States, Kenya, Brazil...",
    icon: <Globe className="w-5 h-5" />
  },
  { 
    id: "city", 
    question: "What city or region within that country?", 
    placeholder: "e.g., New York, Nairobi, São Paulo...",
    icon: <Building2 className="w-5 h-5" />
  },
  { 
    id: "industry", 
    question: "What industry or type of business do you have or want to start?", 
    placeholder: "e.g., restaurant, tech startup, retail...",
    icon: <Rocket className="w-5 h-5" />
  },
  { 
    id: "stage", 
    question: "What stage is your business at?", 
    placeholder: "e.g., idea, pre-revenue, generating revenue...",
    icon: <TrendingUp className="w-5 h-5" />
  },
  { 
    id: "residency", 
    question: "Are you a local resident or a foreign national starting a business in that country?", 
    placeholder: "e.g., local resident, foreign national...",
    icon: <User className="w-5 h-5" />
  },
  { 
    id: "fundingNeed", 
    question: "What is your estimated funding need?", 
    placeholder: "e.g., under $10K, $50K–$250K, over $1M...",
    icon: <DollarSign className="w-5 h-5" />
  },
  { 
    id: "priorFunding", 
    question: "Have you secured any funding before?", 
    placeholder: "e.g., personal savings, grants, none...",
    icon: <History className="w-5 h-5" />
  },
  { 
    id: "preferredType", 
    question: "What type of funding are you most interested in?", 
    placeholder: "e.g., grants, loans, investors, crowdfunding...",
    icon: <Lightbulb className="w-5 h-5" />
  },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is Welcome
  const [answers, setAnswers] = useState<Partial<UserAnswers>>({});
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [guide, setGuide] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followUpContent, setFollowUpContent] = useState<string | null>(null);
  const [followUpType, setFollowUpType] = useState<'dive' | 'plan' | null>(null);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [diveTopic, setDiveTopic] = useState("");
  const [showDiveInput, setShowDiveInput] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStep, guide, isGenerating, followUpContent, isGeneratingFollowUp, showDiveInput]);

  const handleNext = async () => {
    if (!inputValue.trim()) return;

    const currentQuestionKey = QUESTIONS[currentStep]?.id;
    const newAnswers = { ...answers, [currentQuestionKey]: inputValue };
    setAnswers(newAnswers);
    setInputValue("");

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step reached
      setIsGenerating(true);
      setCurrentStep(QUESTIONS.length); // Move to "Generating" view
      try {
        const result = await generateFundingGuide(newAnswers as UserAnswers);
        setGuide(result);
      } catch (err) {
        setError("Failed to generate guide. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleActionPlan = async () => {
    setIsGeneratingFollowUp(true);
    setFollowUpType('plan');
    try {
      const result = await generateFollowUp('plan', answers as UserAnswers);
      setFollowUpContent(result);
    } catch (err) {
      setError("Failed to generate action plan.");
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleDeepDive = async () => {
    if (!diveTopic.trim()) return;
    setIsGeneratingFollowUp(true);
    setFollowUpType('dive');
    try {
      const result = await generateFollowUp('dive', answers as UserAnswers, diveTopic);
      setFollowUpContent(result);
      setShowDiveInput(false);
    } catch (err) {
      setError("Failed to generate deep dive.");
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const reset = () => {
    setCurrentStep(-1);
    setAnswers({});
    setInputValue("");
    setGuide(null);
    setIsGenerating(false);
    setError(null);
    setFollowUpContent(null);
    setFollowUpType(null);
    setDiveTopic("");
    setShowDiveInput(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden antialiased">
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
          <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center transition-transform group-hover:scale-105">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Global Funding Advisor</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">System Status</div>
            <div className="text-xs text-success-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-success-500 rounded-full"></span> Live Global Databases
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Interface */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* Progress Header */}
          {currentStep >= 0 && currentStep <= QUESTIONS.length && !guide && (
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-1">
                    {currentStep < QUESTIONS.length ? "Discovery Phase" : "Analysis Phase"}
                  </h2>
                  <p className="text-2xl font-semibold text-slate-900">
                    {currentStep < QUESTIONS.length ? "Building Your Profile" : "Generating Report"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-500 font-medium">
                    {currentStep < QUESTIONS.length ? `Step ${currentStep + 1} of 8` : "Processing..."}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-600" 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: currentStep < QUESTIONS.length 
                      ? `${(currentStep / QUESTIONS.length) * 100}%` 
                      : "100%" 
                  }}
                />
              </div>
            </div>
          )}

          {/* Conversational Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {currentStep === -1 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-full flex flex-col justify-center items-center text-center space-y-8"
            >
              <div className="max-w-2xl w-full">
                <div className="flex gap-4 mb-8 text-left">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border border-brand-200">
                    <span className="text-brand-600 font-bold text-xs">GA</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-6 text-slate-700 shadow-sm">
                    <p className="text-lg leading-relaxed mb-4">
                      👋 Welcome! I'm your <strong>Global Business Funding Advisor</strong>. I specialize in helping entrepreneurs find the right financial resources — no matter the country or industry.
                    </p>
                    <p className="text-lg leading-relaxed font-semibold text-slate-900">
                      Let's find the best funding options for you! What country are you planning to start or grow your business in?
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setCurrentStep(0)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-100 hover:bg-brand-700 hover:translate-y-[-2px] active:translate-y-0 transition-all group"
                >
                  Begin Assessment
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
                  {[
                    { icon: <Globe className="w-4 h-4 text-brand-600" />, text: "190+ Countries" },
                    { icon: <Rocket className="w-4 h-4 text-brand-600" />, text: "All Industries" },
                    { icon: <ShieldCheck className="w-4 h-4 text-brand-600" />, text: "Verified Sources" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 uppercase tracking-tighter">
                      {item.icon}
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : currentStep < QUESTIONS.length ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto w-full space-y-8 pt-8"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border border-brand-200">
                  <span className="text-brand-600 font-bold text-xs">GA</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-6 text-slate-700 shadow-sm flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 leading-tight">
                    {QUESTIONS[currentStep].question}
                  </h2>
                </div>
              </div>

              <div className="ml-14">
                <div className="relative group">
                  <input
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    placeholder={QUESTIONS[currentStep].placeholder}
                    className="w-full bg-white border-2 border-brand-50 focus:border-brand-500 focus:outline-none rounded-xl px-6 py-4 text-lg shadow-sm placeholder-slate-400 transition-all font-medium"
                  />
                  <button
                    onClick={handleNext}
                    disabled={!inputValue.trim()}
                    className="absolute right-3 top-2 bottom-2 px-6 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Continue
                  </button>
                </div>
                
                {currentStep === 0 && (
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Trending regions:</span>
                    <button onClick={() => setInputValue("United Kingdom")} className="text-xs font-semibold text-brand-600 hover:underline">UK</button>
                    <button onClick={() => setInputValue("USA")} className="text-xs font-semibold text-brand-600 hover:underline">USA</button>
                    <button onClick={() => setInputValue("Singapore")} className="text-xs font-semibold text-brand-600 hover:underline">Singapore</button>
                    <button onClick={() => setInputValue("Kenya")} className="text-xs font-semibold text-brand-600 hover:underline">Kenya</button>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-2">
                  {QUESTIONS.slice(0, currentStep).map((q) => (
                    <div key={q.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] uppercase font-bold text-slate-400">
                      {q.id}: <span className="text-slate-900 font-extrabold">{answers[q.id as keyof UserAnswers]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center space-y-8 text-center"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 rounded-full border-t-brand-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-brand-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Crafting your custom guide...</h2>
                <p className="text-sm text-slate-500">I'm scanning global opportunities for your business.</p>
              </div>
              <div className="flex gap-3 overflow-hidden max-w-lg justify-center flex-wrap">
                {["Grants", "Investors", "Loans", "Regulations"].map((label, i) => (
                  <div key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                    {label} Check
                  </div>
                ))}
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">{error}</h2>
              <button 
                onClick={reset}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12 max-w-4xl mx-auto pb-24"
            >
              <header className="space-y-4 border-b border-slate-200 pb-10">
                <div className="flex items-center gap-2 text-brand-600 text-[10px] font-bold uppercase tracking-widest">
                  <FileText className="w-4 h-4" />
                  Generated Resource Guide
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Business Funding Roadmap
                </h1>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                    <Globe className="w-3.5 h-3.5" /> {answers.country}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                    <Building2 className="w-3.5 h-3.5" /> {answers.industry}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-md text-xs font-bold text-brand-700">
                    <TrendingUp className="w-3.5 h-3.5" /> {answers.stage}
                  </div>
                </div>
              </header>

              <div className="prose prose-slate prose-brand max-w-none">
                <div className="markdown-body">
                  <Markdown>{guide || ""}</Markdown>
                </div>
              </div>

              {followUpContent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-12 border-t border-slate-200"
                >
                  <header className="mb-8 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-brand-600 text-[10px] font-bold uppercase tracking-widest">
                        {followUpType === 'plan' ? 'Action Plan' : 'Deep Dive Research'}
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">
                        {followUpType === 'plan' ? 'Tactical Implementation Roadmap' : `Analysis: ${diveTopic}`}
                      </h2>
                    </div>
                    <button 
                      onClick={() => setFollowUpContent(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-tighter"
                    >
                      Clear Follow-up
                    </button>
                  </header>
                  <div className="prose prose-slate prose-brand max-w-none">
                    <div className="markdown-body">
                      <Markdown>{followUpContent}</Markdown>
                    </div>
                  </div>
                </motion.div>
              )}

              {isGeneratingFollowUp ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-2 border-slate-100 rounded-full border-t-brand-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating {followUpType === 'plan' ? 'Action Plan' : 'Deep Dive'}...</p>
                </div>
              ) : !followUpContent && (
                <div className="bg-slate-900 rounded-2xl p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                    <div className="text-brand-400 text-[10px] font-bold uppercase tracking-[0.2em]">Next Strategic Steps</div>
                    <h3 className="text-2xl font-bold">Ready to take action?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {showDiveInput ? (
                        <div className="col-span-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-sm text-slate-300">Which specific funding source or topic should I research in depth?</p>
                          <div className="relative group">
                            <input
                              autoFocus
                              type="text"
                              value={diveTopic}
                              onChange={(e) => setDiveTopic(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleDeepDive()}
                              placeholder="e.g. SBA 7(a) Loans, Horizon Europe Grants..."
                              className="w-full bg-white/10 border border-white/20 focus:border-brand-500 focus:outline-none rounded-xl px-5 py-4 text-white text-lg placeholder:text-white/20 transition-all font-medium"
                            />
                            <button
                              onClick={handleDeepDive}
                              disabled={!diveTopic.trim()}
                              className="absolute right-2 top-2 bottom-2 px-6 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-500 transition-colors disabled:opacity-30"
                            >
                              Research
                            </button>
                            <button 
                              onClick={() => setShowDiveInput(false)}
                              className="absolute -right-2 -top-2 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-slate-700"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setShowDiveInput(true)}
                            className="p-5 bg-white/10 border border-white/10 rounded-xl text-left hover:bg-white/20 transition-all group/btn backdrop-blur-sm"
                          >
                            <div className="font-bold text-white mb-2 flex items-center justify-between">
                              Deep Dive Research
                              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                            <div className="text-sm text-slate-300">Get specific breakdown of an individual funding source mentioned above.</div>
                          </button>
                          <button 
                            onClick={handleActionPlan}
                            className="p-5 bg-brand-600 border border-brand-500 rounded-xl text-left hover:bg-brand-500 transition-all group/btn shadow-lg"
                          >
                            <div className="font-bold text-white mb-2 flex items-center justify-between">
                              Funding Action Plan
                              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                            <div className="text-sm text-brand-100">Build a step-by-step timeline and application strategy for your business.</div>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 blur-[100px] -mr-32 -mt-32" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>
    </main>

    {/* Sidebar Insight Panel */}
    <aside className="hidden lg:flex w-[320px] bg-slate-50 border-l border-slate-200 p-8 flex-col shrink-0 overflow-y-auto">
      <div className="mb-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Why this matters</h3>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
            "Funding structures vary wildly by jurisdiction. Specifying your exact location allows us to access local government grants, tax incentives, and regional bank programs specifically designed for your economic environment."
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Resource Status</h3>
        <ul className="space-y-6">
          {[
            { label: "Local Grants", active: currentStep > 0 },
            { label: "Private Investors", active: currentStep > 2 },
            { label: "Loan Programs", active: currentStep > 4 },
            { label: "Crowdfunding", active: currentStep > 6 },
          ].map((item, i) => (
            <li key={i} className={`flex items-center gap-3 text-xs font-bold transition-all ${item.active ? 'text-brand-600' : 'text-slate-300'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${item.active ? 'border-brand-500 bg-brand-50' : 'border-slate-100'}`}>
                {item.active && <CheckCircle2 className="w-3 h-3" />}
              </div> 
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        <div className="bg-brand-900 rounded-xl p-6 text-white shadow-xl">
          <div className="text-brand-300 text-[10px] font-bold uppercase tracking-widest mb-3">Expert Insight</div>
          <p className="text-xs font-medium italic leading-relaxed opacity-90">
            "Early-stage companies often overlook 70% of available non-dilutive government grants because of complex terminology."
          </p>
          <div className="mt-6 pt-4 border-t border-brand-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
               <User className="w-5 h-5 text-brand-300" />
            </div>
            <div className="text-[9px] leading-tight font-bold uppercase tracking-tighter">
              Dr. Finance<br/><span className="font-normal opacity-70">Global Advisor</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>

  {/* Sub-Footer Status Bar */}
  <footer className="h-10 bg-slate-900 text-slate-500 text-[10px] px-8 flex items-center justify-between shrink-0 font-bold tracking-wider uppercase">
    <div className="flex gap-8">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
        Database: v4.2.0 (Active)
      </div>
      <div className="flex items-center gap-2 opacity-50">
        <ShieldCheck className="w-3 h-3" />
        256-bit SSL Encrypted
      </div>
    </div>
    <div className="flex gap-6">
      <a href="#" className="hover:text-white transition-colors">Terms</a>
      <a href="#" className="hover:text-white transition-colors">Privacy</a>
      <a href="#" className="hover:text-white transition-colors">Support</a>
    </div>
  </footer>
</div>
  );
}
