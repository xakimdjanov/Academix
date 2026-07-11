import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users/getUser");
      const data = res?.data?.data || res?.data || [];

      const formatted = (Array.isArray(data) ? data : []).map((user) => ({
        ...user,
        status: "Active",
        role: "User",
        // fallback uchun flag: rasm xato bo‘lsa harf ko‘rsatamiz
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

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            User Management
          </h1>
          <p className="text-sm text-gray-500">Tizim foydalanuvchilarini ko'rish va boshqarish</p>
        </div>
        <div className="text-sm font-medium bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg self-start sm:self-center">
          Total: {users.length}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Foydalanuvchilar yuklanmoqda...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6 italic">To'liq ism-sharif</th>
                  <th className="py-4 px-6 italic">Elektron pochta manzili</th>
                  <th className="py-4 px-6 italic text-center">Rol</th>
                  <th className="py-4 px-6 italic text-center">Holat</th>
                  <th className="py-4 px-6 italic text-center">Premium</th>
                  <th className="py-4 px-6 italic text-right">Amallar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const uid = user.id ?? user._id; // id masalasini ham yopdik
                  const name = user.full_name || user.name || user.username || "User";
                  const firstLetter = name?.trim()?.[0]?.toUpperCase() || "U";

                  // avatar_url bo‘sh string bo‘lsa ham false bo‘lishi uchun trim qildik
                  const hasAvatar = Boolean(user.avatar_url && user.avatar_url.trim());
                  const showImage = hasAvatar && user.avatarError === false;

                  return (
                    <tr
                      key={uid}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={user.avatar_url && !user.avatarError ? user.avatar_url : "/image.png"}
                              alt="avatar"
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                              loading="lazy"
                              onError={(e) => {
                                if (!user.avatarError) {
                                  markAvatarError(uid);
                                } else {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "";
                                }
                              }}
                            />

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
                        <span className="px-3 py-1 text-[11px] font-bold rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-3 py-1 text-[11px] font-bold rounded-md border ${
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
                          className={`px-3 py-1 text-[11px] font-bold rounded-md border ${
                            user.has_premium
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}
                        >
                          {user.has_premium ? "Faol" : "Yo'q"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => togglePremium(uid)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                              user.has_premium
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                            }`}
                          >
                            {user.has_premium ? "Bekor qilish" : "Premium berish"}
                          </button>
                          <button
                            onClick={() => toggleStatus(uid)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                              user.status === "Active"
                                ? "bg-rose-500 text-white hover:bg-rose-600"
                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                            }`}
                          >
                            {user.status === "Active" ? "Block" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">
                      No records found in the system
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
// google verification
export default Users;
