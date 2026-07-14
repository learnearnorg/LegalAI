import React, { useRef, useState } from 'react';
import { Upload, Files, Globe, Youtube, Cloud, Trash2, CheckCircle2, ScanSearch } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { VideoRecorder } from './VideoRecorder';
import { SidebarMediaPlayer } from './SidebarMediaPlayer';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
  labels: any;
  inputType: string;
  onInputTypeChange: (type: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onUrlLoad: () => void;
  activeFileIndex: number;
  onActiveFileChange: (index: number) => void;
  primaryColor?: string;
  onSummarizeFile?: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelect, selectedFiles, onRemoveFile, disabled, labels, 
  inputType, onInputTypeChange, url, onUrlChange, onUrlLoad, 
  activeFileIndex, onActiveFileChange, primaryColor = '#ff30fc',
  onSummarizeFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation Tabs - Refined to match Workspace Styling */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-lg flex items-center justify-center">
        <div className="flex w-full">
          {[
            {id: 'file', icon: Files}, 
            {id: 'web', icon: Globe}, 
            {id: 'youtube', icon: Youtube}, 
            {id: 'workspace', icon: Cloud}
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => onInputTypeChange(tab.id)} 
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                inputType === tab.id 
                  ? 'bg-white text-violet-600 shadow-md scale-[1.02]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{labels.tabs[tab.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {inputType === 'file' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
          {/* Drag & Drop Zone - Refined with Glass Styling */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`group relative w-full p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer overflow-hidden ${
              isDragging 
                ? 'border-white bg-white/20 scale-[1.02] shadow-2xl' 
                : 'border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/40'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            
            {/* Visual Feedback Layer during Dragging */}
            {isDragging && (
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10 flex items-center justify-center animate-pulse">
                <Upload className="w-8 h-8 text-white" />
              </div>
            )}

            <div className={`p-2 bg-white/10 rounded-full transition-all duration-300 ${isDragging ? 'scale-75 opacity-0' : 'group-hover:scale-110'}`}>
               <Upload className="w-6 h-6 text-white" />
            </div>
            
            <div className={`text-center transition-all duration-300 ${isDragging ? 'opacity-30' : 'opacity-100'}`}>
              <p className="text-white font-black text-[11px] uppercase tracking-[0.2em] mb-0.5">
                {isDragging ? 'Release' : 'Upload Briefs & Evidence'}
              </p>
              <p className="text-white/40 text-[10px] font-bold">PDF, DOCX, MEDIA, IMAGES</p>
            </div>
          </div>

          {/* Recording Suite */}
          <div className="grid grid-cols-1 gap-2">
            <VideoRecorder onRecordComplete={(file) => onFilesSelect([file])} disabled={disabled} primaryColor={primaryColor} />
            <AudioRecorder onRecordComplete={(file) => onFilesSelect([file])} disabled={disabled} primaryColor={primaryColor} />
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 mt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3 px-1">Evidence ({selectedFiles.length})</p>
              <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-1 space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onActiveFileChange(idx)} 
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      activeFileIndex === idx 
                        ? 'border-white/40 bg-white/20 shadow-lg' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Files className="w-3.5 h-3.5 text-white/60" />
                      <span className="text-[10px] font-bold truncate max-w-[140px] text-white uppercase tracking-widest">{file.name}</span>
                    </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {onSummarizeFile && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onSummarizeFile(file); }}
                            className="p-1.5 text-white/30 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center group relative mt-[-2px] mb-[-2px]"
                            title="Analyze Evidence (OCR / Summary)"
                          >
                            <ScanSearch className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }} 
                          className="p-1.5 text-white/30 hover:text-rose-400 transition-all rounded-lg hover:bg-rose-500/10 mt-[-2px] mb-[-2px]"
                          title="Remove File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {inputType !== 'file' && (
        <div className="p-8 text-center animate-in fade-in duration-500 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
           <Cloud className="w-10 h-10 text-white/20 mx-auto mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Secure Integration Required</p>
           <p className="text-[9px] text-white/30 mt-2">Connect your firm's private cloud vault.</p>
        </div>
      )}
    </div>
  );
};