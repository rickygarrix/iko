"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchFilter from "@/components/SearchFilter";
import SearchResults from "@/components/SearchResults";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState<boolean>(false);

  useEffect(() => {
    const genres = searchParams.get("genre")?.split(",") || [];
    const areas = searchParams.get("area")?.split(",") || [];
    const payments = searchParams.get("payment")?.split(",") || [];
    const open = searchParams.get("open") === "true";

    setSelectedGenres(genres);
    setSelectedAreas(areas);
    setSelectedPayments(payments);
    setShowOnlyOpen(open);

    if (searchParams.toString() !== "") {
      setIsSearchTriggered(true);
    }
  }, [searchParams]);

  const handleSearch = () => {
    setIsSearchTriggered(false);
    setTimeout(() => setIsSearchTriggered(true), 100);

    const params = new URLSearchParams();
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
    if (selectedAreas.length > 0) params.set("area", selectedAreas.join(","));
    if (selectedPayments.length > 0) params.set("payment", selectedPayments.join(","));
    if (showOnlyOpen) params.set("open", "true");

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] text-gray-800 px-4 py-6 space-y-10">
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
        />
      </div>

      {isSearchTriggered && (
        <SearchResults
          selectedGenres={selectedGenres}
          selectedAreas={selectedAreas}
          selectedPayments={selectedPayments}
          showOnlyOpen={showOnlyOpen}
          isSearchTriggered={isSearchTriggered}
        />
      )}
    </div>
  );
}