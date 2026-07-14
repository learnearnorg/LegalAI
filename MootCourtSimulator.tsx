import React, { useState, useRef, useEffect } from 'react';
import { Gavel, Send, User, Bot, Scale, AlertCircle, Award } from 'lucide-react';
import { simulateMootCourtArg } from './geminiService';
import ReactMarkdown from 'react-markdown';

interface Interaction {
  id: string;
  userArgument: string;
  counterArgument?: string;
  judgeFeedback?: string;
  isProcessing: boolean;
}

export const MootCourtSimulator: React.FC<{ isDarkMode: boolean, jurisdiction: string }> = ({ isDarkMode, jurisdiction }) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactions]);

  const handleSubmit = async () => {
    if (!currentInput.trim()) return;
    
    const newInteraction: Interaction = {
      id: Date.now().toString(),
      userArgument: currentInput,
      isProcessing: true
    };
    
    setInteractions(prev => [...prev, newInteraction]);
    setCurrentInput('');
    
    try {
      const response = await simulateMootCourtArg(currentInput, jurisdiction);
      setInteractions(prev => prev.map(int => 
        int.id === newInteraction.id 
          ? { ...int, counterArgument: response.counterArgument, judgeFeedback: response.judgeFeedback, isProcessing: false } 
          : int
      ));
    } catch (err) {
      setInteractions(prev => prev.map(int => 
        int.id === newInteraction.id 
          ? { ...int, counterArgument: "Counsel, I am unable to process your argument at this time.", judgeFeedback: "Error connecting to the bench via API.", isProcessing: false } 
          : int
      ));
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex items-end justify-between shrink-0 px-2">
        <div>
          <h3 className="text-3xl font-bold serif mb-2 flex items-center gap-3">
             <Gavel className="w-8 h-8 text-indigo-500" />
             Moot Court Argument Simulator
          </h3>
          <p className="text-slate-500 text-sm">Test your legal arguments against an AI opposing counsel and receive immediate judicial critique.</p>
        </div>
      </div>

      <div className={`flex flex-col flex-1 rounded-[2rem] border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {interactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
              <Scale className="w-16 h-16" />
              <p>The court is in session. Present your argument to the bench.</p>
              <p className="text-xs max-w-sm mt-2 opacity-70">Submit your legal theory below. Opposing counsel will object, and the judge will deliver a critique.</p>
            </div>
          ) : (
            interactions.map(interaction => (
              <div key={interaction.id} className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                {/* User Argument */}
                <div className="flex justify-end gap-4">
                  <div className={`max-w-[80%] rounded-2xl rounded-tr-sm p-4 shadow-sm ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-500'} text-white`}>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{interaction.userArgument}</p>
                    <div className="text-[10px] uppercase tracking-widest font-black opacity-70 mt-3 pt-2 border-t border-white/20 flex items-center justify-end gap-1.5">
                      <User className="w-3 h-3" /> Your Argument
                    </div>
                  </div>
                </div>

                {/* Processing State */}
                {interaction.isProcessing ? (
                  <div className="flex justify-start gap-4">
                     <div className={`max-w-[80%] rounded-2xl rounded-tl-sm p-5 shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2 text-slate-500">
                           <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                           <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-75" />
                           <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150" />
                           <span className="text-sm ml-2 font-bold tracking-wide">Opposing counsel is preparing a response...</span>
                        </div>
                     </div>
                  </div>
                ) : (
                  <>
                    {/* Opposing Counsel */}
                    {interaction.counterArgument && (
                      <div className="flex justify-start gap-4">
                        <div className={`max-w-[80%] rounded-2xl rounded-tl-sm p-5 shadow-sm border border-l-4 border-l-rose-500 ${isDarkMode ? 'bg-slate-800 border-y-slate-700 border-r-slate-700' : 'bg-white border-y-slate-200 border-r-slate-200'}`}>
                          <div className="prose-legal dark:prose-invert text-sm leading-relaxed mb-3">
                            <ReactMarkdown>{interaction.counterArgument}</ReactMarkdown>
                          </div>
                          <div className="text-[10px] uppercase tracking-widest font-black text-rose-500 pt-2 border-t dark:border-slate-700 flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3" /> Opposing Counsel
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Judge Feedback */}
                    {interaction.judgeFeedback && (
                      <div className="flex justify-center my-8 relative mt-12">
                        <div className={`max-w-[90%] w-full rounded-2xl p-6 shadow-lg border-t-4 border-t-amber-500 ${isDarkMode ? 'bg-slate-800/80 border-x-slate-700 border-b-slate-700' : 'bg-amber-50 border-x-amber-200 border-b-amber-200'} backdrop-blur-sm`}>
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white p-3 rounded-full shadow-lg border-4 dark:border-slate-800 border-white">
                             <Award className="w-5 h-5 mx-auto" />
                           </div>
                           <h4 className="text-center font-bold serif text-amber-600 dark:text-amber-500 mb-4 tracking-wide uppercase text-sm mt-3">Judicial Critique</h4>
                           <div className={`text-sm leading-relaxed prose-legal dark:prose-invert ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                             <ReactMarkdown>{interaction.judgeFeedback}</ReactMarkdown>
                           </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="relative flex items-center max-w-4xl mx-auto">
            <textarea
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Present your argument, cite precedents, or frame your legal theory..."
              className={`w-full py-4 pl-6 pr-16 rounded-2xl resize-none h-[64px] focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm border custom-scrollbar text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`}
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!currentInput.trim() || (interactions.length > 0 && interactions[interactions.length - 1].isProcessing)}
              className={`absolute right-2 p-3 rounded-xl transition-all h-[48px] w-[48px] ${(!currentInput.trim() || (interactions.length > 0 && interactions[interactions.length - 1].isProcessing)) ? 'text-slate-400 bg-transparent cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 shadow-md flex items-center justify-center'}`}
            >
              <Send size={18} className={currentInput.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </div>
          <p className="text-center text-[10px] font-bold text-slate-500 mt-3 uppercase tracking-widest">
            Press <kbd className="font-sans px-1 rounded bg-slate-200 dark:bg-slate-700 mx-1">Enter</kbd> to submit argument to the court
          </p>
        </div>
      </div>
    </div>
  );
};
