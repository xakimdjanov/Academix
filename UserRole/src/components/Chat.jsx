import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiSend, FiPaperclip, FiX, FiChevronLeft, FiMoreVertical } from "react-icons/fi";
import toast from "react-hot-toast";
import { chatService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

// ---- Helpers ----
const safeDate = (d) => (d ? new Date(d) : new Date(0));
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDayLabel = (date) => {
  const d = safeDate(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString();
};

const getEditorIdFromMsg = (m) => m.editorId ?? m.editor_id ?? m.editor?.id ?? null;
const getEditorNameFromMsg = (m) =>
  m.editorName ?? m.editor_name ?? m.editor?.fullname ?? m.editor?.name ?? `Editor #${getEditorIdFromMsg(m) ?? "?"}`;

const getMsgId = (m) => m.id ?? m._id ?? m.message_id ?? null;

const isReadMessage = (m) => {
  if (typeof m.is_read === "boolean") return m.is_read;
  if (typeof m.isRead === "boolean") return m.isRead;
  const s = (m.status ?? m.message_status ?? "").toString().toLowerCase();
  return s === "read" || s === "seen" || s === "viewed";
};

const DoubleTick = ({ read }) => (
  <span className="ml-1 flex items-center">
    <svg width="16" height="11" viewBox="0 0 16 12" fill="none" className={read ? "text-blue-400" : "text-gray-400"}>
      <path
        d="M1.5 6.5L5 10L14.5 0.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {read && (
        <path
          d="M4 6.5L7.5 10L17 0.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="-translate-x-2.5"
        />
      )}
    </svg>
  </span>
);

