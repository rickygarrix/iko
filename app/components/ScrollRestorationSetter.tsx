// components/ScrollRestorationSetter.tsx
"use client";

import { useLayoutEffect } from "react";

export default function ScrollRestorationSetter() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const html = document.documentElement;

    if (html.dataset.scrollRestoring === "true") {
      // requestAnimationFrameを使って描画前に強制的にスクロールしてからopacity復元
      requestAnimationFrame(() => {
        html.style.opacity = "1";
        html.removeAttribute("data-scroll-restoring");
      });
    } else {
      // 念のため fallback
      html.style.opacity = "1";
    }
  }, []);

  return null;
}