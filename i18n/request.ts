import { getRequestConfig } from 'next-intl/server';
import type { RequestConfig } from 'next-intl/server';

import ja from '@/locales/ja.json';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import ko from '@/locales/ko.json';

const messages = { ja, en, zh, ko };

type Locale = keyof typeof messages;

export default getRequestConfig(async ({ locale }): Promise<RequestConfig> => {
  return {
    messages: messages[locale as Locale] || messages.ja,
    locale: locale || 'ja'
  };
});