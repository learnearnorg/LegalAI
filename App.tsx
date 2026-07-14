import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { 
  Globe, X, Monitor, Mic, MicOff, 
  Sparkles, FileText, ExternalLink, Send, Info, Moon, Sun, 
  Home, MapPin, Search, Calendar, FileDown, Upload, GitCompare, Zap, ArrowRight, Bell,
  Users, Share2, Download, MessageSquare, Shield, Lock, Plus, Trash2, Menu, Scale, Filter, ChevronDown, PenTool, 
  Copy, CheckCircle2, Bot, Languages, CreditCard, AlignLeft, FileJson, Tag, ChevronUp, MessageCircle, FileStack,
  ChevronRight, ListFilter, HelpCircle, Lightbulb, Book, Newspaper, FilterX, Link, AlertCircle, TrendingUp, Radar, Activity,
  Bookmark, ShieldCheck, Fingerprint, Library, Settings, History, ShieldAlert, Gavel, LayoutList, Network, MousePointer2
} from 'lucide-react';
import { LegalLevel, ChatMessage, JurisdictionContext, LanguageCode, HistoricalComparison } from './types';
import { FEATURED_RESOURCES, LANGUAGES, TRANSLATIONS, COUNTRY_LIST, REGULATORY_ALERTS, LEGAL_TEMPLATES } from './constants';
import { askLegalAssistant, summarizeLegalContent, translateLegalText, getLegalAdvice, analyzeEvidenceFile } from './geminiService';
import { FileUpload } from './FileUpload';
import LanguageSelector from './LanguageSelector';
import { LegalBriefEditor } from './LegalBriefEditor';
import FlagIcon from './FlagIcon';
import LegalTranslator from './LegalTranslator';
import LegalAdvisor from './LegalAdvisor';
import LegalTemplates from './LegalTemplates';
import { PromptGuide } from './PromptGuide';
import LegalDictionary from './LegalDictionary';
import LegalNews from './LegalNews';
import { CitationNetwork, CitationNode, CitationLink } from './CitationNetwork';
import { LegalTimeline } from './LegalTimeline';
import { ContractRiskHeatmap } from './ContractRiskHeatmap';
import { MootCourtSimulator } from './MootCourtSimulator';
import { ComplianceChecklist } from './ComplianceChecklist';
import { EvidenceBoard } from './EvidenceBoard';

