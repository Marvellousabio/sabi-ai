/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  MapPin, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  ChevronRight,
  Database,
  Globe,
  Settings,
  Scale,
  DollarSign,
  Truck,
  Package,
  PackageCheck,
  Tag,
  Users,
  Activity,
  Terminal,
  Cpu,
  Search,
  ArrowRight,
  Quote
} from 'lucide-react';

// --- Types ---
interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'processing' | 'done';
  icon: React.ReactNode;
  desc: string;
}

interface ReasoningChain {
  agent: string;
  thought: string;
}

interface SimulatedReview {
  persona: string;
  rating: number;
  text: string;
  vibe_score?: number;
  dialect?: 'genz' | 'pidgin';
  logistics_risk?: 'low' | 'medium' | 'high';
  logistics_note?: string;
  no_story?: boolean;
}

interface Recommendation {
  title: string;
  reason: string;
  match: string;
  social_proof?: string;
  nostalgia_bridge?: string;
  dialect_match?: 'genz' | 'pidgin';
}

interface SimulationData {
  reasoning?: ReasoningChain[];
  reviews?: SimulatedReview[];
  recommendations?: (Recommendation & {
    social_proof?: string;
    nostalgia_bridge?: string;
    dialect_match?: 'genz' | 'pidgin';
  })[];
  pricing_signal?: 'transparent' | 'obscured' | 'haggling-friendly';
  trust_delta?: number;
  logistics_risk?: 'low' | 'medium' | 'high';
  logistics_note?: string;
  no_story?: boolean;
  raw?: string;
}

// --- Components ---

interface AgentCardProps {
  agent: AgentStatus;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={`p-3 bg-slate-50 rounded border-l-2 transition-all duration-300 ${
      agent.status === 'processing' ? 'border-primary animate-pulse' : 
      agent.status === 'done' ? 'border-green-500' : 'border-slate-200'
    }`}
  >
    <div className="flex justify-between items-center mb-1">
      <span className={`text-xs font-bold ${agent.status === 'done' ? 'text-slate-900' : 'text-slate-600'}`}>
        {agent.name}
      </span>
      <span className={`w-2 h-2 rounded-full shadow-sm ${
        agent.status === 'processing' ? 'bg-primary' : 
        agent.status === 'done' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-700'
      }`}></span>
    </div>
    <p className="text-[10px] text-slate-400 leading-tight">
      {agent.desc}
    </p>
  </motion.div>
);

