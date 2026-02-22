import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiFileText,
  FiClock,
  FiUser,
  FiMessageCircle,
  FiLogOut,
  FiX,
  FiAlertTriangle,
  FiCheck,
} from "react-icons/fi";

const editorLinks = [
  { name: "Dashboard", path: "/dashboard", icon: <FiGrid /> },
  { name: "Assigned Articles", path: "/assigned", icon: <FiFileText /> },
  { name: "Review History", path: "/history", icon: <FiClock /> },
  { name: "Profile", path: "/profile", icon: <FiUser /> },
  { name: "Chat", path: "/chat", icon: <FiMessageCircle /> },
];

const EditorSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // LocalStorage-dan ma'lumot olish
  const editor = JSON.parse(localStorage.getItem("admin") || "{}");
  const displayName = editor?.fullname || "Xakimdjanov Isomiddin";
  const role = "JOURNAL EDITOR";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const doLogout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  return (
    <>
      {/* 1. Mobil uchun Overlay (Menyu ochilganda orqa fon qorong'u bo'lishi uchun) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* 2. Sidebar Main Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#1e1e2e] border-r border-white/5 flex flex-col transition-all duration-300 transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-0 lg:w-72
        `}
      >
        {/* 3. Profil qismi (Har doim yuqorida va to'liq ko'rinadi) */}
        <div className="p-6 border-b border-white/5 flex items-center gap-4 relative">
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-blue-600 text-white font-bold border border-white/10 shadow-lg">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-white truncate text-base leading-tight">
              {displayName}
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              {role}
            </p>
          </div>

          {/* Mobil uchun yopish tugmasi (X icon) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden absolute top-4 right-4 p-2 text-white/50 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* 4. Navigatsiya menyusi */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {editorLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) => `
                flex items-center gap-3 p-3.5 rounded-xl text-sm font-semibold transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* 5. Chiqish tugmasi */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full flex items-center gap-3 p-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <FiLogOut className="text-xl" />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* 6. Logout Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 text-center">
              <FiAlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Tizimdan chiqish</h3>
              <p className="text-gray-500 text-sm mt-2">Haqiqatan ham chiqmoqchimisiz?</p>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3">
              <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Bekor qilish</button>
              <button onClick={doLogout} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">Chiqish</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditorSidebar;