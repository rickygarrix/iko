"use client";

import { Suspense } from "react";
import SearchPageContent from "@/components/SearchPageContent";

export default function Search() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-center mt-6">🔍 読み込み中...</p>}>
      <SearchPageContent />
    </Suspense>
  );
}