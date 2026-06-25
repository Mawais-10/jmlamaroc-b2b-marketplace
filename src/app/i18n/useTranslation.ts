import { useApp } from '../context/AppContext';
import { translations } from './translations';

export type LanguageType = 'en' | 'ar' | 'fr';

export function useTranslation() {
  const { language, setLanguage } = useApp();
  
  // Default to English if language is not set or not supported
  const currentLang: LanguageType = (language as LanguageType) || 'en';
  const t = translations[currentLang] || translations.en;

  return {
    t,
    language: currentLang,
    setLanguage,
    isRTL: currentLang === 'ar'
  };
}
