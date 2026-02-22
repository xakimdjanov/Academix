import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { FiMenu } from "react-icons/fi"; // Mobil menyu uchun icon
import SignIn from "./pages/Login";
import Sidebar from "./components/Sidebar";

// --- Editor Sahifalari uchun Placeholderlar ---
const Dashboard = () => <div className="p-6 text-2xl font-bold text-gray-800">Dashboard Overview</div>;
const AssignedArticles = () => <div className="p-6 text-2xl font-bold text-gray-800">Assigned Articles List</div>;
const ReviewHistory = () => <div className="p-6 text-2xl font-bold text-gray-800">Review History Log</div>;
const Profile = () => <div className="p-6 text-2xl font-bold text-gray-800">Editor Profile Settings</div>;
const Chat = () => <div className="p-6 text-2xl font-bold text-gray-800">Chat with Authors</div>;

// ✅ Himoyalangan yo'nalish (Token bo'lmasa loginga qaytaradi)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/signin" replace />;
};

// ✅ Layout: Sidebar va Asosiy Kontent
const EditorLayout = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      {/* Sidebar - isOpen va toggleSidebar proplarini qabul qiladi */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobil Header - Faqat lg ekrandan kichikda ko'rinadi */}
        <header className="lg:hidden flex items-center bg-[#1e1e2e] text-white p-4 shadow-md">
          <button 
            onClick={() => setIsOpen(true)} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiMenu size={24} />
          </button>
          <span className="ml-4 font-bold text-sm tracking-widest uppercase">Editor Panel</span>
        </header>

        {/* Asosiy kontent maydoni */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/signin" element={<SignIn />} />

        <Route path="/dashboard" element={<ProtectedRoute><EditorLayout><Dashboard /></EditorLayout></ProtectedRoute>} />
        <Route path="/assigned" element={<ProtectedRoute><EditorLayout><AssignedArticles /></EditorLayout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><EditorLayout><ReviewHistory /></EditorLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><EditorLayout><Profile /></EditorLayout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><EditorLayout><Chat /></EditorLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;