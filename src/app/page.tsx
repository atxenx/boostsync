import Link from "next/link";
import { Shield, ShieldCheck, Zap, BarChart3, Users, CreditCard, ArrowRight, CheckCircle2, Menu, Activity, Sparkles, MessageCircle, Globe, Video, Camera } from 'lucide-react'
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { RecentOrdersMockup } from "@/components/landing/recent-orders";
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { MobileNav } from '@/components/landing/mobile-nav';

export default async function Home() {
  const { dict, locale } = await getDictionary();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">BoostSync</span>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">{dict.nav.features}</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">{dict.nav.howItWorks}</Link>
            <Link href="/services" className="hover:text-blue-600 transition-colors">{dict.nav.services}</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/login" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900">
              {dict.nav.signIn}
            </Link>
            <Link 
              href="/register" 
              className={cn(buttonVariants({ variant: "default" }), "hidden md:flex rounded-full px-6 bg-slate-900 text-white hover:bg-slate-800")}
            >
              {dict.nav.getStarted}
            </Link>
            <MobileNav dict={dict} />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay -z-10" />
          
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              <div className="flex-1 text-center lg:text-left space-y-8">

                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                  {dict.landing.heroTitleLine1} <br/>
                  {dict.landing.heroTitleLine2} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{dict.landing.heroTitleHighlight}</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
                  {dict.landing.heroSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link 
                    href="/register"
                    className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-12 text-base shadow-lg shadow-blue-500/20 w-full sm:w-auto")}
                  >
                    {dict.landing.ctaButton} <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <Link 
                    href="/services"
                    className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full px-8 h-12 text-base w-full sm:w-auto bg-white")}
                  >
                    {dict.landing.viewServices}
                  </Link>
                </div>
                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-slate-500 text-sm font-medium">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> {dict.landing.noCreditCard}</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> {dict.landing.cancelAnytime}</div>
                </div>
              </div>

              <div className="flex-1 w-full max-w-2xl lg:max-w-none">
                <div className="relative rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  {/* Mockup Content */}
                  <div className="p-4 pt-16 sm:p-6 sm:pt-20 flex flex-col gap-6 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-64 h-24 bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2"><BarChart3 className="w-4 h-4 text-blue-600"/></div>
                        <div><div className="text-2xl font-bold text-slate-900">2,845</div><div className="text-xs text-slate-500">{dict.landing.mockup.totalOrders}</div></div>
                      </div>
                      <div className="w-full sm:w-64 h-24 bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-2"><Users className="w-4 h-4 text-emerald-600"/></div>
                        <div><div className="text-2xl font-bold text-slate-900">145.2K</div><div className="text-xs text-slate-500">{dict.landing.mockup.followersGained}</div></div>
                      </div>
                    </div>
                    <RecentOrdersMockup dict={dict.landing.mockup} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{dict.landing.features.title}</h2>
              <p className="text-slate-600">{dict.landing.features.subtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: dict.landing.features.f1Title, desc: dict.landing.features.f1Desc },
                { icon: ShieldCheck, title: dict.landing.features.f2Title, desc: dict.landing.features.f2Desc },
                { icon: BarChart3, title: dict.landing.features.f3Title, desc: dict.landing.features.f3Desc }
              ].map((f, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                    <f.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{dict.landing.how.title}</h2>
              <p className="text-slate-600">{dict.landing.how.subtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 -z-10"></div>
              
              {[
                { step: "1", title: dict.landing.how.s1Title, desc: dict.landing.how.s1Desc },
                { step: "2", title: dict.landing.how.s2Title, desc: dict.landing.how.s2Desc },
                { step: "3", title: dict.landing.how.s3Title, desc: dict.landing.how.s3Desc }
              ].map((f, i) => (
                <div key={i} className="text-center relative">
                  <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mb-6 relative">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-600">{f.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/10" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">{dict.landing.cta.title}</h2>
            <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">{dict.landing.cta.subtitle}</p>
            <Link 
            href="/register" 
            className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700")}
          >
            {dict.landing.cta.button}
          </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">BoostSync</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} BoostSync. {dict.landing.footer}</p>
        </div>
      </footer>
    </div>
  );
}
