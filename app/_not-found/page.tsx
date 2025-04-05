// app/_not-found/page.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEFCF6]">
      <h1 className="text-2xl font-bold mb-4">ページが見つかりません</h1>
      <p className="text-gray-600">お探しのページは存在しないか、移動されました。</p>
    </div>
  );
}