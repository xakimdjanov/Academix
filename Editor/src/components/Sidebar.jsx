import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiFileText,
  FiUser,
  FiMessageCircle,
  FiLogOut,
  FiX,
  FiAlertTriangle,
  FiShield,
} from "react-icons/fi";
import { chatService, ReviewAssignments } from "../services/api";
import { getEditorIdFromToken } from "../utils/getEditorIdFromToken";

const editorLinks = [
  { name: "Asosiy panel", path: "/dashboard", icon: <FiGrid /> },
  { name: "Biriktirilgan maqolalar", path: "/assigned", icon: <FiFileText /> },
  { name: "Profil", path: "/profile", icon: <FiUser /> },
  { name: "Xabarlar", path: "/chat", icon: <FiMessageCircle /> },
];

const EditorSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState({}); // Foydalanuvchi ma'lumotlari state-da
  
  const editorId = getEditorIdFromToken();

  // Ma'lumotlarni yuklash funksiyasi
  const updateUserData = () => {
    const editor = JSON.parse(localStorage.getItem("admin") || localStorage.getItem("user") || "{}");
    setUserData(editor);
  };

  useEffect(() => {
    updateUserData();
    
    // Boshqa sahifada (Profil) rasm o'zgarganda sidebar ham yangilanishi uchun
    window.addEventListener("storage", updateUserData);
    return () => window.removeEventListener("storage", updateUserData);
  }, []);

  const displayName = userData?.fullname || "Editor Name";
  const profileImg = userData?.profile_img;
  const role = "JOURNAL EDITOR";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Unread messages count (Sizning kodingiz o'zgarishsiz qoldi)
  const loadUnreadCount = async () => {
    if (!editorId) return;
    try {
      const assignmentsRes = await ReviewAssignments.getAll();
      const allAssignments = assignmentsRes.data || [];
      const editorAssignments = allAssignments.filter(a => Number(a.editor_id) === Number(editorId));
      let totalUnread = 0;
      for (const assignment of editorAssignments) {
        const userId = assignment.article?.user_id;
        if (userId) {
          try {
            const chatRes = await chatService.getChat(userId, editorId);
            const messages = chatRes.data || [];
            totalUnread += messages.filter(m => m.is_from_user === true && (m.status !== 'read' && m.status !== 'seen')).length;
          } catch (e) {}
        }
      }
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [editorId]);

  const doLogout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#0f172a] border-r border-blue-900/20 flex flex-col transition-all duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-0 lg:w-72`}>
        
        {/* Profile Header with Image */}
        <div className="p-8 border-b border-white/5 relative bg-gradient-to-b from-blue-600/5 to-transparent">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-blue-600 text-white text-xl font-black shadow-xl shadow-blue-600/30 group-hover:scale-105 transition-all duration-300 overflow-hidden border-2 border-blue-500/20">
                {profileImg ? (
                  <img 
                    src={profileImg} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = ""; setUserData({...userData, profile_img: null})}} // Rasmda xato bo'lsa harflarga qaytadi
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-[#0f172a] rounded-full"></div>
            </div>
            
            <div className="text-center overflow-hidden w-full">
              <h2 className="font-bold text-white truncate text-lg tracking-tight">
                {displayName}
              </h2>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <FiShield className="text-blue-500" size={12} />
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
                  {role}
                </p>
              </div>
            </div>
          </div>

          <button onClick={toggleSidebar} className="lg:hidden absolute top-4 right-4 p-2 text-white/30 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          {editorLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative
                ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1" : "text-slate-400 hover:bg-white/5 hover:text-white"}
              `}
            >
              <span className="text-xl relative">
                {link.icon}
                {link.path === "/chat" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-2 border-t border-white/5 bg-black/20">
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <FiLogOut className="text-xl" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Modal (O'zgarishsiz qoldi) */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-blue-950/40">
            {/* Modal mazmuni... */}
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden p-10 text-center">
                 <FiAlertTriangle size={40} className="text-rose-500 mx-auto mb-6" />
                 <h3 className="text-2xl font-black text-slate-900">Sign Out</h3>
                 <p className="text-slate-500 mt-3">Are you sure you want to exit?</p>
                 <div className="flex gap-3 mt-8">
                    <button onClick={() => setConfirmOpen(false)} className="flex-1 py-4 text-slate-600 font-bold bg-slate-50 rounded-2xl">Cancel</button>
                    <button onClick={doLogout} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl">Yes, Exit</button>
                 </div>
            </div>
        </div>
      )}
    </>
  );
};

export default EditorSidebar;