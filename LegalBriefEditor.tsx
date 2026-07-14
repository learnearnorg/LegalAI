import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Save, Share2, Users, ArrowLeft, Clock, ShieldCheck, History, RotateCcw, FileText, CheckCircle2, X, ChevronRight, PenTool, GitCompare, AlertCircle, Eye, FileDown, Sparkles } from 'lucide-react';
import { Presence, EditorAction, DocumentVersion } from './types';
import { syncService } from './syncService';
import { suggestContractRedlines, draftLegalDocument } from './geminiService';

interface LegalBriefEditorProps {
  documentId: string;
  initialContent: string;
  onBack: () => void;
  isDarkMode: boolean;
}

export const LegalBriefEditor: React.FC<LegalBriefEditorProps> = ({ documentId, initialContent, onBack, isDarkMode }) => {
  const [content, setContent] = useState(initialContent);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [isRedlining, setIsRedlining] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Using ReturnType<typeof setTimeout> instead of NodeJS.Timeout to resolve namespace errors in browser environments.
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Side-by-Side Diff for Legal Auditing
  const renderSideBySideDiff = (baseText: string, targetText: string) => {
    const oldWords = baseText.split(/\s+/);
    const newWords = targetText.split(/\s+/);
    
    return (
      <div className="flex flex-col md:flex-row gap-6 w-full h-full pb-8">
        <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white/50 dark:bg-slate-900/50 shadow-inner">
           <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-900/10 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Base Version (Deletions highlighted)</h4>
           </div>
           <div className="p-8 overflow-y-auto custom-scrollbar flex-1 text-[15px] space-y-4">
             <div className="leading-relaxed whitespace-pre-wrap">
               {oldWords.map((word, i) => {
                 const isDeleted = !newWords.includes(word);
                 return isDeleted ? (
                   <span key={`del-${i}`} className="bg-rose-500/20 text-rose-700 dark:text-rose-400 px-1 rounded mr-1 opacity-80">{word}</span>
                 ) : (
                   <span key={`old-${i}`} className="opacity-60 mr-1">{word}</span>
                 );
               })}
             </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white/50 dark:bg-slate-900/50 shadow-inner">
           <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Target Version (Additions highlighted)</h4>
           </div>
           <div className="p-8 overflow-y-auto custom-scrollbar flex-1 text-[15px] space-y-4">
             <div className="leading-relaxed whitespace-pre-wrap">
               {newWords.map((word, i) => {
                 const isAdded = !oldWords.includes(word);
                 return isAdded ? (
                   <span key={`add-${i}`} className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1 rounded mr-1 font-medium">{word}</span>
                 ) : (
                   <span key={`new-${i}`} className="opacity-60 mr-1">{word}</span>
                 );
               })}
             </div>
           </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    syncService.connect(documentId, { id: 'user-0', name: 'You', avatar: '' });

    syncService.onPresence((updatedPresence) => {
      setPresence(updatedPresence);
    });

    syncService.onAction((action) => {
      if (action.type === 'insert' && action.text) {
        setContent(prev => {
          const newContent = prev.slice(0, action.position) + action.text + prev.slice(action.position);
          setActivityLog(h => [`Draft updated by remote collaborator`, ...h].slice(0, 15));
          return newContent;
        });
      }
    });

    // Initialize with professional Milestone history
    setVersions([
      { id: 'v1', timestamp: Date.now() - 3600000 * 2, author: 'Marcus Thorne', content: initialContent + "\n\n(Initial Jurisdictional research context...)", label: 'Milestone 1' },
      { id: 'v2', timestamp: Date.now() - 3600000, author: 'Sarah Chen', content: initialContent + "\n\n(Added GDPR compliance and multi-state privacy citations.)", label: 'Major Review' },
    ]);

    return () => {
      syncService.disconnect();
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [documentId, initialContent]);

  // Auto-Save Logic
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = setTimeout(() => {
      if (content !== initialContent && !versions.some(v => v.content === content)) {
        const autoVersion: DocumentVersion = {
          id: `auto-${Date.now()}`,
          timestamp: Date.now(),
          author: 'System Auto-Save',
          content: content,
          label: 'Shadow Snapshot'
        };
        setVersions(prev => [autoVersion, ...prev].slice(0, 50)); // Keep last 50
        setActivityLog(prev => [`Auto-saved progress: ${new Date().toLocaleTimeString()}`, ...prev]);
      }
    }, 30000); // 30 second debounce
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const pos = e.target.selectionStart;
    setContent(newContent);
    
    syncService.sendAction({
      userId: 'user-0',
      type: 'insert',
      position: pos,
      timestamp: Date.now()
    });
  };

  const handleCursorMove = (e: any) => {
    const pos = e.target.selectionStart;
    syncService.updateCursor('user-0', pos);
  };

  const saveCurrentVersion = () => {
    const newVersion: DocumentVersion = {
      id: `v-${Date.now()}`,
      timestamp: Date.now(),
      author: 'Internal Counsel',
      content: content,
      label: 'Manual Snapshot'
    };
    setVersions(prev => [newVersion, ...prev]);
    setActivityLog(prev => [`Institutional Milestone saved: ${new Date().toLocaleTimeString()}`, ...prev]);
  };

  const toggleVersionSelection = (id: string) => {
    setSelectedVersionIds(prev => {
      if (prev.includes(id)) {
        const newIds = prev.filter(v => v !== id);
        if (newIds.length < 2) setIsComparing(false);
        return newIds;
      }
      if (prev.length >= 2) {
         setIsComparing(true);
         return [prev[1], id];
      }
      if (prev.length === 1) setIsComparing(true);
      return [...prev, id];
    });
  };

  const revertToVersion = (version: DocumentVersion) => {
    setContent(version.content);
    setActivityLog(prev => [`Restored version from ${new Date(version.timestamp).toLocaleTimeString()}`, ...prev]);
    setShowHistory(false);
    setSelectedVersionIds([]);
    setIsComparing(false);
  };

  const previewVersion = useMemo(() => versions.find(v => v.id === selectedVersionIds[selectedVersionIds.length - 1]), [selectedVersionIds, versions]);
  const baseCompareVersion = useMemo(() => versions.find(v => v.id === selectedVersionIds[0]), [selectedVersionIds, versions]);

  const handleExportPDF = () => {
    const element = document.createElement('div');
    element.className = 'p-12 font-serif text-slate-900 bg-white';
    element.innerHTML = `
      <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #4f46e5; margin: 0;">LegalAI Pro - Case Matter Brief</h1>
        <p style="font-size: 12px; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.1em;">Matter Reference: #8821 | Generated: ${new Date().toLocaleString()}</p>
      </div>
      <div style="white-space: pre-wrap; line-height: 1.8; font-size: 14px;">
        ${content}
      </div>
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
        CONFIDENTIAL LEGAL WORK PRODUCT - FOR RESEARCH PURPOSES ONLY
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `LegalBrief_8821_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
    setActivityLog(prev => [`Exported brief to PDF: ${new Date().toLocaleTimeString()}`, ...prev]);
  };

  const handleAutoRedline = async () => {
    setIsRedlining(true);
    try {
      setActivityLog(prev => [`AI Auto-Redlining started...`, ...prev]);
      const redlinedContent = await suggestContractRedlines(content, "Contracting Party");
      
      const prevVersion: DocumentVersion = {
         id: Date.now().toString() + '-base',
         timestamp: Date.now(),
         author: 'Admin',
         content: content,
         label: 'Pre-Redline Snapshot'
      };
      
      const newVersion: DocumentVersion = {
         id: Date.now().toString() + '-redlined',
         timestamp: Date.now() + 1000,
         author: 'LegalAI',
         content: redlinedContent,
         label: 'AI Redlined Contract'
      };
      
      setVersions(prev => [newVersion, prevVersion, ...prev]);
      setContent(redlinedContent);
      setActivityLog(prev => [`AI Auto-Redline apply complete: ${new Date().toLocaleTimeString()}`, ...prev]);
      
      // Auto-open comparison with these two
      setSelectedVersionIds([prevVersion.id, newVersion.id]);
      setIsComparing(true);
      setShowHistory(true);
    } catch (e) {
      console.error(e);
      setActivityLog(prev => [`Auto-Redline failed: ${new Date().toLocaleTimeString()}`, ...prev]);
    } finally {
      setIsRedlining(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!draftPrompt.trim()) return;
    setIsDrafting(true);
    try {
      setActivityLog(prev => [`AI Drafting started...`, ...prev]);
      const draftedText = await draftLegalDocument(draftPrompt, "General / Specified in Prompt");
      
      const newVersion: DocumentVersion = {
         id: Date.now().toString() + '-ai-draft',
         timestamp: Date.now(),
         author: 'LegalAI Drafter',
         content: draftedText,
         label: 'AI First Draft'
      };
      
      setVersions(prev => [newVersion, ...prev]);
      setContent(draftedText);
      setDraftPrompt("");
      setShowDraftDialog(false);
      setActivityLog(prev => [`AI Draft generated successfully: ${new Date().toLocaleTimeString()}`, ...prev]);
    } catch (e) {
      console.error(e);
      setActivityLog(prev => [`AI Drafting failed: ${new Date().toLocaleTimeString()}`, ...prev]);
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-slate-900 border-slate-700 shadow-indigo-500/10' : 'bg-white border-slate-200 shadow-slate-200'}`}>
      
      {/* Premium Editor Header */}
      <div className="flex items-center justify-between px-10 py-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <ShieldCheck className="w-5 h-5 text-indigo-600" />
               <h3 className="text-xl font-bold serif tracking-tight">Case Matter Brief #8821</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Live Collaboration Session</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-1.5 gap-3 border dark:border-slate-700 mr-2">
             <div className="flex -space-x-2">
                {presence.map(user => (
                  <img 
                    key={user.userId} 
                    src={user.avatar} 
                    title={user.name}
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 ring-1 ring-indigo-500/20" 
                    alt={user.name} 
                  />
                ))}
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{presence.length} Active</span>
          </div>

          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2.5 px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group"
            title="Export to PDF"
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button 
            onClick={() => setShowDraftDialog(true)}
            className="flex items-center gap-2.5 px-5 py-3 bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-600 hover:text-white rounded-2xl text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest transition-all group"
          >
            <PenTool size={18} />
            <span className="hidden sm:inline">AI Draft</span>
          </button>

          <button 
            onClick={handleAutoRedline}
            disabled={isRedlining}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group ${isRedlining ? 'bg-indigo-600/50 text-white cursor-wait relative overflow-hidden' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white'}`}
          >
            {isRedlining && <div className="absolute inset-0 bg-indigo-500/20 blur-md animate-pulse" />}
            <Sparkles size={18} className={isRedlining ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{isRedlining ? 'Redlining...' : 'Auto-Redline'}</span>
          </button>

          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2.5 px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group"
          >
            <History size={18} className="group-hover:rotate-[-45deg] transition-transform" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
          
          <button 
            onClick={saveCurrentVersion}
            className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Save size={16} /> <span className="hidden md:inline">Save Milestone</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className={`flex-1 flex flex-col relative transition-all duration-700 ${showHistory ? 'opacity-20 scale-95 pointer-events-none blur-sm' : 'opacity-100 scale-100'}`}>
           <div className="absolute left-10 top-0 bottom-0 w-px bg-red-200/50 dark:bg-red-900/20 hidden md:block" />
           <div className="flex-1 p-12 md:pl-20 relative bg-legal-grid overflow-hidden">
              <textarea 
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                onKeyUp={handleCursorMove}
                onClick={handleCursorMove}
                spellCheck={false}
                placeholder="Begin detailed legal analysis..."
                className="w-full h-full bg-transparent resize-none outline-none font-merriweather text-[17px] leading-[1.8] dark:text-slate-300 selection:bg-indigo-500/20"
              />
              
              {presence.map(user => (
                <div 
                  key={user.userId} 
                  className="absolute pointer-events-none transition-all duration-300 z-20"
                  style={{ 
                    left: `${(user.cursorPos % 50) * 12 + 80}px`, 
                    top: `${Math.floor(user.cursorPos / 50) * 31 + 48}px` 
                  }}
                >
                  <div className="w-0.5 h-6 animate-pulse" style={{ backgroundColor: user.color }} />
                  <div className="px-2 py-0.5 rounded-md text-[8px] font-black text-white whitespace-nowrap shadow-sm translate-y-[-100%] ml-0.5" style={{ backgroundColor: user.color }}>
                    {user.name}
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Audit Timeline Overlay */}
        {showHistory && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 lg:p-12 bg-slate-900/10 dark:bg-slate-900/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
             <div className={`w-full max-w-6xl h-full flex flex-col rounded-[2.5rem] shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between px-10 py-8 border-b dark:border-slate-700 bg-indigo-600 text-white">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <History className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-[0.1em]">Version Audit Timeline</h4>
                        <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">Select up to 2 versions for side-by-side comparison</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      {selectedVersionIds.length > 0 && (
                        <button 
                          onClick={() => setIsComparing(!isComparing)}
                          disabled={selectedVersionIds.length < 2}
                          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${isComparing ? 'bg-white text-indigo-600 border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/30'} ${selectedVersionIds.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isComparing ? <Eye size={16} /> : <GitCompare size={16} />}
                          {isComparing ? 'Review Snapshot' : 'Side-by-Side Analysis'}
                        </button>
                      )}
                      <button 
                        onClick={() => { setShowHistory(false); setSelectedVersionIds([]); setIsComparing(false); }} 
                        className="p-3 hover:bg-white/10 rounded-2xl transition-all"
                      >
                        <X size={28} />
                      </button>
                   </div>
                </div>
                
                <div className="flex flex-1 overflow-hidden">
                   {/* Scrollable Timeline List */}
                   <div className="w-[380px] border-r dark:border-slate-700 overflow-y-auto custom-scrollbar p-8 space-y-4 bg-slate-50/30 dark:bg-slate-900/10">
                      {versions.map(v => (
                        <button 
                          key={v.id}
                          onClick={() => toggleVersionSelection(v.id)}
                          className={`w-full text-left p-6 rounded-[2rem] transition-all border-2 relative group ${selectedVersionIds.includes(v.id) ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-xl scale-[1.02]' : 'border-transparent hover:bg-white/50 dark:hover:bg-slate-800/50 opacity-70 hover:opacity-100'}`}
                        >
                           <div className="flex justify-between items-start mb-3">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${v.label === 'Shadow Snapshot' ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' : 'bg-indigo-600 text-white'}`}>
                                {v.label || 'Archive'}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                <Clock size={12} /> {new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                           </div>
                           <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{v.author}</p>
                           <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                              <span>{new Date(v.timestamp).toLocaleDateString()}</span>
                              <div className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{v.content.length} chars</span>
                           </div>
                           {selectedVersionIds.includes(v.id) && (
                             <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-600">
                               <ChevronRight size={24} />
                             </div>
                           )}
                        </button>
                      ))}
                   </div>
                   
                    {/* Context Preview Surface */}
                   <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/20 relative">
                      <div className="absolute inset-0 bg-legal-grid opacity-20 pointer-events-none" />
                      {previewVersion ? (
                         <>
                            <div className={`p-12 flex-1 overflow-y-auto custom-scrollbar font-merriweather text-[18px] leading-relaxed text-slate-700 dark:text-slate-300 relative z-10 ${isComparing ? 'p-6' : ''}`}>
                               {isComparing && baseCompareVersion ? (
                                  renderSideBySideDiff(baseCompareVersion.content, previewVersion.content)
                               ) : (
                                  <div className="max-w-3xl mx-auto">
                                     {previewVersion.content}
                                  </div>
                               )}
                            </div>
                            <div className="p-10 border-t dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-20">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                    <FileText size={24} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Integrity Check: Valid</p>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                      {isComparing && baseCompareVersion && selectedVersionIds.length === 2
                                        ? `Comparing ${baseCompareVersion.label || 'Archive'} with ${previewVersion.label || 'Archive'}`
                                        : `${previewVersion.label} from ${new Date(previewVersion.timestamp).toLocaleString()}`
                                      }
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <button 
                                    onClick={() => revertToVersion(previewVersion)}
                                    className="flex items-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                                  >
                                     <RotateCcw className="w-5 h-5" /> Restore Target Version
                                  </button>
                                </div>
                            </div>
                         </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-16 opacity-40">
                           <div className="w-32 h-32 rounded-[3rem] bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-10 border-4 border-indigo-200 dark:border-indigo-800 shadow-inner">
                             <PenTool size={64} className="text-indigo-600" />
                           </div>
                           <h5 className="text-3xl font-bold serif mb-4 text-slate-900 dark:text-white">Legal Version Control</h5>
                           <p className="max-w-md text-base font-medium leading-relaxed">Select a snapshot from the timeline to review historical changes. Enable Delta Analysis to see precisely how the draft evolved.</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Audit / Activity Sidebar */}
        <div className="w-[340px] border-l dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 p-8 flex flex-col hidden xl:flex">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <CheckCircle2 size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Activity Log</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {activityLog.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                <Clock size={24} className="mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No Recent Activity</p>
              </div>
            )}
            {activityLog.map((log, i) => (
              <div key={i} className="group p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-sm hover:shadow-md transition-all animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-start gap-3">
                   <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform" />
                   <div>
                     <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-snug">{log}</p>
                     <div className="flex items-center gap-2 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Just now</span>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t dark:border-slate-800">
             <div className="p-5 rounded-3xl bg-[#ffd200]/10 border border-[#ffd200]/20">
                <div className="flex items-center gap-2 mb-2">
                   <Users className="w-3.5 h-3.5 text-amber-600" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Audit Protocol</span>
                </div>
                <p className="text-[10px] font-medium text-amber-800/70 leading-relaxed italic">All modifications are timestamped and attributed for compliance and conflict of interest tracking.</p>
             </div>
          </div>
        </div>
      </div>

      {showDraftDialog && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
           <div className={`w-full max-w-lg p-8 rounded-[2rem] shadow-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h4 className="text-xl font-bold serif mb-1">AI Document Drafting</h4>
                   <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Generate robust legal starting points</p>
                 </div>
                 <button onClick={() => setShowDraftDialog(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                   <X size={20} />
                 </button>
              </div>
              <textarea 
                 value={draftPrompt}
                 onChange={(e) => setDraftPrompt(e.target.value)}
                 className={`w-full h-32 p-4 rounded-2xl border mb-6 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 custom-scrollbar ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 placeholder-slate-400'}`}
                 placeholder="Describe the document you need (e.g. 'Draft an NDA for a software contractor under NY jurisdiction with a 3-year term' or 'Motion to dismiss based on lack of personal jurisdiction')..."
              />
              <div className="flex justify-end gap-4">
                 <button 
                   onClick={() => setShowDraftDialog(false)}
                   className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleGenerateDraft}
                   disabled={isDrafting || !draftPrompt.trim()}
                   className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-500/20 ${isDrafting || !draftPrompt.trim() ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
                 >
                   {isDrafting ? <Sparkles size={14} className="animate-spin" /> : <PenTool size={14} />}
                   {isDrafting ? 'Drafting...' : 'Generate AI Draft'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
