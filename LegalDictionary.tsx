import React, { useState, useMemo } from 'react';
import { Search, Book, Sparkles, ArrowRight, BookOpen, Tag, Copy, CheckCircle2, ListFilter, Quote } from 'lucide-react';
import { LEGAL_DICTIONARY_TERMS } from './constants';

interface LegalDictionaryProps {
  isDarkMode: boolean;
  onAskAI: (term: string) => void;
}

const LegalDictionary: React.FC<LegalDictionaryProps> = ({ isDarkMode, onAskAI }) => {
  const [search, setSearch] = useState('');
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(LEGAL_DICTIONARY_TERMS.map(t => t.category)))];
  }, []);

  const filteredTerms = LEGAL_DICTIONARY_TERMS.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                         t.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedTerm = LEGAL_DICTIONARY_TERMS.find(t => t.id === selectedTermId);

  const handleCopyCitation = (term: string) => {
    const year = new Date().getFullYear();
    const citation = `${term}, LEGALAI INSTITUTIONAL DICTIONARY (Pro Ed. ${year}).`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRelatedTermClick = (rt: string) => {
    // Attempt to find the specific term in our database
    const foundTerm = LEGAL_DICTIONARY_TERMS.find(t => t.term.toLowerCase() === rt.toLowerCase());
    if (foundTerm) {
      // Directly load the term
      setSelectedTermId(foundTerm.id);
      setSearch(''); // Clear search so the context is full
      setActiveCategory('All'); // Ensure category filter doesn't hide the found term
    } else {
      // Fallback: update search to let user find it via AI or broader list
      setSearch(rt);
      setSelectedTermId(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-280px)] min-h-[600px]">
        {/* Sidebar Index */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 h-full">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search legal terminology..." 
                className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-600' 
                    : 'bg-white border-slate-100 focus:border-indigo-600'
                }`} 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex-1 rounded-[2.5rem] border overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
          }`}>
            <div className="p-5 border-b dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <ListFilter size={12} /> Lexicon Index
               </h4>
               <span className="text-[10px] font-bold text-slate-400">{filteredTerms.length} Terms</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredTerms.length > 0 ? filteredTerms.map(term => (
                <button 
                  key={term.id}
                  onClick={() => setSelectedTermId(term.id)}
                  className={`w-full text-left p-6 border-b last:border-0 dark:border-slate-700 transition-all group relative ${
                    selectedTermId === term.id 
                      ? 'bg-indigo-600 text-white active-lexicon' 
                      : 'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm leading-tight">{term.term}</p>
                    <ArrowRight size={14} className={`transition-transform duration-300 ${
                      selectedTermId === term.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-40 group-hover:translate-x-0'
                    }`} />
                  </div>
                  <p className={`text-[9px] uppercase tracking-[0.15em] font-black ${
                    selectedTermId === term.id ? 'text-indigo-200' : 'text-slate-400'
                  }`}>
                    {term.category}
                  </p>
                </button>
              )) : (
                <div className="p-12 text-center opacity-30">
                  <Book className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No entries match filters</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => onAskAI(`Explain the legal term '${search || 'common law'}' including its historical origins and modern application in international jurisdictions.`)}
            className="w-full p-6 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-between group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-legal-grid opacity-10" />
            <div className="text-left relative z-10">
              <p className="text-xs font-black uppercase tracking-widest mb-1">Define with LegalAI</p>
              <p className="text-[10px] opacity-70 font-medium">Research rare or complex provisions</p>
            </div>
            <Sparkles className="group-hover:rotate-12 transition-transform relative z-10" />
          </button>
        </div>

        {/* Content Display */}
        <div className="flex-1 h-full">
          {selectedTerm ? (
            <div className={`p-12 rounded-[3.5rem] border h-full transition-all relative overflow-hidden flex flex-col ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-2xl shadow-indigo-500/5'
            }`}>
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none" 
                   style={{ background: 'radial-gradient(circle at top right, #6366f1, transparent 70%), radial-gradient(circle at bottom left, #f59e0b, transparent 50%)' }} />
              <div className="absolute inset-0 bg-legal-grid opacity-[0.4] pointer-events-none" />
              <div className="absolute -right-20 -bottom-20 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transform -rotate-12">
                <BookOpen size={480} strokeWidth={1} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-12">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-600/20">
                      <BookOpen size={40} />
                    </div>
                    <div>
                      <h2 className="text-5xl font-bold serif text-slate-900 dark:text-white leading-tight mb-2">{selectedTerm.term}</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-full uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-800">
                          {selectedTerm.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry ID: 00{selectedTerm.id}-LX</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopyCitation(selectedTerm.term)}
                      className="p-3 bg-white dark:bg-slate-700 hover:text-indigo-600 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 transition-all group flex items-center gap-2"
                      title="Copy professional citation"
                    >
                      {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Quote size={18} className="text-slate-400 group-hover:text-indigo-600" />}
                      <span className="text-[10px] font-black uppercase tracking-tighter pr-1">{copied ? 'Copied' : 'Cite'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-12">
                  <div className="prose-legal dark:prose-invert max-w-none">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 mb-4 px-1">Institutional Definition</h5>
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                      <p className="text-2xl leading-relaxed text-slate-700 dark:text-slate-300 serif italic">
                        "{selectedTerm.definition}"
                      </p>
                    </div>
                  </div>

                  {selectedTerm.relatedTerms && (
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 px-1">
                          <Tag size={14} className="text-indigo-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Juridical Correspondences</span>
                       </div>
                       <div className="flex flex-wrap gap-2.5">
                          {selectedTerm.relatedTerms.map(rt => (
                            <button 
                              key={rt} 
                              onClick={() => handleRelatedTermClick(rt)}
                              className="px-5 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md active:scale-95 group flex items-center gap-2"
                            >
                              <span className="group-hover:underline underline-offset-4 decoration-indigo-400 decoration-2">{rt}</span>
                              <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                <div className="pt-10 border-t dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                   <button 
                     onClick={() => onAskAI(`Conduct an advanced legal analysis on the concept of '${selectedTerm.term}'. Address its historical evolution, relevant case law in major jurisdictions, and current statutory challenges.`)}
                     className="flex-1 flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                   >
                     Deep Analysis with AI <ArrowRight size={14} />
                   </button>
                   <button 
                     onClick={() => onAskAI(`Draft a legal document section using the term '${selectedTerm.term}' in a proper ${selectedTerm.category} context.`)}
                     className="flex-1 flex items-center justify-center gap-3 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] font-black uppercase tracking-widest text-[10px] text-slate-600 dark:text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                   >
                      Draft with this Context
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`h-full flex flex-col items-center justify-center text-center p-20 rounded-[3.5rem] border-4 border-dashed relative overflow-hidden ${
              isDarkMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-100 bg-slate-50/50'
            }`}>
               <div className="absolute inset-0 bg-legal-grid opacity-[0.2] pointer-events-none" />
               <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-10 border-2 border-indigo-100 dark:border-indigo-800/50">
                 <Book size={48} className="text-indigo-300 dark:text-indigo-700" />
               </div>
               <h3 className="text-3xl font-bold serif text-slate-400 mb-4">Scholarly Lexicon Active</h3>
               <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                 Select a statutory term from the index to access institutional definitions, related jurisdictional concepts, and AI-driven deep analysis.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalDictionary;