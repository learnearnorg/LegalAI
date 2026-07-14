import React, { useState } from 'react';
import { Calendar, ChevronRight, Gavel, Scale, FileText, ArrowRight, Star } from 'lucide-react';

interface TimelineEvent {
  id: string;
  year: number;
  date: string;
  title: string;
  type: 'statute' | 'case' | 'treaty' | 'milestone';
  jurisdiction: string;
  summary: string;
  impact: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 't1', year: 1945, date: 'Oct 24, 1945', title: 'United Nations Charter', type: 'treaty', jurisdiction: 'Global',
    summary: 'The foundational treaty of the United Nations is signed, establishing modern international law frameworks.',
    impact: 'Established the UN framework for international peace, security, and human rights.'
  },
  {
    id: 't2', year: 1963, date: 'Dec 17, 1963', title: 'Clean Air Act', type: 'statute', jurisdiction: 'United States',
    summary: 'Comprehensive federal law that regulates air emissions from stationary and mobile sources.',
    impact: 'Set the foundation for modern environmental regulatory enforcement in the US.'
  },
  {
    id: 't3', year: 2007, date: 'Apr 2, 2007', title: 'Massachusetts v. EPA', type: 'case', jurisdiction: 'United States',
    summary: 'Supreme Court case deciding that the EPA has the authority to regulate greenhouse gases.',
    impact: 'Pioneered climate change litigation and extended environmental agency powers.'
  },
  {
    id: 't4', year: 2015, date: 'Dec 12, 2015', title: 'Paris Agreement', type: 'treaty', jurisdiction: 'Global',
    summary: 'International treaty on climate change, covering climate change mitigation, adaptation, and finance.',
    impact: 'Unified international efforts to limit global warming and set binding emission targets.'
  },
  {
    id: 't5', year: 2016, date: 'Apr 14, 2016', title: 'General Data Protection Regulation (GDPR)', type: 'statute', jurisdiction: 'EU',
    summary: 'Regulation in EU law on data protection and privacy in the EU and the EEA.',
    impact: 'Defined the global gold standard for data privacy and consumer rights.'
  },
  {
    id: 't6', year: 2018, date: 'Jun 28, 2018', title: 'California Consumer Privacy Act (CCPA)', type: 'statute', jurisdiction: 'California',
    summary: 'State statute intended to enhance privacy rights and consumer protection for residents of California.',
    impact: 'Introduced GDPR-like privacy mandates within the US, sparking a wave of state-level laws.'
  },
  {
    id: 't7', year: 2020, date: 'Jul 16, 2020', title: 'Data Protection Commissioner v Facebook Ireland (Schrems II)', type: 'case', jurisdiction: 'EU',
    summary: 'CJEU ruling invalidating the EU-US Privacy Shield and affirming Standard Contractual Clauses.',
    impact: 'Disrupted transatlantic data flows, requiring strict compliance checks for international data transfers.'
  },
  {
    id: 't8', year: 2024, date: 'Mar 13, 2024', title: 'EU AI Act', type: 'statute', jurisdiction: 'EU',
    summary: 'World\'s first comprehensive legal framework on Artificial Intelligence.',
    impact: 'Establishes a risk-based regulatory framework for AI systems across the globe.'
  }
];

export const LegalTimeline: React.FC<{ isDarkMode: boolean, onAnalyze: (query: string) => void }> = ({ isDarkMode, onAnalyze }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'case': return <Scale className="w-5 h-5 text-rose-500" />;
      case 'statute': return <Gavel className="w-5 h-5 text-indigo-500" />;
      case 'treaty': return <Calendar className="w-5 h-5 text-emerald-500" />;
      default: return <Star className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-end mb-8 shrink-0">
         <div>
            <h3 className="text-3xl font-bold serif mb-2">Interactive Legal Timeline</h3>
            <p className="text-slate-500 text-sm">Trace the chronological evolution of seminal legal milestones and precedents.</p>
         </div>
      </div>
      
      <div className="relative">
        <div className={`absolute left-[27px] top-4 bottom-4 w-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="space-y-8 pl-4">
          {TIMELINE_EVENTS.sort((a, b) => b.year - a.year).map((evt) => {
            const isSelected = selectedEventId === evt.id;
            return (
              <div key={evt.id} className="relative pl-14 group">
                <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all z-10 ${isSelected ? 'scale-110 shadow-lg' : 'scale-100'} ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                  style={{ borderColor: isSelected ? (evt.type === 'case' ? '#fb7185' : evt.type === 'treaty' ? '#34d399' : '#818cf8') : undefined }}
                >
                  {getEventIcon(evt.type)}
                </div>

                <div 
                  className={`rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? (isDarkMode ? 'bg-slate-800 border-indigo-500/50 shadow-xl' : 'bg-white border-indigo-300 shadow-xl') 
                      : (isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-slate-600' : 'bg-white/50 border-slate-200 hover:border-slate-300')
                  }`}
                  onClick={() => setSelectedEventId(isSelected ? null : evt.id)}
                >
                  <div className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                          {evt.year}
                        </span>
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                          {evt.date}
                        </span>
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                          {evt.jurisdiction}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {evt.type}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {evt.title}
                    </h4>

                    {isSelected && (
                      <div className="animate-in slide-in-from-top-2 fade-in duration-200 mt-4 pt-4 border-t dark:border-slate-700/50">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Summary</span>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{evt.summary}</p>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1 block flex items-center gap-1">
                              <Star className="w-3 h-3" /> Impact
                            </span>
                            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">{evt.impact}</p>
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onAnalyze(`Analyze the long-term legal impact of ${evt.title} (${evt.year}) in ${evt.jurisdiction}`);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all w-full justify-center mt-2 group"
                          >
                            Analyze Precedent Context 
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
