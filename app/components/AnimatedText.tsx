"use client";

import { useState, useEffect } from "react";

const messages = [
  "今日はどこに行こうかな？",
  "もしかしたら新たな出会いがあるかも？",
  "はぁー今日も疲れた、音楽聴きたい"
];

export default function AnimatedText() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setFade(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center text-lg font-semibold text-white my-4">
      <p className={`transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
        {messages[index]}
      </p>
    </div>
  );
}