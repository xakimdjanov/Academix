import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBookOpen,
  FiEdit3,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiX
} from "react-icons/fi";

const links = [
  { name: "Dashboard", path: "/dashboard", icon: <FiHome /> },
  { name: "Users", path: "/users", icon: <FiUsers /> },
  { name: "Journals", path: "/journals", icon: <FiBookOpen /> },
  { name: "Editor", path: "/editor", icon: <FiEdit3 /> },
  { name: "Logs", path: "/logs", icon: <FiFileText /> },
  { name: "Settings", path: "/settings", icon: <FiSettings /> },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "null");

  const displayName = admin?.fullname || "Admin User";
  const role = admin?.role || "Administrator";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const logout = () => {
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
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between border-b border-gray-50">
          <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
            <FiX size={20} />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-6 py-8 flex items-center gap-4">
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold border-2 border-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-gray-800 truncate text-sm">{displayName}</h2>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{role}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all
                ${isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"}
              `}
            >
              <span className="text-lg">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            <FiLogOut className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;