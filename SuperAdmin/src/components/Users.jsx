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

      const formatted = data.map((user) => ({
        ...user,
        status: "Active",
        role: "User",
      }));

      setUsers(formatted);
    } catch (error) {
      toast.error("Failed to fetch users list");
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
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Blocked" : "Active",
            }
          : user
      )
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">View and manage system users</p>
        </div>
        <div className="text-sm font-medium bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg self-start sm:self-center">
          Total: {users.length}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6 italic">Full Name</th>
                  <th className="py-4 px-6 italic">Email Address</th>
                  <th className="py-4 px-6 italic text-center">Role</th>
                  <th className="py-4 px-6 italic text-center">Status</th>
                  <th className="py-4 px-6 italic text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* User Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.avatar_url || "https://via.placeholder.com/40"}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                        />
                        <span className="font-semibold text-gray-700 truncate max-w-[150px]">
                          {user.full_name}
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

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          user.status === "Active"
                            ? "bg-rose-500 text-white hover:bg-rose-600"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                        }`}
                      >
                        {user.status === "Active" ? "Block" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400 font-medium">
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

export default Users;