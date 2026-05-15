import React from 'react'
import Header from '../components/Header/Header'
import { Link, Outlet } from 'react-router-dom'
import Footer from '../components/Footer/Footer'
import { FiMessageCircle } from "react-icons/fi";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
        <Header/>
        <main className="flex-grow">
          <Outlet/>
        </main>
        <Footer/>

        {/* Floating Suggestion Button for Public Pages */}
        <Link 
          to="/suggestions" 
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#002147] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group overflow-hidden"
          title="Taklif va Shikoyatlar"
        >
           <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
           <div className="absolute w-full h-full border-4 border-blue-400/30 rounded-full animate-ping opacity-20"></div>
           <FiMessageCircle size={32} className="relative z-10" />
        </Link>
    </div>
  )
}

export default MainLayout
