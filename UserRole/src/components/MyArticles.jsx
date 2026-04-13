import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiRefreshCw, FiSearch, FiX, FiCheckCircle, FiClock, FiMessageSquare } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const Timeline = ({ status }) => {
  const steps = [
    { key: "Submitted", label: "Yuborilgan" },
    { key: "Under Review", label: "Taqriz jarayonida" },
    { key: "Needs Revision", label: "Tuzatish kiritilishi kerak" },
    { key: "Accepted", label: "Qabul qilingan" },
    { key: "Published", label: "Nashr etilgan" },
  ];
  const rejected = status === "Rejected";
  const indexOf = (k) => steps.findIndex((s) => s.key === k);
  const currentIndex = rejected ? indexOf("Under Review") : indexOf(status);

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
      <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Holat xronologiyasi</div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {steps.map((s, idx) => {
          const done = !rejected && currentIndex >= idx;
          const active = !rejected && status === s.key;
          return (
            <div key={s.key} className="flex flex-col items-center text-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  done ? "bg-gray-900 border-gray-900 text-white shadow-lg" : 
                  active ? "border-gray-900 text-gray-900 animate-pulse" : "border-gray-200 text-gray-300"
                }`}>
                {done ? <FiCheckCircle size={18} /> : <FiClock size={18} />}
              </div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-tighter ${done || active ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const normalizeKeywords = (keywords) => {
  if (!keywords) return [];
  if (Array.isArray(keywords)) return keywords;
  if (typeof keywords === "string") {
    try {
      const parsed = JSON.parse(keywords);
      return Array.isArray(parsed)
        ? parsed
        : keywords
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
    } catch {
      return keywords
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const StatusBadge = ({ status }) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1";

  const map = {
    Submitted: "bg-gray-50 text-gray-700 ring-gray-200",
    "Under Review": "bg-blue-50 text-blue-700 ring-blue-200",
    "Needs Revision": "bg-amber-50 text-amber-700 ring-amber-200",
    Accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    Published: "bg-purple-50 text-purple-700 ring-purple-200",
  };

  const statusMapUz = {
    Submitted: "Yuborilgan",
    "Under Review": "Taqrizda",
    "Needs Revision": "Tahrirda",
    Accepted: "Qabul qilingan",
    Rejected: "Rad etilgan",
    Published: "Nashr etilgan",
  };

  const cls = map[status] || "bg-gray-50 text-gray-700 ring-gray-200";
  return <span className={`${base} ${cls}`}>{statusMapUz[status] || status || "Noma'lum"}</span>;
};

const MyArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchMyArticles = useCallback(async (showToast = false) => {
    const myId = getUserIdFromToken();

    if (!myId) {
      setArticles([]);
      toast.error("Seans topilmadi yoki token yaroqsiz");
      return;
    }

    setLoading(true);
    try {
      const res = await articleService.getAll();
      const list = Array.isArray(res?.data) ? res.data : [];

      const myArticles = list.filter(
        (a) => Number(a?.user_id) === Number(myId),
      );

      setArticles(myArticles);
      if (showToast) toast.success("Maqolalaringiz yuklandi");
    } catch (e) {
      toast.error("Maqolalarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyArticles(false);
  }, [fetchMyArticles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;

    return articles.filter((a) => {
      const title = (a?.title || "").toLowerCase();
      const journal = (a?.journal?.name || "").toLowerCase();
      const status = (a?.status || "").toLowerCase();
      return title.includes(q) || journal.includes(q) || status.includes(q);
    });
  }, [articles, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Mening maqolalarim
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Jami: <span className="font-semibold">{filtered.length}</span>
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80 lg:w-96">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sarlavha, jurnal yoki holat bo'yicha qidirish..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition"
              />
            </div>

            <button
              onClick={() => fetchMyArticles(true)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 transition shadow-sm"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "Yuklanmoqda..." : "Yangilash"}
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Maqola sarlavhasi
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Jurnal
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Holati
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Yuborilgan
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Yangilangan
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Amallar
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      Maqolalar topilmadi
                    </td>
                  </tr>
                )}

                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {a?.title || "—"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Toifa: {a?.category || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {a?.journal?.name || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={a?.status} />
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(a?.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(a?.updatedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/articles/${a.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                        >
                          <FiEye size={16} />
                          Ko'rish
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelected(a)}
                          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition"
                        >
                          Tezkor ko'rish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
            <div>{filtered.length} ta maqola ko'rsatilmoqda</div>
            <div>{loading ? "Yuklanmoqda..." : "Tayyor"}</div>
          </div>
        </div>
      </div>

      {/* Quick View Modal - Improved & User-Friendly */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold line-clamp-2">
                    {selected?.title || "Maqola tafsilotlari"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-300 opacity-90">
                    {selected?.journal?.name || "—"}
                  </p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="mt-1 rounded-full p-2 text-gray-300 hover:bg-white/10 transition"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="grid gap-8 sm:grid-cols-2">
                {/* Left column - Key Info */}
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Holati
                    </div>
                    <StatusBadge status={selected?.status} />
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Til
                    </div>
                    <div className="text-base font-medium text-gray-900">
                      {selected?.language || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Yuborilgan sana
                    </div>
                    <div className="text-base text-gray-700">
                      {formatDate(selected?.createdAt)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      So'nggi yangilanish
                    </div>
                    <div className="text-base text-gray-700">
                      {formatDate(selected?.updatedAt)}
                    </div>
                  </div>
                </div>

                {/* Right column - Abstract & Keywords */}
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Annotatsiya
                    </div>
                    <div className="max-h-56 overflow-y-auto rounded-xl bg-gray-50 p-5 text-sm text-gray-800 border border-gray-200 leading-relaxed">
                      {selected?.abstract || "Annotatsiya berilmagan."}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Kalit so'zlar
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {normalizeKeywords(selected?.keywords).length === 0 ? (
                        <span className="text-sm text-gray-500 italic">
                          Kalit so'zlar qo'shilmagan
                        </span>
                      ) : (
                        normalizeKeywords(selected?.keywords).map((k, idx) => (
                          <span
                            key={`${k}-${idx}`}
                            className="rounded-full bg-blue-50/70 px-4 py-1.5 text-sm font-medium text-blue-700 border border-blue-100"
                          >
                            {k}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                 <Timeline status={selected?.status} />
              </div>

              {/* Editor Comments Section */}
              {selected?.editor_comment && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                    <FiMessageSquare className="text-amber-500" /> Tahririyat izohlari
                  </div>
                  <div className="rounded-xl bg-amber-50 p-5 text-sm text-amber-900 border border-amber-100 leading-relaxed italic">
                    {selected.editor_comment}
                  </div>
                </div>
              )}

              {/* File Section */}
              {selected?.file_url && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                    Qo'lyozma fayli
                  </div>
                  <a
                    href={selected.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 rounded-xl bg-gray-100 px-6 py-4 text-base font-medium text-gray-800 hover:bg-gray-200 transition shadow-sm hover:shadow"
                  >
                    <FiEye size={20} />
                    Qo'lyozmani ochish / yuklab olish
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-5 flex justify-end">
              <Link
                to={`/dashboard/my-articles/${selected.id}`}
                className="inline-flex items-center gap-3 rounded-xl bg-gray-900 px-8 py-4 text-base font-semibold text-white hover:bg-black transition shadow-md"
                onClick={() => setSelected(null)}
              >
                <FiEye size={20} />
                Maqolaning to'liq sahifasini ko'rish
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyArticles;
