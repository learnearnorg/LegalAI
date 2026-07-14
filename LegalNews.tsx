import React, { useState } from 'react';
import { Newspaper, Calendar, User, Clock, ArrowRight, Sparkles, Share2, Bookmark } from 'lucide-react';
import { LEGAL_NEWS_ARTICLES } from './constants';

interface LegalNewsProps {
  isDarkMode: boolean;
  onSummarize: (text: string) => void;
}

const LegalNews: React.FC<LegalNewsProps> = ({ isDarkMode, onSummarize }) => {
  const [selectedArticle, setSelectedArticle] = useState<typeof LEGAL_NEWS_ARTICLES[0] | null>(null);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {selectedArticle ? (
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:gap-3 transition-all"
          >
            ← Back to News Feed
          </button>
          
          <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-2xl'}`}>
             <div className="flex justify-between items-start mb-8">
               <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                 {selectedArticle.category}
               </span>
               <div className="flex gap-2">
                 <button className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Share2 size={18} /></button>
                 <button className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Bookmark size={18} /></button>
               </div>
             </div>

             <h1 className="text-4xl font-bold serif mb-6 leading-tight">{selectedArticle.title}</h1>
             
             <div className="flex flex-wrap items-center gap-6 mb-10 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b dark:border-slate-700 pb-8">
               <span className="flex items-center gap-2"><User size={14} className="text-indigo-600" /> {selectedArticle.author}</span>
               <span className="flex items-center gap-2"><Calendar size={14} /> {selectedArticle.date}</span>
               <span className="flex items-center gap-2"><Clock size={14} /> {selectedArticle.readTime}</span>
             </div>

             <div className="prose-legal dark:prose-invert max-w-none mb-12">
               <p className="text-xl font-bold mb-8 text-slate-600 dark:text-slate-300 border-l-4 border-indigo-600 pl-6">
                 {selectedArticle.summary}
               </p>
               <p className="leading-[1.8] text-slate-700 dark:text-slate-400">
                 {selectedArticle.content}
                 Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source...
               </p>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-1">Intelligence Summary</h4>
                  <p className="text-xs text-slate-500">Generate a high-level briefing of this regulatory news article.</p>
                </div>
                <button 
                  onClick={() => onSummarize(selectedArticle.content)}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} /> Summarize Article
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
           <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-indigo-600">Legal Pulse</h2>
                <p className="text-slate-500 text-sm">Tracking global regulatory shifts and statutory news.</p>
              </div>
              <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border dark:border-slate-700">
                {['All News', 'Corporate', 'Tech', 'Human Rights'].map(c => (
                  <button key={c} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all">{c}</button>
                ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {LEGAL_NEWS_ARTICLES.map(article => (
               <div 
                 key={article.id}
                 onClick={() => setSelectedArticle(article)}
                 className={`group p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer hover:shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
               >
                 <div className="absolute inset-0 bg-legal-grid opacity-10 pointer-events-none" />
                 <div className="relative z-10">
                   <div className="flex justify-between items-center mb-6">
                     <span className="text-[9px] font-black px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full uppercase tracking-widest">
                       {article.category}
                     </span>
                     <span className="text-[9px] font-bold text-slate-400">{article.date}</span>
                   </div>
                   <h3 className="text-xl font-bold serif mb-4 group-hover:text-indigo-600 transition-colors leading-snug">
                     {article.title}
                   </h3>
                   <p className="text-slate-500 text-xs mb-8 line-clamp-3 leading-relaxed">
                     {article.summary}
                   </p>
                   <div className="flex items-center justify-between pt-6 border-t dark:border-slate-700">
                     <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase">
                       <Clock size={12} /> {article.readTime}
                     </div>
                     <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:gap-2.5 transition-all">
                       Read More <ArrowRight size={14} />
                     </span>
                   </div>
                 </div>
               </div>
             ))}
           </div>

           <div className={`p-10 rounded-[3rem] bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-indigo-600/30`}>
              <div className="flex-1">
                <h4 className="text-2xl font-bold serif mb-3 text-white">Daily Regulatory Briefing</h4>
                <p className="text-white/70 text-sm max-w-md">Stay ahead of the curve with our AI-curated digest of the world's most critical legal developments.</p>
              </div>
              <button className="px-10 py-5 bg-white text-indigo-600 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:-translate-y-1 transition-all">
                Subscribe to Feed
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default LegalNews;