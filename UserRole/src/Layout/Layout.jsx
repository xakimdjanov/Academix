import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FiBell } from "react-icons/fi";

const Layout = () => {
  return (
    <div className="flex bg-[#F6F8FB] min-h-screen">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          
          <h1 className="text-lg md:text-xl font-bold text-[#002147]">
            Academix Platform
          </h1>

        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 min-h-[300px]">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;
