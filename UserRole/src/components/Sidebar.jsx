import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUser,
  FiFileText,
  FiSend,
  FiCreditCard,
  FiBell,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { userService } from "../services/api";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/my-profile", label: "My Profile", icon: FiUser },
  { path: "/my-articles", label: "My Articles", icon: FiFileText },
  { path: "/submit-article", label: "Submit Article", icon: FiSend },
  { path: "/payments", label: "Payments", icon: FiCreditCard },
  { path: "/notifications", label: "Notifications", icon: FiBell },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const userId = useMemo(() => localStorage.getItem("user_id"), []);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;

      // localdan ham ko'rsatib turamiz
      const cached = localStorage.getItem("user_data");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {}
      }

      try {
        const res = await userService.getById(userId);
        const userData =
          res?.data?.data || res?.data?.user || res?.data || null;

        if (userData) {
          setUser(userData);
          localStorage.setItem("user_data", JSON.stringify(userData));
        }
      } catch (e) {
        // agar API ishlamasa ham cached ko'rinaveradi
      }
    };

    load();
  }, [userId]);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_data");
    navigate("/signin");
  };

  const formattedName = useMemo(() => {
    const full = user?.full_name || user?.fullName || user?.name || "User";
    const parts = String(full).trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    return parts[0] || "User";
  }, [user]);

  const initials = useMemo(() => {
    const full = user?.full_name || user?.fullName || user?.name || "U";
    return String(full)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [user]);

  const avatarUrl = useMemo(() => {
    const raw = user?.avatar_url || user?.avatar || user?.photo;
    if (!raw) return null;
    if (String(raw).startsWith("http")) return raw;
    return `${API_BASE}${String(raw).startsWith("/") ? "" : "/"}${raw}`;
  }, [user]);

  return (
    <>
      {/* Mobile open button */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-[#002147] text-white shadow-xl border border-white/10 active:scale-95 transition-transform"
        >
          <FiMenu size={24} />
        </button>
      )}

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 bg-[#002147] border-r border-white/5
        ${isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed && !isMobileOpen ? "w-20" : "w-64"}`}
      >
        <div className="h-full flex flex-col text-white overflow-hidden relative">
          {/* Mobile close */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 active:rotate-90 duration-200"
            >
              <FiX size={24} />
            </button>
          )}

          {/* Header / profile */}
          <div className="p-4 border-b border-white/10 shrink-0">
            <div
              className={`flex flex-col ${
                isCollapsed && !isMobileOpen ? "items-center" : "items-start"
              } gap-3`}
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center font-bold border border-white/20 shadow-lg transition-all duration-300 ${
                      isCollapsed && !isMobileOpen ? "w-12 h-12" : "w-11 h-11"
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-sm">{initials}</span>
                    )}
                  </div>

                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold truncate text-white">
                        User
                      </p>
                      <p className="text-[12px] text-white/50 truncate font-medium">
                        {formattedName}
                      </p>
                    </div>
                  )}
                </div>

                {/* collapse button */}
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

          {/* Nav */}
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
                  } ${
                    isActive
                      ? "bg-blue-600 shadow-lg shadow-blue-900/40 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`text-xl shrink-0 transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="text-[14px] font-medium tracking-wide">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip when collapsed */}
                  {isCollapsed && !isMobileOpen && (
                    <div className="absolute left-full ml-4 scale-0 group-hover:scale-100 transition-all origin-left bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-2xl z-50 whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/5 shrink-0">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={`w-full flex items-center p-3 rounded-xl bg-red-500/5 hover:bg-red-500/15 text-red-400/80 hover:text-red-400 transition-all duration-200 ${
                isCollapsed && !isMobileOpen ? "justify-center" : "gap-3"
              }`}
            >
              <FiLogOut className="text-xl shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <span className="text-[14px] font-bold">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsLogoutModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <FiAlertTriangle className="text-red-500" size={32} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Logout
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
