import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../JournalAdmin/Sidebar/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      {/* Sidebar o'zi ham Desktop, ham Mobile ko'rinishni boshqaradi */}
      <Sidebar />

      {/* Asosiy kontent maydoni */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar (Ixtiyoriy: barcha ekranlar uchun) */}
        <header className="h-16 bg-white border-b flex items-center px-4 md:px-8 shrink-0">
          <h1 className="ml-12 lg:ml-0 font-bold text-xl text-gray-800">
            Journal Panel
          </h1>
        </header>

        {/* Sahifa ichidagi scroll bo'ladigan asosiy qism */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;