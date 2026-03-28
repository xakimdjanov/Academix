import React, { useEffect, useMemo, useState } from "react";
import {
  FiFileText,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiUpload,
  FiBell,
  FiArrowUpRight,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService, notificationService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";
import { useNavigate } from "react-router-dom";

const formatBadge = (n) => (n > 99 ? "99+" : String(n));

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

const StatCard = ({ title, value, icon, hint }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          {title}
        </div>
        <div className="mt-2 text-2xl font-extrabold text-gray-900">
          {value}
        </div>
        {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = useMemo(() => getUserIdFromToken(), []);

  const fetchData = async () => {
    if (!userId) {
      toast.error("Foydalanuvchi topilmadi");
      return;
    }

    setLoading(true);
    try {
      const [articleRes, notificationRes] = await Promise.all([
        articleService.getAll(),
        notificationService.getAll(),
      ]);

      const allArticles = Array.isArray(articleRes?.data) ? articleRes.data : [];
      const myArticles = allArticles.filter(
        (a) => Number(a.user_id) === Number(userId)
      );

      const allNotifications = Array.isArray(notificationRes?.data)
        ? notificationRes.data
        : [];
      const myNotifications = allNotifications.filter(
        (n) => Number(n.user_id) === Number(userId)
      );

      setArticles(myArticles);
      setNotifications(myNotifications);
    } catch (e) {
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Statistics calculation
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

  const unreadNotifCount = useMemo(() => {
    return notifications.filter(
      (n) => String(n?.status || "").toLowerCase() === "unread"
    ).length;
  }, [notifications]);

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

      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl sm:text-2xl font-bold text-gray-900">
                  Mening boshqaruv panelim
                </h1>

                {unreadNotifCount > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                    <FiBell />
                    {formatBadge(unreadNotifCount)} ta o'qilmagan
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Maqolalaringiz holati va so'nggi yangilanishlarni kuzatib boring
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate("/notifications")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                <FiBell />
                Bildirishnomalar
                <FiArrowUpRight />
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                Yangilash
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* STATISTICS GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Jami yuborilgan"
            value={stats.total}
            icon={<FiFileText />}
            hint="Barcha yuborilgan maqolalar"
          />
          <StatCard
            title="Taqrizda"
            value={stats.review}
            icon={<FiClock />}
            hint="Hozirda taqriz jarayonida"
          />
          <StatCard
            title="Tahrirda"
            value={stats.revision}
            icon={<FiUpload />}
            hint="Tahrir qilish lozim"
          />
          <StatCard
            title="Qabul qilingan"
            value={stats.accepted}
            icon={<FiCheckCircle />}
            hint="Qabul qilingan maqolalar"
          />
          <StatCard
            title="Rad etilgan"
            value={stats.rejected}
            icon={<FiXCircle />}
            hint="Rad etilgan maqolalar"
          />
          <StatCard
            title="Nashr etilgan"
            value={stats.published}
            icon={<FiCheckCircle />}
            hint="Nashr etilgan maqolalar"
          />
        </div>

        {/* WIDGETS */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Articles */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-gray-900">
                So'nggi maqolalar
              </div>
              <button
                onClick={() => navigate("/my-articles")}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Hammasini ko'rish
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recentArticles.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-600">
                  Maqolalar topilmadi
                </div>
              )}

              {recentArticles.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-3 hover:bg-gray-50 transition"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <FiBell />
                So'nggi bildirishnomalar
              </div>
              <button
                onClick={() => navigate("/notifications")}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Hammasini ko'rish
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recentNotifications.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-600">
                  Hozircha bildirishnomalar yo'q
                </div>
              )}

              {recentNotifications.map((n) => {
                const isUnread =
                  String(n?.status || "").toLowerCase() === "unread";

                return (
                  <div
                    key={n.id}
                    className={[
                      "rounded-2xl border p-3 transition",
                      isUnread
                        ? "border-blue-100 bg-blue-50/40"
                        : "border-gray-100 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={[
                              "h-2.5 w-2.5 rounded-full",
                              isUnread ? "bg-blue-600" : "bg-gray-300",
                            ].join(" ")}
                          />
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {n.title}
                          </div>
                          {isUnread && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              OʻQILMAGAN
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {n.message}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile helper text */}
        <div className="mt-6 text-center text-xs text-gray-500 sm:hidden">
          Maslahat: Yangilash uchun "Yangilash" tugmasini bosing • O'qilmagan bildirishnomalar belgi shaklida ko'rinadi
        </div>
      </div>
    </div>
  );
};

export default Dashboard;