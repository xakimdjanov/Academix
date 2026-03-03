import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiShield, FiArrowLeft, FiLogOut } from "react-icons/fi";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const savedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("admin"));

    if (!savedUser) {
      navigate("/login");
      return;
    }

    setUser(savedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button 
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-[#002147] transition-colors font-medium group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          {/* Header/Cover Gradient */}
          <div className="h-32 bg-gradient-to-r from-[#002147] to-blue-600 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-lg">
                <div className="h-full w-full rounded-[1.2rem] bg-slate-100 flex items-center justify-center text-[#002147]">
                  <FiUser size={40} />
                </div>
              </div>
            </div>
          </div>

          {/* User Info Content */}
          <div className="pt-16 pb-8 px-8 text-center">
            <h2 className="text-2xl font-extrabold text-[#002147] tracking-tight">
              {user.fullname || user.name || "User Profile"}
            </h2>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mt-1">
              {user.role || "Academic Editor"}
            </p>

            <div className="mt-8 space-y-4 text-left">
              {/* Email Row */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                  <FiMail size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Email Address</p>
                  <p className="text-slate-700 font-medium">{user.email}</p>
                </div>
              </div>

              {/* Role Row */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                  <FiShield size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Account Role</p>
                  <p className="text-slate-700 font-medium capitalize">{user.role || "Editor"}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-1 gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-[0.98]"
              >
                <FiLogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-xs">
          Academic Journal Management System &bull; 2024
        </p>
      </div>
    </div>
  );
};

export default Profile;