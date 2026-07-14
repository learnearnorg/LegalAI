import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, FileText, Sparkles } from 'lucide-react';

interface SidebarMediaPlayerProps {
  file: File;
  primaryColor?: string;
  onSummarize?: (file: File) => void;
}

export const SidebarMediaPlayer: React.FC<SidebarMediaPlayerProps> = ({ file, primaryColor = '#6366f1', onSummarize }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const isVideo = file.type.startsWith('video/');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const toggle = () => {
    if (isPlaying) mediaRef.current?.pause();
    else mediaRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900 overflow-hidden border border-white/10 p-4 shadow-inner">
      <div className="flex flex-col gap-3">
        {isVideo && sourceUrl && (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-black mb-1">
             <video ref={mediaRef as any} src={sourceUrl} className="w-full h-full object-contain" />
          </div>
        )}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggle} 
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 transition-transform active:scale-90"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{file.name}</p>
            <div className="flex gap-1 h-3 items-end mt-1">
               {[1,2,3,4,5,6,7,8].map(i => (
                 <div 
                   key={i} 
                   className={`w-1 bg-indigo-400 rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce' : 'h-1 opacity-30'}`} 
                   style={{ 
                     height: isPlaying ? `${20 + Math.random() * 80}%` : '2px',
                     animationDelay: `${i * 100}ms`
                   }} 
                 />
               ))}
            </div>
          </div>
        </div>
        
        {/* Action Bar for File */}
        <div className="mt-2 pt-3 border-t border-white/5 flex gap-2">
           <button 
             onClick={() => onSummarize?.(file)}
             className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
           >
             <Sparkles size={12} /> Summarize Document
           </button>
        </div>
      </div>
      {!isVideo && <audio ref={mediaRef as any} src={sourceUrl || ''} onEnded={() => setIsPlaying(false)} className="hidden" />}
    </div>
  );
};
