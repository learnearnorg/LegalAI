import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { LanguageCode } from './types';

// Define the available languages and their country codes for flags
const languages = [
  { code: 'en', label: 'English', countryCode: 'us' },
  { code: 'mn', label: 'Монгол', countryCode: 'mn' },
  { code: 'zh', label: '中文', countryCode: 'cn' },
  { code: 'ja', label: '日本語', countryCode: 'jp' },
  { code: 'ko', label: '한국어', countryCode: 'kr' },
  { code: 'fr', label: 'Français', countryCode: 'fr' },
  { code: 'de', label: 'Deutsch', countryCode: 'de' },
  { code: 'es', label: 'Español', countryCode: 'es' },
  { code: 'ru', label: 'Русский', countryCode: 'ru' },
] as const;

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (lang: LanguageCode) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLang = languages.find(l => l.code === value) || languages[0];

  // Handle clicking outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all backdrop-blur-md group"
      >
        <div className="flex items-center gap-2.5">
          <img 
            src={`https://flagcdn.com/w40/${currentLang.countryCode}.png`} 
            alt="" 
            className="w-5 h-3.5 object-cover rounded-sm shadow-sm group-hover:scale-110 transition-transform" 
          />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">{currentLang.label}</span>
        </div>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 opacity-60 group-hover:opacity-100 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-full min-w-[140px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[70] p-1.5 overflow-hidden animate-fade-in backdrop-blur-xl">
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar space-y-0.5">
            {languages.filter(lang => lang.code !== value).map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code as LanguageCode);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://flagcdn.com/w40/${lang.countryCode}.png`} 
                    alt="" 
                    className="w-5 h-3.5 object-cover rounded-sm shadow-sm opacity-90 group-hover:opacity-100" 
                  />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    {lang.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;