"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 匿名ログイン
  const signInAnonymously = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (error) setError(error.message);
  };

  // メールログイン
  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) setError(error.message);
  };

  // Googleログイン
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow bg-white space-y-4">
      <h2 className="text-xl font-bold mb-4">ログイン</h2>
      <button
        className="w-full py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
        onClick={signInAnonymously}
        disabled={loading}
      >
        匿名でログイン
      </button>
      <form onSubmit={signInWithEmail} className="space-y-2">
        <input
          type="email"
          className="w-full border px-3 py-2 rounded"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          メールでログイン
        </button>
      </form>
      <button
        className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        Googleでログイン
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
