"use client";

const GENRES = ["Jazz", "House", "Techno", "EDM"];

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
        position: "absolute",
        top: 20,
        left: 20,
        backgroundColor: "#FFA500",
        padding: "10px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
      }}
    >
      <label>
        <input type="checkbox" checked={showOnlyOpen} onChange={onToggleOpen} /> 営業中
      </label>
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