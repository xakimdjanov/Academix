import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { articleService } from "../../../services/api";
import { FiFileText, FiClock, FiCheckCircle, FiDollarSign } from "react-icons/fi";

const APC_PRICE = 150;

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const res = await articleService.getAll();

      // ✅ backend formatlari turlicha bo'lishi mumkin
      const raw =
        res?.data?.data ||
        res?.data?.articles ||
        res?.data?.result ||
        res?.data ||
        [];

      const list = Array.isArray(raw) ? raw : [];

      // ✅ optional: newest first (agar backend old->new bo'lsa)
      // Agar backend allaqachon newest-first yuborsa, bu baribir ishlaydi.
      const normalized = [...list].reverse();

      setArticles(normalized);
    } catch (err) {
      console.error("Error loading articles", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Maqolalarni yuklashda xatolik!";
      toast.error(msg);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const total = articles.length;

  const published = useMemo(
    () => articles.filter((a) => a?.apc_paid === true).length,
    [articles]
  );

  const underReview = useMemo(
    () => articles.filter((a) => a?.apc_paid !== true).length,
    [articles]
  );

  const revenue = useMemo(() => published * APC_PRICE, [published]);

  const revenueFormatted = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-US").format(revenue);
    } catch {
      return String(revenue);
    }
  }, [revenue]);

  const recent = useMemo(() => articles.slice(0, 5), [articles]);

  if (loading) return <div className="p-4 sm:p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-5 sm:space-y-6 p-4 sm:p-0">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">
          Journal Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Overview of journal performance
        </p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={loadArticles}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99]"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="Total Submissions"
          value={total}
          icon={<FiFileText />}
        />
        <StatCard
          title="Under Review"
          value={underReview}
          icon={<FiClock />}
        />
        <StatCard
          title="Published"
          value={published}
          icon={<FiCheckCircle />}
        />
        <StatCard
          title="Revenue (APC)"
          value={`$${revenueFormatted}`}
          icon={<FiDollarSign />}
        />
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-semibold">
            Recent Submissions
          </h2>
          <span className="text-xs text-gray-500">
            Showing {Math.min(5, articles.length)} of {articles.length}
          </span>
        </div>

        {/* ✅ Mobile: Card List */}
        <div className="space-y-3 sm:hidden">
          {recent.map((a, idx) => {
            const key = a?.id ?? a?._id ?? `${a?.title || "article"}-${idx}`;
            return (
              <div
                key={String(key)}
                className="rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-gray-800 leading-snug break-words line-clamp-2">
                    {a?.title || "Untitled"}
                  </p>
                  <StatusPill paid={a?.apc_paid === true} />
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <p className="text-[11px] text-gray-400">Author</p>
                    <p className="break-words line-clamp-1">
                      {a?.authors || a?.author || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400">Language</p>
                    <p className="break-words line-clamp-1">
                      {a?.language || "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {articles.length === 0 && (
            <p className="text-gray-400 mt-2">No submissions yet.</p>
          )}
        </div>

        {/* ✅ Desktop/Tablet: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Author</th>
                <th className="py-2 pr-4">Language</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a, idx) => {
                const key = a?.id ?? a?._id ?? `${a?.title || "article"}-${idx}`;
                return (
                  <tr key={String(key)} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-4 max-w-[420px]">
                      <span className="font-medium text-gray-800 break-words line-clamp-1">
                        {a?.title || "Untitled"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-gray-700 break-words line-clamp-1">
                        {a?.authors || a?.author || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-gray-700">{a?.language || "—"}</span>
                    </td>
                    <td className="py-3">
                      <StatusText paid={a?.apc_paid === true} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {articles.length === 0 && (
            <p className="text-gray-400 mt-4">No submissions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

/* ============================= */
/* Reusable Stat Card Component  */
/* ============================= */

const StatCard = ({ title, value, icon }) => {
  // title bo‘yicha ranglarni avtomatik beramiz
  const style = getStatStyle(title);

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-5 flex items-center justify-between hover:shadow-lg transition">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-500">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold mt-1 truncate">{value}</h3>
      </div>
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl ${style.bg} ${style.text} text-lg sm:text-xl shrink-0`}
      >
        {icon}
      </div>
    </div>
  );
};

function getStatStyle(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("total")) return { bg: "bg-blue-500/10", text: "text-blue-600" };
  if (t.includes("review")) return { bg: "bg-yellow-500/10", text: "text-yellow-600" };
  if (t.includes("published")) return { bg: "bg-green-500/10", text: "text-green-600" };
  if (t.includes("revenue") || t.includes("apc")) return { bg: "bg-purple-500/10", text: "text-purple-600" };
  return { bg: "bg-gray-500/10", text: "text-gray-600" };
}

const StatusText = ({ paid }) => {
  return paid ? (
    <span className="text-green-600 font-medium">Published</span>
  ) : (
    <span className="text-yellow-600 font-medium">Under Review</span>
  );
};

const StatusPill = ({ paid }) => {
  return paid ? (
    <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-700">
      Published
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-700">
      Under Review
    </span>
  );
};
