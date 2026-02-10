import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { journalService, articleService } from "../../../services/api";
import {
  FiRefreshCw,
  FiCalendar,
  FiBarChart2,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

/* ---------------- Helpers ---------------- */
function getArticleDate(a) {
  const raw =
    a?.createdAt ||
    a?.created_at ||
    a?.submitted_at ||
    a?.submittedAt ||
    a?.date ||
    null;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(yyyyMM) {
  const [y, m] = yyyyMM.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("en-US", { month: "short" });
}

/* ---------------- UI Components ---------------- */
const StatCard = ({ title, value, sub, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-2">
      {Icon && (
        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
          <Icon size={16} />
        </div>
      )}
      <p className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
        {title}
      </p>
    </div>
    <div className="flex items-end justify-between gap-3">
      <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
      {sub ? (
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold text-right">
          {sub}
        </p>
      ) : null}
    </div>
  </div>
);

const ModeBtn = ({ active, onClick, icon, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "w-1/2 sm:w-auto flex-1 sm:flex-none inline-flex items-center justify-center gap-2",
      "rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-black transition-all border",
      active
        ? "bg-[#002147] text-white border-[#002147] shadow-lg shadow-blue-900/20"
        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
    ].join(" ")}
  >
    {icon}
    {children}
  </button>
);

/* ---------------- Main ---------------- */
const JournalReports = () => {
  const [mode, setMode] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [articles, setArticles] = useState([]);

  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  // ✅ simple responsive flag (JS)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!myAdminId) {
        toast.error("Admin ID not found. Please re-login.");
        setArticles([]);
        return;
      }

      const [jr, ar] = await Promise.all([
        journalService.getAll(),
        articleService.getAll(),
      ]);

      const jRaw = jr?.data?.data || jr?.data?.journals || jr?.data || [];
      const jList = Array.isArray(jRaw) ? jRaw : [];
      setJournals(jList);

      const myJournalIds = jList
        .filter((j) => String(j?.journal_admin_id) === String(myAdminId))
        .map((j) => String(j?.id ?? j?._id ?? j?.journal_id))
        .filter(Boolean);

      const aRaw = ar?.data?.data || ar?.data?.articles || ar?.data || [];
      const aList = Array.isArray(aRaw) ? aRaw : [];

      const mine =
        myJournalIds.length === 0
          ? []
          : aList.filter((a) => myJournalIds.includes(String(a?.journal_id)));

      setArticles(mine);
    } catch (e) {
      toast.error("Failed to load analytics");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(ymd(d));
    }
    const counts = Object.fromEntries(days.map((k) => [k, 0]));
    for (const a of articles) {
      const d = getArticleDate(a);
      if (!d) continue;
      const key = ymd(d);
      if (key in counts) counts[key] += 1;
    }
    return days.map((k) => ({ label: k.slice(5), count: counts[k] }));
  }, [articles]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(monthKey(d));
    }
    const counts = Object.fromEntries(months.map((k) => [k, 0]));
    for (const a of articles) {
      const d = getArticleDate(a);
      if (!d) continue;
      const key = monthKey(d);
      if (key in counts) counts[key] += 1;
    }
    return months.map((k) => ({ label: monthLabel(k), count: counts[k] }));
  }, [articles]);

  const chartData = mode === "weekly" ? weeklyData : monthlyData;

  const total = articles.length;
  const paid = articles.filter((a) => a?.apc_paid === true).length;
  const unpaid = total - paid;

  const peak = useMemo(() => Math.max(...chartData.map((d) => d.count), 0), [chartData]);
  const avg = useMemo(
    () => (total / (mode === "weekly" ? 7 : 12)).toFixed(1),
    [total, mode]
  );
  const payRate = useMemo(
    () => (total > 0 ? `${Math.round((paid / total) * 100)}%` : "0%"),
    [total, paid]
  );

  if (loading)
    return (
      <div className="flex h-72 sm:h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="max-w-[1200px] mx-auto space-y-5 sm:space-y-6 px-3 sm:px-6 md:px-8 py-4 sm:py-8">
      {/* Header Card */}
      <div className="rounded-3xl md:rounded-[32px] bg-gradient-to-br from-[#002147] to-[#003a7a] p-5 sm:p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-blue-100/80 text-xs sm:text-sm md:text-base font-medium">
              Real-time statistics for your academic journals
            </p>
          </div>

          <button
            onClick={loadData}
            type="button"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 sm:px-6 py-3 rounded-2xl transition-all font-black text-sm active:scale-[0.99]"
          >
            <FiRefreshCw /> Refresh Data
          </button>
        </div>

        {/* ✅ Mobile: 2 cols, Desktop: 3 cols */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
          <MiniStat title="Total Manuscripts" value={total} tone="blue" />
          <MiniStat title="APC Collected" value={paid} tone="green" />
          <MiniStat title="Pending Payment" value={unpaid} tone="rose" className="col-span-2 sm:col-span-1" />
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <ModeBtn active={mode === "weekly"} onClick={() => setMode("weekly")} icon={<FiCalendar />}>
          Weekly
        </ModeBtn>
        <ModeBtn active={mode === "monthly"} onClick={() => setMode("monthly")} icon={<FiBarChart2 />}>
          Monthly
        </ModeBtn>
      </div>

      {/* Chart Section */}
      <div className="rounded-3xl md:rounded-[32px] border border-slate-100 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-black text-slate-800">
            Submission Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold">
            {mode === "weekly"
              ? "Daily breakdown of the last 7 days"
              : "Monthly breakdown for the past year"}
          </p>
        </div>

        <div className="h-[260px] sm:h-[340px] md:h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={
                isMobile
                  ? { top: 8, right: 8, left: -30, bottom: 0 }
                  : { top: 10, right: 10, left: -20, bottom: 0 }
              }
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#002147" stopOpacity={1} />
                  <stop offset="100%" stopColor="#004a99" stopOpacity={0.85} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: isMobile ? 10 : 12,
                  fontWeight: 700,
                }}
                interval={isMobile ? 1 : 0}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: isMobile ? 10 : 12,
                  fontWeight: 700,
                }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontWeight: 700,
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={isMobile ? (mode === "weekly" ? 18 : 14) : mode === "weekly" ? 40 : 30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Activity Peak" value={peak} sub="Highest in period" icon={FiTrendingUp} />
        <StatCard title="Avg. Submissions" value={avg} sub="Per unit time" icon={FiClock} />
        <StatCard title="Payment Rate" value={payRate} sub="Successful APC" icon={FiCheckCircle} />
      </div>
    </div>
  );
};

export default JournalReports;

/* ---------------- Mini Stat (header cards) ---------------- */
const MiniStat = ({ title, value, tone = "blue", className = "" }) => {
  const toneCls =
    tone === "green"
      ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-100"
      : tone === "rose"
      ? "bg-rose-500/20 border-rose-500/20 text-rose-100"
      : "bg-white/10 border-white/10 text-blue-100";

  return (
    <div className={`backdrop-blur-md p-4 sm:p-5 rounded-2xl border ${toneCls} ${className}`}>
      <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-90">
        {title}
      </p>
      <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{value}</p>
    </div>
  );
};
