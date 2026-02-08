import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { journalAdminService } from "../../services/api";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/journals", label: "Journals" },
  { to: "/articles", label: "Articles" },
  { to: "/contact", label: "Contact" },
];

// ✅ backend base url
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
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const token = useMemo(() => localStorage.getItem("token"), []);
  const adminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((p) => !p);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // ESC bilan yopish
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Menu ochiq bo'lsa scroll block
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const isActive = (to) => activePath === to;

  // ✅ Login bo‘lsa: getById bilan userni olish
  useEffect(() => {
    const load = async () => {
      if (!token || !adminId) return;
      try {
        const res = await journalAdminService.getById(adminId);
        const u =
          res?.data?.data ||
          res?.data?.user ||
          res?.data?.admin ||
          res?.data ||
          null;
        setUser(u);
      } catch {
        setUser(null);
      }
    };
    load();
  }, [token, adminId]);

  const fullName =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const initials = getInitials(fullName) || "JA";

  const avatarRaw =
    user?.avatar_url || user?.avatarUrl || user?.avatar || user?.photo || "";

  const avatarUrl = buildAvatarUrl(avatarRaw);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("journal_admin_id");
    sessionStorage.clear();
    setUser(null);
    navigate("/journal-signin");
    window.location.reload()
  };

  const isLoggedIn = !!token && !!adminId;

  return (
    <header className="bg-[#002147] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="text-lg sm:text-xl md:text-2xl">Academix</span>
            <span className="text-blue-400 text-xl md:text-2xl">•</span>
          </Link>

          {/* Desktop Nav */}
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

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/journal-signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 lg:px-5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-xl active:scale-95"
                >
                  Create a Journal
                </Link>

                <Link
                  to="/articles-signup"
                  className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-4 py-2.5 lg:px-5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-xl active:scale-95"
                >
                  Create an Article
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* profile */}
                <Link
                  to="/journal-dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  title={fullName || "Journal Admin"}
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
                    <div className="text-sm font-semibold">Journal Admin</div>
                    <div className="text-xs text-white/70 max-w-[160px] truncate">
                      {fullName || initials}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="md:hidden flex items-center gap-2">
            {!isLoggedIn ? (
              <Link
                to="/journal-signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
              >
                Create
              </Link>
            ) : (
              <Link
                to="/journal-dashboard"
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
              aria-label="Open menu"
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

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        {/* Panel */}
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
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {/* Logged in box */}
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
                  <div className="text-sm font-semibold">Journal Admin</div>
                  <div className="text-xs text-white/70 truncate">
                    {fullName || initials}
                  </div>
                </div>
              </div>
            )}

            {/* Nav Links */}
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

            {/* Actions */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/journal-signup"
                    onClick={closeMenu}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition shadow-md active:scale-[0.99]"
                  >
                    Create a Journal
                  </Link>

                  <Link
                    to="/articles-signup"
                    onClick={closeMenu}
                    className="block w-full text-center border border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-white px-4 py-3 rounded-xl font-semibold transition shadow-md active:scale-[0.99]"
                  >
                    Create an Article
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/journal-dashboard"
                    onClick={closeMenu}
                    className="block w-full text-center bg-white/10 hover:bg-white/15 text-white px-4 py-3 rounded-xl font-semibold transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }}
                    className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition"
                  >
                    Logout
                  </button>
                </>
              )}

              <p className="pt-4 text-center text-xs text-gray-300">
                © {new Date().getFullYear()} Academix. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