const COLLABORATORS = [
  { id: 1, name: 'Sarah Chen', role: 'Lead Counsel', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 2, name: 'Marcus Thorne', role: 'Paralegal', status: 'away', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
  { id: 3, name: 'Elena Rodriguez', role: 'Compliance Officer', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
  { id: 4, name: 'David Kim', role: 'Junior Associate', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
];

const CITATION_NODES: CitationNode[] = [
  { id: '1', type: 'treaty', jurisdiction: 'Global', title: 'UN Charter', year: 1945, abstract: 'The foundational treaty establishing the United Nations, maintaining international peace and security.', signatories: ['193 Member States'], status: 'Active' },
  { id: '2', type: 'treaty', jurisdiction: 'Global', title: 'Paris Agreement', year: 2015, abstract: 'International treaty on climate change, covering climate change mitigation, adaptation, and finance.', signatories: ['195 Parties'], status: 'Active' },
  { id: '3', type: 'statute', jurisdiction: 'United States', title: 'Clean Air Act', year: 1963, abstract: 'Comprehensive federal law that regulates air emissions from stationary and mobile sources.', signatories: ['US Congress'], status: 'Active' },
  { id: '4', type: 'statute', jurisdiction: 'EU', title: 'GDPR', year: 2016, abstract: 'Regulation in EU law on data protection and privacy in the EU and the EEA.', signatories: ['EU Parliament', 'Council of EU'], status: 'Active' },
  { id: '5', type: 'statute', jurisdiction: 'California', title: 'CCPA', year: 2018, abstract: 'State statute intended to enhance privacy rights and consumer protection for residents of California.', signatories: ['California State Legislature'], status: 'Active (Amended)' },
  { id: '6', type: 'case', jurisdiction: 'United States', title: 'Massachusetts v. EPA', year: 2007, abstract: 'Supreme Court case deciding that the EPA has the authority to regulate greenhouse gases.', signatories: [], status: 'Binding Precedent' },
  { id: '7', type: 'case', jurisdiction: 'EU', title: 'Schrems II', year: 2020, abstract: 'CJEU ruling invalidating the EU-US Privacy Shield and affirming Standard Contractual Clauses.', signatories: [], status: 'Binding Precedent' },
  { id: '8', type: 'article', jurisdiction: 'International', title: 'Data Flows Article', year: 2021, abstract: 'Academic paper detailing cross-border data flow regulations following Schrems II.', signatories: ['Prof. A. Smith'], status: 'Published' }
];

const CITATION_LINKS: CitationLink[] = [
  { source: '2', target: '1', relation: 'supports' },
  { source: '3', target: '2', relation: 'supports' },
  { source: '6', target: '3', relation: 'cites' },
  { source: '5', target: '4', relation: 'supports' },
  { source: '7', target: '4', relation: 'overrules' },
  { source: '8', target: '4', relation: 'cites' },
  { source: '8', target: '7', relation: 'cites' }
];

const COMMON_CLAUSES = [
  'Liability Limitation',
  'Force Majeure',
  'Intellectual Property Rights',
  'Termination for Convenience',
  'Data Privacy & GDPR Compliance',
  'Governing Law & Jurisdiction',
  'Indemnification',
  'Confidentiality',
  'Dispute Resolution',
  'Anti-Bribery & Corruption'
];

/**
 * Helper to generate visual patterns for resource cards based on their category.
 */
const getCardPattern = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('constitutional')) {
    return 'radial-gradient(circle at top left, #4f46e5, transparent 70%), radial-gradient(circle at bottom right, #f59e0b, transparent 70%)';
  } else if (cat.includes('human rights')) {
    return 'radial-gradient(circle at top left, #10b981, transparent 70%), radial-gradient(circle at bottom right, #6366f1, transparent 70%)';
  } else if (cat.includes('privacy')) {
    return 'radial-gradient(circle at top left, #7c3aed, transparent 70%), radial-gradient(circle at bottom right, #db2777, transparent 70%)';
  } else if (cat.includes('administrative')) {
    return 'radial-gradient(circle at top left, #0891b2, transparent 70%), radial-gradient(circle at bottom right, #4f46e5, transparent 70%)';
  }
  return 'radial-gradient(circle at top left, #6366f1, transparent 70%), radial-gradient(circle at bottom right, #94a3b8, transparent 70%)';
};

const App: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<LegalLevel | 'Search' | 'Comparison' | 'Pulse' | 'Team' | 'Translate' | 'Advisor' | 'Templates' | 'Dictionary' | 'News' | 'Network' | 'Timeline' | 'Risk' | 'MootCourt' | 'Checklist' | 'EvidenceBoard'>(LegalLevel.INTERNATIONAL);
  const [specificJurisdiction, setSpecificJurisdiction] = useState<string>('United States');
  const [comparisonJurisdiction, setComparisonJurisdiction] = useState<string>('Germany');
  const [isClusterByJurisdiction, setIsClusterByJurisdiction] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkSearchQuery, setNetworkSearchQuery] = useState('');
  const [selectedCitationNode, setSelectedCitationNode] = useState<CitationNode | null>(null);
  
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [activeBriefId, setActiveBriefId] = useState<string | null>(null);
  const [isUIEditingMode, setIsUIEditingMode] = useState(false);

  useEffect(() => {
    document.designMode = isUIEditingMode ? 'on' : 'off';
  }, [isUIEditingMode]);

  // Advanced Search Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filterDocType, setFilterDocType] = useState('Any');
  const [filterMinYear, setFilterMinYear] = useState<number | ''>('');
  const [filterMaxYear, setFilterMaxYear] = useState<number | ''>('');
  const [filterKeywords, setFilterKeywords] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('legalai_chatHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [exportingJson, setExportingJson] = useState(false);
  const [showPromptGuide, setShowPromptGuide] = useState(false);
  const [isPrecisionMode, setIsPrecisionMode] = useState(true);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [selectedClause, setSelectedClause] = useState<string>('Liability Limitation');
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [savedComparisons, setSavedComparisons] = useState<HistoricalComparison[]>(() => {
    try {
      const saved = localStorage.getItem('legalai_savedComparisons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const sessionCode = "RESEARCH-88";
  const [copiedLink, setCopiedLink] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  useEffect(() => {
    try {
      localStorage.setItem('legalai_chatHistory', JSON.stringify(chatHistory));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }, [chatHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('legalai_savedComparisons', JSON.stringify(savedComparisons));
    } catch (e) {
      console.error('Failed to save comparisons', e);
    }
  }, [savedComparisons]);

  const getJurisdictionContext = (): JurisdictionContext => ({
    level: ['Pulse', 'Search', 'Team', 'Templates', 'Dictionary', 'News'].includes(activeTab) ? 'Global' : (activeTab as any),
    specificJurisdiction,
    comparisonJurisdiction: activeTab === 'Comparison' ? comparisonJurisdiction : undefined,
    language: LANGUAGES.find(l => l.code === lang)?.name,
    strictRelevance: isPrecisionMode,
    filters: {
      docType: filterDocType !== 'Any' ? filterDocType : undefined,
      minYear: typeof filterMinYear === 'number' ? filterMinYear : undefined,
      maxYear: typeof filterMaxYear === 'number' ? filterMaxYear : undefined,
      keywords: filterKeywords || undefined
    }
  });

  const handleSendMessage = async (customPrompt?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const promptToUse = customPrompt || userInput;
    if (!promptToUse.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: promptToUse };
    setChatHistory(prev => [...prev, userMsg]);
    if (!customPrompt) setUserInput('');
    setIsAssistantOpen(true);
    setIsTyping(true);
    setShowPromptGuide(false);

    try {
      const response = await askLegalAssistant(promptToUse, getJurisdictionContext(), chatHistory);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.text, sources: response.sources }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Error accessing global legal intelligence. Please verify network or API configuration." }]);
    } finally { setIsTyping(false); }
  };

  const handleSummarizeText = async (text: string) => {
    setIsTyping(true);
    setIsAssistantOpen(true);
    try {
      const summary = await summarizeLegalContent(text, 'document', getJurisdictionContext());
      setChatHistory(prev => [...prev, { 
        role: 'user', 
        content: `Summarize provided legal content.` 
      }, { 
        role: 'assistant', 
        content: `### Content Summary\n\n${summary}` 
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Failed to summarize content.` }]);
    } finally { setIsTyping(false); }
  };

  const handleSummarizeFile = async (file: File) => {
    setIsTyping(true);
    setIsAssistantOpen(true);
    try {
      if (file.type.startsWith('image/')) {
        const analysis = await analyzeEvidenceFile(file, getJurisdictionContext().level);
        setChatHistory(prev => [...prev, { 
          role: 'user', 
          content: `Analyze evidence (OCR): ${file.name}` 
        }, { 
          role: 'assistant', 
          content: `### Evidence Analysis: ${file.name}\n\n${analysis}` 
        }]);
      } else {
        const fileContext = `File Name: ${file.name}\nFile Type: ${file.type}\nFile Size: ${file.size} bytes.`;
        const summary = await summarizeLegalContent(fileContext, 'document', getJurisdictionContext());
        setChatHistory(prev => [...prev, { 
          role: 'user', 
          content: `Summarize legal document: ${file.name}` 
        }, { 
          role: 'assistant', 
          content: `### Legal Document Summary: ${file.name}\n\n${summary}` 
        }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Failed to process document/evidence: ${file.name}` }]);
    } finally { setIsTyping(false); }
  };

  const activeFilterCount = useMemo(() => {
    return (filterDocType !== 'Any' ? 1 : 0) + 
           (filterMinYear !== '' ? 1 : 0) + 
           (filterMaxYear !== '' ? 1 : 0) + 
           (filterKeywords !== '' ? 1 : 0);
  }, [filterDocType, filterMinYear, filterMaxYear, filterKeywords]);

  const filteredResources = useMemo(() => {
    return FEATURED_RESOURCES.filter(res => {
      const levelMatch = ['Search', 'Comparison', 'Pulse', 'Team', 'Translate', 'Advisor', 'Templates', 'Dictionary', 'News', 'Network', 'Timeline', 'Risk', 'MootCourt', 'Checklist', 'EvidenceBoard'].includes(activeTab) || res.level === activeTab;
      const searchMatch = !searchQuery || res.title.toLowerCase().includes(searchQuery.toLowerCase()) || res.description.toLowerCase().includes(searchQuery.toLowerCase());
      const docTypeMatch = filterDocType === 'Any' || res.docType === filterDocType;
      const minYearMatch = filterMinYear === '' || res.year >= Number(filterMinYear);
      const maxYearMatch = filterMaxYear === '' || res.year <= Number(filterMaxYear);
      const keywordMatch = !filterKeywords || res.title.toLowerCase().includes(filterKeywords.toLowerCase()) || res.description.toLowerCase().includes(filterKeywords.toLowerCase());
      return levelMatch && searchMatch && docTypeMatch && minYearMatch && maxYearMatch && keywordMatch;
    });
  }, [activeTab, searchQuery, filterDocType, filterMinYear, filterMaxYear, filterKeywords]);

  const NAV_ITEMS = [
    { id: LegalLevel.INTERNATIONAL, icon: Globe, labelKey: 'international' },
    { id: LegalLevel.NATIONAL, icon: Home, labelKey: 'national' },
    { id: 'Templates', icon: FileStack, labelKey: 'templates' },
    { id: 'Comparison', icon: GitCompare, labelKey: 'comparison' },
    { id: 'Advisor', icon: MessageCircle, labelKey: 'advisor' },
    { id: 'Pulse', icon: Zap, labelKey: 'pulse' },
    { id: 'Search', icon: Search, labelKey: 'all_refs' }
  ];

  const SECONDARY_NAV_ITEMS = [
    { id: 'Translate', icon: Languages, label: 'Translator' },
    { id: 'Network', icon: Activity, label: 'Network' },
    { id: 'Timeline', icon: History, label: 'Timeline' },
    { id: 'Risk', icon: ShieldAlert, label: 'Risk Heatmap' },
    { id: 'MootCourt', icon: Gavel, label: 'Moot Court' },
    { id: 'Checklist', icon: LayoutList, label: 'Intl Checklist' },
    { id: 'EvidenceBoard', icon: Network, label: 'Evidence Board' }
  ];

  const handleCopySession = () => {
    const inviteLink = `${window.location.origin}/invite?session=${sessionCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCompareClauses = async () => {
    setIsComparing(true);
    setComparisonResult(null);
    try {
      const prompt = `Perform a granular side-by-side comparison of the "${selectedClause}" clause between ${specificJurisdiction} and ${comparisonJurisdiction}. 
      1. Identify key statutory differences.
      2. Compare enforcement standards.
      3. Highlight specific risks for international firms.
      IMPORTANT: Wrap any specific textual differences, crucial varying terms, or standout contrasting provisions in <mark> HTML tags so they are highlighted with a background color for the user.
      Present the findings in a clear, side-by-side Markdown table followed by a detailed analysis.`;
      
      const response = await askLegalAssistant(prompt, getJurisdictionContext());
      setComparisonResult(response.text);
    } catch (err) {
      setComparisonResult("Failed to generate comparative analysis. Please check your connection.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleSaveComparison = () => {
    if (!comparisonResult) return;
    const newComp: HistoricalComparison = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      clause: selectedClause,
      baseJurisdiction: specificJurisdiction,
      targetJurisdiction: comparisonJurisdiction,
      result: comparisonResult
    };
    setSavedComparisons(prev => [newComp, ...prev]);
  };

  const handleRestoreComparison = (comp: HistoricalComparison) => {
    setSelectedClause(comp.clause);
    setSpecificJurisdiction(comp.baseJurisdiction);
    setComparisonJurisdiction(comp.targetJurisdiction);
    setComparisonResult(comp.result);
  };

  const LegalTicker = () => (
    <div className={`fixed bottom-0 left-0 right-0 h-10 flex items-center z-[250] border-t backdrop-blur-xl overflow-hidden ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-cyan-600/10 border-cyan-100'}`}>
       <div className="flex items-center gap-2 px-6 h-full border-r dark:border-slate-800 bg-cyan-600 text-white shrink-0 relative z-10">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Live Juris Pulse</span>
       </div>
       <div className="flex-1 overflow-hidden relative h-full">
          <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-transparent via-transparent to-white dark:to-slate-950" />
          <div className="flex items-center gap-20 whitespace-nowrap px-10 animate-ticker">
             {REGULATORY_ALERTS.concat(REGULATORY_ALERTS).map((alert, idx) => (
               <div key={idx} className="flex items-center gap-3">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${alert.severity === 'high' ? 'bg-rose-50 text-white' : 'bg-amber-500 text-white'}`}>{alert.severity}</span>
                  <span className="text-[10px] font-black uppercase text-slate-400">{alert.region}:</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{alert.title}</span>
                  <span className="text-[9px] font-bold text-indigo-500">Analyze →</span>
               </div>
             ))}
          </div>
       </div>
       <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker {
            animation: ticker 40s linear infinite;
          }
       `}</style>
    </div>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Dictionary':
        return <LegalDictionary isDarkMode={isDarkMode} onAskAI={handleSendMessage} />;
      case 'News':
        return <LegalNews isDarkMode={isDarkMode} onSummarize={handleSummarizeText} />;
      case 'Translate':
        return <LegalTranslator isDarkMode={isDarkMode} />;
      case 'Advisor':
        return <LegalAdvisor isDarkMode={isDarkMode} />;
      case 'Templates':
        return <LegalTemplates templates={LEGAL_TEMPLATES} isDarkMode={isDarkMode} />;
      case 'Comparison':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
            <div className={`relative overflow-hidden flex flex-col lg:flex-row items-stretch gap-6 p-8 rounded-[3rem] border transition-all shadow-xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] pointer-events-none" style={{ background: 'radial-gradient(circle at top left, #6366f1, transparent 70%), radial-gradient(circle at bottom right, #f59e0b, transparent 70%)' }} />
              <div className="absolute inset-0 pattern-plus opacity-10 pointer-events-none text-indigo-500" />
              
              <div className="relative z-10 flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-2">Base Jurisdiction</label>
                    <select value={specificJurisdiction} onChange={e => setSpecificJurisdiction(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm font-bold outline-none focus:border-indigo-600 transition-all text-sm">
                      {COUNTRY_LIST.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-2">Target Jurisdiction</label>
                    <select value={comparisonJurisdiction} onChange={e => setComparisonJurisdiction(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm font-bold outline-none focus:border-indigo-600 transition-all text-sm">
                      {COUNTRY_LIST.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-2">Select Clause / Section for Analysis</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CLAUSES.map(clause => (
                      <button 
                        key={clause}
                        onClick={() => setSelectedClause(clause)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedClause === clause ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`}
                      >
                        {clause}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleCompareClauses}
                  disabled={isComparing}
                  className={`w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 ${isComparing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isComparing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Comparative Analysis...
                    </>
                  ) : (
                    <>
                      <GitCompare className="w-4 h-4" />
                      Run Side-by-Side Comparison
                    </>
                  )}
                </button>
              </div>
            </div>

            {comparisonResult && (
              <div className={`p-8 rounded-[3rem] border-2 animate-in fade-in slide-in-from-top-4 shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-50'}`}>
                <div className="absolute inset-0 pattern-grid opacity-[0.05] pointer-events-none text-indigo-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"><Scale className="w-5 h-5" /></div>
                      <div>
                        <h3 className="text-xl font-bold serif">Comparative Analysis</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{selectedClause}: {specificJurisdiction} vs {comparisonJurisdiction}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveComparison} 
                        className="px-4 py-2 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl transition-all shadow-sm flex items-center gap-2 text-[10px] uppercase font-black tracking-widest bg-white dark:bg-slate-700/50"
                        title="Save Comparison"
                      >
                        <Bookmark className="w-4 h-4" /> Save Comparison
                      </button>
                      <button onClick={() => setComparisonResult(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-700/50 rounded-xl"><X className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="prose-legal dark:prose-invert max-w-none [&_mark]:bg-amber-200/60 dark:[&_mark]:bg-amber-500/40 [&_mark]:text-inherit [&_mark]:px-1 [&_mark]:rounded [&_mark]:inline-block [&_mark]:animate-[highlightPulse_1s_ease-out_forwards]">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{comparisonResult}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {savedComparisons.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-bold serif text-slate-800 dark:text-slate-200">Comparison History</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedComparisons.map(comp => (
                    <div 
                      key={comp.id} 
                      className={`group p-6 rounded-3xl border transition-all hover:-translate-y-1 cursor-pointer shadow-sm hover:shadow-xl relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-400'}`}
                      onClick={() => handleRestoreComparison(comp)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{new Date(comp.timestamp).toLocaleDateString()}</span>
                        <GitCompare className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <h4 className="font-bold text-base mb-1 group-hover:text-indigo-600 transition-colors">{comp.clause}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {comp.baseJurisdiction} vs {comp.targetJurisdiction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'Pulse':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
            {REGULATORY_ALERTS.map(alert => (
              <div key={alert.id} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] relative overflow-hidden group shadow-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 hover:border-indigo-600/30'}`}>
                <div className="absolute inset-0 opacity-[0.12] dark:opacity-[0.2] pointer-events-none" style={{ background: alert.severity === 'high' ? 'radial-gradient(circle at top left, #f43f5e, transparent 70%), radial-gradient(circle at bottom right, #fb923c, transparent 70%)' : 'radial-gradient(circle at top left, #10b981, transparent 70%), radial-gradient(circle at bottom right, #6366f1, transparent 70%)' }} />
                <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none text-slate-400" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm ${alert.severity === 'high' ? 'text-rose-500' : 'text-emerald-500'}`}><Zap className="w-5 h-5" /></div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{alert.region}</span>
                        <p className="text-[10px] font-bold text-slate-400">{alert.timestamp}</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-6 serif leading-tight group-hover:text-indigo-600 transition-colors">{alert.title}</h3>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 transition-all bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/30">Analyze Impact <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'Team':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 pb-20">
            <div className="flex flex-col xl:flex-row gap-12">
              <div className="flex-1">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h3 className="text-3xl font-bold serif mb-2">Team Collaboration</h3>
                    <p className="text-slate-500 text-sm">Coordinate on multijurisdictional matters in real-time.</p>
                  </div>
                  <button onClick={handleCopySession} className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">
                    {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                    {copiedLink ? 'Link Copied!' : 'Copy Session Link'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {COLLABORATORS.map(member => (
                    <div key={member.id} className={`p-5 rounded-[2rem] border-2 transition-all hover:shadow-xl group shadow-md relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 hover:border-indigo-600/30'}`}>
                      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none" style={{ background: 'radial-gradient(circle at top left, #6366f1, transparent 70%), radial-gradient(circle at bottom right, #10b981, transparent 70%)' }} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <img src={member.avatar} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-md" alt={member.name} />
                          <div>
                            <p className="font-bold text-base dark:text-white leading-tight">{member.name}</p>
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{member.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'Network':
        const handleExportCitationData = () => {
            const data = {
                nodes: CITATION_NODES,
                links: CITATION_LINKS
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'citation_network.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        return (
          <div className="flex flex-col h-[calc(100vh-16rem)] overflow-hidden animate-in fade-in slide-in-from-bottom-6">
            <div className="flex justify-between items-end mb-6 shrink-0">
               <div>
                  <h3 className="text-3xl font-bold serif mb-2">Interactive Citation Network</h3>
                  <p className="text-slate-500 text-sm">Visualize relationships and dependencies between legal precedents and statutes.</p>
               </div>
               <div className="flex gap-2 items-center">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search nodes..." 
                      value={networkSearchQuery}
                      onChange={(e) => setNetworkSearchQuery(e.target.value)}
                      className={`pl-9 pr-4 py-2 w-48 text-sm rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                 </div>
                 <button 
                    onClick={() => setIsClusterByJurisdiction(!isClusterByJurisdiction)}
                    className={`flex items-center gap-2 px-4 py-2 ${isClusterByJurisdiction ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'} rounded-xl text-xs font-bold transition-all`}
                 >
                    <Activity size={14} />
                    {isClusterByJurisdiction ? 'Clustered' : 'Cluster by Jurisdiction'}
                 </button>
                 <button 
                    onClick={handleExportCitationData}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all"
                 >
                    <FileDown size={14} />
                    Export JSON
                 </button>
               </div>
            </div>
            <div className={`flex-1 rounded-3xl overflow-hidden border shadow-inner relative flex ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
               <CitationNetwork searchQuery={networkSearchQuery} clusterByJurisdiction={isClusterByJurisdiction} nodes={CITATION_NODES} links={CITATION_LINKS} isDarkMode={isDarkMode} onNodeClick={(node) => {
                 setSelectedCitationNode(node);
               }} />
               {selectedCitationNode && (
                 <div className={`absolute top-4 right-4 w-80 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-right-8 fade-in flex flex-col z-[50] ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                   <div className={`px-4 py-3 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCitationNode.type === 'statute' ? '#4f46e5' : selectedCitationNode.type === 'treaty' ? '#059669' : selectedCitationNode.type === 'case' ? '#e11d48' : '#d97706' }} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{selectedCitationNode.type}</span>
                     </div>
                     <button onClick={() => setSelectedCitationNode(null)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                   <div className="p-5 flex flex-col gap-4">
                     <div>
                       <h4 className="font-bold text-lg leading-tight mb-1">{selectedCitationNode.title}</h4>
                       <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{selectedCitationNode.jurisdiction} &bull; {selectedCitationNode.year}</p>
                     </div>
                     {selectedCitationNode.abstract && (
                       <div>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Abstract</span>
                         <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedCitationNode.abstract}</p>
                       </div>
                     )}
                     <div className="grid grid-cols-2 gap-4">
                       {selectedCitationNode.signatories && selectedCitationNode.signatories.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Signatories/Body</span>
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {selectedCitationNode.signatories.map(s => <div key={s}>{s}</div>)}
                            </div>
                          </div>
                       )}
                       {selectedCitationNode.status && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Status</span>
                            <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold uppercase tracking-widest">
                               {selectedCitationNode.status}
                            </span>
                          </div>
                       )}
                     </div>
                     <button 
                       onClick={() => {
                         handleSendMessage(`Explain the significance of ${selectedCitationNode.title} in jurisdiction ${selectedCitationNode.jurisdiction} (${selectedCitationNode.year})`);
                         setIsAssistantOpen(true);
                       }}
                       className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                     >
                       <Bot size={14} /> Analyze with Advisor
                     </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        );
      case 'Timeline':
        return <div className="h-[calc(100vh-16rem)] overflow-y-auto pb-6 pr-4 custom-scrollbar"><LegalTimeline isDarkMode={isDarkMode} onAnalyze={(query) => { handleSendMessage(query); setIsAssistantOpen(true); }} /></div>;
      case 'Risk':
        return <div className="h-[calc(100vh-16rem)] overflow-y-auto pb-6 pr-4 custom-scrollbar"><ContractRiskHeatmap isDarkMode={isDarkMode} /></div>;
      case 'MootCourt':
        return <div className="h-[calc(100vh-16rem)] overflow-y-auto pb-6 pr-4 custom-scrollbar"><MootCourtSimulator isDarkMode={isDarkMode} jurisdiction={specificJurisdiction} /></div>;
      case 'Checklist':
        return <div className="h-[calc(100vh-16rem)] overflow-y-auto pb-6 pr-4 custom-scrollbar"><ComplianceChecklist isDarkMode={isDarkMode} /></div>;
      case 'EvidenceBoard':
        return <div className="h-[calc(100vh-16rem)] overflow-y-auto pb-6 pr-4 custom-scrollbar"><EvidenceBoard isDarkMode={isDarkMode} /></div>;
      default:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t('search_library')} 
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all shadow-md ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-600' : 'bg-white border-slate-100 focus:border-indigo-600'}`} 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${showFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-800 text-indigo-600 border-indigo-50 dark:border-slate-700'}`}><ListFilter className="w-4 h-4" /> Filters {activeFilterCount > 0 && <span className="ml-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px]">{activeFilterCount}</span>}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
              {filteredResources.map(res => {
                return (
                  <div key={res.id} className={`group p-5 rounded-2xl border transition-all shadow-md hover:shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/90 backdrop-blur-xl border-slate-100'}`}>
                    <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.25] pointer-events-none" style={{ background: getCardPattern(res.category) }} />
                    <div className="absolute inset-0 pattern-grid opacity-[0.4] pointer-events-none text-indigo-500/20" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-black px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full uppercase tracking-widest w-fit">{res.category}</span>
                        <div className="flex gap-2">
                          <button onClick={() => { setIsAssistantOpen(true); handleSendMessage(`Analyze implications: ${res.title}`); }} className="p-2 bg-white/80 dark:bg-slate-700/80 hover:bg-indigo-600 hover:text-white rounded-lg text-indigo-600 transition-all shadow-sm"><Sparkles className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2 serif group-hover:text-indigo-600 transition-colors leading-tight">{res.title}</h3>
                      <p className="text-slate-500 text-xs mb-4 leading-relaxed line-clamp-3">{res.description}</p>
                      <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase pt-4 border-t dark:border-slate-700">
                        <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {res.jurisdiction}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {res.year}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-merriweather transition-colors duration-300 relative ${isDarkMode ? 'dark text-slate-100' : 'text-slate-900'}`}>
      
      {/* GLOBAL MASTER BACKGROUND */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-slate-950 pointer-events-none overflow-hidden">
        {/* The Technical Grid Pattern */}
        <div className="absolute inset-0 pattern-global opacity-[0.9]"></div>
        
        {/* Decorative Blur Blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-pink-500/15 dark:bg-pink-500/10 rounded-full blur-[140px]"></div>
      </div>

      <header className="sticky top-4 z-50 mx-auto w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] max-w-[1400px]">
        <div 
          className="rounded-2xl px-4 md:px-6 flex justify-between items-center transition-all backdrop-blur-2xl h-[51px] shadow-[0_20px_50px_-10px_rgba(180,40,243,0.4)] border border-white/30 relative overflow-hidden"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to right, rgba(180, 40, 243, 0.9), rgba(0, 162, 232, 0.9))
            `,
            backgroundSize: '20px 20px, 20px 20px, 100% 100%'
          }}
        >
          <button onClick={() => { setActiveTab(LegalLevel.INTERNATIONAL); setIsEditingBrief(false); }} className="relative z-10 flex items-center gap-3 group transition-opacity hover:opacity-80">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 border border-white/30 shadow-inner group-hover:border-white transition-colors"><PenTool className="w-4 h-4 text-white" /></div>
            <h1 className="text-base font-black text-white tracking-tighter drop-shadow-sm hidden sm:block">LegalAI</h1>
          </button>
          
          <div className="relative z-10 flex items-center gap-2 md:gap-4">
            {[
              {id: 'News', icon: Newspaper, label: 'News'},
              {id: 'Dictionary', icon: Book, label: 'Glossary'},
              {id: 'Team', icon: Users, label: 'Team'}
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsEditingBrief(false); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-white text-cyan-600 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}

            <button 
              onClick={() => setShowPromptGuide(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest ${showPromptGuide ? 'bg-white text-cyan-600 border-white' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
              title="Prompt Engineering Guide"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Prompt Guide</span>
            </button>

            <div className="w-px h-6 bg-white/20 hidden md:block" />

            <div className="hidden sm:block w-[124px] md:w-[156px]">
              <LanguageSelector value={lang} onChange={setLang} />
            </div>
            
            <button 
              onClick={() => setIsUIEditingMode(!isUIEditingMode)} 
              className={`p-1.5 rounded-lg border transition-all ${isUIEditingMode ? 'bg-indigo-500 text-white border-indigo-400 shadow-inner' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}`}
              title="Toggle UI Editing Mode (Design Mode)"
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 rounded-lg bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all">{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden pt-8 px-4 gap-4 relative">
        {/* REFINED SIDEBAR / LEFT PANEL - VIBRANT & GLASSMORPHIC */}
        <aside className={`${isSidebarOpen ? 'w-[320px]' : 'w-0'} flex-shrink-0 flex flex-col z-40 transition-all duration-300 hidden xl:flex relative overflow-hidden h-[calc(100vh-8rem)] rounded-3xl shadow-[0_30px_60px_-15px_rgba(139,92,246,0.3)] border border-violet-500/30 bg-gradient-to-br from-violet-500 to-fuchsia-600 dark:from-violet-600 dark:to-fuchsia-700 mb-6 mt-[30px]`}>
          <div className="absolute inset-0 pattern-cross opacity-40 pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 text-white opacity-10 transform -rotate-12 pointer-events-none">
              <Scale strokeWidth={0.5} className="w-full h-full" />
          </div>

          <div className="relative z-10 h-full flex flex-col px-4 py-5 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-black text-base tracking-tighter uppercase tracking-[0.1em] drop-shadow-md text-white">Ingest</span>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Institutional Input</p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 hover:bg-white/20 transition-all"><Settings size={14} /></button>
              </div>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <select className="w-full py-2 px-3 appearance-none border border-white/20 bg-white/10 backdrop-blur-md text-white rounded-xl focus:ring-2 focus:ring-white/20 outline-none text-xs font-black uppercase tracking-widest cursor-pointer group">
                        <option className="bg-violet-600">Active Matter #8821</option>
                        <option className="bg-violet-600">Compliance Audit Q4</option>
                        <option className="bg-violet-600">IP Repository</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-6">
              <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Discovery Engine</div>
              <FileUpload 
                onFilesSelect={setSelectedFiles} 
                selectedFiles={selectedFiles} 
                onRemoveFile={(idx) => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} 
                labels={{ tabs: { file: 'Local', web: 'Cloud', youtube: 'Vid', workspace: 'API' } }} 
                inputType="file" 
                onInputTypeChange={() => {}} 
                url="" 
                onUrlChange={() => {}} 
                onUrlLoad={() => {}} 
                activeFileIndex={activeFileIndex} 
                onActiveFileChange={setActiveFileIndex} 
                onSummarizeFile={handleSummarizeFile} 
              />
            </div>

            <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Global Engine Online</span>
            </div>
          </div>
        </aside>

        {/* Content Column with Integrated Navigation */}
        <div className="flex-1 flex flex-col mt-[30px] overflow-hidden gap-6">
          {!isEditingBrief && (
            <div className="shrink-0 flex flex-col items-center gap-3">
              <nav className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-2 h-[42px] shadow-sm flex items-center justify-center overflow-x-auto no-scrollbar">
                <div className="flex p-1 gap-1">
                  {SECONDARY_NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button 
                        key={item.id} 
                        onClick={() => { setActiveTab(item.id as any); setIsEditingBrief(false); }} 
                        className={`flex items-center gap-1.5 px-4 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${isActive ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              <nav className="bg-indigo-600 border border-indigo-700 rounded-2xl px-2 h-[51px] shadow-[0_30px_60px_-12px_rgba(79,70,229,0.5)] flex items-center justify-center overflow-x-auto no-scrollbar">
                <div className="flex bg-white/10 p-1 rounded-xl border border-white/20">
                  {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button 
                        key={item.id} 
                        onClick={() => { setActiveTab(item.id as any); setIsEditingBrief(false); }} 
                        className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{t(item.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>
          )}

          {/* MAIN SCROLLABLE AREA - GLASS CARD POP */}
          <main className={`flex-1 overflow-y-auto px-6 py-6 transition-all rounded-3xl border shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} mb-6`}>
            <div className="max-w-[1200px] mx-auto h-full animate-fade-in">
              {isEditingBrief ? (
                <LegalBriefEditor documentId={activeBriefId || 'new'} initialContent="PRELIMINARY LEGAL ANALYSIS..." onBack={() => setIsEditingBrief(false)} isDarkMode={isDarkMode} />
              ) : (
                <div className="mb-12">
                  {renderActiveTabContent()}
                </div>
              )}
            </div>
          </main>
        </div>
        
        {/* Assistant Panel - Pop over Background */}
        <section className={`fixed lg:relative inset-y-0 right-0 h-[calc(100vh-1.5rem)] rounded-3xl mb-6 border flex flex-col z-[300] shadow-2xl transition-all duration-500 ${isAssistantOpen ? 'w-full lg:w-[520px] opacity-100' : 'w-0 opacity-0 overflow-hidden'} ${isDarkMode ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 backdrop-blur-2xl border-slate-200'}`}>
          <div className="p-6 border-b flex items-center justify-between text-white rounded-t-3xl shadow-lg z-10" style={{ backgroundColor: '#6366f1' }}>
            <div className="flex items-center gap-4"><Sparkles className="w-5 h-5" /><h3 className="text-[11px] font-black uppercase tracking-[0.25em]">Legal Intel</h3></div>
            <button onClick={() => setIsAssistantOpen(false)} className="p-3 hover:bg-white/20 rounded-xl transition-all"><X size={22} /></button>
          </div>
          <div id="chat-transcript" className="flex-1 overflow-y-auto relative custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
            {showPromptGuide ? (
              <PromptGuide isDarkMode={isDarkMode} onClose={() => setShowPromptGuide(false)} onUsePrompt={(p) => { setUserInput(p); setShowPromptGuide(false); }} />
            ) : (
              <div className="px-6 py-10 space-y-12">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col group ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                      <div className={`max-w-[92%] p-7 rounded-[2rem] text-sm shadow-xl relative overflow-hidden ${
                        msg.role === 'user' 
                          ? 'bg-[#6366f1] text-white rounded-br-none' 
                          : 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 dark:text-white rounded-bl-none border border-slate-200/60 dark:border-slate-800'
                      }`}>
                        {msg.role === 'assistant' && (
                          <div className="absolute inset-0 pattern-plus opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-indigo-600" />
                        )}
                        <ReactMarkdown className="prose-legal dark:prose-invert relative z-10">{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isTyping && <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 px-6 animate-pulse">Analyzing multi-state statutes...</div>}
                  <div ref={chatEndRef} />
              </div>
            )}
          </div>
          <form onSubmit={(e) => handleSendMessage(undefined, e)} className="p-6 border-t bg-white dark:bg-slate-950 rounded-b-3xl">
            <div className="relative flex gap-4">
              <input type="text" placeholder="Inquire about global statutes..." className="flex-1 pl-6 pr-[110px] py-5 rounded-3xl outline-none border-2 dark:bg-slate-900 focus:border-indigo-500 border-slate-100 dark:border-slate-800" value={userInput} onChange={e => setUserInput(e.target.value)} />
              <div className="absolute right-2 top-2 bottom-2 flex gap-2">
                <button type="button" onClick={toggleListening} className={`w-12 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`} title={isListening ? 'Stop listening' : 'Start dictation'}>
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button type="submit" disabled={!userInput.trim() || isTyping} className="w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Send size={20} /></button>
              </div>
            </div>
          </form>
        </section>
      </div>
      <LegalTicker />
      
      {/* Quick Actions Menu */}
      <div className="fixed bottom-24 right-8 flex flex-col items-end gap-3 z-[200]">
        {isQuickActionsOpen && (
          <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4">
            <button 
              onClick={() => { setIsEditingBrief(true); setActiveBriefId(null); setIsQuickActionsOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-indigo-600">New Legal Brief</span>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600"><PenTool size={16} /></div>
            </button>
            <button 
              onClick={() => { setActiveTab('Search'); setIsEditingBrief(false); setIsQuickActionsOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-indigo-600">Search Document</span>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600"><Search size={16} /></div>
            </button>
            <button 
              onClick={() => { setActiveTab('Translate'); setIsEditingBrief(false); setIsQuickActionsOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-indigo-600">Translate Text</span>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600"><Languages size={16} /></div>
            </button>
          </div>
        )}
        <button 
          onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)} 
          className={`w-8 h-8 bg-indigo-600 shadow-2xl border border-white/20 rounded-[14px] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[210] ${isQuickActionsOpen ? 'rotate-45 bg-rose-500' : ''}`}
          title="Quick Actions"
        >
          <Plus size={17} />
        </button>
      </div>

      {/* Neon Pink Active Button */}
      <button 
        onClick={() => setIsAssistantOpen(true)} 
        className={`fixed bottom-14 right-8 w-8 h-8 bg-[#ff30fc] shadow-[0_20px_50px_-10px_rgba(255,48,252,0.6)] border border-white/20 rounded-[14px] text-white flex items-center justify-center z-[200] hover:scale-110 active:scale-95 transition-all ${isAssistantOpen ? 'hidden' : ''}`}
      >
        <Sparkles size={17} />
      </button>
    </div>
  );
};

export default App;