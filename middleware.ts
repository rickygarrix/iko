import { NextRequest, NextResponse } from "next/server";

// ✅ ローカルに直接定義（他ファイルに依存しない）
const locales = ["ja", "en", "zh", "ko"] as const;
const defaultLocale = "ja";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameIsMissingLocale = locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ 必要なパスにだけマッチ（APIや画像は除外）
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};