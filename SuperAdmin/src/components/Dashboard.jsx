import React, { useEffect, useMemo, useState, useRef } from "react";
import { 
  FiUsers, FiBookOpen, FiBell, FiClock, FiCheckCircle, 
  FiFileText, FiShield, FiTrendingUp, FiActivity, FiLayers,
  FiArrowRight, FiCheck, FiX, FiInfo
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Chart, registerables } from "chart.js";
import { 
  userService, 
  journalService, 
  notificationService, 
  auditLogService, 
  articleService, 
  journalAdminService 
} from "../services/api";

Chart.register(...registerables);

const Dashboard = () => {
  const [data, setData] = useState({ 
    users: [], 
    journals: [], 
    notifications: [], 
    logs: [],
    articles: [],
    journalAdmins: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("articles");
  const navigate = useNavigate();

  const articlesChartRef = useRef(null);
  const journalsChartRef = useRef(null);
  const usersChartRef = useRef(null);

  const articlesChartInstance = useRef(null);
  const journalsChartInstance = useRef(null);
  const usersChartInstance = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, jRes, nRes, lRes, aRes, jaRes] = await Promise.all([
        userService.getAll(),
        journalService.getAll(),
        notificationService.getAll(),
        auditLogService.getAll(),
        articleService.getAll(),
        journalAdminService.getAll(),
      ]);

      const parse = (res) => res?.data?.data || res?.data?.result || res?.data?.payload || res?.data || [];

      setData({
        users: Array.isArray(parse(uRes)) ? parse(uRes) : [],
        journals: Array.isArray(parse(jRes)) ? parse(jRes) : [],
        notifications: Array.isArray(parse(nRes)) ? parse(nRes) : [],
        logs: Array.isArray(parse(lRes)) ? parse(lRes) : [],
        articles: Array.isArray(parse(aRes)) ? parse(aRes) : [],
        journalAdmins: Array.isArray(parse(jaRes)) ? parse(jaRes) : [],
      });
    } catch (e) {
      toast.error("Failed to load dashboard data");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;

    // 1. Articles Chart
    if (articlesChartRef.current) {
      if (articlesChartInstance.current) articlesChartInstance.current.destroy();

      const articles = data.articles;
      const counts = {
        published: articles.filter(a => ['published', 'nashr etilgan'].includes(String(a.status || '').toLowerCase())).length,
        accepted: articles.filter(a => ['accepted', 'qabul qilingan'].includes(String(a.status || '').toLowerCase())).length,
        review: articles.filter(a => ['under review', 'review', 'jarayonda'].includes(String(a.status || '').toLowerCase())).length,
        pending: articles.filter(a => ['submitted', 'pending', 'yuborilgan'].includes(String(a.status || '').toLowerCase())).length,
        rejected: articles.filter(a => ['rejected', 'rad etilgan'].includes(String(a.status || '').toLowerCase())).length,
      };

      articlesChartInstance.current = new Chart(articlesChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Nashr etilgan", "Qabul qilingan", "Taqrizda", "Kutilmoqda", "Rad etilgan"],
          datasets: [
            {
              data: [counts.published, counts.accepted, counts.review, counts.pending, counts.rejected],
              backgroundColor: ["#0F766E", "#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: "bottom", 
              labels: { 
                boxWidth: 8, 
                padding: 10,
                font: { size: 10, weight: 'bold' } 
              } 
            },
          },
        },
      });
    }

    // 2. Journals Chart
    if (journalsChartRef.current) {
      if (journalsChartInstance.current) journalsChartInstance.current.destroy();

      const journals = data.journals;
      const counts = {
        active: journals.filter(j => j.is_active && j.is_approved_by_admin).length,
        pending: journals.filter(j => !j.is_approved_by_admin).length,
        inactive: journals.filter(j => j.is_approved_by_admin && !j.is_active).length,
      };

      journalsChartInstance.current = new Chart(journalsChartRef.current, {
        type: "pie",
        data: {
          labels: ["Faol", "Kutilmoqda", "Yashirilgan"],
          datasets: [
            {
              data: [counts.active, counts.pending, counts.inactive],
              backgroundColor: ["#10B981", "#F59E0B", "#94A3B8"],
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: "bottom", 
              labels: { 
                boxWidth: 8, 
                padding: 10,
                font: { size: 10, weight: 'bold' } 
              } 
            },
          },
        },
      });
    }

    // 3. User Roles Chart
    if (usersChartRef.current) {
      if (usersChartInstance.current) usersChartInstance.current.destroy();

      usersChartInstance.current = new Chart(usersChartRef.current, {
        type: "bar",
        data: {
          labels: ["Mualliflar", "Journal Adminlar"],
          datasets: [
            {
              label: "Soni",
              data: [data.users.length, data.journalAdmins.length],
              backgroundColor: ["#6366F1", "#3B82F6"],
              borderRadius: 8,
              borderWidth: 0,
              maxBarThickness: 35,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
            },
          },
        },
      });
    }

    return () => {
      if (articlesChartInstance.current) articlesChartInstance.current.destroy();
      if (journalsChartInstance.current) journalsChartInstance.current.destroy();
      if (usersChartInstance.current) usersChartInstance.current.destroy();
    };
  }, [data, loading]);

  const stats = useMemo(() => {
    const journals = data.journals;
    const articles = data.articles;
    const journalAdmins = data.journalAdmins;
    
    const unapprovedCount = journals.filter(j => !j.is_approved_by_admin).length + 
                           articles.filter(a => !a.is_approved_by_admin).length;
                           
    return [
      { title: "Total Users", value: data.users.length, icon: <FiUsers />, color: "bg-indigo-600" },
      { title: "Total Journals", value: journals.length, icon: <FiBookOpen />, color: "bg-blue-600" },
      { title: "Total Articles", value: articles.length, icon: <FiFileText />, color: "bg-teal-600" },
      { title: "Journal Admins", value: journalAdmins.length, icon: <FiShield />, color: "bg-purple-600" },
      { title: "Pending", value: unapprovedCount, icon: <FiClock />, color: "bg-amber-500" },
    ];
  }, [data]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiActivity className="text-blue-600" /> Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">Tizim statistikasi, diagrammalar va oxirgi ma'lumotlar</p>
        </div>
        <button 
          onClick={fetchData} 
          disabled={loading}
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-semibold text-sm transition-all"
        >
          {loading ? "Yangilanmoqda..." : "Ma'lumotlarni yangilash"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight truncate">
                {stat.title === "Total Users" ? "Foydalanuvchilar" : 
                 stat.title === "Total Journals" ? "Jurnallar" : 
                 stat.title === "Total Articles" ? "Maqolalar" : 
                 stat.title === "Journal Admins" ? "Journal Adminlar" : "Kutilmoqda"}
              </p>
              <h2 className="text-xl font-bold text-gray-800 truncate">
                {loading ? "..." : stat.value}
              </h2>
            </div>
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-white text-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles Chart Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <FiFileText className="text-teal-600" /> Maqolalar holati
            </h3>
            <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded font-black uppercase">Statistika</span>
          </div>
          <div className="relative flex-1">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm italic">Yuklanmoqda...</div>
            ) : (
              <canvas ref={articlesChartRef} />
            )}
          </div>
        </div>

        {/* Journals Chart Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <FiBookOpen className="text-blue-600" /> Jurnallar holati
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black uppercase">Statistika</span>
          </div>
          <div className="relative flex-1">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm italic">Yuklanmoqda...</div>
            ) : (
              <canvas ref={journalsChartRef} />
            )}
          </div>
        </div>

        {/* Users Chart Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <FiUsers className="text-indigo-600" /> Foydalanuvchilar turlari
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black uppercase">Statistika</span>
          </div>
          <div className="relative flex-1">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm italic">Yuklanmoqda...</div>
            ) : (
              <canvas ref={usersChartRef} />
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Latest Records Tables */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Tizimdagi so'nggi ma'lumotlar</h2>
            <p className="text-xs text-gray-400">Yangi qo'shilgan yozuvlarni tezkor kuzatish</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("articles")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "articles"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Maqolalar ({data.articles.length})
            </button>
            <button
              onClick={() => setActiveTab("journals")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "journals"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Jurnallar ({data.journals.length})
            </button>
            <button
              onClick={() => setActiveTab("journalAdmins")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "journalAdmins"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Journal Adminlar ({data.journalAdmins.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-400 italic">Yuklanmoqda...</div>
          ) : activeTab === "articles" ? (
            <div className="p-2">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="py-3 px-5">Maqola sarlavhasi</th>
                    <th className="py-3 px-5">Kategoriya / Til</th>
                    <th className="py-3 px-5">Jurnal</th>
                    <th className="py-3 px-5">Holat</th>
                    <th className="py-3 px-5 text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.articles.slice(0, 8).map((art) => (
                    <tr key={art.id || art._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="py-3 px-5 font-semibold text-gray-800 max-w-[280px] truncate" title={art.title}>
                        {art.title}
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-gray-700 font-medium block">{art.category || "Maqola"}</span>
                        <span className="text-xs text-gray-400">{art.language || "O'zbekcha"}</span>
                      </td>
                      <td className="py-3 px-5 text-blue-600 font-semibold max-w-[200px] truncate">
                        {art.journal?.name || "Noma'lum"}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                          String(art.status).toLowerCase() === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          String(art.status).toLowerCase() === 'accepted' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                          ['under review', 'review'].includes(String(art.status).toLowerCase()) ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          String(art.status).toLowerCase() === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {art.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right text-gray-400 text-xs font-medium">
                        {new Date(art.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {data.articles.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 italic">Maqolalar topilmadi</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => navigate("/articles")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
                >
                  Barcha maqolalarni ko'rish <FiArrowRight />
                </button>
              </div>
            </div>
          ) : activeTab === "journals" ? (
            <div className="p-2">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="py-3 px-5">Jurnal nomi</th>
                    <th className="py-3 px-5">ISSN / Sfera</th>
                    <th className="py-3 px-5 text-center">Tasdiq holati</th>
                    <th className="py-3 px-5 text-center">Aktivlik</th>
                    <th className="py-3 px-5 text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.journals.slice(0, 8).map((journal) => (
                    <tr key={journal.id || journal._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="py-3 px-5 font-semibold text-gray-800 max-w-[280px] truncate" title={journal.name}>
                        {journal.name}
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-gray-700 font-medium block">ISSN: {journal.issn || "—"}</span>
                        <span className="text-xs text-gray-400">{journal.subject_area || "Barcha sohalar"}</span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          journal.is_approved_by_admin ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {journal.is_approved_by_admin ? "Tasdiqlangan" : "Kutilmoqda"}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          journal.is_active ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {journal.is_active ? "Aktiv" : "Nofaol"}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right text-gray-400 text-xs font-medium">
                        {new Date(journal.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {data.journals.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 italic">Jurnallar topilmadi</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => navigate("/journals")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
                >
                  Barcha jurnallarni ko'rish <FiArrowRight />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="py-3 px-5">Foydalanuvchi</th>
                    <th className="py-3 px-5">Email / Telefon</th>
                    <th className="py-3 px-5">Affiliatsiya (Tashkilot)</th>
                    <th className="py-3 px-5 text-center">Bob yaratish</th>
                    <th className="py-3 px-5 text-right">Ro'yxatdan o'tdi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.journalAdmins.slice(0, 8).map((ja) => (
                    <tr key={ja.id || ja._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                            {ja.avatar_url ? (
                              <img src={ja.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              (ja.full_name || ja.name || 'A').charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 block">{ja.full_name || ja.name || "Noma'lum"}</span>
                            <span className="text-xs text-gray-400">{ja.country || "Uzbekistan"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-gray-700 block font-medium">{ja.email}</span>
                        <span className="text-xs text-gray-400">{ja.phone || "—"}</span>
                      </td>
                      <td className="py-3 px-5 text-gray-600 max-w-[200px] truncate" title={ja.affiliation}>
                        {ja.affiliation || "—"}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          ja.allow_bob_creation ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {ja.allow_bob_creation ? "Ruxsat" : "Taqiq"}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right text-gray-400 text-xs font-medium">
                        {new Date(ja.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {data.journalAdmins.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 italic">Journal adminlar topilmadi</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => navigate("/journal-admins")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
                >
                  Barcha Journal Adminlarni ko'rish <FiArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Oxirgi harakatlar (Loglar)</h2>
          <span className="text-xs text-gray-400 font-medium italic">Hamma harakatlar qayd etilmoqda</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Yuklanmoqda...</div>
          ) : data.logs.length === 0 ? (
            <div className="p-10 text-center text-gray-400">Loglar topilmadi</div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50">
                <tr className="text-xs font-bold text-gray-500 uppercase italic tracking-wider">
                  <th className="py-4 px-6 font-semibold">Shaxs</th>
                  <th className="py-4 px-6 font-semibold">Harakat tavsifi</th>
                  <th className="py-4 px-6 font-semibold">Qurilma</th>
                  <th className="py-4 px-6 font-semibold text-center">IP Manzil</th>
                  <th className="py-4 px-6 font-semibold text-right">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.logs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{log.actor_name || "Noma'lum"}</span>
                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">{log.actor_type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600 font-medium max-w-[300px] leading-tight">
                        {log.description || log.action}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-[10px] text-gray-400 truncate max-w-[150px] italic" title={log.device_info}>
                        {log.device_info || "—"}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[11px] text-gray-500 text-center font-mono">
                      {log.ip_address || "—"}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 text-right font-medium">
                      {new Date(log.createdAt).toLocaleString("uz-UZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;