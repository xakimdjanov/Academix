import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { articleService, journalService } from "../../../services/api";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiEye,
} from "react-icons/fi";

const APC_PRICE = 150;
const DETAILS_BASE_PATH = "/articledetails";

const Dashboard = () => {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const parseList = (res) => {
    const raw =
      res?.data?.data ??
      res?.data?.articles ??
      res?.data?.journals ??
      res?.data?.result ??
      res?.data ??
      [];
    return Array.isArray(raw) ? raw : [];
  };

  const getId = (x) => x?.id ?? x?._id ?? x?.article_id ?? x?.journal_id;

  const getTime = (a) => {
    const t =
      a?.created_at ||
      a?.createdAt ||
      a?.updated_at ||
      a?.updatedAt ||
      a?.submitted_at ||
      a?.submittedAt;
    const ms = t ? new Date(t).getTime() : 0;
    return Number.isFinite(ms) ? ms : 0;
  };

  const normalizeStatus = (s) => {
    const v = String(s || "").trim().toLowerCase();
    if (v === "submitted") return "Submitted";
    if (v === "under review" || v === "under_review" || v === "review") return "Under Review";
    if (v === "needs revision" || v === "needs_revision" || v === "revision") return "Needs Revision";
    if (v === "accepted" || v === "approve" || v === "approved") return "Accepted";
    if (v === "rejected" || v === "reject") return "Rejected";
    return s ? String(s) : "Submitted";
  };

  const goDetails = (article) => {
    const id = getId(article);
    if (!id) return toast.error("Article ID topilmadi");
    navigate(`${DETAILS_BASE_PATH}/${id}`);
  };

  const loadArticles = async () => {
    try {
      setLoading(true);

      if (!myAdminId) {
        toast.error("journal_admin_id topilmadi. Qayta login qiling.");
        setArticles([]);
        return;
      }

      // 1) Admin yaratgan journals
      const jr = await journalService.getAll();
      const journals = parseList(jr);

      const myJournalIds = journals
        .filter((j) => String(j?.journal_admin_id) === String(myAdminId))
        .map((j) => String(getId(j)))
        .filter(Boolean);

      if (myJournalIds.length === 0) {
        setArticles([]);
        return;
      }

      // 2) Articlelar -> faqat shu journal_id lar
      const ar = await articleService.getAll();
      const list = parseList(ar);

      const mine = list
        .filter((a) => myJournalIds.includes(String(a?.journal_id)))
        .map((a) => ({ ...a, status: normalizeStatus(a?.status) }));

      // newest first (by time if exists; fallback reverse)
      const withAnyDate = mine.some((a) => getTime(a) > 0);
      const newestFirst = withAnyDate
        ? [...mine].sort((x, y) => getTime(y) - getTime(x))
        : [...mine].reverse();

      setArticles(newestFirst);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== Stats (STATUS based) ======
  const total = articles.length;

  const submitted = useMemo(
    () => articles.filter((a) => normalizeStatus(a?.status) === "Submitted").length,
    [articles]
  );

  const underReview = useMemo(
    () => articles.filter((a) => normalizeStatus(a?.status) === "Under Review").length,
    [articles]
  );

  const needsRevision = useMemo(
    () => articles.filter((a) => normalizeStatus(a?.status) === "Needs Revision").length,
    [articles]
  );

  const accepted = useMemo(
    () => articles.filter((a) => normalizeStatus(a?.status) === "Accepted").length,
    [articles]
  );

  const rejected = useMemo(
    () => articles.filter((a) => normalizeStatus(a?.status) === "Rejected").length,
    [articles]
  );

  // Revenue default: Accepted * APC_PRICE
  const revenue = useMemo(() => accepted * APC_PRICE, [accepted]);

  const revenueFormatted = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-US").format(revenue);
    } catch {
      return String(revenue);
    }
  }, [revenue]);

  const recent = useMemo(() => articles.slice(0, 5), [articles]);

  if (loading) return <DashboardLoading />;

  return (
    <div className="space-y-5 sm:space-y-6 p-4 sm:p-0">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">
          Journal Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Only articles for journals you created
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
        <StatCard title="Total Submissions" value={total} icon={<FiFileText />} />
        <StatCard title="Under Review" value={underReview} icon={<FiClock />} />
        <StatCard title="Accepted" value={accepted} icon={<FiCheckCircle />} />
        <StatCard title="Revenue (APC)" value={`$${revenueFormatted}`} icon={<FiDollarSign />} />
      </div>

      {/* Extra status pills (optional) */}
      <div className="flex flex-wrap gap-2">
        <MiniPill label="Submitted" value={submitted} tone="blue" />
        <MiniPill label="Needs Revision" value={needsRevision} tone="amber" />
        <MiniPill label="Rejected" value={rejected} tone="rose" />
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-semibold">Recent Submissions</h2>
          <span className="text-xs text-gray-500">
            Showing {Math.min(5, articles.length)} of {articles.length}
          </span>
        </div>

        {/* Mobile: Card List */}
        <div className="space-y-3 sm:hidden">
          {recent.map((a, idx) => {
            const key = getId(a) ?? `${a?.title || "article"}-${idx}`;
            const status = normalizeStatus(a?.status);

            return (
              <div
                key={String(key)}
                onClick={() => goDetails(a)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") goDetails(a);
                }}
                className="rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-gray-800 leading-snug break-words line-clamp-2">
                    {a?.title || "Untitled"}
                  </p>
                  <StatusPill status={status} />
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <p className="text-[11px] text-gray-400">Author</p>
                    <p className="break-words line-clamp-1">{a?.authors || a?.author || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400">Language</p>
                    <p className="break-words line-clamp-1">{a?.language || "—"}</p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goDetails(a);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#002147] hover:text-white transition"
                  >
                    <FiEye /> View
                  </button>
                </div>
              </div>
            );
          })}

          {articles.length === 0 && <p className="text-gray-400 mt-2">No submissions yet.</p>}
        </div>

        {/* Desktop/Tablet: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Author</th>
                <th className="py-2 pr-4">Language</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 text-right">View</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((a, idx) => {
                const key = getId(a) ?? `${a?.title || "article"}-${idx}`;
                const status = normalizeStatus(a?.status);

                return (
                  <tr key={String(key)} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-4 max-w-[420px]">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => goDetails(a)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") goDetails(a);
                        }}
                        className="font-medium text-gray-800 break-words line-clamp-1 cursor-pointer hover:underline"
                      >
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

                    <td className="py-3 pr-4">
                      <StatusText status={status} />
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => goDetails(a)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#002147] hover:text-white transition"
                        title="View Details"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {articles.length === 0 && <p className="text-gray-400 mt-4">No submissions yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

/* ============================= */
/* Loading / Skeleton UI         */
/* ============================= */

const DashboardLoading = () => {
  return (
    <div className="space-y-5 sm:space-y-6 p-4 sm:p-0">
      <div className="space-y-2">
        <div className="h-6 w-52 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-4 w-64 rounded-lg bg-gray-100 animate-pulse" />
      </div>

      <div className="flex justify-end">
        <div className="h-9 w-24 rounded-xl bg-gray-100 border border-gray-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="h-5 w-44 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-4 w-28 rounded-lg bg-gray-100 animate-pulse" />
        </div>

        <div className="space-y-3 sm:hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-3 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-gray-100 animate-pulse" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                  <div className="mt-1 h-4 w-28 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="ml-auto h-3 w-16 rounded bg-gray-100 animate-pulse" />
                  <div className="mt-1 ml-auto h-4 w-20 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <div className="w-full">
            <div className="h-9 w-full rounded-xl bg-gray-100 mb-2 animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-gray-50 mb-2 animate-pulse" />
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" />
        </div>

        <p className="mt-3 text-center text-sm text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );
};

const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-5 flex items-center justify-between">
      <div className="min-w-0 w-full">
        <div className="h-3 w-28 rounded bg-gray-100 animate-pulse" />
        <div className="mt-2 h-7 w-16 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
    </div>
  );
};

/* ============================= */
/* Reusable Stat Card Component  */
/* ============================= */

const StatCard = ({ title, value, icon }) => {
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
  if (t.includes("accepted")) return { bg: "bg-green-500/10", text: "text-green-600" };
  if (t.includes("revenue") || t.includes("apc"))
    return { bg: "bg-purple-500/10", text: "text-purple-600" };
  return { bg: "bg-gray-500/10", text: "text-gray-600" };
}

/* ============================= */
/* Status UI                      */
/* ============================= */

const StatusText = ({ status }) => {
  const s = String(status || "");
  const cls =
    s === "Accepted"
      ? "text-green-600"
      : s === "Rejected"
      ? "text-rose-600"
      : s === "Needs Revision"
      ? "text-amber-600"
      : s === "Under Review"
      ? "text-yellow-600"
      : "text-blue-600";
  return <span className={`${cls} font-medium`}>{s || "Submitted"}</span>;
};

const StatusPill = ({ status }) => {
  const s = String(status || "Submitted");
  const cls =
    s === "Accepted"
      ? "bg-green-500/10 text-green-700"
      : s === "Rejected"
      ? "bg-rose-500/10 text-rose-700"
      : s === "Needs Revision"
      ? "bg-amber-500/10 text-amber-700"
      : s === "Under Review"
      ? "bg-yellow-500/10 text-yellow-700"
      : "bg-blue-500/10 text-blue-700";

  return (
    <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${cls}`}>
      {s}
    </span>
  );
};

const MiniPill = ({ label, value, tone }) => {
  const cls =
    tone === "blue"
      ? "bg-blue-500/10 text-blue-700"
      : tone === "amber"
      ? "bg-amber-500/10 text-amber-700"
      : tone === "rose"
      ? "bg-rose-500/10 text-rose-700"
      : "bg-gray-500/10 text-gray-700";

  return (
    <div className={`px-3 py-2 rounded-2xl text-xs font-bold ${cls}`}>
      {label}: <span className="font-black">{value}</span>
    </div>
  );
};
