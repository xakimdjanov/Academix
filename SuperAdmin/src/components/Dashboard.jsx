import React, { useEffect, useMemo, useState } from "react";
import { FiUsers, FiBookOpen, FiBell, FiClock, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { userService, journalService, notificationService, auditLogService } from "../services/api";

const Dashboard = () => {
  const [data, setData] = useState({ users: [], journals: [], notifications: [], logs: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, jRes, nRes, lRes] = await Promise.all([
        userService.getAll(),
        journalService.getAll(),
        notificationService.getAll(),
        auditLogService.getAll(),
      ]);

      const parse = (res) => res?.data?.data || res?.data?.result || res?.data?.payload || res?.data || [];

      setData({
        users: Array.isArray(parse(uRes)) ? parse(uRes) : [],
        journals: Array.isArray(parse(jRes)) ? parse(jRes) : [],
        notifications: Array.isArray(parse(nRes)) ? parse(nRes) : [],
        logs: Array.isArray(parse(lRes)) ? parse(lRes) : [],
      });
    } catch (e) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const journals = data.journals;
    return [
      { title: "Total Users", value: data.users.length, icon: <FiUsers />, color: "bg-indigo-600" },
      { title: "Total Journals", value: journals.length, icon: <FiBookOpen />, color: "bg-blue-600" },
      { title: "Active Journals", value: journals.filter(j => j.status?.toLowerCase() === "active").length, icon: <FiCheckCircle />, color: "bg-emerald-600" },
      { title: "Pending", value: journals.filter(j => ["pending", "pending approval"].includes(j.status?.toLowerCase())).length, icon: <FiClock />, color: "bg-amber-500" },
      { title: "Notifications", value: data.notifications.length, icon: <FiBell />, color: "bg-purple-600" },
    ];
  }, [data]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">System statistics and latest activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight truncate">
                {stat.title === "Total Users" ? "Foydalanuvchilar" : 
                 stat.title === "Total Journals" ? "Jurnallar" : 
                 stat.title === "Active Journals" ? "Faol" : 
                 stat.title === "Pending" ? "Kutilmoqda" : "Xabarnomalar"}
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