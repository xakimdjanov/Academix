import React from "react";
import { Outlet } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "../components/Sidebar";

const Layout = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    // h-screen va overflow-hidden sahifani ekran balandligiga qulflaydi
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* Sidebar - h-full uning balandligini ekran bilan cheklaydi */}
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(false)} />

      {/* Asosiy kontent maydoni */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header - Faqat mobil qurilmada ko'rinadi */}
        <header className="lg:hidden flex items-center bg-[#0f172a] text-white p-4 shadow-lg z-30">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-blue-600/20 rounded-xl transition-all"
          >
            <FiMenu size={24} />
          </button>

          <span className="ml-4 font-black text-xs tracking-[0.2em] uppercase text-blue-400">
            Editor Panel
          </span>
        </header>

        {/* Asosiy kontent - Faqat shu qism skroll bo'ladi */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;