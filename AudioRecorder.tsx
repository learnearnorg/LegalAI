import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface AudioRecorderProps {
  onRecordComplete: (file: File) => void;
  disabled?: boolean;
  primaryColor?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordComplete, disabled, primaryColor = '#6366f1' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Initiates microphone recording
  const start = async () => {
    try {
      // Direct access to microphone as per seamless UX requirement
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        onRecordComplete(file);
        stream.getTracks().forEach(t => t.stop());
      };
      chunksRef.current = [];
      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("Microphone access denied or unavailable:", err);
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
          ? 'bg-red-500 text-white border-red-400' 
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {isRecording ? <Square className="w-3.5 h-3.5 fill-current animate-pulse" /> : <Mic className="w-3.5 h-3.5" />}
      <span className="text-[10px] font-black uppercase tracking-widest">{isRecording ? 'Stop' : 'Voice Memo'}</span>
    </button>
  );
};