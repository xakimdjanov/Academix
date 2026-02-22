import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import { chatService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const Chat = ({ editorId = 2 }) => {
  const userId = getUserIdFromToken();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await chatService.getUserChatList(userId);
      setMessages(res?.data || []);
    } catch (e) {
      toast.error("Chat yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ✅ newest pastda bo‘lishi uchun sort (createdAt bo‘yicha)
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  // ✅ yangi message kelsa pastga scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages.length]);

  const send = async () => {
    if (!text.trim()) return;

    try {
      const payload = {
        userId,
        editorId,
        message: text.trim(),
        image_url: null,
        is_from_user: true,
      };

      await chatService.send(payload);
      setText("");
      load();
    } catch (e) {
      toast.error("Yuborishda xatolik");
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-4xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Chat</div>
          <div className="text-xs text-gray-500">User ↔ Editor</div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-600">Online</span>
        </div>
      </div>

      {/* MESSAGES (scroll shu yerda) */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-modern bg-gradient-to-b from-gray-50 to-white px-4 py-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {loading && sortedMessages.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              Loading...
            </div>
          ) : null}

          {!loading && sortedMessages.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              Hozircha xabar yo‘q. Birinchi bo‘lib yozing 🙂
            </div>
          ) : null}

          {sortedMessages.map((m) => {
            const mine = m.is_from_user === true;

            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[78%]">
                  {/* bubble */}
                  <div
                    className={[
                      "rounded-3xl px-4 py-3 text-sm shadow-sm",
                      mine
                        ? "bg-gray-900 text-white rounded-br-lg"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-lg",
                    ].join(" ")}
                  >
                    {m.message ? (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {m.message}
                      </div>
                    ) : null}

                    {m.image_url ? (
                      <img
                        src={m.image_url}
                        alt="attachment"
                        className="mt-2 max-h-60 w-full rounded-2xl object-cover"
                      />
                    ) : null}

                    <div
                      className={[
                        "mt-2 text-[10px]",
                        mine ? "text-gray-300" : "text-gray-400",
                      ].join(" ")}
                    >
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-gray-300">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              placeholder="Write a message..."
            />
          </div>

          <button
            onClick={send}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm transition hover:bg-black active:scale-95 disabled:opacity-60"
            title="Send"
            disabled={!text.trim()}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;