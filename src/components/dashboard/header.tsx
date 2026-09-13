'use client';

import Link from 'next/link';
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Locale } from "@/lib/i18n/dictionaries";

export function Header({ user, locale = 'en' }: { user: any, locale?: Locale }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <Link href="/dashboard" className="text-base font-bold tracking-tight text-slate-900 md:hidden">BoostSync</Link>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <LanguageSwitcher currentLocale={locale} />
        <div className="w-px h-6 bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <div className="text-sm font-semibold text-slate-900 leading-none mb-1">{user?.name}</div>
            <div className="text-xs text-slate-500 leading-none">{user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}</div>
          </div>
          <Link href={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} aria-label={user?.role === 'ADMIN' ? 'Open admin panel' : 'Open dashboard'} className="flex size-9 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-200">
            {user?.name?.charAt(0) || 'U'}
          </Link>
        </div>
      </div>
    </header>
  )
}
