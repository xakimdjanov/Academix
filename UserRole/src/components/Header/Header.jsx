import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../services/api";
import RoleSelectionModal from "../RoleSelectionModal";

const NAV_ITEMS = [
  { to: "/", label: "Bosh sahifa" },
  { to: "/journals", label: "Jurnallar" },
  { to: "/articles", label: "Maqolalar" },
  { to: "/pricing", label: "Tariflar" },
  { to: "/about", label: "Haqida" },
  { to: "/contact", label: "Bog'lanish" },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const UPLOADS_PATH = "/uploads";

function getInitials(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

function buildAvatarUrl(raw) {
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("uploads/")) return `${API_BASE}/${raw}`;
  if (raw.startsWith("/uploads/")) return `${API_BASE}${raw}`;
  return `${API_BASE}${UPLOADS_PATH}/${raw}`;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const token = useMemo(() => localStorage.getItem("token"), []);
  const userId = useMemo(() => localStorage.getItem("user_id"), []);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((p) => !p);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const isActive = (to) => activePath === to;

  useEffect(() => {
    const load = async () => {
      if (!token || !userId) return;
      try {
        const res = await userService.getById(userId);
        const u =
          res?.data?.data ||
          res?.data?.user ||
          res?.data ||
          null;
        setUser(u);
      } catch {
        setUser(null);
      }
    };
    load();
  }, [token, userId]);

  const fullName =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const initials = getInitials(fullName) || "F";

  const avatarRaw =
    user?.avatar_url || user?.avatarUrl || user?.avatar || user?.photo || "";

  const avatarUrl = buildAvatarUrl(avatarRaw);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_data");
    sessionStorage.clear();
    setUser(null);
    navigate("/signin");
    window.location.reload();
  };

  const isLoggedIn = !!token && !!userId;

  return (
    <header className="bg-[#002147] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="text-lg sm:text-xl md:text-2xl">Academix</span>
            <span className="text-blue-400 text-xl md:text-2xl">•</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${
                    isActive(item.to) ? "w-full" : "w-0 hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsRoleModalOpen(true)}
                  className="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  Kirish
                </button>

                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/40 active:scale-95"
                >
                  Ro'yxatdan o'tish
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  title={fullName || "Foydalanuvchi profili"}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center font-bold">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <span className="text-sm">{initials}</span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">Boshqaruv paneli</div>
                    <div className="text-xs text-white/70 max-w-[160px] truncate">
                      {fullName || initials}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  Chiqish
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {!isLoggedIn ? (
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
              >
                Kirish
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/10"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center font-bold">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-xs">{initials}</span>
                  )}
                </div>
              </Link>
            )}

            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-200 hover:text-white hover:bg-gray-800 transition-all"
              aria-label="Menyuni ochish"
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1"
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        <div
          className={`absolute right-0 top-0 h-full w-[80%] max-w-[360px] bg-[#002147] shadow-2xl transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <span className="text-lg font-bold">
              Academix<span className="text-blue-400">.</span>
            </span>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition"
              aria-label="Menyuni yopish"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {isLoggedIn && (
              <div className="mb-4 p-3 rounded-xl bg-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center font-bold">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Boshqaruv paneli</div>
                  <div className="text-xs text-white/70 truncate">
                    {fullName || initials}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition ${
                    isActive(item.to)
                      ? "bg-blue-900 text-white"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive(item.to) && (
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      closeMenu();
                      setIsRoleModalOpen(true);
                    }}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold transition shadow-lg active:scale-[0.99]"
                  >
                    Kirish
                  </button>

                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="block w-full text-center border border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-white px-4 py-3 rounded-xl font-semibold transition active:scale-[0.99]"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="block w-full text-center bg-white/10 hover:bg-white/15 text-white px-4 py-3 rounded-xl font-semibold transition"
                  >
                    Boshqaruv paneli
                  </Link>
                  <button
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }}
                    className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition"
                  >
                    Chiqish
                  </button>
                </>
              )}

              <p className="pt-4 text-center text-xs text-gray-300">
                © {new Date().getFullYear()} Academix. Barcha huquqlar himoyalangan.
              </p>
            </div>
          </div>
        </div>
      </div>
      <RoleSelectionModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