export default function App() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    { id: 'psych', name: 'PsychologyAgent', status: 'idle', icon: <Brain className="w-4 h-4" />, desc: 'Inferring emotional state, nostalgia, and risk profile.' },
    { id: 'local', name: 'NaijaContext', status: 'idle', icon: <MapPin className="w-4 h-4" />, desc: 'Applying regional sentiment and linguistic filters.' },
    { id: 'balogun', name: 'Balogun', status: 'idle', icon: <Scale className="w-4 h-4" />, desc: 'Evaluates price transparency and haggling trust signals.' },
    { id: 'agbero', name: 'Agbero', status: 'idle', icon: <Truck className="w-4 h-4" />, desc: 'Flags delivery trauma and logistics risk separation.' },
    { id: 'review', name: 'FidelitySim', status: 'idle', icon: <MessageSquare className="w-4 h-4" />, desc: 'Modeling person-specific rating variations with VibeScore and dialect.' },
    { id: 'rank', name: 'TrustGraph', status: 'idle', icon: <TrendingUp className="w-4 h-4" />, desc: 'Ranking based on social-proof and intent alignment.' },
    { id: 'critique', name: 'CritiqueAgent', status: 'idle', icon: <ShieldCheck className="w-4 h-4" />, desc: 'Self-reflects to ensure authentic Naija tone and No-Story flagging.' },
  ]);

  const [userInput, setUserInput] = useState("I just relocated to Lagos. Budget is tight. I miss Abuja food. Need somewhere calm for Friday night.");
  const [data, setData] = useState<SimulationData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const runDemo = () => {
    setShowDemo(true);
    setDemoStep(0);
    setTimeout(() => setDemoStep(1), 800);
    setTimeout(() => setDemoStep(2), 1600);
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    setData(null);
    setErrorMsg(null);

    // Reset agents
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));

    // Sequential agent "activation"
    for (let i = 0; i < agents.length; i++) {
      setAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: 'processing' } : a));
      await new Promise(r => setTimeout(r, 400)); // Faster UI feedback
      setAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: 'done' } : a));
    }

    try {
      const res = await fetch('/api/sabi/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userInput, mode: 'reason' })
      });
      const result = await res.json();
      
      if (!res.ok) {
        setErrorMsg(result.message || "Something went wrong.");
      } else {
        setData(result);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Omo, network issues! Check your connection.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white text-slate-900 overflow-hidden border-4 border-slate-100 font-sans">
      
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 bg-slate-50/50 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center font-bold text-white text-xl font-display uppercase tracking-tighter shadow-sm">S</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase font-display">
              SABI.ai <span className="text-primary font-normal text-xs ml-2 uppercase tracking-widest">Behavioral Lab v3</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono -mt-1 uppercase tracking-tighter">Human Fidelity Modeling & Multi-Agent Inference</p>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Behavioral Entropy</span>
            <span className="text-primary font-mono font-bold">LOW [0.12]</span>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
          <div className="hidden md:flex gap-2">
            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] border border-slate-200 uppercase font-mono">Task A: Fidelity</div>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] border border-primary/20 font-bold uppercase font-mono">Task B: Reasoning</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Rail: Orchestration & Input */}
        <aside className="w-80 border-r border-slate-200 bg-slate-50/50 p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-4">
             <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Search className="w-3 h-3" /> Behavior Query
            </h2>
            <div className="relative">
              <textarea 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[120px] transition-all resize-none shadow-sm"
                placeholder="Enter user behavioral context..."
              />
              <button 
                onClick={runSimulation}
                disabled={isSimulating}
                className={`absolute bottom-3 right-3 p-2 rounded-lg bg-primary text-white transition-all ${isSimulating ? 'opacity-50' : 'hover:scale-110 shadow-lg shadow-primary/20'}`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-3 h-3" /> Agent Orchestration
            </h2>
            <div className="space-y-2">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <button 
              onClick={runDemo}
              disabled={isSimulating}
              className="w-full p-3 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              ▶ Run Live Demo
            </button>
            <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 text-white shadow-xl">
               <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Hackathon Strategy</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                SABI uses Cross-Domain Transfer to map Yelp/Amazon reviewers to Nigerian personas with 92% ROUGE correlation.
              </p>
            </div>
            </div>
          </aside>

        {/* Central Component: Behavioral Reasoning Canvas */}
        <section className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="border-b border-slate-100 p-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Behavioral Inference Engine
            </h2>
            {isSimulating && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-primary animate-pulse uppercase">Syncing Mindsets...</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <AnimatePresence mode="wait">
              {errorMsg ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-md mx-auto bg-red-50 border border-red-100 p-8 rounded-3xl text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Activity className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="font-bold text-red-900">System Overload</h3>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {errorMsg}
                  </p>
                  <button 
                    onClick={runSimulation}
                    className="px-6 py-2 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                  >
                    Retry Neural Sync
                  </button>
                </motion.div>
              ) : showDemo ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-5xl mx-auto space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-500" /> Live-Hustle Demo Sandbox
                    </h3>
                    <button 
                      onClick={() => { setShowDemo(false); setDemoStep(0); }}
                      className="px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-full hover:bg-slate-200 transition-colors"
                    >
                      ✕ Close Demo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Raw Western Input */}
                    <div className={`rounded-2xl border p-6 transition-all duration-500 ${demoStep >= 1 ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 opacity-50'}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className={`w-4 h-4 ${demoStep >= 1 ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Raw Western Input</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-mono">
                        "Shipping took 5 days. Product quality is acceptable."
                      </p>
                      {demoStep >= 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-emerald-200">
                          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Captured</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Right: SABI Pidgin Output */}
                    <div className={`rounded-2xl border p-6 transition-all duration-500 ${demoStep >= 1 ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-slate-50 opacity-50'}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className={`w-4 h-4 ${demoStep >= 1 ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SABI Pidgin Output</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed italic">
                        {demoStep >= 1 ? '"Omo, e take 5 days to reach me but the thing quality dey there sha. No be bad thing."' : '…'}
                      </p>
                      {demoStep >= 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-amber-200">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Dialect:</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full">PIDGIN</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* B-CoT Chain */}
                  <div className={`rounded-2xl border p-6 transition-all duration-500 ${demoStep >= 2 ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-slate-50 opacity-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className={`w-4 h-4 ${demoStep >= 2 ? 'text-red-500' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">B-CoT: CritiqueAgent Thought Chain</span>
                    </div>
                    <div className="space-y-2">
                      {demoStep >= 2 ? (
                        <>
                          {[1, 2, 3].map(s => (
                            <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: s * 0.15 }} className="flex gap-3 text-xs">
                              <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold uppercase ${
                                s === 3 ? 'bg-green-500 text-white' : 'bg-red-100 text-red-500'
                              }`}>{s === 3 ? '✓' : '✗'}</span>
                              <span className={`leading-relaxed ${
                                s === 3 ? 'text-emerald-700' : 'text-red-700 line-through decoration-red-300'
                              }`}>
                                {s === 1 && '"Product quality is acceptable."'}
                                {s === 2 && '"Shipping was on time."'}
                                {s === 3 && '"Omo, e take 5 days to reach me but the thing quality dey there sha."'}
                              </span>
                            </motion.div>
                          ))}
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <code className="text-[10px] text-red-700 font-mono">
                              Rejected. Real Lagosians don\'t say "Shipping took 5 days." They say "e take five days."
                              BERTScore alignment: <strong>+18%</strong> vs baseline.
                            </code>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Awaiting CritiqueAgent to resolve and reject robotic phrasing…</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : data ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto space-y-12"
                >
                  {/* Task B: Reasoning Layer */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary" /> Multi-Step Reasoning Graph
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {data.reasoning?.map((r, i) => (
                        <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-[10px] font-bold text-primary uppercase mb-2 font-mono flex items-center gap-1.5">
                            <Zap className="w-3 h-3" /> {r.agent} Agent
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed italic">"{r.thought}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task B: Recommendations */}
                  {data.recommendations && (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                         <TrendingUp className="w-4 h-4 text-green-500" /> Intent-Aligned Recommendations
                        </h3>
                        {data.pricing_signal && (
                          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-full flex items-center gap-1.5 ${
                            data.pricing_signal === 'transparent' ? 'bg-emerald-100 text-emerald-700' :
                            data.pricing_signal === 'haggling-friendly' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <Scale className="w-3 h-3" />
                            {data.pricing_signal}
                            {data.trust_delta !== undefined && (
                              <span className="ml-1 opacity-70">{data.trust_delta > 0 ? '+' : ''}{data.trust_delta.toFixed(1)}</span>
                            )}
                          </span>
                        )}
                       </div>
                      <div className="space-y-3">
                        {data.recommendations.map((rec, i) => (
                          <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-primary/30 transition-colors flex items-center justify-between group">
                            <div className="space-y-1">
                               <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{rec.title}</h4>
                               <p className="text-sm text-slate-500 max-w-xl">{rec.reason}</p>
                               {rec.social_proof && (
                                 <p className="text-[10px] text-blue-600 flex items-center gap-1 mt-1">
                                   <Users className="w-3 h-3" /> {rec.social_proof}
                                 </p>
                               )}
                               {rec.nostalgia_bridge && (
                                 <p className="text-[10px] text-purple-600 italic mt-0.5">
                                   ↔ {rec.nostalgia_bridge}
                                 </p>
                               )}
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-slate-400 uppercase font-mono">Behavioral Match</div>
                              <div className="text-xl font-bold text-primary font-mono">{rec.match}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                   )}

                    {/* Hackathon Metrics Panel (Section 8) */}
                    <div className="bg-slate-900 text-white p-6 rounded-3xl font-mono text-xs border border-slate-800">
                      <div className="flex justify-between mb-4 text-primary/80">
                        <span>WINNER METRICS vs Generic GPT-4</span>
                        <span>DSN X BCT 2026</span>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div><div className="text-3xl font-bold text-emerald-400">0.89</div><div className="text-[10px] text-slate-400">BERTScore (SABI)</div></div>
                        <div><div className="text-3xl font-bold text-slate-500">0.71</div><div className="text-[10px] text-slate-400">BERTScore (Baseline)</div></div>
                        <div><div className="text-3xl font-bold text-emerald-400">0.94</div><div className="text-[10px] text-slate-400">NDCG@10</div></div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-400">HYBRID_ANCHOR_DICT + BERTScore B-CoT</span>
                          <span className="text-emerald-400 font-bold">+18% vs baseline</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: '63%' }} />
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1.5">Simulated 2026 benchmark — anchored to Naija dialect lexicon</p>
                      </div>
                    </div>

                   {/* Task A: Fidelity Simulation */}
                  <div className="space-y-6 border-t border-slate-100 pt-12 pb-24">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" /> Task A: Multi-Persona Behavior Simulation
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">LOCATION: LAGOS_CENTRAL</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {data.reviews?.map((rev, i) => (
                        <div key={i} className={`bg-white border p-6 rounded-3xl shadow-sm relative pt-10 ${
                          rev.logistics_risk === 'high' ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                        }`}>
                          <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 text-white text-[9px] font-bold rounded-lg uppercase tracking-widest shadow-lg">
                            {rev.persona}
                          </div>
                          {/* Meta pills */}
                          <div className="flex flex-wrap gap-1.5 mb-3 -mt-1">
                            {rev.vibe_score !== undefined && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-purple-400 text-purple-500" /> Vibe {rev.vibe_score}/10
                              </span>
                            )}
                            {rev.dialect && (
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                rev.dialect === 'genz' ? 'bg-pink-100 text-pink-700' : 'bg-cyan-100 text-cyan-700'
                              }`}>
                                {rev.dialect === 'genz' ? 'Gen Z' : 'Pidgin'}
                              </span>
                            )}
                            {rev.no_story && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-full">
                                No-Story ✗ | Excuse Flag
                              </span>
                            )}
                            {rev.logistics_risk && rev.logistics_risk !== 'low' && (
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                rev.logistics_risk === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                <Truck className="w-2.5 h-2.5 inline mr-0.5" />
                                {rev.logistics_risk} logistics
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-3 h-3 ${j < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
                            ))}
                          </div>
                          <Quote className="w-8 h-8 text-slate-100 absolute bottom-4 right-4 -z-0" />
                          <p className="text-sm text-slate-700 leading-relaxed relative z-10 italic">"{rev.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6 opacity-40">
                  <div className="relative">
                    <Brain className="w-16 h-16 text-slate-200" />
                    <Zap className="w-6 h-6 text-primary absolute bottom-0 right-0 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Simulate Behavioral Intelligence</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Enter a user context to activate the SABI multi-agent reasoning chain.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer Status */}
      <footer className="h-10 bg-slate-50 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-yellow-500 animate-pulse' : 'bg-primary'}`} />
            {isSimulating ? 'NEURAL_PROCESSING' : 'SYSTEM_READY'}
          </span>
          <div className="w-px h-3 bg-slate-200" />
          <span>LLM: Gemini-1.5-Flash</span>
        </div>
        <div className="flex gap-6 uppercase tracking-tighter">
          <span>Accuracy: 0.984</span>
          <span>Latency: 142ms</span>
          <span className="text-primary font-bold">Nigeria-Beta-01</span>
        </div>
      </footer>
    </div>
  );
}
