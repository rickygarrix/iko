declare global {
  interface Window {
    gtag: (...args: unknown[]) => void; // any → unknown にする
  }
}

type GAEventParams = Record<string, string | number | boolean | undefined>;

export const sendGAEvent = (eventName: string, params?: GAEventParams) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  }
};