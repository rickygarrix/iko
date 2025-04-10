"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== "chloerickyc@gmail.com") {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    };

    checkAuth();
  }, []);

  if (authorized === null) {
    return <div className="text-center p-10 text-gray-800">認証確認中...</div>;
  }

  if (!authorized) {
    notFound();
  }

  return (
    <div>
      {children}
    </div>
  );
}