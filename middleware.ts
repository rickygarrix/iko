import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

/* ------ 対応ロケール ------ */
const LOCALES = ["ja", "en", "zh", "ko"] as const;
const DEFAULT_LOCALE = "ja";

/* ------ ユーザーの Accept-Language から優先ロケールを取得 ------ */
function detectLocale(req: NextRequest): string {
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => (headers[k] = v));
  const langs = new Negotiator({ headers }).languages();
  return matchLocale(langs, LOCALES, DEFAULT_LOCALE);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ✅ ロケールを付けない公開パス（リダイレクトや rewrite 不要） */
  const PUBLIC_PATHS = [
    "/admin",        // 管理画面
    "/contact",      // お問い合わせフォーム
    "/terms",        // 利用規約（日本語表示のみでOK）
    "/privacy"       // プライバシーポリシー（日本語表示のみでOK）
  ];
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  /* ✅ すでに /ja や /en 等が付いていればスルー */
  const lacksLocale = LOCALES.every(
    l => !pathname.startsWith(`/${l}/`) && pathname !== `/${l}`
  );
  if (!lacksLocale) return NextResponse.next();

  /* ✅ それ以外 → 自動的にロケールを付与してリダイレクト */
  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // 静的ファイル・APIを除外
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"
  ]
};