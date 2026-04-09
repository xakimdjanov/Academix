import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBookOpen,
  FiEdit3,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiCheck,
  FiPlus,
  FiShield,
} from "react-icons/fi";

const links = [
  { name: "Asosiy panel", path: "/dashboard", icon: <FiHome /> },
  { name: "Foydalanuvchilar", path: "/users", icon: <FiUsers /> },
  { name: "Journal Adminlar", path: "/journal-admins", icon: <FiShield /> },
  { name: "Jurnallar", path: "/journals", icon: <FiBookOpen /> },
  { name: "Maqolalar", path: "/articles", icon: <FiFileText /> },
  { name: "Muharrirlar", path: "/editor", icon: <FiEdit3 /> },
  { name: "Loglar", path: "/logs", icon: <FiFileText /> },
  { name: "Sozlamalar", path: "/settings", icon: <FiSettings /> },
];
 
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ Logout confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  const admin = JSON.parse(localStorage.getItem("admin") || "null");
  const displayName = admin?.fullname || "Admin User";
  const role = admin?.role || "Administrator";
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#002147] border-r border-white/10 flex flex-col transition-all duration-300 transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-0
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        `}
      >
        {/* Logo & Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!isCollapsed && <span className="text-white font-bold tracking-wider">ADMIN</span>}

          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-white/70 hover:bg-white/10 rounded-lg"
          >
            <FiX size={20} />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"
          >
            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>

        {/* User Profile */}
        <div
          className={`px-4 py-8 flex items-center transition-all ${
            isCollapsed ? "justify-center" : "gap-4"
          }`}
        >
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold border border-white/20 shadow-lg">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 overflow-hidden">
              <h2 className="font-bold text-white truncate text-sm">{displayName}</h2>
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                {role}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-auto scrollbar-none">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) => `
                flex items-center group relative p-3 rounded-xl text-sm font-semibold transition-all
                ${isCollapsed ? "justify-center" : "gap-3"}
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span className="text-xl shrink-0">{link.icon}</span>
              {!isCollapsed && <span className="truncate">{link.name}</span>}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all origin-left bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-2xl z-50 whitespace-nowrap pointer-events-none">
                  {link.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setConfirmOpen(true)}
            className={`
              w-full flex items-center p-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all
              ${isCollapsed ? "justify-center" : "gap-3"}
            `}
          >
            <FiLogOut className="text-lg shrink-0" />
            {!isCollapsed && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* ✅ Confirm Logout Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 mx-auto mb-6">
                <FiLogOut size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Chiqish</h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                Haqiqatan ham tizimdan chiqishni xohlaysizmi?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfirmOpen(false);
                    doLogout();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-lg shadow-red-100"
                >
                  <FiCheck /> Chiqish
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
                >
                  <FiX /> Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
