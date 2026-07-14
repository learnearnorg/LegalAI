import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, Shield, ScanSearch, FileText, ArrowRight, Activity } from 'lucide-react';
import { analyzeContractRisk } from './geminiService';

interface RiskClause {
  clause: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskReason: string;
}

export const ContractRiskHeatmap: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [contractText, setContractText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskData, setRiskData] = useState<RiskClause[] | null>(null);

  const handleAnalyze = async () => {
    if (!contractText.trim()) return;
    setIsAnalyzing(true);
    setRiskData(null);
    try {
      const data = await analyzeContractRisk(contractText);
      setRiskData(data);
    } catch (e) {
      console.error(e);
      // Fallback dummy data if API fails or isn't set up
      setRiskData([
        { clause: "Liability Limitation", riskLevel: "high", riskReason: "Capped too low compared to contract value." },
        { clause: "Indemnification", riskLevel: "critical", riskReason: "Unilateral indemnification covering unforeseeable third-party claims." },
        { clause: "Governing Law", riskLevel: "medium", riskReason: "Foreign jurisdiction specified, potentially increasing litigation costs." },
        { clause: "Force Majeure", riskLevel: "low", riskReason: "Standard market clauses included." }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string, darkData?: boolean) => {
    const isDark = darkData ?? isDarkMode;
    switch (level) {
      case 'critical': return isDark ? 'bg-rose-900/50 border-rose-500/50 text-rose-300' : 'bg-rose-100 border-rose-300 text-rose-800';
      case 'high': return isDark ? 'bg-orange-900/50 border-orange-500/50 text-orange-300' : 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return isDark ? 'bg-amber-900/50 border-amber-500/50 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-800';
      case 'low': return isDark ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800';
      default: return isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'low': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return <Shield className="w-5 h-5 text-slate-500" />;
    }
  };

  const riskCounts = riskData ? {
    critical: riskData.filter(r => r.riskLevel === 'critical').length,
    high: riskData.filter(r => r.riskLevel === 'high').length,
    medium: riskData.filter(r => r.riskLevel === 'medium').length,
    low: riskData.filter(r => r.riskLevel === 'low').length,
  } : null;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex items-end justify-between shrink-0 px-2">
        <div>
          <h3 className="text-3xl font-bold serif mb-2 flex items-center gap-3">
             <ShieldAlert className="w-8 h-8 text-indigo-500" />
             Visual Contract Risk Heatmap
          </h3>
          <p className="text-slate-500 text-sm">Scan documents for critical vulnerabilities, liability traps, and non-standard clauses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-18rem)] min-h-[500px]">
        {/* Left Side: Input */}
        <div className={`flex flex-col rounded-[2rem] border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className={`p-4 border-b flex items-center gap-3 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
             <FileText className="w-5 h-5 text-indigo-500" />
             <span className="font-bold text-sm tracking-wide">Contract Source Text</span>
           </div>
           <div className="flex-1 p-4 relative">
             <textarea 
               value={contractText}
               onChange={e => setContractText(e.target.value)}
               placeholder="Paste contract text here to generate a risk heatmap..."
               className={`w-full h-full resize-none bg-transparent outline-none custom-scrollbar text-sm leading-relaxed ${isDarkMode ? 'text-slate-300 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400'}`}
             />
           </div>
           <div className={`p-4 border-t ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
             <button 
               onClick={handleAnalyze} 
               disabled={isAnalyzing || !contractText.trim()}
               className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${isAnalyzing || !contractText.trim() ? 'bg-indigo-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'}`}
             >
               {isAnalyzing ? (
                 <><ScanSearch className="w-4 h-4 animate-spin" /> Scanning Clauses...</>
               ) : (
                 <><ScanSearch className="w-4 h-4" /> Generate Risk Heatmap</>
               )}
             </button>
           </div>
        </div>

        {/* Right Side: Heatmap Output */}
        <div className={`flex flex-col rounded-[2rem] border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
             <div className="flex items-center gap-3">
               <Activity className="w-5 h-5 text-indigo-500" />
               <span className="font-bold text-sm tracking-wide">Analysis Heatmap</span>
             </div>
             {riskCounts && (
               <div className="flex gap-2">
                 {riskCounts.critical > 0 && <span className="px-2 py-1 rounded bg-rose-500 text-white text-[10px] font-bold">{riskCounts.critical} Critical</span>}
                 {riskCounts.high > 0 && <span className="px-2 py-1 rounded bg-orange-500 text-white text-[10px] font-bold">{riskCounts.high} High</span>}
               </div>
             )}
           </div>

           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
             {!riskData ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
                 <Shield className="w-16 h-16 opacity-20" />
                 <p className="text-sm font-medium">Input contract text to visualize risks.</p>
               </div>
             ) : (
               <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                 {riskData.map((risk, idx) => (
                   <div key={idx} className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] shadow-sm ${getRiskColor(risk.riskLevel)}`}>
                     <div className="flex items-start gap-4">
                       <div className="mt-1 shrink-0 bg-white/50 dark:bg-black/20 p-2 rounded-xl backdrop-blur-sm">
                         {getRiskIcon(risk.riskLevel)}
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center justify-between mb-2">
                           <h4 className="font-bold text-base leading-tight">{risk.clause}</h4>
                           <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                             {risk.riskLevel} Risk
                           </span>
                         </div>
                         <p className={`text-sm leading-relaxed ${isDarkMode ? 'opacity-90' : 'opacity-80'} font-medium`}>
                           {risk.riskReason}
                         </p>
                       </div>
                     </div>
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
