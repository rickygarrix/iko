import Image from "next/image";
import Navbar from "@/components/Navbar"; // ✅ 修正後の正しいパス

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <h1 className="text-4xl font-bold">オトナビ</h1>
    </div>
  );
}

