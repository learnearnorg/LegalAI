
import React, { useState } from 'react';
import { MessageCircle, Bot, Sparkles, Send, ShieldAlert, Scale, ArrowRight, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getLegalAdvice } from './geminiService';
import { COUNTRY_LIST } from './constants';

interface LegalAdvisorProps {
  isDarkMode: boolean;
}

const LegalAdvisor: React.FC<LegalAdvisorProps> = ({ isDarkMode }) => {
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsConsulting(true);
    try {
      const result = await getLegalAdvice(question, jurisdiction);
      setResponse(result);
    } catch (error) {
      setResponse("Consultation error. Please retry.");
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className={`relative overflow-hidden p-10 rounded-[3rem] border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-2xl'}`}>
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none" style={{ background: 'radial-gradient(circle at top left, #6366f1, transparent 70%), radial-gradient(circle at bottom right, #f59e0b, transparent 70%)' }} />
        <div className="absolute inset-0 bg-legal-grid opacity-[0.5] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-600/30">
              <Bot size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold serif">Institutional Legal Advisor</h3>
              <p className="text-slate-500 text-sm">Preliminary guidance on codes, procedures, and statutory interpretation.</p>
            </div>
          </div>

          <form onSubmit={handleConsult} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Active Jurisdiction</label>
                <select 
                  value={jurisdiction} 
                  onChange={e => setJurisdiction(e.target.value)} 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm font-bold outline-none focus:border-indigo-600 transition-all text-sm"
                >
                  {COUNTRY_LIST.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Legal Inquiry</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="e.g. What are the notification requirements for data breaches in California?"
                    className="w-full p-4 pr-16 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm font-bold outline-none focus:border-indigo-600 transition-all text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={isConsulting || !question.trim()}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {response ? (
            <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
              <div className={`p-8 rounded-[2.5rem] relative overflow-hidden ${isDarkMode ? 'bg-slate-900/50' : 'bg-white border border-slate-100 shadow-inner'}`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Scale size={160} />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-600/10 text-indigo-600 rounded-xl">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Consultation Result</span>
                </div>
                <div className="prose-legal dark:prose-invert">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 p-6 rounded-3xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-600">Legal Disclaimer</span>
                    </div>
                    <p className="text-[10px] text-rose-700 dark:text-rose-400 leading-relaxed font-medium">This guidance is generated by AI for informational purposes. It does not constitute attorney-client relationship or formal legal advice.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-md hover:-translate-y-1 transition-all">
                      Generate Brief <ArrowRight size={14} />
                    </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
              {[
                "Procedure for IP patent filing",
                "Employment termination notice periods",
                "Shareholder dispute arbitration",
                "Cross-border tax compliance"
              ].map(item => (
                <button 
                  key={item}
                  onClick={() => setQuestion(item)}
                  className={`p-5 text-left rounded-2xl border-2 border-dashed transition-all group ${isDarkMode ? 'border-slate-700 bg-slate-900/30 hover:border-indigo-500' : 'border-slate-200 bg-white/50 hover:border-indigo-600 hover:bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">{item}</span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalAdvisor;
