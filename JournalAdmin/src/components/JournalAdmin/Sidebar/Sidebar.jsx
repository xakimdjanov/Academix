import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiHome, FiSettings, FiFileText, FiUsers,
  FiCheckCircle, FiCreditCard, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiChevronLeft, FiChevronRight,
  FiPlusCircle, FiAlertTriangle,
} from "react-icons/fi";
import { journalAdminService } from "../../../services/api";

const menuItems = [
  { path: "/journal-dashboard", label: "Dashboard", icon: FiHome },
  { path: "/journal-list", label: "Add Journals", icon: FiPlusCircle },
  { path: "/journal-settings", label: "Settings", icon: FiSettings },
  { path: "/journal-articles", label: "Articles", icon: FiFileText },
  { path: "/journal-editors", label: "Assign Editors", icon: FiUsers },
  // { path: "/journal-decisions", label: "Decisions", icon: FiCheckCircle },
  // { path: "/journal-payments", label: "Payments", icon: FiCreditCard },
  { path: "/journal-reports", label: "Reports", icon: FiBarChart2 },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Modal uchun state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const adminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  useEffect(() => {
    const load = async () => {
      if (!adminId) return;
      try {
        const res = await journalAdminService.getById(adminId);
        const userData = res?.data?.data || res?.data?.user || res?.data || null;
        setUser(userData);
      } catch (e) { setUser(null); }
    };
    load();
  }, [adminId]);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("journal_admin_id");
    navigate("/journal-signin");
  };

  const formattedName = useMemo(() => {
    const full = user?.full_name || user?.fullName || user?.name || "Admin";
    const parts = full.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return parts[0];
  }, [user]);

  const initials = useMemo(() => {
    const full = user?.full_name || user?.fullName || "A";
    return full.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  }, [user]);

  const avatarUrl = useMemo(() => {
    const raw = user?.avatar_url || user?.avatar || user?.photo;
    if (!raw) return null;
    if (raw.startsWith("http")) return raw;
    return `${API_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`;
  }, [user]);

  return (
    <>
      {/* Mobile Menu Open Button */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-[#002147] text-white shadow-xl border border-white/10 active:scale-95 transition-transform"
        >
          <FiMenu size={24} />
        </button>
      )}

      {/* Backdrop Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 bg-[#002147] border-r border-white/5 ${
        isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed && !isMobileOpen ? 'w-20' : 'w-64'}`}>
        
        <div className="h-full flex flex-col text-white overflow-hidden relative">
          
          {/* Mobile X Button */}
          {isMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 active:rotate-90 duration-200"
            >
              <FiX size={24} />
            </button>
          )}

          {/* Header / Profile Section */}
          <div className="p-4 border-b border-white/10 shrink-0">
            <div className={`flex flex-col ${isCollapsed && !isMobileOpen ? 'items-center' : 'items-start'} gap-3`}>
              
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center font-bold border border-white/20 shadow-lg transition-all duration-300 ${
                    isCollapsed && !isMobileOpen ? 'w-12 h-12' : 'w-11 h-11'
                  }`}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-sm">{initials}</span>
                    )}
                  </div>

                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold truncate text-white">Journal Admin</p>
                      <p className="text-[12px] text-white/50 truncate font-medium">{formattedName}</p>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <button 
                    onClick={() => setIsCollapsed(true)} 
                    className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                )}
              </div>

              {isCollapsed && !isMobileOpen && (
                <button 
                  onClick={() => setIsCollapsed(false)}
                  className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all"
                >
                  <FiChevronRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center group relative p-3 rounded-xl transition-all duration-200 ${
                    isCollapsed && !isMobileOpen ? "justify-center" : "gap-3"
                  } ${isActive 
                    ? "bg-blue-600 shadow-lg shadow-blue-900/40 text-white" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className={`text-xl shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="text-[14px] font-medium tracking-wide">{item.label}</span>
                  )}
                  
                  {isCollapsed && !isMobileOpen && (
                    <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all origin-left bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-2xl z-50 whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-white/5 shrink-0">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={`w-full flex items-center p-3 rounded-xl bg-red-500/5 hover:bg-red-500/15 text-red-400/80 hover:text-red-400 transition-all duration-200 ${
                isCollapsed && !isMobileOpen ? "justify-center" : "gap-3"
              }`}
            >
              <FiLogOut className="text-xl shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="text-[14px] font-bold">Chiqish</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Modal Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <FiAlertTriangle className="text-red-500" size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Sign out
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to leave the profile?
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  Yes, log out
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