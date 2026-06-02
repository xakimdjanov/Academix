import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { FiSearch, FiActivity, FiUser, FiMonitor, FiMapPin, FiClock } from "react-icons/fi";
import { auditLogService } from "../services/api";

const TABS = [
  { key: "all", label: "Barchasi" },
  { key: "LOGIN", label: "Tizimga kirish" },
  { key: "ARTICLE", label: "Maqolalar" },
  { key: "JOURNAL", label: "Jurnallar" },
];

const norm = (v = "") => String(v ?? "").toLowerCase().trim();

const Logs = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getAll();
      const data = res?.data?.data || res?.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Loglarni yuklashda xatolik");
      setLogs([]);
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
      .filter((l) => {
        if (activeTab === "all") return true;
        return (l.action || "").includes(activeTab) || (l.entity_type || "").toUpperCase().includes(activeTab);
      })
      .filter((l) => {
        if (!q) return true;
        const hay = [
          l.actor_name,
          l.actor_type,
          l.description,
          l.action,
          l.ip_address,
          l.device_info,
          l.location
        ]
          .map((v) => norm(v))
          .join(" ");
        return hay.includes(q);
      });
  }, [logs, activeTab, query]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiActivity className="text-blue-700" /> Harakatlar tarixi (Logs)
          </h1>
          <p className="text-sm text-gray-500 font-medium italic">Tizimdagi barcha amallar va hodisalarni kuzatish</p>
        </div>

        <div className="relative w-full md:w-96">
          <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Shaxs, harakat yoki IP orqali qidirish..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === t.key
                ? "bg-[#002147] text-white border-[#002147] shadow-lg shadow-blue-900/20"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
            {TABS.find((t) => t.key === activeTab)?.label} bo'yicha natijalar
          </h2>

          <span className="bg-white px-3 py-1 rounded-full border text-[10px] font-black text-slate-500 shadow-sm uppercase tracking-tighter">
            Jami: {filtered.length} ta yozuv
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-none">
          {loading ? (
            <div className="p-20 text-center text-gray-400 italic flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              Yuklanmoqda...
            </div>
          ) : (
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase italic tracking-widest">
                <tr>
                  <th className="py-5 px-6">Shaxs (Actor)</th>
                  <th className="py-5 px-6">Harakat tavsifi</th>
                  <th className="py-5 px-6">Qurilma / Manzil</th>
                  <th className="py-5 px-6 text-center">IP Manzil</th>
                  <th className="py-5 px-6 text-right">Amallar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filtered.map((log, idx) => (
                  <tr key={log?.id || idx} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0 group-hover:scale-110 transition-transform">
                          {(log.actor_name?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-slate-800 truncate max-w-[160px]">
                            {log.actor_name || "Noma'lum"}
                          </div>
                          <div className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">
                            {log.actor_type}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-6">
                      <div className="max-w-[350px]">
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase mb-1.5 tracking-tighter">
                          {log.action}
                        </span>
                        <p className="text-sm text-slate-600 font-medium leading-snug truncate">
                          {log.description || "Tavsif yo'q"}
                        </p>
                      </div>
                    </td>

                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500">
                          <FiMonitor className="shrink-0 text-slate-300" size={14} />
                          <div className="text-[11px] font-bold truncate max-w-[180px]" title={log.device_info}>
                            {log.device_info || "Noma'lum"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <FiMapPin className="shrink-0 text-slate-300" size={12} />
                          <div className="text-[10px] font-medium truncate max-w-[180px]">
                            {log.location || "Manzil aniqlanmagan"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-6">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          {log.ip_address || "—"}
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-6 text-right">
                       <button className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <FiSearch size={16} />
                       </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-gray-400 italic font-medium">
                      Loglar topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedLog(null)} />
           <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
              <div className="bg-[#002147] p-6 text-white flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300 border border-white/10">
                       <FiActivity size={24} />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold">Harakat tafsilotlari</h2>
                       <p className="text-xs text-white/50 uppercase tracking-widest font-black">ID: #{selectedLog.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                    <FiMapPin className="rotate-45" size={20} />
                 </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-none">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shaxs (Actor)</p>
                       <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{selectedLog.actor_name}</span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase">{selectedLog.actor_type}</span>
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Harakat turi</p>
                       <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-800 text-white uppercase">{selectedLog.action}</span>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tavsif (Description)</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 font-medium italic leading-relaxed">
                       "{selectedLog.description}"
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Obyekt (Entity)</p>
                       <div className="text-xs font-bold text-slate-700">
                          {selectedLog.entity_name || selectedLog.entity_type || "N/A"} 
                          <span className="text-slate-400 ml-2">ID: {selectedLog.entity_id || "—"}</span>
                          {selectedLog.entity_name && <div className="text-[9px] text-slate-400 font-medium">{selectedLog.entity_type}</div>}
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaqti</p>
                       <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <FiClock className="text-blue-500" />
                          {new Date(selectedLog.createdAt).toLocaleString("uz-UZ")}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qurilma (Device)</p>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-medium">
                       <FiMonitor className="shrink-0 text-blue-500" />
                       {selectedLog.device_info}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manzil (Location)</p>
                       <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <FiMapPin className="text-red-500" />
                          {selectedLog.location || "Manzil aniqlanmagan"}
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Manzil</p>
                       <div className="text-xs font-mono font-bold text-slate-700">
                          {selectedLog.ip_address}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                 <button onClick={() => setSelectedLog(null)} className="px-8 py-3 bg-[#002147] text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20">
                    Yopish
                 </button>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Logs;
