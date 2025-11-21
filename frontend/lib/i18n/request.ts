import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

// Static imports for Edge Runtime compatibility
import enMessages from '../../messages/en.json';
import bnMessages from '../../messages/bn.json';

const messages = {
  en: enMessages,
  bn: bnMessages,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as Locale],
  };
});
