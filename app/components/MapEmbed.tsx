"use client";

import { useState, useEffect, useRef } from "react";

type MapEmbedProps = {
  src: string;
  title?: string;
};

export default function MapEmbed({ src, title }: MapEmbedProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: "100px",
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div ref={ref} className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
      {isVisible && (
        <iframe
          src={src}
          width="600"
          height="100"
          title={title}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}