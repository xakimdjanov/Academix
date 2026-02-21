import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiBell, FiCheck, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { notificationService } from "../services/api"; // yo'lingizga moslang

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const StatusBadge = ({ status }) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1";
  const map = {
    unread: "bg-blue-50 text-blue-700 ring-blue-200",
    read: "bg-gray-50 text-gray-700 ring-gray-200",
  };
  const cls = map[status] || "bg-gray-50 text-gray-700 ring-gray-200";
  return <span className={`${base} ${cls}`}>{status || "unknown"}</span>;
};

// Avatar: rasm ishlamasa yoki yo'q bo'lsa bosh harf
const Avatar = ({ src, name, size = 48 }) => {
  const [error, setError] = useState(false);
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  // name bo'yicha barqaror rang tanlash
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center overflow-hidden rounded-2xl border border-gray-200 font-semibold ${color}`}
    >
      {src && !error ? (
        <img
          src={src}
          alt={name || "avatar"}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm">{initial}</span>
      )}
    </div>
  );
};

const Tabs = ({ value, onChange, counts }) => {
  const Tab = ({ id, label, count }) => {
    const active = value === id;
    return (
      <button
        onClick={() => onChange(id)}
        className={[
          "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border",
          active
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50",
        ].join(" ")}
      >
        <span>{label}</span>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700",
          ].join(" ")}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Tab id="all" label="All" count={counts.all} />
      <Tab id="unread" label="Unread" count={counts.unread} />
      <Tab id="read" label="Read" count={counts.read} />
    </div>
  );
};

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchNotifications = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      const list = Array.isArray(res?.data) ? res.data : [];
      setItems(list);
      if (showToast) toast.success("Notifications yuklandi");
    } catch (e) {
      toast.error("Yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  const counts = useMemo(() => {
    const unread = items.filter((n) => n?.status === "unread").length;
    const read = items.filter((n) => n?.status === "read").length;
    return { all: items.length, unread, read };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = items;

    if (tab !== "all") {
      list = list.filter((n) => (n?.status || "").toLowerCase() === tab);
    }

    if (!q) return list;

    return list.filter((n) => {
      const title = (n?.title || "").toLowerCase();
      const msg = (n?.message || "").toLowerCase();
      const name = (n?.user?.full_name || "").toLowerCase();
      const email = (n?.user?.email || "").toLowerCase();
      return (
        title.includes(q) ||
        msg.includes(q) ||
        name.includes(q) ||
        email.includes(q)
      );
    });
  }, [items, tab, query]);

  const markAsRead = async (n) => {
    if (!n?.id) return;

    // optimistic update
    setItems((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, status: "read" } : x))
    );

    try {
      await notificationService.update(n.id, { status: "read" });
      toast.success("Read qilindi");
    } catch (e) {
      // revert
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, status: n.status } : x))
      );
      toast.error("Update xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-gray-200">
              <FiBell />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-600">
                All: <span className="font-semibold">{counts.all}</span> •
                Unread:{" "}
                <span className="font-semibold">{counts.unread}</span> • Read:{" "}
                <span className="font-semibold">{counts.read}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchNotifications(true)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onChange={setTab} counts={counts} />

          <div className="relative w-full sm:w-96">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, message, user..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-gray-300"
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
              Hech narsa topilmadi
            </div>
          )}

          {filtered.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={n?.user?.avatar_url}
                    name={n?.user?.full_name}
                    size={48}
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {n?.title || "-"}
                      </div>
                      <StatusBadge status={n?.status} />
                    </div>

                    <div className="mt-1 line-clamp-2 text-sm text-gray-700">
                      {n?.message || "-"}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>
                        User:{" "}
                        <span className="font-semibold text-gray-700">
                          {n?.user?.full_name || "-"}
                        </span>
                      </span>
                      <span>Email: {n?.user?.email || "-"}</span>
                      <span>Created: {formatDate(n?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    onClick={() => setSelected(n)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    View
                  </button>

                  {n?.status === "unread" && (
                    <button
                      onClick={() => markAsRead(n)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                    >
                      <FiCheck />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selected?.title || "Notification"}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  From: {selected?.user?.full_name || "-"} •{" "}
                  {selected?.user?.email || "-"}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                <FiX />
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="text-xs font-semibold text-gray-500">Status</div>
                <div className="mt-2">
                  <StatusBadge status={selected?.status} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <div className="text-xs font-semibold text-gray-500">Created</div>
                <div className="mt-1 text-sm text-gray-900">
                  {formatDate(selected?.createdAt)}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-3">
              <div className="text-xs font-semibold text-gray-500">Message</div>
              <p className="mt-1 text-sm text-gray-800">
                {selected?.message || "-"}
              </p>
            </div>

            {selected?.status === "unread" && (
              <button
                onClick={() => markAsRead(selected)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                <FiCheck />
                Mark as read
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 