import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  FiSend,
  FiPaperclip,
  FiX,
  FiChevronLeft,
  FiMoreVertical,
  FiSearch,
  FiTrash2,
  FiCheckSquare,
  FiSquare,
  FiCopy,
  FiFileText,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
  FiArrowLeft,
} from "react-icons/fi";
import { HiOutlinePhotograph } from "react-icons/hi";
import toast from "react-hot-toast";

import { chatService, ReviewAssignments } from "../services/api";
import { getEditorIdFromToken } from "../utils/getEditorIdFromToken";

// ------------ Helpers ------------
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
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (date) => {
  return safeDate(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUserId = (m) => m?.userId ?? m?.user_id ?? m?.user?.id ?? null;
const getEditorId = (m) => m?.editorId ?? m?.editor_id ?? m?.editor?.id ?? null;

const isReadMessage = (m) => {
  const s = m?.status?.toLowerCase?.();
  return s === "read" || s === "seen";
};

const DoubleTick = ({ read }) => (
  <span className="ml-1 inline-flex items-center">
    <svg width="16" height="10" viewBox="0 0 20 12" fill="none"
      className={read ? "text-blue-300" : "text-gray-400"}>
      <path d="M1.5 6.5L5 10L13.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {read && (
        <path d="M7 6.5L10.5 10L19 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      )}
    </svg>
  </span>
);

// ------------ Article List Modal Component (Mobile Optimized) ------------
const ArticleListModal = ({ articles, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-blue-100 animate-fadeIn">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText size={20} />
              <h4 className="font-semibold text-base">Articles ({articles.length})</h4>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors active:bg-white/30"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        
        {/* Article List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {articles.map((article, index) => (
            <div
              key={article.articleId}
              className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 active:bg-blue-100 transition-colors rounded-xl m-1"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <FiFileText className="text-blue-500" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: #{article.articleId}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

// ------------ MAIN COMPONENT ------------
const EditorChat = () => {
  // ============ 1. ALL useState HOOKS ============
  const editorId = getEditorIdFromToken();

  const [assignments, setAssignments] = useState([]);
  const [userChats, setUserChats] = useState({});
  const [userArticles, setUserArticles] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState({});

  const [activeUserId, setActiveUserId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default false on mobile
  const [searchTerm, setSearchTerm] = useState("");

  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedUserArticles, setSelectedUserArticles] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Scroll position tracking
  const [userScrollPosition, setUserScrollPosition] = useState({});
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // ============ 2. ALL useRef HOOKS ============
  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  // ============ 3. RESIZE HANDLER ============
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============ 4. FUNCTIONS ============
  const loadAssignments = async () => {
    try {
      const res = await ReviewAssignments.getAll();
      const all = res.data || [];
      
      const assigned = all.filter(
        (a) => Number(a.editor_id) === Number(editorId)
      );
      
      setAssignments(assigned);
      
      const articlesByUser = {};
      
      assigned.forEach(a => {
        const userId = a.article?.user_id;
        
        if (userId) {
          if (!articlesByUser[userId]) {
            articlesByUser[userId] = [];
          }
          articlesByUser[userId].push({
            articleId: a.article_id,
            title: a.article?.title || "Untitled Article",
            assigned_at: a.assigned_at,
          });
        }
      });
      
      setUserArticles(articlesByUser);
      
      const initialLoading = {};
      Object.keys(articlesByUser).forEach(userId => {
        initialLoading[userId] = false;
      });
      setLoadingChat(initialLoading);
      
    } catch (err) {
      toast.error("Failed to load assignments");
    }
  };

  const loadUserChat = async (userId) => {
    if (!userId || !editorId) return;

    setLoadingChat(prev => ({ ...prev, [userId]: true }));
    
    try {
      const res = await chatService.getChat(userId, editorId);
      const chatMessages = res.data || [];
      
      // Save current scroll position before updating
      if (messagesContainerRef.current && activeUserId === userId) {
        setUserScrollPosition(prev => ({
          ...prev,
          [userId]: messagesContainerRef.current.scrollTop
        }));
      }
      
      setUserChats(prev => ({
        ...prev,
        [userId]: chatMessages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      }));
      
    } catch (error) {
      if (error.response?.status === 404) {
        setUserChats(prev => ({ ...prev, [userId]: [] }));
      }
    } finally {
      setLoadingChat(prev => ({ ...prev, [userId]: false }));
    }
  };

  const loadAllUserChats = async () => {
    if (!editorId || Object.keys(userArticles).length === 0) return;

    setLoading(true);
    
    try {
      const userIds = Object.keys(userArticles);
      const promises = userIds.map(async (userId) => {
        try {
          const res = await chatService.getChat(userId, editorId);
          return { userId, messages: res.data || [] };
        } catch {
          return { userId, messages: [] };
        }
      });

      const results = await Promise.all(promises);
      
      const chatsMap = {};
      results.forEach(r => {
        chatsMap[r.userId] = r.messages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      
      setUserChats(chatsMap);
      
    } catch (error) {
      console.error("Error loading all user chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await chatService.delete(messageId);
      
      if (activeUserId) {
        setUserChats(prev => ({
          ...prev,
          [activeUserId]: (prev[activeUserId] || []).filter(m => m.id !== messageId)
        }));
      }
      
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedMessages).map(id => 
        chatService.delete(id)
      );
      
      await Promise.all(deletePromises);
      
      if (activeUserId) {
        setUserChats(prev => ({
          ...prev,
          [activeUserId]: (prev[activeUserId] || []).filter(m => !selectedMessages.has(m.id))
        }));
      }
      
      setSelectedMessages(new Set());
      setSelectionMode(false);
      setShowDeleteConfirm(false);
      
      toast.success(`${selectedMessages.size} messages deleted`);
    } catch (error) {
      toast.error("Failed to delete messages");
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied");
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const selectAllMessages = () => {
    if (activeUserId) {
      const allMessageIds = (userChats[activeUserId] || [])
        .filter(m => !m.temp)
        .map(m => m.id);
      setSelectedMessages(new Set(allMessageIds));
    }
  };

  const clearSelection = () => {
    setSelectedMessages(new Set());
    setSelectionMode(false);
  };

  const send = async () => {
    if (!activeUserId) {
      toast.error("Please select a user first");
      return;
    }
    
    if (!text.trim() && !imageFile) return;

    const messageText = text.trim();
    const currentImageFile = imageFile;
    const currentImagePreview = imagePreview;
    
    setText("");
    setImageFile(null);
    setImagePreview("");

    // Auto resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const tempMessage = {
      id: `temp-${Date.now()}`,
      userId: activeUserId,
      editorId: editorId,
      message: messageText,
      is_from_user: false,
      image_url: currentImagePreview || null,
      createdAt: new Date().toISOString(),
      status: "sent",
      temp: true
    };

    setUserChats(prev => ({
      ...prev,
      [activeUserId]: [...(prev[activeUserId] || []), tempMessage].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }));

    // Only auto-scroll if user is at bottom or just sent a message
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isAtBottom);
    }

    try {
      const fd = new FormData();
      fd.append("userId", activeUserId);
      fd.append("editorId", editorId);
      fd.append("message", messageText);
      fd.append("is_from_user", "false");
      if (currentImageFile) fd.append("image_url", currentImageFile);

      await chatService.send(fd);
      await loadUserChat(activeUserId);
      
    } catch (error) {
      setUserChats(prev => ({
        ...prev,
        [activeUserId]: (prev[activeUserId] || []).filter(m => !m.temp)
      }));
      
      setText(messageText);
      setImageFile(currentImageFile);
      setImagePreview(currentImagePreview);
      
      toast.error("Failed to send message");
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await chatService.updateStatus(messageId, { status: "read" });
      
      if (activeUserId) {
        setUserChats(prev => ({
          ...prev,
          [activeUserId]: (prev[activeUserId] || []).map(m => 
            m.id === messageId ? { ...m, status: "read" } : m
          )
        }));
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current && activeUserId) {
      const { scrollTop } = messagesContainerRef.current;
      setUserScrollPosition(prev => ({
        ...prev,
        [activeUserId]: scrollTop
      }));
      
      // Check if user is at bottom
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isAtBottom);
    }
  }, [activeUserId]);

  // Open article modal
  const openArticlesModal = (userId) => {
    const articles = userArticles[userId] || [];
    setSelectedUserArticles(articles);
    setShowArticleModal(true);
  };

  // Auto resize textarea
  const handleTextareaChange = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // ============ 5. ALL useMemo HOOKS ============
  const threads = useMemo(() => {
    return Object.entries(userArticles).map(([userId, articles]) => {
      const msgs = userChats[userId] || [];
      
      const sortedArticles = [...articles].sort((a, b) => 
        new Date(b.assigned_at) - new Date(a.assigned_at)
      );
      
      const last = msgs[msgs.length - 1];
      const unreadCount = msgs.filter(m => 
        m.is_from_user === true && !isReadMessage(m)
      ).length;

      return {
        userId: userId,
        primaryTitle: sortedArticles[0]?.title || "Untitled Article",
        allArticles: sortedArticles,
        articlesCount: articles.length,
        lastMessage: last?.message || (last?.image_url ? "📷 Image" : "No messages yet"),
        lastAt: last?.createdAt || articles[0]?.assigned_at,
        unreadCount: unreadCount,
        loading: loadingChat[userId] || false
      };
    });
  }, [userArticles, userChats, loadingChat]);

  const filteredThreads = useMemo(() => {
    if (!searchTerm.trim()) return threads;
    
    const term = searchTerm.toLowerCase();
    return threads.filter(t => 
      t.primaryTitle?.toLowerCase().includes(term) ||
      t.allArticles.some(a => a.title?.toLowerCase().includes(term))
    );
  }, [threads, searchTerm]);

  const activeThread = threads.find(
    (t) => t.userId === activeUserId
  );

  const activeMessages = useMemo(() => {
    if (!activeUserId) return [];
    return userChats[activeUserId] || [];
  }, [activeUserId, userChats]);

  const groupedMsgs = useMemo(() => {
    if (!activeMessages.length) return [];
    const out = [];
    let prev = null;

    activeMessages.forEach((m) => {
      const d = safeDate(m.createdAt);

      if (!prev || !isSameDay(prev, d)) {
        out.push({ type: "date", label: formatDayLabel(d) });
        prev = d;
      }

      out.push({ type: "msg", data: m });
    });

    return out;
  }, [activeMessages]);

  // ============ 6. ALL useEffect HOOKS ============
  useEffect(() => {
    if (!editorId) return;
    loadAssignments();
  }, [editorId]);

  useEffect(() => {
    if (Object.keys(userArticles).length > 0 && editorId) {
      loadAllUserChats();
    }
  }, [userArticles, editorId]);

  useEffect(() => {
    if (activeUserId && editorId && !userChats[activeUserId]) {
      loadUserChat(activeUserId);
    }
  }, [activeUserId, editorId]);

  // Restore scroll position after messages update
  useEffect(() => {
    if (messagesContainerRef.current && activeUserId) {
      const savedPosition = userScrollPosition[activeUserId];
      if (savedPosition !== undefined && !shouldAutoScroll) {
        messagesContainerRef.current.scrollTop = savedPosition;
      } else if (shouldAutoScroll && bottomRef.current && !selectionMode) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [groupedMsgs, activeUserId, shouldAutoScroll, selectionMode]);

  // Auto-refresh without forcing scroll
  useEffect(() => {
    if (!activeUserId || !editorId) return;
    
    const timer = setInterval(() => {
      loadUserChat(activeUserId);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [activeUserId, editorId]);

  // Close sidebar when selecting a user on mobile
  useEffect(() => {
    if (isMobile && activeUserId) {
      setSidebarOpen(false);
    }
  }, [activeUserId, isMobile]);

  // ============ 7. RETURN JSX ============
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 md:p-4">
      <div className="flex h-full w-full bg-white md:rounded-3xl overflow-hidden border-0 md:border border-blue-100 shadow-2xl">
        
        {/* ---- SIDEBAR - ONLY ARTICLE TITLES (Mobile Optimized) ---- */}
        <div 
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0
            fixed md:relative
            w-[85%] md:w-[380px] 
            flex-col 
            border-r border-blue-100
            bg-white
            z-20 
            h-full
            transition-transform duration-300 ease-in-out
            shadow-2xl md:shadow-none
          `}
        >
          {/* Header */}
          <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700 sticky top-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl md:text-2xl font-bold text-white">Articles</h2>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors active:bg-white/30"
                >
                  <FiX size={20} className="text-white" />
                </button>
              )}
            </div>
            <p className="text-sm text-blue-100">
              {filteredThreads.length} {filteredThreads.length === 1 ? 'conversation' : 'conversations'}
            </p>
            
            <div className="mt-3 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" size={18} />
              <input
                type="text"
                placeholder="Search by article title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-blue-400/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white text-sm"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-blue-50 pb-20">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4 text-blue-300">📭</div>
                <p className="text-gray-700 font-medium">No articles found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchTerm ? 'Try a different search term' : 'No articles assigned to you'}
                </p>
              </div>
            ) : (
              filteredThreads.map((t) => (
                <div
                  key={t.userId}
                  onClick={() => {
                    setActiveUserId(t.userId);
                    if (isMobile) setSidebarOpen(false);
                    setSelectionMode(false);
                    setSelectedMessages(new Set());
                    setShouldAutoScroll(true);
                  }}
                  className={`
                    p-4 cursor-pointer 
                    transition-all duration-200
                    hover:bg-blue-50 active:bg-blue-100
                    border-l-4 
                    ${t.userId === activeUserId 
                      ? "border-blue-600 bg-blue-50" 
                      : "border-transparent hover:border-blue-200"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        <FiFileText size={20} />
                      </div>
                      {t.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white">
                          {t.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate text-sm md:text-base">
                          {t.primaryTitle}
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1 ml-2 flex-shrink-0">
                          <FiClock size={10} />
                          {formatTime(t.lastAt)}
                        </span>
                      </div>
                      
                      {t.articlesCount > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openArticlesModal(t.userId);
                          }}
                          className="mt-1 inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 active:bg-blue-300 transition-colors"
                        >
                          <FiFileText size={10} />
                          <span>+{t.articlesCount - 1}</span>
                        </button>
                      )}
                      
                      <p className={`text-xs sm:text-sm truncate mt-2 ${t.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                        {t.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ---- CHAT WINDOW (Mobile Optimized) ---- */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-50 to-white relative">
          {!activeThread ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="text-center">
                <div className="text-6xl md:text-7xl mb-4 text-blue-300">💬</div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
                  {filteredThreads.length === 0 ? 'No articles yet' : 'Select an article'}
                </h3>
                <p className="text-sm md:text-base text-gray-500 max-w-md">
                  {filteredThreads.length === 0 
                    ? 'No articles have been assigned to you yet' 
                    : 'Choose an article from the sidebar to start messaging'}
                </p>
                {filteredThreads.length > 0 && isMobile && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-lg"
                  >
                    View Articles
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header - Mobile Optimized */}
              <div className="bg-white border-b border-blue-100 px-3 md:px-6 py-2 md:py-3 shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    {isMobile && (
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-blue-50 active:bg-blue-100 rounded-full text-blue-600 flex-shrink-0"
                      >
                        <FiMenu size={22} />
                      </button>
                    )}

                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                      <FiFileText size={16} className="md:hidden" />
                      <FiFileText size={20} className="hidden md:block" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm md:text-lg truncate">
                        {activeThread.primaryTitle}
                      </h3>
                      {activeThread.articlesCount > 1 && (
                        <button
                          onClick={() => openArticlesModal(activeThread.userId)}
                          className="text-xs text-blue-600 hover:text-blue-700 active:text-blue-800 mt-0.5 flex items-center gap-1"
                        >
                          <FiFileText size={10} />
                          <span className="truncate">+{activeThread.articlesCount - 1} more</span>
                          <FiChevronDown size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 md:gap-2">
                    {!selectionMode ? (
                      <button
                        onClick={() => setSelectionMode(true)}
                        className="p-2 hover:bg-blue-50 active:bg-blue-100 rounded-full text-blue-600"
                        title="Select messages"
                      >
                        <FiCheckSquare size={18} className="md:hidden" />
                        <FiCheckSquare size={20} className="hidden md:block" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={selectAllMessages}
                          className="p-2 hover:bg-blue-50 active:bg-blue-100 rounded-full text-blue-600"
                          title="Select all"
                        >
                          <FiCheckSquare size={18} className="md:hidden" />
                          <FiCheckSquare size={20} className="hidden md:block" />
                        </button>
                        <button
                          onClick={clearSelection}
                          className="p-2 hover:bg-blue-50 active:bg-blue-100 rounded-full text-blue-600"
                          title="Cancel"
                        >
                          <FiX size={18} className="md:hidden" />
                          <FiX size={20} className="hidden md:block" />
                        </button>
                        {selectedMessages.size > 0 && (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 hover:bg-red-50 active:bg-red-100 rounded-full text-red-500"
                            title="Delete selected"
                          >
                            <FiTrash2 size={18} className="md:hidden" />
                            <FiTrash2 size={20} className="hidden md:block" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area - Mobile Optimized */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4"
              >
                {loadingChat[activeUserId] && groupedMsgs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">Loading messages...</p>
                    </div>
                  </div>
                ) : groupedMsgs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl md:text-5xl mb-3 text-blue-300">💭</div>
                      <p className="text-gray-700 font-medium text-sm md:text-base">No messages yet</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-2">
                        Send the first message
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {groupedMsgs.map((item, i) => (
                      <React.Fragment key={i}>
                        {item.type === "date" ? (
                          <div className="flex justify-center sticky top-2 z-10">
                            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm bg-opacity-90">
                              {item.label}
                            </span>
                          </div>
                        ) : (
                          <MessageBubble 
                            key={item.data.id || i} 
                            msg={item.data}
                            isSelected={selectedMessages.has(item.data.id)}
                            selectionMode={selectionMode}
                            onSelect={() => toggleMessageSelection(item.data.id)}
                            onDelete={() => deleteMessage(item.data.id)}
                            onCopy={() => copyMessage(item.data.message)}
                            onVisible={markAsRead}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Selection Mode Indicator - Mobile Optimized */}
              {selectionMode && selectedMessages.size > 0 && (
                <div className="bg-blue-600 text-white px-4 py-2 md:py-3 flex items-center justify-between sticky bottom-0 z-10 shadow-lg">
                  <span className="text-xs md:text-sm">
                    {selectedMessages.size} {selectedMessages.size === 1 ? 'message' : 'messages'} selected
                  </span>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs md:text-sm bg-red-500 hover:bg-red-600 active:bg-red-700 px-3 py-1.5 rounded-full font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* Input Area - Mobile Optimized */}
              <div className="bg-white border-t border-blue-100 p-2 md:p-4 sticky bottom-0">
                {imagePreview && (
                  <div className="mb-2 md:mb-3 relative inline-block">
                    <img 
                      src={imagePreview} 
                      className="h-16 w-16 md:h-24 md:w-24 rounded-lg object-cover border-2 border-blue-200" 
                      alt="Preview"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 active:bg-red-700 shadow-lg"
                    >
                      <FiX size={12} className="md:hidden" />
                      <FiX size={14} className="hidden md:block" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 md:gap-3">
                  <input
                    type="file"
                    ref={fileRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="p-2.5 md:p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <HiOutlinePhotograph size={20} className="md:hidden" />
                    <FiPaperclip size={22} className="hidden md:block" />
                  </button>

                  <div className="flex-1 bg-blue-50 rounded-2xl px-3 md:px-4 py-2 md:py-3">
                    <textarea
                      ref={textareaRef}
                      rows="1"
                      value={text}
                      onChange={handleTextareaChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full bg-transparent outline-none resize-none max-h-32 text-sm md:text-base text-gray-700 placeholder-gray-400"
                      style={{ minHeight: '20px', maxHeight: '120px' }}
                    />
                  </div>

                  <button
                    onClick={send}
                    disabled={!text.trim() && !imageFile}
                    className={`
                      p-2.5 md:p-3 rounded-full transition-all flex-shrink-0
                      ${!text.trim() && !imageFile
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:shadow-lg"
                      }
                    `}
                  >
                    <FiSend size={18} className="md:hidden" />
                    <FiSend size={20} className="hidden md:block" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Article Modal */}
      {showArticleModal && (
        <ArticleListModal
          articles={selectedUserArticles}
          isOpen={showArticleModal}
          onClose={() => setShowArticleModal(false)}
        />
      )}

      {/* Delete Confirmation Modal - Mobile Optimized */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-2xl p-5 md:p-6 z-50 shadow-xl border border-blue-100 animate-fadeIn">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Delete Messages</h3>
            <p className="text-sm md:text-base text-gray-600 mb-5 md:mb-6">
              Are you sure you want to delete {selectedMessages.size} {selectedMessages.size === 1 ? 'message' : 'messages'}? This action cannot be undone.
            </p>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 md:py-2 px-4 border border-blue-200 rounded-xl text-sm md:text-base text-gray-700 hover:bg-blue-50 active:bg-blue-100"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelectedMessages}
                className="flex-1 py-2.5 md:py-2 px-4 bg-red-600 text-white rounded-xl text-sm md:text-base hover:bg-red-700 active:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ------------ MESSAGE BUBBLE COMPONENT (Mobile Optimized) ------------
const MessageBubble = ({ msg, isSelected, selectionMode, onSelect, onDelete, onCopy, onVisible }) => {
  const isMine = msg.is_from_user === false;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);

  useEffect(() => {
    if (!isMine && msg.status !== 'read' && onVisible && msg.id && !msg.temp) {
      const timer = setTimeout(() => {
        onVisible(msg.id);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isMine, msg.id, msg.status, onVisible]);

  // Long press for mobile
  const handleTouchStart = () => {
    if (!msg.temp && !selectionMode) {
      const timer = setTimeout(() => {
        setShowActions(true);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (!msg.temp && !selectionMode) {
      setShowActions(true);
    }
  };

  return (
    <div 
      className={`flex ${isMine ? "justify-end" : "justify-start"} relative group px-2 md:px-0`}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {selectionMode && !msg.temp && (
        <button
          onClick={onSelect}
          className={`absolute ${isMine ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 z-10 p-2`}
        >
          {isSelected ? (
            <FiCheckSquare className="text-blue-600" size={20} />
          ) : (
            <FiSquare className="text-gray-400" size={20} />
          )}
        </button>
      )}

      <div
        className={`
          max-w-[85%] md:max-w-[75%] px-3 md:px-4 py-2 md:py-2.5 rounded-2xl shadow-sm
          transition-all duration-200
          ${msg.temp ? 'opacity-70' : ''}
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          ${
            isMine
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none"
              : "bg-white border border-blue-100 rounded-tl-none"
          }
        `}
      >
        {msg.image_url && (
          <div className="relative mb-1.5 md:mb-2">
            {!isImageLoaded && (
              <div className="h-24 w-24 md:h-32 md:w-32 bg-blue-50 rounded-lg animate-pulse"></div>
            )}
            <img 
              src={msg.image_url} 
              className={`
                max-h-40 md:max-h-60 rounded-lg max-w-full object-cover cursor-pointer
                transition-opacity duration-300
                ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              alt="Attachment"
              onLoad={() => setIsImageLoaded(true)}
              onClick={() => window.open(msg.image_url, '_blank')}
            />
          </div>
        )}

        {msg.message && (
          <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
            {msg.message}
          </p>
        )}

        <div className={`
          text-[10px] md:text-xs mt-1.5 flex items-center justify-end gap-1
          ${isMine ? "text-blue-200" : "text-gray-400"}
        `}>
          <span>{formatTime(msg.createdAt)}</span>
          {isMine && <DoubleTick read={isReadMessage(msg)} />}
          {msg.temp && <span className="ml-1 text-xs">⏳</span>}
        </div>
      </div>

      {showActions && !msg.temp && (
        <>
          <div className="absolute top-0 right-0 mt-8 bg-white rounded-xl shadow-xl border border-blue-100 z-30 py-1 min-w-[140px] md:min-w-[150px] animate-fadeIn">
            <button
              onClick={() => {
                onCopy();
                setShowActions(false);
              }}
              className="w-full px-4 py-3 md:py-2 text-left text-sm hover:bg-blue-50 active:bg-blue-100 flex items-center gap-2 text-gray-700"
            >
              <FiCopy size={14} className="text-blue-600" /> Copy
            </button>
            <button
              onClick={() => {
                onDelete();
                setShowActions(false);
              }}
              className="w-full px-4 py-3 md:py-2 text-left text-sm hover:bg-red-50 active:bg-red-100 flex items-center gap-2 text-red-600"
            >
              <FiTrash2 size={14} /> Delete
            </button>
          </div>
          <div 
            className="fixed inset-0 z-20"
            onClick={() => setShowActions(false)}
          />
        </>
      )}
    </div>
  );
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`;
document.head.appendChild(style);

export default EditorChat;