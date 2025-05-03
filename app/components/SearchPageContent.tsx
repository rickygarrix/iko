"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";
import SearchResults from "@/components/SearchResults";
import { supabase } from "@/lib/supabase";
import { checkIfOpen } from "@/lib/utils";
import useSWR from "swr";
import type { Messages } from "@/types/messages";

export default function SearchPageContent({
  messages,
}: {
  messages: Messages;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getLocaleFromPathname = (pathname: string): string => {
    const segments = pathname.split("/");
    return segments[1] || "ja";
  };

  const locale = getLocaleFromPathname(pathname);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);

  const fetchPreviewCount = async (
    selectedGenres: string[],
    selectedAreas: string[],
    selectedPayments: string[],
    showOnlyOpen: boolean
  ): Promise<number> => {
    let query = supabase.from("stores").select("*").eq("is_published", true);

    if (selectedGenres.length > 0) {
      query = query.filter("genre_ids", "cs", JSON.stringify(selectedGenres)); // ✅ overlapsじゃなくて filter("cs", JSON.stringify())
    }
    if (selectedAreas.length > 0) {
      query = query.in("area_id", selectedAreas);
    }
    if (selectedPayments.length > 0) {
      query = query.overlaps("payment_method_ids", selectedPayments);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error("🔥 Supabase Error:", error?.message);
      return 0;
    }

    const filtered = showOnlyOpen
      ? data.filter((store) => checkIfOpen(store.opening_hours).isOpen)
      : data;

    return filtered.length;
  };
  const { data: previewCount } = useSWR(
    ["previewCount", selectedGenres, selectedAreas, selectedPayments, showOnlyOpen],
    ([, selectedGenres, selectedAreas, selectedPayments, showOnlyOpen]) =>
      fetchPreviewCount(selectedGenres, selectedAreas, selectedPayments, showOnlyOpen),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const genresParam = searchParams.get("genre");
    const areasParam = searchParams.get("area");
    const paymentsParam = searchParams.get("payment");
    const openParam = searchParams.get("open");

    const genres =
      genresParam?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterGenres") || "[]");
    const areas =
      areasParam?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterAreas") || "[]");
    const payments =
      paymentsParam?.split(",") ??
      JSON.parse(sessionStorage.getItem("filterPayments") || "[]");
    const open =
      openParam !== null
        ? openParam === "true"
        : JSON.parse(sessionStorage.getItem("filterOpen") || "false");

    // 👇 ここに追記
    console.log("初期読み込み", { genres, areas, payments, open });

    setSelectedGenres(genres);
    setSelectedAreas(areas);
    setSelectedPayments(payments);
    setShowOnlyOpen(open);

    setIsSearchTriggered(true);
  }, []);

  const handleSearch = () => {
    sessionStorage.setItem("filterGenres", JSON.stringify(selectedGenres));
    sessionStorage.setItem("filterAreas", JSON.stringify(selectedAreas));
    sessionStorage.setItem("filterPayments", JSON.stringify(selectedPayments));
    sessionStorage.setItem("filterOpen", JSON.stringify(showOnlyOpen));

    setIsSearchTriggered(false);
    setTimeout(() => {
      setIsSearchTriggered(true);
    }, 100);

    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.set("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.set("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.set("open", "true");

    router.push(`/${locale}/search?${params.toString()}`);
  };

  return (
    <div className="bg-white mt-8 text-gray-800 pb-0 flex justify-center">
      <div className="w-full ">
        <div id="search-filter">
          <SearchFilter
            selectedGenres={selectedGenres}
            setSelectedGenres={setSelectedGenres}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
            selectedPayments={selectedPayments}
            setSelectedPayments={setSelectedPayments}
            showOnlyOpen={showOnlyOpen}
            setShowOnlyOpen={setShowOnlyOpen}
            handleSearch={handleSearch}
            previewCount={previewCount ?? 0}
            messages={{
              ...messages.searchFilter,
              genres: messages.genres,
              payments: messages.payments,
              areas: messages.areas,
            }}
          />
        </div>

        {isSearchTriggered && (
          <Suspense fallback={<div className="text-center py-10">検索結果を読み込み中...</div>}>
            <SearchResults
              selectedGenres={selectedGenres}
              selectedAreas={selectedAreas}
              selectedPayments={selectedPayments}
              showOnlyOpen={showOnlyOpen}
              isSearchTriggered={isSearchTriggered}
              messages={{
                ...messages.searchResults,
                genres: messages.genres, // ✅ genresを追加
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}