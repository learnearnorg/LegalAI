import React, { useState, useRef } from 'react';
import { Video, Square, Camera } from 'lucide-react';

interface VideoRecorderProps {
  onRecordComplete: (file: File) => void;
  disabled?: boolean;
  primaryColor?: string;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onRecordComplete, disabled, primaryColor = '#6366f1' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `video-capture-${Date.now()}.webm`, { type: 'video/webm' });
        onRecordComplete(file);
        stream.getTracks().forEach(t => t.stop());
      };
      chunksRef.current = [];
      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <button 
      onClick={isRecording ? stop : start} 
      disabled={disabled} 
      className={`w-full py-3 rounded-2xl border border-white/20 flex items-center justify-center gap-3 transition-all backdrop-blur-md ${
        isRecording 
          ? 'bg-rose-500 text-white border-rose-400' 
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Camera className="w-3.5 h-3.5" />}
      <span className="text-[10px] font-black uppercase tracking-widest">{isRecording ? 'Stop' : 'Capture Context'}</span>
    </button>
  );
};