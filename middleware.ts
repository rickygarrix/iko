import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

// 使用するロケール
const LOCALES = ["ja", "en", "zh", "ko"] as const;
const DEFAULT_LOCALE = "ja";

// 言語判定処理
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

  // 静的ファイル・API・画像などは対象外
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // /contact や /admin は i18n の対象外
  if (pathname.startsWith("/contact") || pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ルートは /[locale]/home にリダイレクト
  if (pathname === "/") {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/home`;
    return NextResponse.redirect(url);
  }

  // すでにロケール付きのURLなら何もしない
  const hasLocalePrefix = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // その他のパスは locale を付与してリダイレクト
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

// matcher 設定
export const config = {
  matcher: ["/((?!api|_next|.*\\..*|contact|admin).*)"],
};