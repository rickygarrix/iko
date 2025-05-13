"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SearchResults from "@/components/SearchResults";
import SearchFloatingButton from "@/components/SearchFloatingButton";
import Footer from "@/components/Footer"; // ✅ 追加
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
import useSWR from "swr";
import type { Messages } from "@/types/messages";

export default function SearchPageContent({ messages }: { messages: Messages }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ja";

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);

  const queryString = searchParams.toString();

  const fetchPreviewCount = async (
    genres: string[],
    areas: string[],
    payments: string[],
    openOnly: boolean
  ): Promise<number> => {
    let query = supabase.from("stores").select("*").eq("is_published", true);
    if (genres.length > 0) query = query.filter("genre_ids", "cs", JSON.stringify(genres));
    if (areas.length > 0) query = query.in("area_id", areas);
    if (payments.length > 0) query = query.overlaps("payment_method_ids", payments);

    const { data, error } = await query;
    if (error || !data) return 0;
    const filtered = openOnly ? data.filter((s) => checkIfOpen(s.opening_hours).isOpen) : data;
    return filtered.length;
  };

  const { data: previewCount } = useSWR(
    ["previewCount", selectedGenres, selectedAreas, selectedPayments, showOnlyOpen],
    ([, genres, areas, payments, openOnly]) =>
      fetchPreviewCount(genres, areas, payments, openOnly),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const genres = searchParams.get("genre")?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterGenres") || "[]");
    const areas = searchParams.get("area")?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterAreas") || "[]");
    const payments = searchParams.get("payment")?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterPayments") || "[]");
    const open = searchParams.get("open") === "true" ||
      JSON.parse(sessionStorage.getItem("filterOpen") || "false");

    setSelectedGenres(genres);
    setSelectedAreas(areas);
    setSelectedPayments(payments);
    setShowOnlyOpen(open);
    setIsSearchTriggered(true);
  }, [queryString]);

  const handleSearch = () => {
    sessionStorage.setItem("filterGenres", JSON.stringify(selectedGenres));
    sessionStorage.setItem("filterAreas", JSON.stringify(selectedAreas));
    sessionStorage.setItem("filterPayments", JSON.stringify(selectedPayments));
    sessionStorage.setItem("filterOpen", JSON.stringify(showOnlyOpen));

    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.set("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.set("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.set("open", "true");

    setIsSearchTriggered(false);
    setTimeout(() => setIsSearchTriggered(true), 100);

    router.push(`/${locale}/search?${params.toString()}`);
  };

  useEffect(() => {
    const genres = searchParams.get("genre")?.split(",") ?? [];
    const areas = searchParams.get("area")?.split(",") ?? [];
    const payments = searchParams.get("payment")?.split(",") ?? [];
    const open = searchParams.get("open") === "true";

    setSelectedGenres(genres);
    setSelectedAreas(areas);
    setSelectedPayments(payments);
    setShowOnlyOpen(open);
    setIsSearchTriggered(true);
  }, [queryString]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <main className="flex-grow flex justify-center pt-8">
        <div className="w-full max-w-[1024px] px-4 min-h-[200px]">
          {isSearchTriggered && (
            <Suspense fallback={<div className="text-center py-10">検索結果を読み込み中...</div>}>
              <SearchResults
                key={queryString}
                selectedGenres={selectedGenres}
                selectedAreas={selectedAreas}
                selectedPayments={selectedPayments}
                showOnlyOpen={showOnlyOpen}
                isSearchTriggered={isSearchTriggered}
                messages={{
                  ...messages.searchResults,
                  genres: messages.genres,
                }}
              />
            </Suspense>
          )}

          <SearchFloatingButton
            messages={messages.searchFilter}
            genres={messages.genres}
            areas={messages.areas}
          />
        </div>
      </main>
    </div>
  );
}