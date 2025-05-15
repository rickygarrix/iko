"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DEFAULT_AVATAR_URL = "/favicon.ico";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  const createUserProfileIfNeeded = async (userId: string) => {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!profile) {
      await supabase.from("user_profiles").insert({
        id: userId,
        name: "オトナビさん",
        avatar_url: DEFAULT_AVATAR_URL,
        instagram: null,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("ログイン失敗：" + error.message);
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        await createUserProfileIfNeeded(userData.user.id);
        router.push("/mypage");
      }
    }
  };

  const handleEmailSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("登録失敗：" + error.message);
    } else {
      alert("確認メールをチェックしてください！");
    }
  };

  useEffect(() => {
    const isCallback = location.pathname === "/auth/callback";
    if (!isCallback) return;

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const userId = data.session.user.id;
        await createUserProfileIfNeeded(userId);
        router.push("/mypage");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header
        locale="ja"
        messages={{ search: "検索", map: "地図で探す" }}
      />

      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg space-y-4">
          <h1 className="text-2xl font-bold text-center">
            {isLoginMode ? "ログイン" : "新規登録"}
          </h1>

          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          {isLoginMode ? (
            <button
              onClick={handleEmailLogin}
              className="w-full bg-black text-white py-2 rounded hover:opacity-80"
            >
              メールでログイン
            </button>
          ) : (
            <button
              onClick={handleEmailSignUp}
              className="w-full bg-gray-600 text-white py-2 rounded hover:opacity-80"
            >
              メールで新規登録
            </button>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-[#4285F4] hover:bg-[#357ae8] text-white py-2 rounded font-semibold shadow"
          >
            {isLoginMode ? "Googleアカウントでログイン" : "Googleアカウントで新規登録"}
          </button>

          <p
            className="text-center text-sm text-gray-500 cursor-pointer hover:underline"
            onClick={() => setIsLoginMode(!isLoginMode)}
          >
            {isLoginMode ? "アカウントをお持ちでない方はこちら" : "ログインはこちら"}
          </p>
        </div>
      </main>

      <Footer
        locale="ja"
        messages={{
          search: "検索",
          map: "地図で探す",
          contact: "お問い合わせ",
          terms: "利用規約",
          privacy: "プライバシー",
          copyright: "© 2025 Otonavi",
        }}
      />
    </div>
  );
}