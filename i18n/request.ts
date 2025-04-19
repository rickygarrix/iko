// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import type { RequestConfig } from 'next-intl/server';

import ja from '@/locales/ja.json';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import ko from '@/locales/ko.json';

const messages = { ja, en, zh, ko };

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: messages[locale as keyof typeof messages],
    locale: locale ?? 'ja',
  };
});