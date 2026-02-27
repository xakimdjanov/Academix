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
  FiFileText,
  FiCopy,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { chatService, articleService, ReviewAssignments } from "../services/api";
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

const formatTime = (date) => {
  return safeDate(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMsgId = (m) => m?.id ?? m?._id ?? m?.message_id ?? null;
const getEditorIdFromMsg = (m) => m?.editorId ?? m?.editor_id ?? m?.editor?.id ?? null;
const getUserIdFromMsg = (m) => m?.userId ?? m?.user_id ?? m?.user?.id ?? null;

const isReadMessage = (m) => {
  if (typeof m?.is_read === "boolean") return m.is_read;
  if (typeof m?.isRead === "boolean") return m.isRead;
  const s = (m?.status ?? m?.message_status ?? "").toString().toLowerCase();
  return s === "read" || s === "seen" || s === "viewed";
};

// ID helpers
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
      <path
        d="M1.5 6.5L5 10L13.5 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

// Article List Modal
const ArticleListModal = ({ articles, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200">
        <div className="p-4 bg-[#002147] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiFileText size={20} />
            <h4 className="font-semibold">Articles ({articles.length})</h4>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <FiX size={20} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {articles.map((article, index) => (
            <div key={article.articleId} className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
              <p className="text-sm font-medium text-gray-800">{article.title}</p>
              <p className="text-xs text-gray-500 mt-1">ID: #{article.articleId}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Message Context Menu
const MessageContextMenu = ({ x, y, onClose, onCopy, onDelete, isMine }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-1 z-50 min-w-[160px]"
      style={{ top: y, left: x }}
    >
      <button
        onClick={() => {
          onCopy();
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
      >
        <FiCopy size={14} className="text-gray-500" />
        Copy Message
      </button>
      {isMine && (
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
        >
          <FiTrash2 size={14} />
          Delete Message
        </button>
      )}
    </div>
  );
};

const Chat = () => {
  const userId = getUserIdFromToken();

  // messages
  const [allMessages, setAllMessages] = useState([]);

  // articles + assignments
  const [articles, setArticles] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // chat UI
  const [text, setText] = useState("");
  const [activeEditorId, setActiveEditorId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Article modal
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);

  // Context menu
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, message: null });

  // Select / bulk delete
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

      // 1) chats
      const chats = (chatRes?.data || []).filter((m) => {
        const uid = getUserIdFromMsg(m);
        return String(uid) === String(userId);
      });
      setAllMessages(chats);

      // 2) articles
      const arts = artRes?.data?.data ?? artRes?.data?.articles ?? artRes?.data ?? [];
      const artsArr = Array.isArray(arts) ? arts : [];
      setArticles(artsArr);

      // 3) assignments
      const revs = revRes?.data?.data ?? revRes?.data?.result ?? revRes?.data ?? [];
      const revsArr = Array.isArray(revs) ? revs : [];

      // Filter assignments for current user
      const myAssigned = revsArr.filter((r) => {
        const aId = getAssignArticleId(r);
        const eId = getAssignEditorId(r);
        if (!aId || !eId) return false;

        const art = artsArr.find((a) => String(getArticleId(a)) === String(aId));
        return String(art?.user_id) === String(userId);
      });

      console.log("Raw assignments:", myAssigned); // DEBUG: qanday ma'lumotlar kelyapti

      // FIX: Group by EDITOR with unique editorId
      const editorGroups = new Map();
      
      myAssigned.forEach((r) => {
        const editorId = String(getAssignEditorId(r));
        const articleId = String(getAssignArticleId(r));
        const article = artsArr.find((a) => String(getArticleId(a)) === articleId);
        
        console.log(`Processing: editorId=${editorId}, articleId=${articleId}, article=`, article); // DEBUG
        
        if (!editorGroups.has(editorId)) {
          editorGroups.set(editorId, {
            editorId,
            articles: [],
            latestDate: r?.createdAt || r?.created_at
          });
        }
        
        const editorData = editorGroups.get(editorId);
        
        // Check if this article is already in the list
        const articleExists = editorData.articles.some(a => String(a.articleId) === articleId);
        
        if (!articleExists && article) {
          editorData.articles.push({
            articleId,
            title: article?.title || article?.name || `Article #${articleId}`,
            assigned_at: r?.createdAt || r?.created_at
          });
        }
        
        const rDate = safeDate(r?.createdAt || r?.created_at).getTime();
        if (rDate > safeDate(editorData.latestDate).getTime()) {
          editorData.latestDate = r?.createdAt || r?.created_at;
        }
      });

      // Convert to array and filter out editors with no articles
      const editorArray = Array.from(editorGroups.values())
        .filter(group => group.articles.length > 0);
      
      console.log("Editor groups:", editorArray); // DEBUG: gruppalangan ma'lumotlar
      setAssignments(editorArray);

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

  // sidebar: editor threads (grouped by editor)
  const editorThreads = useMemo(() => {
    console.log("Calculating threads from assignments:", assignments); // DEBUG
    
    return assignments
      .map((group) => {
        const editorId = group.editorId;
        const articlesList = group.articles || [];

        // Get messages for this specific editor only
        const msgs = allMessages
          .filter((m) => String(getEditorIdFromMsg(m)) === String(editorId))
          .sort((a, b) => safeDate(a.createdAt).getTime() - safeDate(b.createdAt).getTime());

        const last = msgs[msgs.length - 1];
        
        // Get all article titles for this editor
        const articleTitles = articlesList.map(a => a.title).join(", ");
        const mainTitle = articlesList[0]?.title || "Unknown Article";
        const hasMultiple = articlesList.length > 1;

        return {
          editorId,
          articles: articlesList,
          mainTitle,
          articleTitles,
          hasMultiple,
          articlesCount: articlesList.length,
          lastMessage: last?.message || (last?.image_url ? "📷 Image" : "No messages yet"),
          lastAt: last?.createdAt || group.latestDate,
          unreadCount: msgs.filter((m) => !m.is_from_user && !isReadMessage(m)).length,
          messages: msgs,
        };
      })
      .sort((a, b) => safeDate(b.lastAt).getTime() - safeDate(a.lastAt).getTime());
  }, [assignments, allMessages]);

  // Filter threads by search
  const filteredThreads = useMemo(() => {
    if (!searchTerm.trim()) return editorThreads;
    
    const term = searchTerm.toLowerCase();
    return editorThreads.filter(t => 
      t.articleTitles?.toLowerCase().includes(term) ||
      t.mainTitle?.toLowerCase().includes(term) ||
      t.articles.some(a => a.title?.toLowerCase().includes(term))
    );
  }, [editorThreads, searchTerm]);

  console.log("Filtered threads:", filteredThreads); // DEBUG: natijaviy threadlar

  const activeThread = useMemo(
    () => editorThreads.find((t) => String(t.editorId) === String(activeEditorId)),
    [editorThreads, activeEditorId]
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

  useEffect(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [activeEditorId]);

  useEffect(() => {
    if (activeWithDates.length > 0 && !selectMode && !contextMenu.show) {
      const timer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeWithDates.length, activeEditorId, selectMode, contextMenu.show]);

  // Mark messages as read
  useEffect(() => {
    if (!activeEditorId || !userId) return;

    const unreadIncoming = allMessages.filter((m) => {
      const sameEditor = String(getEditorIdFromMsg(m)) === String(activeEditorId);
      const incoming = !m.is_from_user;
      const unread = !isReadMessage(m);
      const hasId = !!getMsgId(m);
      return sameEditor && incoming && unread && hasId;
    });

    if (unreadIncoming.length === 0) return;

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

    const messageText = text.trim();
    const currentImageFile = imageFile;
    const currentImagePreview = imagePreview;

    setText("");
    setImageFile(null);
    setImagePreview("");

    const tempMessage = {
      id: `temp-${Date.now()}`,
      userId: userId,
      editorId: activeEditorId,
      message: messageText,
      is_from_user: true,
      image_url: currentImagePreview || null,
      createdAt: new Date().toISOString(),
      status: "sent",
      temp: true
    };

    setAllMessages(prev => [...prev, tempMessage]);

    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("editorId", activeEditorId);
      fd.append("message", messageText);
      fd.append("is_from_user", "true");
      if (currentImageFile) fd.append("image_url", currentImageFile);

      await chatService.send(
        currentImageFile ? fd : { userId, editorId: activeEditorId, message: messageText, is_from_user: "true" }
      );

      loadAll(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message");
      setAllMessages(prev => prev.filter(m => !m.temp));
      setText(messageText);
      setImageFile(currentImageFile);
      setImagePreview(currentImagePreview);
    }
  };

  // Copy message
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard");
  };

  // Delete message
  const deleteMessage = async (m) => {
    if (!m.is_from_user) {
      toast.error("You can only delete your own messages");
      return;
    }

    const id = getMsgId(m);
    if (!id || m.temp) return;

    setAllMessages((prev) => prev.filter((x) => String(getMsgId(x)) !== String(id)));

    try {
      await chatService.delete(id);
      toast.success("Message deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete message");
      loadAll(true);
    }
  };

  // Handle context menu
  const handleContextMenu = (e, m) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      message: m
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, message: null });
  };

  // Select toggle
  const toggleSelect = (m) => {
    if (!m.is_from_user) {
      toast.error("You can only select your own messages");
      return;
    }

    const id = getMsgId(m);
    if (!id || m.temp) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk delete
  const deleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setAllMessages((prev) => prev.filter((m) => !selectedIds.has(getMsgId(m))));
    setSelectedIds(new Set());
    setSelectMode(false);

    try {
      await Promise.all(ids.map((id) => chatService.delete(id)));
      toast.success(`${ids.length} messages deleted`);
    } catch (e) {
      console.error(e);
      toast.error("Some messages could not be deleted");
      loadAll(true);
    }
  };

  // Select all
  const selectAllMyMessages = () => {
    if (!activeThread) return;
    
    const myMessageIds = activeThread.messages
      .filter(m => m.is_from_user && !m.temp)
      .map(m => getMsgId(m))
      .filter(id => id);
    
    setSelectedIds(new Set(myMessageIds));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

            {articleThreads.length === 0 && (
              <div className="p-6 text-sm text-gray-400">You don't have any assigned articles yet.</div>
            )}
          </div>
        </div>

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50 md:p-4">
        <div className="flex h-full w-full overflow-hidden border border-gray-200 bg-white shadow-xl md:rounded-3xl">
          
          {/* SIDEBAR */}
          <div
            className={`${
              isSidebarOpen ? "flex" : "hidden"
            } w-full flex-col border-r border-gray-200 bg-white md:flex md:w-[380px]`}
          >
            <div className="border-b border-gray-200 p-5">
              <h2 className="text-xl font-bold text-[#002147]">My Editors</h2>
              <p className="mt-1 text-xs text-gray-500">Chat with your editors</p>
              
              {/* Search */}
              <div className="mt-4 relative">
                <input
                  type="text"
                  placeholder="Search by article title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4 text-gray-300">📭</div>
                  <p className="text-gray-600 font-medium">No conversations found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {searchTerm ? 'Try a different search term' : 'Articles with editors will appear here'}
                  </p>
                </div>
              ) : (
                filteredThreads.map((t, index) => (
                  <div
                    key={String(t.editorId) + index} // Unique key
                    onClick={() => {
                      setActiveEditorId(t.editorId);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex cursor-pointer items-center gap-3 border-l-4 px-4 py-4 transition-colors ${
                      String(activeEditorId) === String(t.editorId)
                        ? "border-[#002147] bg-[#002147]/5"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative h-14 w-14 flex-shrink-0">
                      <div className="h-14 w-14 rounded-2xl bg-[#002147] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                        {t.hasMultiple ? t.articlesCount : (t.mainTitle?.[0] || "A")}
                      </div>
                      {t.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white">
                          {t.unreadCount > 9 ? '9+' : t.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <h3 className="truncate text-base font-bold text-gray-800">
                          {t.hasMultiple ? `${t.articlesCount} Articles` : t.mainTitle}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {t.lastAt ? formatTime(t.lastAt) : ""}
                        </span>
                      </div>
                      
                      {t.hasMultiple && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openArticlesModal(t.articles);
                          }}
                          className="mt-1 inline-flex items-center gap-1 text-xs bg-gray-100 text-[#002147] px-2 py-0.5 rounded-full hover:bg-gray-200"
                        >
                          <FiFileText size={12} />
                          <span>View {t.articlesCount} articles</span>
                          <FiChevronDown size={12} />
                        </button>
                      )}
                      
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {t.lastMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className={`${!isSidebarOpen ? "flex" : "hidden"} flex-1 flex-col bg-white md:flex`}>
            {activeThread ? (
              <>
                {/* Header */}
                <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="rounded-full p-2 text-[#002147] hover:bg-gray-100 md:hidden"
                    >
                      <FiChevronLeft size={22} />
                    </button>
                    
                    <div className="h-10 w-10 rounded-xl bg-[#002147] flex items-center justify-center text-white font-bold shadow-sm">
                      {activeThread.hasMultiple ? activeThread.articlesCount : (activeThread.mainTitle?.[0] || "A")}
                    </div>
                    
                    <div>
                      <h3 className="text-base font-bold text-gray-800">
                        {activeThread.hasMultiple ? `${activeThread.articlesCount} Articles` : activeThread.mainTitle}
                      </h3>
                      {activeThread.hasMultiple && (
                        <button
                          onClick={() => openArticlesModal(activeThread.articles)}
                          className="text-xs text-[#002147] hover:underline flex items-center gap-1"
                        >
                          <FiFileText size={12} />
                          View all articles
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectMode((v) => !v);
                        setSelectedIds(new Set());
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                        selectMode 
                          ? "bg-[#002147] text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {selectMode ? "Cancel" : "Select"}
                    </button>

                    {selectMode && (
                      <button
                        onClick={selectAllMyMessages}
                        className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                      >
                        Select All
                      </button>
                    )}

                    <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                      <FiMoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div 
                  className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 md:p-6"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {activeWithDates.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4 text-gray-300">💬</div>
                        <p className="text-gray-600 font-medium">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-2">Send a message to your editor</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {activeWithDates.map((item) => {
                        if (item.type === "date") {
                          return (
                            <div key={item.id} className="my-4 flex justify-center">
                              <span className="rounded-full bg-gray-200/80 px-4 py-1.5 text-xs font-semibold text-gray-600">
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
                            {selectMode && isMine && !m.temp && (
                              <button
                                onClick={() => toggleSelect(m)}
                                className="mt-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                              >
                                {checked ? (
                                  <FiCheckSquare className="text-[#002147]" size={18} />
                                ) : (
                                  <FiSquare className="text-gray-400" size={18} />
                                )}
                              </button>
                            )}

                            <div
                              onContextMenu={(e) => !selectMode && !m.temp && handleContextMenu(e, m)}
                              className={`relative max-w-[80%] px-3.5 py-2 shadow-sm cursor-context-menu ${
                                isMine
                                  ? "rounded-2xl rounded-tr-none bg-[#002147] text-white"
                                  : "rounded-2xl rounded-tl-none border border-gray-200 bg-white text-gray-800"
                              }`}
                            >
                              {m.image_url && (
                                <img
                                  src={m.image_url}
                                  alt="attachment"
                                  className="mb-2 max-h-64 w-full rounded-lg object-cover shadow-sm cursor-pointer hover:opacity-90 transition"
                                  onClick={() => window.open(m.image_url, '_blank')}
                                />
                              )}

                              <p className="break-words text-sm leading-relaxed">{m.message}</p>

                              <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                                isMine ? "text-blue-200" : "text-gray-400"
                              }`}>
                                {formatTime(m.createdAt)}
                                {isMine && <DoubleTick read={isReadMessage(m)} />}
                                {m.temp && <span className="ml-1 text-xs">⏳</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} className="h-1" />
                    </>
                  )}
                </div>

                {/* Bulk actions bar */}
                {selectMode && (
                  <div className="border-t border-gray-200 bg-white px-4 py-3">
                    <div className="mx-auto flex max-w-4xl items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Selected: <span className="font-bold text-[#002147]">{selectedIds.size}</span>
                        </span>
                        {selectedIds.size > 0 && (
                          <span className="text-xs text-gray-400">
                            (only your messages)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedIds(new Set());
                            setSelectMode(false);
                          }}
                          className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={deleteSelected}
                          disabled={selectedIds.size === 0}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <FiTrash2 size={16} />
                          Delete ({selectedIds.size})
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input panel */}
                {!selectMode && (
                  <div className="border-t border-gray-200 bg-white p-4">
                    <div className="mx-auto flex max-w-4xl items-end gap-2">
                      <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                      
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50"
                      >
                        <FiPaperclip size={22} />
                      </button>

                      <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-3">
                        {imagePreview && (
                          <div className="relative mb-2 inline-block">
                            <img 
                              src={imagePreview} 
                              className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200" 
                              alt="preview" 
                            />
                            <button
                              onClick={clearImage}
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600 transition"
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
                          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                          style={{ minHeight: '24px' }}
                        />
                      </div>

                      <button
                        onClick={send}
                        disabled={!text.trim() && !imageFile}
                        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                          !text.trim() && !imageFile
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-[#002147] text-white shadow-md hover:shadow-lg active:scale-95"
                        }`}
                      >
                        <FiSend size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-7xl mb-4 text-gray-300">💬</div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">No editor selected</p>
                  <p className="text-gray-500 max-w-md">
                    Choose an editor from the sidebar to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Modal */}
      {showArticleModal && (
        <ArticleListModal
          articles={selectedArticles}
          isOpen={showArticleModal}
          onClose={() => setShowArticleModal(false)}
        />
      )}

      {/* Context Menu */}
      {contextMenu.show && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onCopy={() => copyMessage(contextMenu.message.message)}
          onDelete={() => deleteMessage(contextMenu.message)}
          isMine={contextMenu.message?.is_from_user}
        />
      )}
    </>
  );
};

export default Chat;