import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiBell, FiSend, FiPlus, FiX, FiSearch, FiCheckCircle, FiSlash } from "react-icons/fi";
import { notificationService, userService } from "../services/api";

const Settings = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creating, setCreating] = useState(false);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    title: "",
    message: "",
    channel: "telegram_only", // telegram_only | telegram_and_site | site_only
  });

  // Searchable user picker
  const [userSearch, setUserSearch] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const userPickerRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await notificationService.getAll();
      const data = res?.data?.data || res?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await userService.getAll();
      const data = res?.data?.data || res?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, [fetchNotifications, fetchUsers]);

  // Close dropdown on click outside
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!userPickerRef.current) return;
      if (!userPickerRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const selectedUser = useMemo(() => {
    if (!form.user_id) return null;
    return users.find((u) => String(u.id) === String(form.user_id)) || null;
  }, [users, form.user_id]);

  const canSendTelegram = !!selectedUser?.telegram_id;

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = `${u.full_name || ""} ${u.email || ""} ${u.username || ""} ${u.telegram_id || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, userSearch]);

  const closeModal = () => {
    if (!creating) setOpen(false);
  };

  const resetForm = () => {
    setForm({ user_id: "", title: "", message: "", channel: "telegram_only" });
    setUserSearch("");
    setUserOpen(false);
  };

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleOpenCreate = () => {
    setOpen(true);
    setUserOpen(false);
    if (selectedUser) {
      setUserSearch(`${selectedUser.full_name || "User"} (${selectedUser.email || ""})`);
    }
  };

  const handleSelectUser = (u) => {
    setForm((p) => ({ ...p, user_id: String(u.id) }));
    setUserSearch(`${u.full_name || "User"} (${u.email || ""})`);
    setUserOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.user_id) return toast.error("Select a user");
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.message.trim()) return toast.error("Message is required");

    if (form.channel !== "site_only" && !canSendTelegram) {
      return toast.error("Selected user does not have a Telegram ID");
    }

    setCreating(true);
    try {
      await notificationService.create({
        title: form.title.trim(),
        message: form.message.trim(),
        user_id: Number(form.user_id),
        channel: form.channel,
      });

      toast.success("Notification sent");
      setOpen(false);
      resetForm();
      fetchNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error sending notification");
    } finally {
      setCreating(false);
    }
  };

  const ChannelPill = ({ value, label }) => {
    const active = form.channel === value;
    const disabled = value !== "site_only" && selectedUser && !canSendTelegram;

    return (
      <label
        className={`flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-all text-xs font-bold uppercase
          ${active ? "bg-blue-700 border-blue-700 text-white shadow-md shadow-blue-100" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          type="radio"
          name="channel"
          value={value}
          checked={active}
          onChange={onChange}
          disabled={disabled}
          className="hidden"
        />
        {label}
      </label>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500">Manage system notifications</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-700 text-white hover:bg-blue-800 transition-all shadow-sm shadow-blue-100"
        >
          <FiPlus /> Create
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Notification History</h2>
          <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">
            {notifications.length} Total
          </span>
        </div>

        {loadingNotifs ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left min-w-[850px]">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                <tr>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Recipient</th>
                  <th className="py-4 px-6 text-center">Channel</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Date Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <tr key={n.id || n._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-700">{n.title}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[260px]">{n.message}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-700">{n?.user?.full_name || "—"}</div>
                      <div className="text-xs text-gray-400">{n?.user?.email || "—"}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                        {String(n.channel || "—").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          n.status === "unread"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}
                      >
                        {n.status || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400 text-xs">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))}

                {notifications.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-400 text-sm italic">
                      No notifications dispatched yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Modal header */}
            <div className="bg-blue-800 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiBell className="text-xl" />
                <h2 className="text-lg font-bold">Create Notification</h2>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 transition"
                aria-label="Close"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Searchable user picker */}
              <div className="space-y-2" ref={userPickerRef}>
                <label className="text-xs font-bold text-gray-400 uppercase">User</label>

                <div className="relative">
                  <FiSearch className="absolute top-3.5 left-4 text-gray-400" />
                  <input
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserOpen(true);
                    }}
                    onFocus={() => setUserOpen(true)}
                    placeholder={loadingUsers ? "Loading users..." : "Type name / email / telegram..."}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm outline-none"
                  />

                  {userOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="max-h-64 overflow-auto scrollbar-none">
                        {loadingUsers ? (
                          <div className="p-4 text-sm text-gray-400">Loading...</div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-4 text-sm text-gray-400">No users found</div>
                        ) : (
                          filteredUsers.map((u) => {
                            const hasTG = !!u.telegram_id;
                            return (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelectUser(u)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm font-bold text-gray-800 truncate">
                                    {u.full_name || "User"}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    {u.email || "—"}
                                    {u.username ? ` • @${u.username}` : ""}
                                  </div>
                                </div>

                                <span
                                  className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${
                                    hasTG
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                      : "bg-rose-50 text-rose-600 border-rose-100"
                                  }`}
                                  title={hasTG ? `Telegram ID: ${u.telegram_id}` : "No Telegram"}
                                >
                                  {hasTG ? <FiCheckCircle /> : <FiSlash />}
                                  {hasTG ? "TG" : "NO TG"}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected user preview */}
                {selectedUser && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-blue-900 truncate">{selectedUser.full_name}</p>
                      <p className="text-xs text-blue-700 truncate">{selectedUser.email}</p>
                    </div>

                    <div className="text-xs font-medium">
                      <span className="text-gray-500">Telegram:</span>{" "}
                      <span className={canSendTelegram ? "text-emerald-600" : "text-rose-600"}>
                        {canSendTelegram ? `Linked (${selectedUser.telegram_id})` : "Not linked"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Channel */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Delivery Channel</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ChannelPill value="telegram_only" label="Telegram only" />
                  <ChannelPill value="telegram_and_site" label="Telegram + site" />
                  <ChannelPill value="site_only" label="Site only" />
                </div>
                {selectedUser && !canSendTelegram && form.channel !== "site_only" && (
                  <div className="text-xs text-rose-600 font-medium">
                    This user has no Telegram ID. Choose <span className="font-bold">Site only</span>.
                  </div>
                )}
              </div>

              {/* Title & Message */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="e.g. System Update"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Message</label>
                  <input
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    placeholder="e.g. Your paper is under review"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                <FiSend />
                {creating ? "Processing..." : "Send Notification"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                disabled={creating}
                className="w-full py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
