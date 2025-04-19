import HomePage from "@/components/HomePage";
import en from "@/locales/en.json";
import type { Messages } from "@/types/messages";

export const metadata = {
  title: en.meta.title,
  description: en.meta.description,
};

export default function Page() {
  return <HomePage locale="en" messages={en as Messages} />;
}