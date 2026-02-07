import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSettings,
  FiFileText,
  FiUsers,
  FiCheckCircle,
  FiCreditCard,
  FiBarChart2,
  FiLogOut,
} from "react-icons/fi";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/journal-settings", label: "Journal Settings", icon: FiSettings },
  { path: "/articles", label: "Articles", icon: FiFileText },
  { path: "/editors", label: "Editors", icon: FiUsers },
  { path: "/decisions", label: "Decisions", icon: FiCheckCircle },
  { path: "/payments", label: "Payments", icon: FiCreditCard },
  { path: "/reports", label: "Reports", icon: FiBarChart2 },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/journal-signin");
  };

  return (
    <div className="h-full w-full bg-[#002147] text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg">
            J
          </div>
          <div>
            <p className="text-base font-semibold leading-5">Journal Admin</p>
            <p className="text-xs text-white/70">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="px-3 py-4 flex-1">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="text-lg" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
