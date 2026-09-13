'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Locale } from '@/lib/i18n/dictionaries';

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  function toggleLocale() {
    const newLocale = currentLocale === 'en' ? 'th' : 'en';
    
    // 1. Set cookie instantly on the client
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    
    // 2. Refresh the router to fetch new server components with the new cookie
    startTransition(() => {
      router.refresh();
    });
  }
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLocale}
      disabled={isPending}
      className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium text-xs uppercase">{currentLocale === 'en' ? 'TH' : 'EN'}</span>
    </Button>
  );
}
