import Link from "next/link";



export default function About() {
  return (

    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Link href="/" passHref>
        <h1 className="text-3xl font-bold cursor-pointer hover:text-blue-400 transition">オトナビ</h1>
      </Link>
      <h1 className="text-4xl font-bold">オトナビとは？</h1>
      <p className="mt-4 text-gray-300">
        オトナビは、クラブ・ジャズバー・ナイトスポットの検索・発見をサポートするサービスです。
      </p>
    </div>
  );
}