"use client";

interface SearchButtonProps {
  showSearchButton: boolean;
  onSearch: () => void;
}

export default function SearchButton({ showSearchButton, onSearch }: SearchButtonProps) {
  if (!showSearchButton) return null;

  return (
    <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)" }}>
      <button onClick={onSearch} className="bg-orange-500 text-white p-2 rounded shadow-lg">
        🔍 ここで検索する
      </button>
    </div>
  );
}