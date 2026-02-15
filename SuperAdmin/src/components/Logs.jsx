import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiClock, FiActivity } from "react-icons/fi";
import { auditLogService } from "../services/api";

const TABS = [
  { key: "all", label: "All Logs" },
  { key: "login", label: "Login" },
  { key: "article", label: "Articles" },
  { key: "payment", label: "Payments" },
];

const norm = (v = "") => String(v ?? "").toLowerCase().trim();
const compact = (v = "") => norm(v).replace(/\s+/g, "");

const matchTab = (log, tabKey) => {
  if (tabKey === "all") return true;
  const entity = compact(log?.entity_type);
  const action = compact(log?.action);

  if (tabKey === "login") {
    return entity.includes("login") || action.includes("login") || action.includes("signin") || action.includes("logout");
  }
  if (tabKey === "article") return entity.includes("article") || action.includes("article");
  if (tabKey === "payment") return entity.includes("payment") || action.includes("payment");
  return true;
};

const safePreview = (value) => {
  if (value == null) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  const s = String(value);
  return s.length > 50 ? s.slice(0, 50) + "..." : s;
};

const Logs = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getAll();
      const data = res?.data?.data || res?.data?.logs || res?.data?.auditLogs || res?.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query);
    return logs
      .filter((l) => matchTab(l, activeTab))
      .filter((l) => {
        if (!q) return true;
        const actor = l?.actor || {};
        const hay = [actor?.full_name, actor?.email, l?.action, l?.entity_type, l?.ip_address]
          .map(v => norm(v)).join(" ");
        return hay.includes(q);
      });
  }, [logs, activeTab, query]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Activity Logs</h1>
          <p className="text-sm text-gray-500">Track all system actions and events</p>
        </div>
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by user, action, IP..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === t.key ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <FiActivity className="text-indigo-600" />
            {TABS.find((t) => t.key === activeTab)?.label}
          </h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filtered.length} Entries</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-400 italic">Fetching logs...</div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase italic">
                <tr>
                  <th className="py-4 px-6">Actor</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Entity</th>
                  <th className="py-4 px-6">IP Address</th>
                  <th className="py-4 px-6">Metadata</th>
                  <th className="py-4 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((log, idx) => {
                  const actor = log?.actor || {};
                  return (
                    <tr key={log?.id || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {(actor?.full_name?.[0] || "U").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-700 truncate max-w-[120px]">
                              {actor?.full_name || `User #${log?.actor_user_id}`}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate max-w-[120px]">{actor?.email || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
                          {log?.action || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs font-bold text-gray-700">{log?.entity_type || "-"}</div>
                        <div className="text-[10px] text-gray-400">ID: {log?.entity_id ?? "-"}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-gray-500">{log?.ip_address || "-"}</td>
                      <td className="py-4 px-6 text-xs text-gray-400 italic truncate max-w-[150px]">
                        {safePreview(log?.metadata)}
                      </td>
                      <td className="py-4 px-6 text-right text-[11px] text-gray-400">
                        {log?.createdAt ? new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;