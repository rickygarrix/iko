// middleware.ts

import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

const LOCALES = ["ja", "en", "zh", "ko"] as const;
const DEFAULT_LOCALE = "ja";

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

  // ── 追加 ──
  // /stores/:id へのアクセスはそのまま通す
  if (pathname.startsWith("/stores/")) {
    return NextResponse.next();
  }
  // ─────────────────

  // 例）/search でアクセスされたら /ja/search に強制
  if (pathname === "/search") {
    const url = request.nextUrl.clone();
    url.pathname = `/ja/search`;
    return NextResponse.redirect(url);
  }

  // ルートにアクセスされたら、Accept-Language から最適なロケールへリダイレクト
  if (pathname === "/") {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // `_next/` や `api/` や 静的ファイルを除くすべてを対象
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};