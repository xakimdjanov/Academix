import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import toast from "react-hot-toast";
import { 
  FiUser, 
  FiSearch, 
  FiStar, 
  FiShield, 
  FiUserCheck, 
  FiUserX, 
  FiActivity, 
  FiGift, 
  FiCheckCircle, 
  FiInfo,
  FiZap
} from "react-icons/fi";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users/getUser");
      const data = res?.data?.data || res?.data || [];

      const formatted = (Array.isArray(data) ? data : []).map((user) => ({
        ...user,
        status: user.status || "Active",
        role: user.role || "User",
        avatarError: false,
      }));

      setUsers(formatted);
    } catch (error) {
      toast.error("Foydalanuvchilar ro'yxatini yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = (id) => {
    // Simulated status toggle since backend endpoint is local/simulated
    setUsers((prev) =>
      prev.map((user) =>
        (user.id ?? user._id) === id
          ? {
              ...user,
              status: user.status === "Active" ? "Blocked" : "Active",
            }
          : user
      )
    );
    toast.success("Foydalanuvchi holati yangilandi (simulyatsiya)");
  };

  const togglePremium = async (id) => {
    try {
      const res = await axiosInstance.put(`/users/toggle-premium/${id}`);
      toast.success(res.data.message || "Premium statusi yangilandi");
      setUsers((prev) =>
        prev.map((user) =>
          (user.id ?? user._id) === id
            ? { ...user, has_premium: res.data.has_premium }
            : user
        )
      );
    } catch (error) {
      toast.error("Premium statusini o'zgartirib bo'lmadi");
    }
  };

  const markAvatarError = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        (user.id ?? user._id) === id ? { ...user, avatarError: true } : user
      )
    );
  };

  const filteredUsers = users.filter((user) => {
    const name = (user.full_name || user.name || user.username || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "premium") return user.has_premium;
    if (activeTab === "active") return user.status === "Active";
    if (activeTab === "blocked") return user.status === "Blocked";

    return true;
  });

  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.has_premium).length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const blockedUsers = users.filter((u) => u.status === "Blocked").length;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-full overflow-hidden bg-slate-50 min-h-screen text-slate-700">
      
      {/* Top Banner explaining Premium features */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wider uppercase">
              <FiZap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" /> Super Admin Boshqaruv
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Foydalanuvchilar va Premium Tizimi</h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Foydalanuvchilarga premium statusini berish orqali ular keyingi 1 ta maqola uchun to'lovsiz (bepul) yuborish imkoniyatiga ega bo'ladilar. Maqola yuborilgach, premium status avtomatik ravishda yakunlanadi.
            </p>
          </div>
          <div className="flex gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-slate-300 max-w-xs leading-normal">
            <FiInfo className="text-amber-400 shrink-0 mt-0.5" size={16} />
            <span>Premium foydalanuvchilar maqola yuborishda payment-bypass (to'lov chetlab o'tish) huquqiga ega bo'lishadi.</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
            <FiUser className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami a'zolar</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{totalUsers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
            <FiStar className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Premium a'zolar</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{premiumUsers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
            <FiUserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faol a'zolar</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{activeUsers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
            <FiUserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bloklanganlar</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{blockedUsers}</h3>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Ism yoki email bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 w-full rounded-2xl border border-slate-200 outline-none text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setActiveTab("premium")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "premium"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FiStar className={`w-3.5 h-3.5 ${activeTab === 'premium' ? 'fill-white' : ''}`} />
            Premiumlar
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
              activeTab === "active"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Faollar
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
              activeTab === "blocked"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Bloklanganlar
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400">
            <FiActivity className="w-10 h-10 animate-spin mx-auto text-indigo-600 mb-4" />
            <span className="font-semibold text-sm">Foydalanuvchilar yuklanmoqda...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="py-5 px-6">To'liq ism-sharif</th>
                  <th className="py-5 px-6">Elektron pochta manzili</th>
                  <th className="py-5 px-6 text-center">Rol</th>
                  <th className="py-5 px-6 text-center">Holat</th>
                  <th className="py-5 px-6 text-center">Premium Status</th>
                  <th className="py-5 px-6 text-right">Amallar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const uid = user.id ?? user._id;
                  const name = user.full_name || user.name || user.username || "User";
                  const firstLetter = name?.trim()?.[0]?.toUpperCase() || "U";
                  const showImage = user.avatar_url && !user.avatarError;

                  return (
                    <tr
                      key={uid}
                      className="hover:bg-slate-50/40 transition-colors group"
                    >
                      {/* User Info */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4 min-w-0">
                          {showImage ? (
                            <img
                              src={user.avatar_url}
                              alt="avatar"
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 shrink-0 shadow-sm"
                              loading="lazy"
                              onError={() => markAvatarError(uid)}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md">
                              {firstLetter}
                            </div>
                          )}

                          <div className="truncate">
                            <span className="font-bold text-slate-800 text-sm block group-hover:text-indigo-600 transition-colors">
                              {name}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              ID: {uid}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-5 px-6 text-sm text-slate-600 font-medium truncate max-w-[220px]">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="py-5 px-6 text-center">
                        <span className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center gap-1.5 w-max mx-auto shadow-sm">
                          <FiShield className="w-3.5 h-3.5" />
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-5 px-6 text-center">
                        <span
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border inline-block shadow-sm ${
                            user.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Premium */}
                      <td className="py-5 px-6 text-center">
                        <span
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border inline-flex items-center gap-1.5 shadow-sm transition-all duration-300 ${
                            user.has_premium
                              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-400"
                              : "bg-slate-50 text-slate-400 border-slate-200/60"
                          }`}
                        >
                          {user.has_premium ? (
                            <>
                              <FiStar className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
                              <span>1 ta maqola uchun faol</span>
                            </>
                          ) : (
                            <span>Yo'q</span>
                          )}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => togglePremium(uid)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 border ${
                              user.has_premium
                                ? "bg-white hover:bg-slate-50 text-amber-600 border-amber-200"
                                : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-transparent"
                            }`}
                            title={user.has_premium ? "Premium holatini o'chirish" : "Maqola yuborish uchun bepul premium berish"}
                          >
                            <FiGift className={`w-3.5 h-3.5 ${user.has_premium ? '' : 'animate-bounce'}`} />
                            {user.has_premium ? "Bekor qilish" : "Premium berish"}
                          </button>
                          
                          <button
                            onClick={() => toggleStatus(uid)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                              user.status === "Active"
                                ? "bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-200/60"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {user.status === "Active" ? (
                              <>
                                <FiUserX className="w-3.5 h-3.5" />
                                <span>Bloklash</span>
                              </>
                            ) : (
                              <>
                                <FiUserCheck className="w-3.5 h-3.5" />
                                <span>Faollash</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-20 text-slate-400 font-semibold text-sm">
                      Mos foydalanuvchilar topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
