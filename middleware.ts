import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

// 対応ロケール
const LOCALES = ["ja", "en", "zh", "ko"] as const;
const DEFAULT_LOCALE = "ja";

// Accept-Language から最適ロケールを検出
function detectLocale(req: NextRequest): string {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  return matchLocale(languages, LOCALES, DEFAULT_LOCALE);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 静的ファイル・API・_next を除外
  const isStaticOrApi =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (isStaticOrApi) {
    return NextResponse.next();
  }

  // ✅ "/" は /[locale]/home にリダイレクト
  if (pathname === "/") {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/home`;
    return NextResponse.redirect(url);
  }

  // ✅ すでにロケールが付いていればそのまま
  const hasLocalePrefix = LOCALES.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // ✅ その他のケース：ロケール付与してリダイレクト
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

// ✅ 適用対象
export const config = {
  matcher: [
    // 静的ファイル・API除外済みで、ルート配下すべてに適用
    "/((?!api|_next|.*\\..*).*)",
  ],
};