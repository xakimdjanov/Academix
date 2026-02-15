import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiClock, FiSlash, FiPlay, FiBook } from "react-icons/fi";
import { journalService } from "../services/api";

const normalizeStatus = (s = "") => String(s).trim().toLowerCase().replace(/\s+/g, "");

const isPending = (s) => {
  const ns = normalizeStatus(s);
  return ns === "pending" || ns === "pendingapproval" || ns === "approvalpending";
};

const isActive = (s) => normalizeStatus(s) === "active";
const isDisabled = (s) => ["disabled", "inactive", "blocked"].includes(normalizeStatus(s));

const StatusBadge = ({ status }) => {
  if (isActive(status)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
        <FiCheckCircle /> Active
      </span>
    );
  }
  if (isPending(status)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase">
        <FiClock /> Pending
      </span>
    );
  }
  if (isDisabled(status)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">
        <FiSlash /> Disabled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600 border uppercase">
      {status || "Unknown"}
    </span>
  );
};

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await journalService.getAll();
      const data = res?.data?.data || res?.data || [];
      setJournals(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const pendingList = useMemo(() => journals.filter((j) => isPending(j?.status)), [journals]);
  const activeList = useMemo(() => journals.filter((j) => isActive(j?.status)), [journals]);
  const disabledList = useMemo(() => journals.filter((j) => isDisabled(j?.status)), [journals]);

  const setJournalStatus = async (journal, nextStatus) => {
    const id = journal?.id;
    if (!id) return;
    setBusyId(id);
    try {
      await journalService.update(id, { status: nextStatus });
      setJournals((prev) => prev.map((j) => (j.id === id ? { ...j, status: nextStatus } : j)));
      toast.success(`Journal is now ${nextStatus}`);
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 italic flex items-center gap-2">
          <FiBook className="text-indigo-600" /> Journal Management
        </h1>
        <p className="text-sm text-gray-500">Manage pending approvals and active publications</p>
      </div>

      {/* SECTION: Pending Approval */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Pending Approval</h2>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
            {pendingList.length} Request(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase italic">
              <tr>
                <th className="py-4 px-6">Journal Details</th>
                <th className="py-4 px-6">ISSN</th>
                <th className="py-4 px-6">Subject Area</th>
                <th className="py-4 px-6">Admin Contact</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400">Loading requests...</td></tr>
              ) : pendingList.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">No pending requests found</td></tr>
              ) : (
                pendingList.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 min-w-[200px]">
                      <div className="font-bold text-gray-700 truncate">{j.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{j.slug}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{j.issn}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 italic">{j.subject_area}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={j?.admin?.avatar_url || "https://via.placeholder.com/32"} alt="admin" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-700 truncate">{j?.admin?.full_name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{j?.admin?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><StatusBadge status={j.status} /></td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => setJournalStatus(j, "Active")} disabled={busyId === j.id} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-sm shadow-emerald-100">
                        <FiCheckCircle /> {busyId === j.id ? "..." : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: Active Journals */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Active Publications</h2>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">{activeList.length} Online</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase italic">
              <tr>
                <th className="py-4 px-6">Journal Name</th>
                <th className="py-4 px-6">ISSN</th>
                <th className="py-4 px-6">Languages</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Safety</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeList.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-700 truncate max-w-[250px]">{j.name}</div>
                    <div className="text-[10px] text-indigo-500 hover:underline cursor-pointer truncate max-w-[250px]">{j.website_url}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 font-mono">{j.issn}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {(j.languages || []).map((lang) => (
                        <span key={lang} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100 uppercase">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6"><StatusBadge status={j.status} /></td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => setJournalStatus(j, "Disabled")} disabled={busyId === j.id} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50">
                      <FiSlash /> {busyId === j.id ? "..." : "Disable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: Disabled/Inactive */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-80">
        <div className="p-5 border-b border-gray-50">
          <h2 className="font-bold text-gray-500">Disabled Journals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <tbody className="divide-y divide-gray-100">
              {disabledList.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-400">{j.name}</div>
                    <div className="text-[10px] text-gray-400">{j.slug}</div>
                  </td>
                  <td className="py-4 px-6"><StatusBadge status={j.status} /></td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => setJournalStatus(j, "Active")} disabled={busyId === j.id} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm shadow-indigo-100">
                      <FiPlay /> {busyId === j.id ? "..." : "Re-activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {disabledList.length === 0 && (
                <tr><td className="p-6 text-center text-gray-400 text-sm">No disabled journals in the archive</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Journals;