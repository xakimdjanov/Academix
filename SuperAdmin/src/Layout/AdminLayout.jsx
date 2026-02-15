import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FiMenu, FiBookOpen } from "react-icons/fi";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/signin" replace />;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden relative">
      {/* Sidebar - desktopda doimiy, mobilda toggle */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <FiBookOpen size={16} />
            </div>
            <span className="font-bold text-gray-800 italic">AdminPanel</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-100"
          >
            <FiMenu size={20} />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;