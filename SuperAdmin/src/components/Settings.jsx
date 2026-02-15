import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiBell, FiSend, FiSearch } from "react-icons/fi";
import { notificationService, userService } from "../services/api";

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const [userQuery, setUserQuery] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    title: "",
    message: "",
    channel: "telegram_only",
  });

  const selectedUser = useMemo(() => {
    const id = Number(form.user_id);
    return users.find((u) => u.id === id) || null;
  }, [form.user_id, users]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = `${u.full_name || ""} ${u.email || ""} ${u.telegram_id || ""} ${u.username || ""}`
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, userQuery]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await userService.getAll();
      const data = res?.data?.data || res?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await notificationService.getAll();
      const data = res?.data?.data || res?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Error fetching notifications");
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const canSendTelegram = !!selectedUser?.telegram_id;

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.user_id) return toast.error("Please select a user");
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.message.trim()) return toast.error("Message is required");

    if (form.channel !== "site_only" && !canSendTelegram) {
      return toast.error("Selected user does not have a Telegram ID");
    }

    setLoadingCreate(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        user_id: Number(form.user_id),
        channel: form.channel,
      };

      await notificationService.create(payload);
      toast.success("Notification sent successfully ✅");
      setForm((p) => ({ ...p, title: "", message: "" }));
      fetchNotifications();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error creating notification");
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Configure notifications and system delivery</p>
      </div>

      {/* Create Notification */}
      <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <FiBell className="text-indigo-600 text-xl" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Send Notification</h2>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          {/* User selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Search User</label>
              <div className="relative">
                <FiSearch className="absolute top-3.5 left-3 text-gray-400" />
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Name, email or ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Select User</label>
              <select
                name="user_id"
                value={form.user_id}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              >
                <option value="">{loadingUsers ? "Loading..." : "Choose a user"}</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} {u.telegram_id ? "— (TG ✅)" : "— (No TG)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Info Preview */}
          {selectedUser && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-indigo-900 truncate">{selectedUser.full_name}</p>
                <p className="text-xs text-indigo-600 truncate">{selectedUser.email}</p>
              </div>
              <div className="text-xs font-medium">
                <span className="text-gray-500">Telegram Status:</span>{" "}
                <span className={canSendTelegram ? "text-emerald-600" : "text-rose-600"}>
                  {canSendTelegram ? `Active (${selectedUser.telegram_id})` : "Not linked"}
                </span>
              </div>
            </div>
          )}

          {/* Channel Selection */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Delivery Channel</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['telegram_only', 'telegram_and_site', 'site_only'].map((ch) => (
                <label key={ch} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${form.channel === ch ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <input type="radio" name="channel" value={ch} checked={form.channel === ch} onChange={onChange} className="hidden" />
                  <span className="text-xs font-bold capitalize">{ch.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title & Message */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Title</label>
              <input name="title" value={form.title} onChange={onChange} placeholder="e.g. System Update" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Message</label>
              <input name="message" value={form.message} onChange={onChange} placeholder="e.g. Your paper is under review" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingCreate}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            <FiSend />
            {loadingCreate ? "Processing..." : "Dispatch Notification"}
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Notification History</h2>
          <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">{notifications.length} Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
              <tr>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Recipient</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Date Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-700">{n.title}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{n.message}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-700">{n?.user?.full_name}</div>
                    <div className="text-xs text-gray-400">{n?.user?.email}</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${n.status === 'unread' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-gray-400 text-xs">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {notifications.length === 0 && !loadingNotifs && (
            <div className="p-10 text-center text-gray-400 text-sm italic">No notifications dispatched yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;