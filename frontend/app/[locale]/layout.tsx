import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { AuthProvider } from '@/lib/auth-context';
import { locales } from '@/lib/i18n/config';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  unstable_setRequestLocale(locale);

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <ThemeProvider>
      <AuthProvider>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
