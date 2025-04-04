type SkeletonProps = {
  width: number | string; // ← numberだけじゃなく、stringも許可する
  height: number;
};

export default function Skeleton({ width, height }: SkeletonProps) {
  return (
    <div
      style={{ width, height }}
      className="bg-gray-300 animate-pulse rounded-md"
    />
  );
}