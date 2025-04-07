"use client";

import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type InstagramSliderProps = {
  posts: string[];
};

// 👇ここ追加！！
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default function InstagramSlider({ posts }: InstagramSliderProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [posts]);

  if (posts.length === 0) {
    return null;
  }

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
        simulateTouch={true}  // 追加
        grabCursor={true}      // 追加
        touchStartPreventDefault={false} // 追加！超重要
        modules={[Navigation, Pagination]}
        className="w-full rounded-lg instagram-slider"
      >
        {posts.map((url, idx) => (
          <SwiperSlide key={idx}>
            <div className="w-full aspect-square rounded-lg overflow-hidden">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`${url}`}
                data-instgrm-version="14"
                style={{ width: "100%", height: "100%", margin: 0 }}
              ></blockquote>
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