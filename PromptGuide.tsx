import React from 'react';
import { Lightbulb, Target, MessageSquare, Table, ShieldCheck, ChevronRight, Scale, Lock, Globe, FileText, Zap } from 'lucide-react';

interface PromptGuideProps {
  onClose: () => void;
  onUsePrompt: (prompt: string) => void;
  isDarkMode: boolean;
}

const GUIDE_CATEGORIES = [
  {
    title: "Strategic Frameworks",
    icon: Target,
    tips: [
      "Define the persona (e.g., 'Act as a Senior Compliance Officer').",
      "Specify the exact jurisdiction and document year range.",
      "Request output formats (e.g., 'Compare in a 3-column markdown table').",
      "Assign a task level (e.g., 'Provide a preliminary review' vs 'In-depth statutory audit')."
    ]
  },
  {
    title: "Corporate & Commercial",
    icon: Scale,
    examples: [
      "Analyze the fiduciary duties of directors under Delaware GCL vs UK Companies Act 2006 for a mid-cap entity.",
      "Identify the statutory requirements for minority shareholder protection during a hostile takeover in Japan.",
      "Review the anti-assignment provisions of this SaaS contract under the French Civil Code."
    ]
  },
  {
    title: "Data Privacy & Tech",
    icon: Lock,
    examples: [
      "Contrast the 'Right to be Forgotten' under GDPR Article 17 and the California Privacy Rights Act (CPRA).",
      "Draft a table of mandatory breach notification timelines for all EU member states following the 2024 AI Act.",
      "Evaluate the cross-border data transfer requirements for a US-based firm storing data in Brazil under LGPD."
    ]
  },
  {
    title: "Litigation & Research",
    icon: FileText,
    examples: [
      "Identify 3 key precedents for 'piercing the corporate veil' in New York state courts from 2015 to 2024.",
      "Summarize the current standing of the 'doctrine of laches' in Australian patent infringement cases.",
      "Analyze the admissibility of AI-generated evidence in criminal proceedings within the United Kingdom."
    ]
  }
];

export const PromptGuide: React.FC<PromptGuideProps> = ({ onClose, onUsePrompt, isDarkMode }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="p-8 border-b dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-xl font-bold serif">Prompt Engineering Guide</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
            <ChevronRight size={24} />
          </button>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">Optimize your legal research by leveraging strategic phrasing and contextual parameters.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {GUIDE_CATEGORIES.map((cat, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                <cat.icon size={16} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cat.title}</h4>
            </div>

            {cat.tips && (
              <div className="grid grid-cols-1 gap-3">
                {cat.tips.map((tip, tIdx) => (
                  <div key={tIdx} className={`p-4 rounded-2xl border flex items-start gap-3 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {cat.examples && (
              <div className="space-y-3">
                {cat.examples.map((example, eIdx) => (
                  <button
                    key={eIdx}
                    onClick={() => onUsePrompt(example)}
                    className={`w-full text-left p-5 rounded-2xl border-2 border-dashed transition-all group ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:border-indigo-600 hover:bg-white hover:shadow-lg'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors italic">"{example}"</p>
                      <Zap size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0 mt-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-8 border-t dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium text-emerald-800 dark:text-emerald-400 leading-relaxed">
            <span className="font-bold uppercase tracking-tighter mr-1">Pro Tip:</span> 
            Combine jurisdictional card actions with specific follow-up prompts for ultra-precise multi-state analysis.
          </p>
        </div>
      </div>
    </div>
  );
};