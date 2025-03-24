"use client";

type SearchButtonProps = {
  onSearch: () => void;
  visible: boolean;
};

export default function SearchButton({ onSearch, visible }: SearchButtonProps) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#FFA500",
        padding: "10px",
        borderRadius: "10px",
        zIndex: 1000,
      }}
    >
      <button onClick={onSearch}>🔍 このエリアで検索する</button>
    </div>
  );
}