'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileNav({ dict }: { dict: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-600 hover:text-slate-900"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-lg flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link 
            href="#features" 
            className="text-slate-600 font-medium px-4 py-2 hover:bg-slate-50 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            {dict.nav.features}
          </Link>
          <Link 
            href="#how-it-works" 
            className="text-slate-600 font-medium px-4 py-2 hover:bg-slate-50 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            {dict.nav.howItWorks}
          </Link>
          <Link 
            href="/services" 
            className="text-slate-600 font-medium px-4 py-2 hover:bg-slate-50 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            {dict.nav.services}
          </Link>
          <div className="h-px bg-slate-100 my-2" />
          <Link 
            href="/login" 
            className="text-slate-600 font-medium px-4 py-2 hover:bg-slate-50 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            {dict.nav.signIn}
          </Link>
          <Link 
            href="/register" 
            className="bg-slate-900 text-white font-medium px-4 py-3 rounded-lg text-center mt-2"
            onClick={() => setIsOpen(false)}
          >
            {dict.nav.getStarted}
          </Link>
        </div>
      )}
    </div>
  );
}
