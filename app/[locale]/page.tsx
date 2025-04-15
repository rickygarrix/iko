import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HomeContent from "@/components/Home";
import type { Messages } from "@/types/messages";

const locales = ["ja", "en", "zh", "ko"] as const;
type Locale = (typeof locales)[number];

import ja from "@/locales/ja.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import ko from "@/locales/ko.json";

const messagesMap: Record<Locale, Messages> = {
  ja,
  en,
  zh,
  ko,
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale?: string };
}): Promise<Metadata> {
  const locale = params?.locale;
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }
  const dict = messagesMap[locale as Locale];
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: {
      description: dict.meta.description,
    },
    twitter: {
      description: dict.meta.description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: { locale?: string };
}) {
  const locale = params?.locale;
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }
  const dict = messagesMap[locale as Locale];
  return (
    <main>
      <HomeContent messages={dict} />
    </main>
  );
}