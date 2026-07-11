import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import toast from "react-hot-toast";
import { FiUser, FiSearch, FiStar, FiShield, FiUserCheck, FiUserX, FiActivity } from "react-icons/fi";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'premium', 'active', 'blocked'

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

  // Filter and search logic
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

  // Calculate statistics
  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.has_premium).length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const blockedUsers = users.filter((u) => u.status === "Blocked").length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden bg-gray-50/50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiUser className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Jami a'zolar</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalUsers}</h3>
          </div>
        </div>

        {/* Premium Users */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiStar className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Premium a'zolar</p>
            <h3 className="text-2xl font-bold text-gray-800">{premiumUsers}</h3>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiUserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Faol a'zolar</p>
            <h3 className="text-2xl font-bold text-gray-800">{activeUsers}</h3>
          </div>
        </div>

        {/* Blocked Users */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <FiUserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Bloklanganlar</p>
            <h3 className="text-2xl font-bold text-gray-800">{blockedUsers}</h3>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Ism yoki email bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 outline-none text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setActiveTab("premium")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "premium"
                ? "bg-amber-500 text-white shadow-md shadow-amber-100"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Premiumlar
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "active"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Faollar
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "blocked"
                ? "bg-rose-600 text-white shadow-md shadow-rose-100"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Bloklanganlar
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <FiActivity className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
            <span>Foydalanuvchilar yuklanmoqda...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6">To'liq ism-sharif</th>
                  <th className="py-4 px-6">Elektron pochta manzili</th>
                  <th className="py-4 px-6 text-center">Rol</th>
                  <th className="py-4 px-6 text-center">Holat</th>
                  <th className="py-4 px-6 text-center">Premium</th>
                  <th className="py-4 px-6 text-right">Amallar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const uid = user.id ?? user._id;
                  const name = user.full_name || user.name || user.username || "User";
                  const firstLetter = name?.trim()?.[0]?.toUpperCase() || "U";
                  const showImage = user.avatar_url && !user.avatarError;

                  return (
                    <tr
                      key={uid}
                      className="hover:bg-gray-50/30 transition-colors group"
                    >
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 min-w-0">
                          {showImage ? (
                            <img
                              src={user.avatar_url}
                              alt="avatar"
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                              loading="lazy"
                              onError={() => markAvatarError(uid)}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                              {firstLetter}
                            </div>
                          )}

                          <span className="font-semibold text-gray-700 truncate max-w-[150px]">
                            {name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-sm text-gray-500 truncate max-w-[200px]">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center gap-1 w-max mx-auto">
                          <FiShield className="w-3.5 h-3.5" />
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md border inline-block ${
                            user.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Premium */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md border inline-flex items-center gap-1 ${
                            user.has_premium
                              ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
                              : "bg-gray-50 text-gray-400 border-gray-100"
                          }`}
                        >
                          {user.has_premium ? (
                            <>
                              <FiStar className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                              <span>Faol</span>
                            </>
                          ) : (
                            <span>Yo'q</span>
                          )}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => togglePremium(uid)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 ${
                              user.has_premium
                                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                                : "bg-white hover:bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <FiStar className={`w-3.5 h-3.5 ${user.has_premium ? 'fill-white' : ''}`} />
                            {user.has_premium ? "Bekor qilish" : "Premium berish"}
                          </button>
                          <button
                            onClick={() => toggleStatus(uid)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 ${
                              user.status === "Active"
                                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200"
                                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200"
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
                    <td colSpan="6" className="text-center py-16 text-gray-400 font-medium">
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