const Chat = () => {
  const userId = getUserIdFromToken();
  const [allMessages, setAllMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeEditorId, setActiveEditorId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const load = async (isSilent = false) => {
    try {
      const res = await chatService.getUserChatList(userId);
      const list = (res?.data || []).filter((m) => {
        const uid = m.userId ?? m.user_id ?? m.user?.id;
        return String(uid) === String(userId);
      });
      setAllMessages(list);
    } catch (e) {
      if (!isSilent) toast.error("Failed to load chats");
    }
  };

  useEffect(() => {
    if (!userId) return;
    load();
    const interval = setInterval(() => load(true), 4000);
    return () => clearInterval(interval);
  }, [userId]);

  // Mark incoming unread messages as read when thread is opened
  useEffect(() => {
    if (!activeEditorId || !userId) return;

    const unreadIncoming = allMessages.filter((m) => {
      const sameEditor = getEditorIdFromMsg(m) === activeEditorId;
      const incoming = !m.is_from_user; // from editor
      const unread = !isReadMessage(m);
      const hasId = !!getMsgId(m);
      return sameEditor && incoming && unread && hasId;
    });

    if (unreadIncoming.length === 0) return;

    // Optimistic UI update
    setAllMessages((prev) =>
      prev.map((m) => {
        if (getEditorIdFromMsg(m) === activeEditorId && !m.is_from_user) {
          return { ...m, status: "read", is_read: true };
        }
        return m;
      })
    );

    // Update on server
    (async () => {
      try {
        await Promise.all(
          unreadIncoming.map((m) =>
            chatService.updateStatus(getMsgId(m), { status: "read", is_read: true })
          )
        );
      } catch (e) {
        load(true);
      }
    })();
  }, [activeEditorId]);

  const threads = useMemo(() => {
    const sorted = [...allMessages].sort(
      (a, b) => safeDate(a.createdAt).getTime() - safeDate(b.createdAt).getTime()
    );
    const map = new Map();

    sorted.forEach((m) => {
      const id = getEditorIdFromMsg(m);
      if (!id) return;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(m);
    });

    return Array.from(map.entries())
      .map(([editorId, msgs]) => {
        const last = msgs[msgs.length - 1];
        return {
          editorId,
          editorName: getEditorNameFromMsg(last),
          lastMessage: last?.message || (last?.image_url ? "📷 Image" : ""),
          lastAt: last?.createdAt,
          unreadCount: msgs.filter((m) => !m.is_from_user && !isReadMessage(m)).length,
          messages: msgs,
        };
      })
      .sort((a, b) => safeDate(b.lastAt).getTime() - safeDate(a.lastAt).getTime());
  }, [allMessages]);

  const activeThread = useMemo(() => threads.find((t) => t.editorId === activeEditorId), [threads, activeEditorId]);

  const activeWithDates = useMemo(() => {
    if (!activeThread) return [];
    const out = [];
    let prevDate = null;
    activeThread.messages.forEach((m) => {
      const d = safeDate(m.createdAt);
      if (!prevDate || !isSameDay(prevDate, d)) {
        out.push({ type: "date", id: `date-${d.toISOString()}`, label: formatDayLabel(d) });
        prevDate = d;
      }
      out.push({ type: "msg", id: `msg-${getMsgId(m) || Math.random()}`, data: m });
    });
    return out;
  }, [activeThread]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (activeWithDates.length > 0) {
      const timer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeWithDates.length, activeEditorId]);

  const send = async () => {
    if (!activeEditorId || (!text.trim() && !imageFile)) return;

    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("editorId", activeEditorId);
      fd.append("message", text.trim());
      fd.append("is_from_user", "true");
      if (imageFile) fd.append("image_url", imageFile);

      await chatService.send(
        imageFile
          ? fd
          : { userId, editorId: activeEditorId, message: text.trim(), is_from_user: true }
      );

      setText("");
      setImageFile(null);
      setImagePreview("");
      load(true);
    } catch (e) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 md:p-4">
      <div className="flex h-full w-full overflow-hidden border border-gray-100 bg-white shadow-xl md:rounded-3xl">
        {/* SIDEBAR */}
        <div className={`${isSidebarOpen ? "flex" : "hidden"} w-full flex-col border-r border-gray-50 bg-white md:flex md:w-[350px]`}>
          <div className="border-b border-gray-50 p-5">
            <h2 className="text-xl font-bold text-slate-800">Chats</h2>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {threads.map((t) => (
              <div
                key={t.editorId}
                onClick={() => {
                  setActiveEditorId(t.editorId);
                  setIsSidebarOpen(false);
                }}
                className={`flex cursor-pointer items-center gap-3 border-l-4 px-4 py-3.5 transition-colors ${
                  activeEditorId === t.editorId ? "border-blue-600 bg-blue-50/50" : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="relative h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#002147] font-bold text-white shadow-sm flex">
                  {t.editorName?.[0] ?? "E"}
                  {t.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-bold text-white">
                      {t.unreadCount > 99 ? "99+" : t.unreadCount}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="truncate text-[15px] font-bold text-slate-900">{t.editorName}</h3>
                    <span className="text-[10px] text-gray-400">
                      {t.lastAt ? safeDate(t.lastAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-500">{t.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`${!isSidebarOpen ? "flex" : "hidden"} flex-1 flex-col bg-white md:flex`}>
          {activeThread ? (
            <>
              <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-50 bg-white/90 px-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100 md:hidden"
                  >
                    <FiChevronLeft size={22} />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#002147]">
                    {activeThread.editorName?.[0] ?? "E"}
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-800">{activeThread.editorName}</h3>
                </div>
                <FiMoreVertical size={20} className="text-gray-400 cursor-pointer" />
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 md:p-6 scrollbar-hide">
                {activeWithDates.map((item) => {
                  if (item.type === "date") {
                    return (
                      <div key={item.id} className="my-4 flex justify-center">
                        <span className="rounded-lg bg-gray-200/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          {item.label}
                        </span>
                      </div>
                    );
                  }

                  const m = item.data;
                  const isMine = !!m.is_from_user;

                  return (
                    <div key={item.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] px-3.5 py-2 shadow-sm md:max-w-[65%] ${
                          isMine
                            ? "rounded-2xl rounded-tr-none bg-[#002147] text-white"
                            : "rounded-2xl rounded-tl-none border border-slate-100 bg-white text-slate-800"
                        }`}
                      >
                        {m.image_url && (
                          <img
                            src={m.image_url}
                            alt="attachment"
                            className="mb-2 max-h-64 w-full rounded-lg object-cover shadow-sm"
                          />
                        )}

                        <p className="break-words text-[14px] leading-relaxed">{m.message}</p>

                        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                          {safeDate(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {isMine && <DoubleTick read={isReadMessage(m)} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} className="h-1" />
              </div>

              <div className="border-t border-gray-100 bg-white p-4">
                <div className="mx-auto flex max-w-4xl items-end gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50"
                  >
                    <FiPaperclip size={20} />
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />

                  <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-2.5">
                    {imagePreview && (
                      <div className="relative mb-2 inline-block">
                        <img src={imagePreview} className="h-20 w-20 rounded-lg object-cover" alt="preview" />
                        <button
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    )}

                    <textarea
                      rows="1"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    onClick={send}
                    disabled={!text.trim() && !imageFile}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#002147] text-white shadow-md transition-transform active:scale-90 disabled:opacity-50"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
              <FiSend size={40} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;