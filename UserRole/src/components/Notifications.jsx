import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiBell, FiCheck, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { notificationService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const StatusBadge = ({ status }) => {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1";

  const map = {
    unread: "bg-blue-50 text-blue-700 ring-blue-200",
    read: "bg-gray-50 text-gray-700 ring-gray-200",
  };

  const statusMapUz = {
    unread: "O'qilmagan",
    read: "O'qilgan",
  };

  const cls = map[status?.toLowerCase()] || "bg-gray-50 text-gray-700 ring-gray-200";
  return <span className={`${base} ${cls}`}>{statusMapUz[status?.toLowerCase()] || status || "Noma'lum"}</span>;
};

const Avatar = ({ src, name, size = 48 }) => {
  const [error, setError] = useState(false);
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";

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
          "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition",
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
      <Tab id="all" label="Hammasi" count={counts.all} />
      <Tab id="unread" label="O'qilmagan" count={counts.unread} />
      <Tab id="read" label="O'qilgan" count={counts.read} />
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
    const myId = getUserIdFromToken();
    if (!myId) {
      setItems([]);
      toast.error("Seans topilmadi yoki token yaroqsiz");
      return;
    }

    setLoading(true);
    try {
      const res = await notificationService.getAll();
      const list = Array.isArray(res?.data) ? res.data : [];

      // Only user's own notifications
      const mine = list.filter((n) => Number(n?.user_id) === Number(myId));

      setItems(mine);
      if (showToast) toast.success("Bildirishnomalar yuklandi");
    } catch (e) {
      toast.error("Bildirishnomalarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  const counts = useMemo(() => {
    const unread = items.filter((n) => (n?.status || "").toLowerCase() === "unread").length;
    const read = items.filter((n) => (n?.status || "").toLowerCase() === "read").length;
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
      return title.includes(q) || msg.includes(q);
    });
  }, [items, tab, query]);

  const markAsRead = async (n) => {
    if (!n?.id) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, status: "read" } : x))
    );

    try {
      await notificationService.update(n.id, { status: "read" });
      toast.success("O'qilgan deb belgilandi");
    } catch (e) {
      // Rollback on error
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, status: n.status } : x))
      );
      toast.error("Holatni yangilashda xatolik yuz berdi");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm">
              <FiBell className="text-gray-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Bildirishnomalar</h1>
              <p className="mt-1 text-sm text-gray-600">
                Jami: <span className="font-semibold">{counts.all}</span> •
                O'qilmagan: <span className="font-semibold">{counts.unread}</span> •
                O'qilgan: <span className="font-semibold">{counts.read}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchNotifications(true)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 transition shadow-sm"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            {loading ? "Yuklanmoqda..." : "Yangilash"}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onChange={setTab} counts={counts} />

          <div className="relative w-full sm:w-80 lg:w-96">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sarlavha yoki xabar bo'yicha qidirish..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
              Bildirishnomalar topilmadi
            </div>
          )}

          {filtered.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={n?.user?.avatar_url}
                    name={n?.user?.full_name || n?.user?.name}
                    size={48}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {n?.title || "Bildirishnoma"}
                      </div>
                      <StatusBadge status={n?.status} />
                    </div>

                    <div className="mt-1 line-clamp-2 text-sm text-gray-700">
                      {n?.message || "—"}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Yaratilgan sana: {formatDate(n?.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    onClick={() => setSelected(n)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                  >
                    Ko'rish
                  </button>

                  {n?.status?.toLowerCase() === "unread" && (
                    <button
                      onClick={() => markAsRead(n)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
                    >
                      <FiCheck size={16} />
                      O'qilgan deb belgilash
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selected?.title || "Bildirishnoma"}
              </h2>

              <button
                onClick={() => setSelected(null)}
                className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 transition"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Holati
                </div>
                <div className="mt-2">
                  <StatusBadge status={selected?.status} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Yaratilgan sana
                </div>
                <div className="mt-2 text-sm text-gray-900">
                  {formatDate(selected?.createdAt)}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Xabar
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {selected?.message || "Xabar mazmuni yo'q"}
              </p>
            </div>

            {selected?.status?.toLowerCase() === "unread" && (
              <button
                onClick={() => markAsRead(selected)}
                className="mt-6 w-full rounded-xl bg-gray-900 py-3 text-white font-semibold hover:bg-black transition flex items-center justify-center gap-2"
              >
                <FiCheck size={18} />
                O'qilgan deb belgilash
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;