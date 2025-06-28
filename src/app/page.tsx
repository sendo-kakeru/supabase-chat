import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export default async function Home() {
  // サーバー側で認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl font-bold">Supabase チャットアプリ</h1>
      {/* チャットUIをここに追加予定 */}
    </main>
  );
}
