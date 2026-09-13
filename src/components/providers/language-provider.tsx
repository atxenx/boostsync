'use client';

import { createContext, useContext } from 'react';
import { Dictionary, Locale } from '@/lib/i18n/dictionaries';

interface LanguageContextType {
  dict: Dictionary;
  locale: Locale;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ 
  children, 
  dict, 
  locale 
}: { 
  children: React.ReactNode; 
  dict: Dictionary; 
  locale: Locale; 
}) {
  return (
    <LanguageContext.Provider value={{ dict, locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
