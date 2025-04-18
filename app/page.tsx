// app/[locale]/page.tsx
import { redirect } from "next/navigation";

export default function RedirectPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/home`);
}