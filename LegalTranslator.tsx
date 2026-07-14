import React, { useState, useRef } from 'react';
import { Languages, ArrowRightLeft, Sparkles, Copy, CheckCircle2, FileDown, Upload, Loader2, FileText, Trash2 } from 'lucide-react';
import { LANGUAGES } from './constants';
import { translateLegalText, extractTextFromDocument } from './geminiService';

interface LegalTranslatorProps {
  isDarkMode: boolean;
}

const LegalTranslator: React.FC<LegalTranslatorProps> = ({ isDarkMode }) => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('mn');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    try {
      const s = LANGUAGES.find(l => l.code === sourceLang)?.name || 'English';
      const t = LANGUAGES.find(l => l.code === targetLang)?.name || 'Mongolian';
      const result = await translateLegalText(inputText, s, t);
      setTranslatedText(result);
    } catch (error) {
      setTranslatedText("Translation failed. Check API configuration.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const extractedText = await extractTextFromDocument(file.name, base64Data, file.type);
      if (extractedText) {
        setInputText(extractedText);
      } else {
        alert("Could not extract text from the file.");
      }
    } catch (error) {
      console.error("File upload extraction error:", error);
      setInputText("Failed to extract text from file. Please ensure it is a readable document/image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e);
  };

  const clearFile = () => {
    setUploadedFileName('');
    setInputText('');
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`relative overflow-hidden p-8 rounded-[3rem] border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-xl'}`}>
        <div className="absolute inset-0 bg-legal-grid opacity-[0.4] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-2">Source Language</label>
              <select 
                value={sourceLang} 
                onChange={e => setSourceLang(e.target.value)} 
                className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm font-bold outline-none focus:border-indigo-600 transition-all"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            
            <button onClick={swapLanguages} className="p-3 bg-white/50 dark:bg-indigo-900/40 text-indigo-600 rounded-full hover:scale-110 shadow-md transition-transform border border-slate-100 dark:border-indigo-800/50"><ArrowRightLeft className="w-5 h-5" /></button>

            <div className="flex-1 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-2">Target Language</label>
              <select 
                value={targetLang} 
                onChange={e => setTargetLang(e.target.value)} 
                className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm font-bold outline-none focus:border-indigo-600 transition-all"
              >
                {/* Filter out the source language from target options */}
                {LANGUAGES.filter(l => l.code !== sourceLang).map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Input Legal Text</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".pdf,.txt,.docx,.doc,image/*" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isTranslating}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {isUploading ? 'Extracting Text...' : 'Upload Document'}
                  </button>
                </div>
              </div>

              {uploadedFileName && (
                <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-bold truncate text-indigo-700 dark:text-indigo-300">{uploadedFileName}</span>
                  </div>
                  <button onClick={clearFile} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative w-full rounded-[2.5rem] border-2 transition-all duration-300 ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]' 
                    : 'border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60'
                }`}
              >
                {isDragging && (
                  <div className="absolute inset-0 rounded-[2.5rem] bg-indigo-500/10 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center pointer-events-none">
                    <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-bounce mb-2" />
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Drop your file here</span>
                  </div>
                )}
                <textarea 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Paste legal text here or drag and drop a PDF, TXT, DOCX, or Image file..."
                  className="w-full h-80 p-6 bg-transparent outline-none focus:border-indigo-600 transition-all resize-none"
                />
              </div>

              <button onClick={handleTranslate} disabled={isTranslating || isUploading || !inputText.trim()} className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50">
                {isTranslating ? 'Translating...' : 'Process Legal Text'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-full h-80 p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-emerald-900/5 backdrop-blur-sm overflow-y-auto whitespace-pre-wrap">
                {translatedText || <span className="text-slate-400 italic">Result with legal nuance preserved...</span>}
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                 <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Expert engine mapping concepts between common law, civil law, and Sharia frameworks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalTranslator;