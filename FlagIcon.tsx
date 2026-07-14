import React from 'react';

interface FlagIconProps {
  language: string;
  className?: string;
}

const FlagIcon: React.FC<FlagIconProps> = ({ language, className }) => {
  // Mapping language display names to country codes for flagcdn
  const flagMap: Record<string, string> = {
    'English': 'us',
    'Монгол': 'mn',
    '中文': 'cn',
    '日本語': 'jp',
    '한국어': 'kr',
    'Français': 'fr',
    'Deutsch': 'de',
    'Español': 'es',
    'Русский': 'ru'
  };
  
  const code = flagMap[language] || 'us';
  
  return (
    <img 
      src={`https://flagcdn.com/w40/${code}.png`} 
      alt={`${language} flag`} 
      className={className} 
      style={{ display: 'inline-block' }}
    />
  );
};

export default FlagIcon;