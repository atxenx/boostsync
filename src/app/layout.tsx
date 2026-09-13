import type { Metadata } from "next";
import "./globals.css";
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { LanguageProvider } from '@/components/providers/language-provider';

export const metadata: Metadata = {
  title: "SMM Panel | Grow Your Social Presence",
  description: "Manage your social media growth seamlessly from one premium platform.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { dict, locale } = await getDictionary();
  return (
    <html
      lang={locale}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider dict={dict} locale={locale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
