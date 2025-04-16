// components/StoreDetail/StoreWebsiteButton.tsx
import type { Store } from "./StoreDetail";

type Props = {
  href: string;
  label: string;
  onClick: () => void;
};

export default function StoreWebsiteButton({ href, label, onClick }: Props) {
  return (
    <div className="px-4 pb-4">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="block w-full max-w-[358px] h-[48px] bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center mx-auto"
      >
        {label}
      </a>
    </div>
  );
}