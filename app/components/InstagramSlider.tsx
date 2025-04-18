"use client";

import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  // 初回のみInstagram埋め込みscriptを追加
  useEffect(() => {
    if (!document.getElementById("instagram-embed-script")) {
      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 投稿が変わったら埋め込みを再処理
  useEffect(() => {
    const timer = setTimeout(() => {
      window.instgrm?.Embeds.process();
    }, 500);

    return () => clearTimeout(timer);
  }, [posts]);

  if (posts.length === 0) return null;

  return (
    <div className="w-full px-4 pb-8 relative">
      <p className="text-base mb-2 flex items-center gap-2 font-[#1F1F21]">
        <span className="w-[12px] h-[12px] bg-[#4B5C9E] rounded-[2px] inline-block" />
        Instagram
      </p>

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
              <div
                className="block w-full h-full cursor-pointer"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (onClickPost) await onClickPost(url);
                  } finally {
                    window.open(url, "_blank", "noopener");
                  }
                }}
              >
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={url}
                  data-instgrm-version="14"
                  style={{ width: "100%", height: "100%", margin: 0 }}
                ></blockquote>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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