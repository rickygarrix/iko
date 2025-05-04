"use client";

const GENRES = [
  "jazz",
  "house",
  "techno",
  "EDM",
  "hipHop",
  "pop",
];

type SearchFiltersProps = {
  showOnlyOpen: boolean;
  selectedGenres: string[];
  onToggleOpen: () => void;
  onToggleGenre: (genre: string) => void;
};

export default function SearchFilters({
  showOnlyOpen,
  selectedGenres,
  onToggleOpen,
  onToggleGenre,
}: SearchFiltersProps) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minWidth: "160px",   // ✅ 幅を拡張
        maxHeight: "70vh",
        overflowY: "auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)", // optional: 影を柔らかく
      }}
    >
      {GENRES.map((genre) => (
        <label key={genre}>
          <input
            type="checkbox"
            checked={selectedGenres.includes(genre)}
            onChange={() => onToggleGenre(genre)}
          />{" "}
          {genre}
        </label>
      ))}
    </div>
  );
}