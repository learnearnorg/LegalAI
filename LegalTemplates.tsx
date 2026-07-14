
import React, { useState } from 'react';
import { FileStack, FileText, Search, Download, Plus, LayoutGrid, List, Briefcase, Users, Globe, Cpu } from 'lucide-react';
import { LegalTemplate } from './types';

interface LegalTemplatesProps {
  templates: LegalTemplate[];
  isDarkMode: boolean;
}

const getTemplatePattern = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('corporate')) {
    return 'radial-gradient(circle at top left, #4f46e5, transparent 70%), radial-gradient(circle at bottom right, #f59e0b, transparent 70%)';
  } else if (cat.includes('employment')) {
    return 'radial-gradient(circle at top left, #10b981, transparent 70%), radial-gradient(circle at bottom right, #6366f1, transparent 70%)';
  } else if (cat.includes('digital')) {
    return 'radial-gradient(circle at top left, #7c3aed, transparent 70%), radial-gradient(circle at bottom right, #db2777, transparent 70%)';
  } else if (cat.includes('technology')) {
    return 'radial-gradient(circle at top left, #0891b2, transparent 70%), radial-gradient(circle at bottom right, #4f46e5, transparent 70%)';
  }
  return 'radial-gradient(circle at top left, #6366f1, transparent 70%), radial-gradient(circle at bottom right, #94a3b8, transparent 70%)';
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('corporate')) return Briefcase;
  if (cat.includes('employment')) return Users;
  if (cat.includes('digital')) return Globe;
  if (cat.includes('technology')) return Cpu;
  return FileText;
};

const LegalTemplates: React.FC<LegalTemplatesProps> = ({ templates, isDarkMode }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  const filtered = templates.filter(t => 
    (filter === 'All' || t.category === filter) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search standard legal forms..." 
            className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all shadow-md ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-600' : 'bg-white border-slate-100 focus:border-indigo-600'}`} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700">
             <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}><LayoutGrid size={18} /></button>
             <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}><List size={18} /></button>
          </div>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold outline-none focus:border-indigo-600 transition-all text-[10px] uppercase tracking-widest"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'flex flex-col gap-4'}>
        {filtered.length > 0 ? filtered.map(tpl => {
          const CategoryIcon = getCategoryIcon(tpl.category);
          return (
            <div 
              key={tpl.id} 
              className={`group relative p-8 rounded-[2.5rem] border transition-all shadow-lg hover:shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
            >
              {/* Background Patterns */}
              <div 
                className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] pointer-events-none" 
                style={{ background: getTemplatePattern(tpl.category) }} 
              />
              <div className="absolute inset-0 bg-legal-grid opacity-[0.4] pointer-events-none" />
              <div className="absolute -right-10 -bottom-10 opacity-[0.04] dark:opacity-[0.07] pointer-events-none transform -rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0">
                <CategoryIcon size={180} strokeWidth={1} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/80 dark:bg-slate-800/80 shadow-sm text-indigo-600 rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-600 rounded-full uppercase tracking-widest backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/50">
                    {tpl.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 serif group-hover:text-indigo-600 transition-colors leading-tight">{tpl.title}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-2">{tpl.description}</p>
                
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                    <Plus size={14} /> Use Template
                  </button>
                  <button className="p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-500 rounded-xl hover:text-indigo-600 border border-slate-100 dark:border-slate-700 transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center opacity-30">
            <FileStack size={64} className="mx-auto mb-6" />
            <h5 className="text-xl font-bold serif">No templates found</h5>
            <p className="text-sm">Try broadening your search or filter.</p>
          </div>
        )}
      </div>

      <div className="mt-16 p-10 rounded-[3rem] bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1] bg-legal-grid pointer-events-none" />
        <div className="flex-1 relative z-10">
          <h4 className="text-2xl font-bold serif mb-3">Custom Document Generator</h4>
          <p className="text-white/70 text-sm max-w-md">Can't find what you're looking for? Use our AI to draft a custom contract based on your specific requirements.</p>
        </div>
        <button className="relative z-10 px-10 py-5 bg-white text-indigo-600 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:-translate-y-1 transition-all">
          Launch AI Drafter
        </button>
      </div>
    </div>
  );
};

export default LegalTemplates;
