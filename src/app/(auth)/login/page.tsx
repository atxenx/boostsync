'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Zap, Mail, Lock, BarChart3, Shield, ArrowLeft } from 'lucide-react';
import { loginUser } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/providers/language-provider';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function LoginPage() {
  const { dict, locale } = useLanguage();
  const [state, formAction, isPending] = useActionState(loginUser, { error: '' });

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 to-blue-900 p-12 text-white">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span>BoostSync</span>
        </div>

        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{dict.auth.login.title}</h1>
            <p className="text-lg text-slate-300">
              {dict.auth.login.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <div className="text-2xl font-bold">2.4K+</div>
              <div className="text-sm text-slate-300">{dict.auth.login.activeOrders}</div>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
              <Shield className="h-6 w-6 text-blue-400" />
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-slate-300">{dict.auth.login.uptime}</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-400 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {dict.auth.login.encryption}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative">
        <div className="absolute top-8 right-8">
          <LanguageSwitcher currentLocale={locale} />
        </div>
        <Link href="/" className="absolute top-8 left-8 sm:left-16 lg:left-24 xl:left-32 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {dict.auth.login.backHome}
        </Link>
        <div className="mx-auto w-full max-w-md space-y-8 mt-12 lg:mt-0">
          <div className="lg:hidden flex items-center gap-2 font-bold text-2xl mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span>BoostSync</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{dict.auth.login.formTitle}</h2>
            <p className="text-slate-500">{dict.auth.login.formSubtitle}</p>
          </div>

          <form action={formAction} className="space-y-6">
            {state.error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                {state.error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{dict.auth.login.email}</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    required 
                    placeholder="name@example.com"
                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{dict.auth.login.password}</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                dict.auth.login.signInBtn
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            {dict.auth.login.noAccount}{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {dict.auth.login.registerLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
