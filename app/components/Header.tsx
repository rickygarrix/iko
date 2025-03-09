"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <div className="flex space-x-6">
        <Link href="/" passHref>
        <h1 className="text-xl font-bold cursor-pointer hover:text-blue-400 transition">オトナビ</h1>
        </Link>
        <Link href="/about" passHref>
          <p className="cursor-pointer hover:text-blue-400 transition">オトナビとは？</p>
        </Link>
      </div>
    </footer>
  );
}