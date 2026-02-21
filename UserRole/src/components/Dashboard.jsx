import React, { useEffect, useMemo, useState } from "react";
import {
  FiFileText,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiUpload,
  FiBell,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService, notificationService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

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

const StatCard = ({ title, value, icon }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase">
          {title}
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = useMemo(() => getUserIdFromToken(), []);

  const fetchData = async () => {
    if (!userId) {
      toast.error("User topilmadi");
      return;
    }

    setLoading(true);
    try {
      const [articleRes, notificationRes] = await Promise.all([
        articleService.getAll(),
        notificationService.getAll(),
      ]);

      const allArticles = articleRes?.data || [];
      const myArticles = allArticles.filter(
        (a) => Number(a.user_id) === Number(userId)
      );

      const allNotifications = notificationRes?.data || [];
      const myNotifications = allNotifications.filter(
        (n) => Number(n.user_id) === Number(userId)
      );

      setArticles(myArticles);
      setNotifications(myNotifications);
    } catch (e) {
      toast.error("Dashboard yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 📊 STATISTICS
  const stats = useMemo(() => {
    return {
      total: articles.length,
      review: articles.filter((a) => a.status === "Under Review").length,
      revision: articles.filter((a) => a.status === "Needs Revision").length,
      accepted: articles.filter((a) => a.status === "Accepted").length,
      rejected: articles.filter((a) => a.status === "Rejected").length,
      published: articles.filter((a) => a.status === "Published").length,
    };
  }, [articles]);

  const recentArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [articles]);

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [notifications]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            User Dashboard
          </h1>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* STATISTICS GRID */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Submitted"
            value={stats.total}
            icon={<FiFileText />}
          />
          <StatCard
            title="Under Review"
            value={stats.review}
            icon={<FiClock />}
          />
          <StatCard
            title="Needs Revision"
            value={stats.revision}
            icon={<FiUpload />}
          />
          <StatCard
            title="Accepted"
            value={stats.accepted}
            icon={<FiCheckCircle />}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={<FiXCircle />}
          />
          <StatCard
            title="Published"
            value={stats.published}
            icon={<FiCheckCircle />}
          />
        </div>

        {/* WIDGETS */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Articles */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-900">
              Recent Articles
            </div>

            <div className="mt-4 space-y-3">
              {recentArticles.length === 0 && (
                <div className="text-sm text-gray-600">
                  No articles found
                </div>
              )}

              {recentArticles.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {a.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FiBell />
              Recent Notifications
            </div>

            <div className="mt-4 space-y-3">
              {recentNotifications.length === 0 && (
                <div className="text-sm text-gray-600">
                  No notifications
                </div>
              )}

              {recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {n.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {n.message}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;