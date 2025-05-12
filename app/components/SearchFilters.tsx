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
  handleSearch: () => void;
  onToggleGenre: (genre: string) => void;
};

type Props = {
  showOnlyOpen: boolean;
  selectedGenres: string[];
  onToggleOpen: () => void; // ←追加
  onToggleGenre: (genre: string) => void; // ←追加
  handleSearch: () => void;
  previewCount: number;
  messages: {
    title: string;
    search: string;
    reset: string;
    items: string;
    open: string;
    open_all: string;
    open_now: string;
    genre: string;
    area: string;
    genres: Record<string, string>;
    payments: Record<string, string>;
    areas: Record<string, string>;
  };
};

export default function SearchFilters(props: Props) {
  const {
    showOnlyOpen,
    selectedGenres,
    onToggleOpen,
    onToggleGenre,
    handleSearch,
    previewCount,
    messages,
  } = props;
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
        <label key={genre} className="text-black font-medium flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedGenres.includes(genre)}
            onChange={() => onToggleGenre(genre)}
          />
          {genre}
        </label>
      ))}
    </div>
  );
}