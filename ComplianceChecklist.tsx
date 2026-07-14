import React, { useState } from 'react';
import { Globe, ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, AlignLeft, Scale, LayoutList } from 'lucide-react';
import { generateComplianceChecklist } from './geminiService';

interface ChecklistItem {
  task: string;
  description: string;
  reqLevel: 'mandatory' | 'recommended';
}

interface ChecklistCategory {
  category: string;
  items: ChecklistItem[];
}

export const ComplianceChecklist: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [sourceJurisdiction, setSourceJurisdiction] = useState('');
  const [targetJurisdiction, setTargetJurisdiction] = useState('');
  const [businessActivity, setBusinessActivity] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [checklistData, setChecklistData] = useState<ChecklistCategory[] | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!sourceJurisdiction.trim() || !targetJurisdiction.trim() || !businessActivity.trim()) return;
    
    setIsGenerating(true);
    setChecklistData(null);
    setExpandedCategories({});
    setCompletedTasks({});
    
    try {
      const data = await generateComplianceChecklist(sourceJurisdiction, targetJurisdiction, businessActivity);
      setChecklistData(data);
      
      const newExpanded: Record<string, boolean> = {};
      data.forEach(cat => { newExpanded[cat.category] = true; });
      setExpandedCategories(newExpanded);
    } catch (e) {
      console.error(e);
      // Dummy fallback
      const dummyData: ChecklistCategory[] = [
        {
          category: 'Corporate Registration',
          items: [
            { task: 'Entity Formation Strategy', description: 'Determine whether to set up a branch or a subsidiary based on liability and tax.', reqLevel: 'mandatory' },
            { task: 'Appoint Local Representative', description: 'Most jurisdictions require a resident director or legal representative.', reqLevel: 'recommended' }
          ]
        },
        {
          category: 'Data Privacy & Security',
          items: [
            { task: 'Cross-Border Data Transfer Mechanism', description: 'Implement Standard Contractual Clauses (SCCs) for data flows.', reqLevel: 'mandatory' },
            { task: 'Local Privacy Policy Localization', description: 'Draft jurisdiction-specific privacy notices covering local law requirements.', reqLevel: 'mandatory' }
          ]
        }
      ];
      setChecklistData(dummyData);
      
      const newExpanded: Record<string, boolean> = {};
      dummyData.forEach(cat => { newExpanded[cat.category] = true; });
      setExpandedCategories(newExpanded);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex items-end justify-between shrink-0 px-2">
        <div>
          <h3 className="text-3xl font-bold serif mb-2 flex items-center gap-3">
             <LayoutList className="w-8 h-8 text-indigo-500" />
             Cross-Border Compliance Checklist
          </h3>
          <p className="text-slate-500 text-sm">Generate targeted operational checklists for international market expansion.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-18rem)] min-h-[500px]">
        {/* Left Side: Input Form */}
        <div className={`col-span-1 flex flex-col rounded-[2rem] border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className={`p-5 flex-1 space-y-6 overflow-y-auto custom-scrollbar`}>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Source Jurisdiction</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={sourceJurisdiction}
                    onChange={e => setSourceJurisdiction(e.target.value)}
                    placeholder="e.g. United States"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  />
                </div>
              </div>

              <div className="flex justify-center my-2">
                <ArrowRight className="w-5 h-5 text-indigo-400 rotate-90 lg:rotate-0" />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Target Jurisdiction</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={targetJurisdiction}
                    onChange={e => setTargetJurisdiction(e.target.value)}
                    placeholder="e.g. European Union"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  />
                </div>
              </div>

              <div className="pt-2 border-t dark:border-slate-800 border-slate-200">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Business Activity / Model</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea 
                    value={businessActivity}
                    onChange={e => setBusinessActivity(e.target.value)}
                    placeholder="e.g. SaaS platform entering EU market targeting enterprise customers"
                    rows={4}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm resize-none custom-scrollbar ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  />
                </div>
              </div>
           </div>
           
           <div className={`p-4 border-t ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
             <button 
               onClick={handleGenerate} 
               disabled={isGenerating || !sourceJurisdiction.trim() || !targetJurisdiction.trim() || !businessActivity.trim()}
               className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${isGenerating || !sourceJurisdiction.trim() || !targetJurisdiction.trim() || !businessActivity.trim() ? 'bg-indigo-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}`}
             >
               {isGenerating ? (
                 <><ShieldCheck className="w-4 h-4 animate-spin" /> Analyzing Requirements...</>
               ) : (
                 <><LayoutList className="w-4 h-4" /> Generate Checklist</>
               )}
             </button>
           </div>
        </div>

        {/* Right Side: Checklist Output */}
        <div className={`col-span-1 lg:col-span-3 flex flex-col rounded-[2rem] border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className={`p-4 border-b flex items-center gap-3 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
             <Scale className="w-5 h-5 text-indigo-500" />
             <span className="font-bold text-sm tracking-wide">Compliance Requirements Checklist</span>
           </div>

           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
             {!checklistData ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
                 <ShieldCheck className="w-16 h-16 opacity-20" />
                 <p className="text-sm font-medium">Define jurisdictions and business model to generate the checklist.</p>
               </div>
             ) : (
               <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                 {checklistData.map((categoryData, catIdx) => (
                   <div key={catIdx} className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                     <button 
                        onClick={() => toggleCategory(categoryData.category)}
                        className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-colors`}
                     >
                       <h4 className="font-bold text-base flex items-center gap-2">
                         {categoryData.category}
                         <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                           {categoryData.items.length}
                         </span>
                       </h4>
                       <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedCategories[categoryData.category] ? 'rotate-180' : ''}`} />
                     </button>
                     
                     {expandedCategories[categoryData.category] && (
                       <div className="p-4 pt-0 space-y-3">
                         {categoryData.items.map((item, itemIdx) => {
                           const taskId = `${catIdx}-${itemIdx}`;
                           const isCompleted = completedTasks[taskId];
                           
                           return (
                             <div 
                               key={itemIdx} 
                               onClick={() => toggleTask(taskId)}
                               className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                                 isCompleted 
                                   ? (isDarkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-200/50') 
                                   : (isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                               }`}
                             >
                               <div className="shrink-0 mt-1">
                                 {isCompleted ? (
                                   <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                 ) : (
                                   <div className={`w-5 h-5 rounded-full border-2 ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`} />
                                 )}
                               </div>
                               <div className="flex-1">
                                 <div className="flex items-center justify-between mb-1">
                                   <span className={`font-bold text-sm ${isCompleted ? 'text-slate-400 line-through' : ''}`}>
                                     {item.task}
                                   </span>
                                   <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md ${
                                     item.reqLevel === 'mandatory' 
                                       ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' 
                                       : 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                   }`}>
                                     {item.reqLevel}
                                   </span>
                                 </div>
                                 <p className={`text-sm ${isCompleted ? 'text-slate-400/70 line-through' : (isDarkMode ? 'text-slate-400' : 'text-slate-600')} leading-relaxed`}>
                                   {item.description}
                                 </p>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
