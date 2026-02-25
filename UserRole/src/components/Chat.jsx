import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSend,
  FiPaperclip,
  FiX,
  FiChevronLeft,
  FiMoreVertical,
  FiTrash2,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { chatService, articleService, ReviewAssignments } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

// ---- Helpers ----
const safeDate = (d) => (d ? new Date(d) : new Date(0));
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDayLabel = (date) => {
  const d = safeDate(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString();
};

const getMsgId = (m) => m?.id ?? m?._id ?? m?.message_id ?? null;
const getEditorIdFromMsg = (m) => m?.editorId ?? m?.editor_id ?? m?.editor?.id ?? null;

const isReadMessage = (m) => {
  if (typeof m?.is_read === "boolean") return m.is_read;
  if (typeof m?.isRead === "boolean") return m.isRead;
  const s = (m?.status ?? m?.message_status ?? "").toString().toLowerCase();
  return s === "read" || s === "seen" || s === "viewed";
};

// ID helpers (aralashmasin!)
const getArticleId = (a) => a?.id ?? a?._id ?? a?.article_id ?? null;
const getAssignArticleId = (r) => r?.article_id ?? r?.article?.id ?? null;
const getAssignEditorId = (r) => r?.editor_id ?? r?.editor?.id ?? null;

const DoubleTick = ({ read }) => (
  <span className="ml-1 inline-flex items-center">
    <svg
      width="18"
      height="12"
      viewBox="0 0 20 12"
      fill="none"
      className={read ? "text-blue-400" : "text-gray-400"}
      aria-hidden="true"
    >
      {/* first tick */}
      <path
        d="M1.5 6.5L5 10L13.5 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* second tick (only when read) */}
      {read && (
        <path
          d="M7 6.5L10.5 10L19 1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  </span>
);

const Chat = () => {
  const userId = getUserIdFromToken();

  // messages
  const [allMessages, setAllMessages] = useState([]);

  // articles + assignments
  const [articles, setArticles] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // chat UI
  const [text, setText] = useState("");
  const [activeArticleId, setActiveArticleId] = useState(null);
  const [activeEditorId, setActiveEditorId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // ✅ Select / bulk delete
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const loadAll = async (isSilent = false) => {
    try {
      if (!userId) return;

      const [chatRes, artRes, revRes] = await Promise.all([
        chatService.getUserChatList(userId),
        articleService.getAll(),
        ReviewAssignments.getAll(),
      ]);

      // 1) chats (faqat userning o'zi)
      const chats = (chatRes?.data || []).filter((m) => {
        const uid = m?.userId ?? m?.user_id ?? m?.user?.id;
        return String(uid) === String(userId);
      });
      setAllMessages(chats);

      // 2) articles
      const arts = artRes?.data?.data ?? artRes?.data?.articles ?? artRes?.data ?? [];
      const artsArr = Array.isArray(arts) ? arts : [];
      setArticles(artsArr);

      // 3) assignments (faqat userga tegishli article + editor biriktirilgan)
      const revs = revRes?.data?.data ?? revRes?.data?.result ?? revRes?.data ?? [];
      const revsArr = Array.isArray(revs) ? revs : [];

      const myAssigned = revsArr.filter((r) => {
        const aId = getAssignArticleId(r);
        const eId = getAssignEditorId(r);
        if (!aId || !eId) return false;

        const art = artsArr.find((a) => String(getArticleId(a)) === String(aId));
        return String(art?.user_id) === String(userId);
      });

      // bitta article uchun eng oxirgi assignmentni qoldiramiz
      const byArticle = new Map();
      myAssigned.forEach((r) => {
        const aId = String(getAssignArticleId(r));
        const prev = byArticle.get(aId);
        if (!prev) {
          byArticle.set(aId, r);
          return;
        }
        const tPrev = safeDate(prev?.createdAt ?? prev?.created_at ?? prev?.updatedAt ?? prev?.updated_at).getTime();
        const tCur = safeDate(r?.createdAt ?? r?.created_at ?? r?.updatedAt ?? r?.updated_at).getTime();
        if (tCur >= tPrev) byArticle.set(aId, r);
      });

      setAssignments(Array.from(byArticle.values()));
    } catch (e) {
      console.error(e);
      if (!isSilent) toast.error("Failed to load chats");
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadAll();
    const interval = setInterval(() => loadAll(true), 4000);
    return () => clearInterval(interval);
  }, [userId]);

  // sidebar: article list
  const articleThreads = useMemo(() => {
    const getTitle = (articleId) => {
      const a = articles.find((x) => String(getArticleId(x)) === String(articleId));
      return a?.title || a?.name || `Article #${articleId}`;
    };

    return assignments
      .map((r) => {
        const articleId = getAssignArticleId(r);
        const editorId = getAssignEditorId(r);

        // shu editor bilan bo'lgan xabarlar (chat bo'lmasligi ham mumkin)
        const msgs = allMessages
          .filter((m) => String(getEditorIdFromMsg(m)) === String(editorId))
          .sort((a, b) => safeDate(a.createdAt).getTime() - safeDate(b.createdAt).getTime());

        const last = msgs[msgs.length - 1];

        return {
          articleId,
          editorId,
          title: getTitle(articleId),
          lastMessage: last?.message || (last?.image_url ? "📷 Image" : ""),
          lastAt: last?.createdAt || r?.createdAt || r?.created_at,
          unreadCount: msgs.filter((m) => !m.is_from_user && !isReadMessage(m)).length,
          messages: msgs,
        };
      })
      .sort((a, b) => safeDate(b.lastAt).getTime() - safeDate(a.lastAt).getTime());
  }, [assignments, articles, allMessages]);

  const activeThread = useMemo(
    () => articleThreads.find((t) => String(t.articleId) === String(activeArticleId)),
    [articleThreads, activeArticleId]
  );

  // active thread messages with date separators
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

  // ✅ Thread o'zgarsa select tozalanadi
  useEffect(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [activeArticleId, activeEditorId]);

  // auto-scroll
  useEffect(() => {
    if (activeWithDates.length > 0) {
      const timer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeWithDates.length, activeArticleId]);

  // Mark incoming unread messages as read when thread is opened
  useEffect(() => {
    if (!activeEditorId || !userId) return;

    const unreadIncoming = allMessages.filter((m) => {
      const sameEditor = String(getEditorIdFromMsg(m)) === String(activeEditorId);
      const incoming = !m.is_from_user; // from editor
      const unread = !isReadMessage(m);
      const hasId = !!getMsgId(m);
      return sameEditor && incoming && unread && hasId;
    });

    if (unreadIncoming.length === 0) return;

    // optimistic
    setAllMessages((prev) =>
      prev.map((m) => {
        if (String(getEditorIdFromMsg(m)) === String(activeEditorId) && !m.is_from_user) {
          return { ...m, status: "read", is_read: true };
        }
        return m;
      })
    );

    (async () => {
      try {
        await Promise.all(
          unreadIncoming.map((m) => chatService.updateStatus(getMsgId(m), { status: "read", is_read: true }))
        );
      } catch (e) {
        loadAll(true);
      }
    })();
  }, [activeEditorId, allMessages, userId]);

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
        imageFile ? fd : { userId, editorId: activeEditorId, message: text.trim(), is_from_user: true }
      );

      setText("");
      setImageFile(null);
      setImagePreview("");
      loadAll(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message");
    }
  };

  // ✅ Single delete (faqat mening xabarim)
  const deleteMessage = async (m) => {
    const id = getMsgId(m);
    if (!id) return;

    const ok = window.confirm("Xabarni o‘chirasizmi?");
    if (!ok) return;

    setAllMessages((prev) => prev.filter((x) => String(getMsgId(x)) !== String(id)));

    try {
      await chatService.delete(id);
      toast.success("Xabar o‘chirildi");
    } catch (e) {
      console.error(e);
      toast.error("Xabarni o‘chirib bo‘lmadi");
      loadAll(true);
    }
  };

  // ✅ Select toggle (faqat mening xabarlarim)
  const toggleSelect = (m) => {
    const id = getMsgId(m);
    if (!id) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ✅ Bulk delete
  const deleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const ok = window.confirm(`${ids.length} ta xabar o‘chirasizmi?`);
    if (!ok) return;

    // optimistic
    setAllMessages((prev) => prev.filter((m) => !selectedIds.has(getMsgId(m))));
    setSelectedIds(new Set());
    setSelectMode(false);

    try {
      await Promise.all(ids.map((id) => chatService.delete(id)));
      toast.success("Tanlangan xabarlar o‘chirildi");
    } catch (e) {
      console.error(e);
      toast.error("Ba’zi xabarlar o‘chirilmadi");
      loadAll(true);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 md:p-4">
      <div className="flex h-full w-full overflow-hidden border border-gray-100 bg-white shadow-xl md:rounded-3xl">
        {/* SIDEBAR */}
        <div
          className={`${
            isSidebarOpen ? "flex" : "hidden"
          } w-full flex-col border-r border-gray-50 bg-white md:flex md:w-[350px]`}
        >
          <div className="border-b border-gray-50 p-5">
            <h2 className="text-xl font-bold text-slate-800">My Assigned Articles</h2>
            <p className="mt-1 text-xs text-gray-400">Only articles assigned to an editor are shown</p>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {articleThreads.map((t) => (
              <div
                key={String(t.articleId)}
                onClick={() => {
                  setActiveArticleId(t.articleId);
                  setActiveEditorId(t.editorId);
                  setIsSidebarOpen(false);
                }}
                className={`flex cursor-pointer items-center gap-3 border-l-4 px-4 py-3.5 transition-colors ${
                  String(activeArticleId) === String(t.articleId)
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="relative h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#002147] font-bold text-white shadow-sm flex">
                  {t.title?.[0] ?? "A"}
                  {t.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-bold text-white">
                      {t.unreadCount > 99 ? "99+" : t.unreadCount}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="truncate text-[15px] font-bold text-slate-900">{t.title}</h3>
                    <span className="text-[10px] text-gray-400">
                      {t.lastAt ? safeDate(t.lastAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-500">{t.lastMessage || "No messages yet"}</p>
                </div>
              </div>
            ))}

            {articleThreads.length === 0 && (
              <div className="p-6 text-sm text-gray-400">Sizda hozircha editor biriktirilgan maqola yo‘q.</div>
            )}
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
                    {activeThread.title?.[0] ?? "A"}
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-800">{activeThread.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* ✅ Select Mode toggle */}
                  <button
                    onClick={() => {
                      setSelectMode((v) => !v);
                      setSelectedIds(new Set());
                    }}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                      selectMode ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="Select messages"
                  >
                    {selectMode ? "Selecting" : "Select"}
                  </button>

                  <FiMoreVertical size={20} className="text-gray-400 cursor-pointer" />
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 md:p-6 scrollbar-hide">
                {activeWithDates.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <p className="text-sm font-medium">No messages yet. Write to your editor ✍️</p>
                  </div>
                ) : (
                  <>
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
                      const id = getMsgId(m);
                      const checked = id ? selectedIds.has(id) : false;

                      return (
                        <div key={item.id} className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                          {/* ✅ checkbox (faqat mening xabarim) */}
                          {selectMode && isMine && (
                            <button
                              onClick={() => toggleSelect(m)}
                              className="mt-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                              title="Select"
                            >
                              {checked ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                            </button>
                          )}

                          <div
                            className={`relative max-w-[80%] px-3.5 py-2 shadow-sm md:max-w-[65%] ${
                              isMine
                                ? "rounded-2xl rounded-tr-none bg-[#002147] text-white"
                                : "rounded-2xl rounded-tl-none border border-slate-100 bg-white text-slate-800"
                            }`}
                          >
                            {/* ✅ single delete (faqat mening xabarim va selectMode OFF) */}
                            {!selectMode && isMine && (
                              <button
                                onClick={() => deleteMessage(m)}
                                className="absolute -left-10 top-2 rounded-full p-2 text-gray-400 hover:bg-white"
                                title="Delete message"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            )}

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
                  </>
                )}
              </div>

              {/* ✅ Bulk actions bar */}
              {selectMode && (
                <div className="border-t border-gray-100 bg-white px-4 py-3">
                  <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
                    <div className="text-sm text-gray-600">
                      Selected: <span className="font-bold">{selectedIds.size}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedIds(new Set());
                          setSelectMode(false);
                        }}
                        className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={deleteSelected}
                        disabled={selectedIds.size === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <FiTrash2 />
                        Delete selected
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* input panel (selectMode bo'lsa yashiramiz) */}
              {!selectMode && (
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
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
              <FiSend size={40} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Select an article to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;