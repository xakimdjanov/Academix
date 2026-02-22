import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const normalizeKeywords = (keywords) => {
  if (!keywords) return [];
  if (Array.isArray(keywords)) return keywords;
  if (typeof keywords === "string") {
    try {
      const parsed = JSON.parse(keywords);
      return Array.isArray(parsed) ? parsed : keywords.split(",").map((x) => x.trim()).filter(Boolean);
    } catch {
      return keywords.split(",").map((x) => x.trim()).filter(Boolean);
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
  const cls = map[status] || "bg-gray-50 text-gray-700 ring-gray-200";
  return <span className={`${base} ${cls}`}>{status || "Unknown"}</span>;
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
      toast.error("Token topilmadi yoki yaroqsiz");
      return;
    }

    setLoading(true);
    try {
      const res = await articleService.getAll();
      const list = Array.isArray(res?.data) ? res.data : [];

      const myArticles = list.filter(
        (a) => Number(a?.user_id) === Number(myId)
      );

      setArticles(myArticles);
      if (showToast) toast.success("My articles yuklandi");
    } catch (e) {
      toast.error("Yuklashda xatolik");
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

      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Articles</h1>
            <p className="text-sm text-gray-600">
              Total: <span className="font-semibold">{filtered.length}</span>
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, journal, status..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-gray-300"
              />
            </div>

            <button
              onClick={() => fetchMyArticles(true)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Article Title</th>
                  <th className="px-4 py-3">Journal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      Maqola topilmadi
                    </td>
                  </tr>
                )}

                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {a?.title || "-"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Category: {a?.category || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {a?.journal?.name || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={a?.status} />
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(a?.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(a?.updatedAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/articles/${a.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          <FiEye />
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelected(a)}
                          className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
                        >
                          Quick view
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            <div>Showing: {filtered.length}</div>
            <div>{loading ? "Loading..." : "Ready"}</div>
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
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
                  {selected?.title || "Article"}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Journal: {selected?.journal?.name || "-"}
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
                <div className="text-xs font-semibold text-gray-500">Language</div>
                <div className="mt-1 text-sm text-gray-900">
                  {selected?.language || "-"}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <div className="text-xs font-semibold text-gray-500">Submitted</div>
                <div className="mt-1 text-sm text-gray-900">
                  {formatDate(selected?.createdAt)}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <div className="text-xs font-semibold text-gray-500">Updated</div>
                <div className="mt-1 text-sm text-gray-900">
                  {formatDate(selected?.updatedAt)}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-3">
              <div className="text-xs font-semibold text-gray-500">Abstract</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                {selected?.abstract || "-"}
              </p>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500">Keywords</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {normalizeKeywords(selected?.keywords).length === 0 ? (
                  <span className="text-sm text-gray-600">-</span>
                ) : (
                  normalizeKeywords(selected?.keywords).map((k, idx) => (
                    <span
                      key={`${k}-${idx}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      {k}
                    </span>
                  ))
                )}
              </div>
            </div>

            {selected?.file_url && (
              <div className="mt-4 rounded-xl border border-gray-200 p-3">
                <div className="text-xs font-semibold text-gray-500">File</div>
                <a
                  href={selected.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  Open file
                </a>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <Link
                to={`/articles/${selected.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                onClick={() => setSelected(null)}
              >
                <FiEye />
                Open full details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyArticles;