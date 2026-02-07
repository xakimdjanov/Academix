import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import Sidebar from "../JournalAdmin/Sidebar/Sidebar";

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F6F8FB] relative">

      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden md:flex md:w-64 bg-[#002147] text-white">
        <Sidebar />
      </aside>

      {/* ===== Mobile Sidebar ===== */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Sidebar Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-[#002147] text-white transform transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setOpen(false)}>
              <FiX size={22} />
            </button>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col">

        {/* Topbar (Mobile) */}
        <div className="md:hidden bg-white shadow-sm px-4 py-3 flex items-center">
          <button onClick={() => setOpen(true)}>
            <FiMenu size={22} />
          </button>
          <h1 className="ml-4 font-semibold text-[#1F2937]">
            Dashboard
          </h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
