"use client";

import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// 🔥 props型に onClickPost を追加
type InstagramSliderProps = {
  posts: string[];
  onClickPost?: (url: string) => Promise<void>;
};

// 👇 グローバル型宣言（instagram embed.js 用）
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default function InstagramSlider({ posts, onClickPost }: InstagramSliderProps) {
  // 🔥 初回だけInstagramの埋め込み用scriptを追加
  useEffect(() => {
    if (!document.getElementById("instagram-embed-script")) {
      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 🔥 postsが変わったら再度embedを再実行
  useEffect(() => {
    const timer = setTimeout(() => {
      window.instgrm?.Embeds.process();
    }, 500);

    return () => clearTimeout(timer);
  }, [posts]);

  if (posts.length === 0) return null; // 投稿なければ非表示

  return (
    <div className="w-full px-4 pb-8 relative">
      {/* Instagramセクションタイトル */}
      <p className="text-base mb-2 flex items-center gap-2 font-[#1F1F21]">
        <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
        Instagram
      </p>

      {/* スライダー本体 */}
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        navigation
        loop
        pagination={{ clickable: true }}
        grabCursor
        simulateTouch
        touchStartPreventDefault={false}
        modules={[Navigation, Pagination]}
        className="w-full rounded-lg instagram-slider"
      >
        {posts.map((url, idx) => (
          <SwiperSlide key={idx}>
            <div className="w-full aspect-square rounded-lg overflow-hidden">
              {/* 🔥 クリックでonClickPostを呼ぶ */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async (e) => {
                  e.stopPropagation(); // swiperのタップ干渉防止
                  if (onClickPost) {
                    await onClickPost(url); // ログ記録
                  }
                }}
                className="block w-full h-full"
              >
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={url}
                  data-instgrm-version="14"
                  style={{ width: "100%", height: "100%", margin: 0 }}
                ></blockquote>
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Swiperのボタンスタイル */}
      <style jsx global>{`
        .instagram-slider .swiper-button-prev,
        .instagram-slider .swiper-button-next {
          color: white;
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 9999px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .instagram-slider .swiper-button-prev::after,
        .instagram-slider .swiper-button-next::after {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}