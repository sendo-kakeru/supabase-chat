"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Message {
  id: string;
  user_id: string;
  username: string | null;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ユーザー取得
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // メッセージ取得 & リアルタイム購読
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((msgs) => {
            const exists = msgs.some(
              (m) => m.id === (payload.new as Message).id
            );
            if (exists) return msgs;
            return [...msgs, payload.new as Message];
          });
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // メッセージ送信
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    await supabase.from("messages").insert({
      user_id: user.id,
      username: user.email || "匿名",
      content: input,
    });
    setInput("");
    // 直後に再取得（リアルタイムが遅延する場合の対策）
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 border rounded-lg shadow bg-white flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-bold mr-2">{msg.username || "匿名"}</span>
            <span>{msg.content}</span>
            <span className="text-xs text-gray-400 ml-2">
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!input.trim()}
        >
          送信
        </button>
      </form>
    </div>
  );
}
