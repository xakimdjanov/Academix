import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiClock, FiSlash, FiPlay, FiBook, FiDollarSign } from "react-icons/fi";
import { journalService, adminService } from "../services/api";

const normalizeStatus = (s = "") => String(s).trim().toLowerCase().replace(/\s+/g, "");

const isPending = (s) => {
  const ns = normalizeStatus(s);
  return ns === "pending" || ns === "pendingapproval" || ns === "approvalpending";
};
const isActive = (s) => normalizeStatus(s) === "active";
const isDisabled = (s) => ["disabled", "inactive", "blocked"].includes(normalizeStatus(s));

const StatusBadge = ({ j }) => {
  if (!j?.is_approved_by_admin) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase">
        <FiClock /> Pending Approval
      </span>
    );
  }
  if (j?.is_active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
        <FiCheckCircle /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">
      <FiSlash /> Disabled
    </span>
  );
};

const getId = (obj) => obj?.id ?? obj?._id;
const getAdminName = (j) =>
  j?.admin?.full_name || j?.admin?.fullname || j?.admin?.name || j?.admin?.username || "Admin";
const getFirstLetter = (name) => (String(name || "A").trim()?.[0] || "A").toUpperCase();

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Menu (tabs)
  const [tab, setTab] = useState("all"); // all | pending | active | disabled

  // avatar fallback (img 404 bo‘lsa)
  const [adminImgError, setAdminImgError] = useState({});

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await journalService.getAll();
      const data = res?.data?.data || res?.data || [];
      setJournals(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load journals");
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const pendingList = useMemo(() => journals.filter((j) => !j?.is_approved_by_admin), [journals]);
  const activeList = useMemo(() => journals.filter((j) => j?.is_approved_by_admin && j?.is_active), [journals]);
  const disabledList = useMemo(() => journals.filter((j) => j?.is_approved_by_admin && !j?.is_active), [journals]);

  const filteredList = useMemo(() => {
    if (tab === "pending") return pendingList;
    if (tab === "active") return activeList;
    if (tab === "disabled") return disabledList;
    return journals;
  }, [tab, journals, pendingList, activeList, disabledList]);

  const handleApprove = async (id) => {
    setBusyId(id);
    const admin_id = localStorage.getItem("admin_id");
    try {
      await adminService.approveJournal(id, { admin_id });
      setJournals((prev) => prev.map((j) => (getId(j) === id ? { ...j, is_approved_by_admin: true, is_active: true } : j)));
      toast.success("Jurnal muvaffaqiyatli tasdiqlandi");
    } catch (e) {
      toast.error("Failed to approve journal");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (id) => {
    setBusyId(id);
    const admin_id = localStorage.getItem("admin_id");
    try {
      const res = await adminService.toggleJournalStatus(id, { admin_id });
      const updatedJournal = res.data.journal;
      setJournals((prev) => prev.map((j) => (getId(j) === id ? { ...j, is_active: updatedJournal.is_active } : j)));
      toast.success(`Jurnal holati o'zgartirildi: ${updatedJournal.is_active ? "Yoqildi" : "Bloklandi"}`);
    } catch (e) {
      toast.error("Failed to toggle status");
    } finally {
      setBusyId(null);
    }
  };

  const AdminAvatar = ({ j }) => {
    const adminName = getAdminName(j);
    const letter = getFirstLetter(adminName);
    const avatarUrl = j?.admin?.avatar_url;
    const key = j?.admin?.id || j?.admin?._id || j?.admin?.email || adminName;

    const showImg = Boolean(avatarUrl && String(avatarUrl).trim()) && !adminImgError[key];

    return showImg ? (
      <img
        src={avatarUrl}
        alt="admin"
        className="w-8 h-8 rounded-full object-cover shrink-0"
        onError={() => setAdminImgError((p) => ({ ...p, [key]: true }))}
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
        {letter}
      </div>
    );
  };

  const TabBtn = ({ value, label, count }) => {
    const active = tab === value;
    return (
      <button
        onClick={() => setTab(value)}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${active
          ? "bg-blue-700 text-white border-blue-700 shadow-sm shadow-blue-100"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
      >
        <span className="flex items-center gap-2">
          {label}
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
          >
            {count}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header + Menu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 italic flex items-center gap-2">
            <FiBook className="text-blue-700" /> Journal Management
          </h1>
          <p className="text-sm text-gray-500">Manage pending approvals and active publications</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <TabBtn value="all" label="All" count={journals.length} />
          <TabBtn value="pending" label="Pending" count={pendingList.length} />
          <TabBtn value="active" label="Active" count={activeList.length} />
          <TabBtn value="disabled" label="Disabled" count={disabledList.length} />
        </div>
      </div>

      {/* ONE TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">
            {tab === "all"
              ? "All Journals"
              : tab === "pending"
                ? "Pending Approval"
                : tab === "active"
                  ? "Active Publications"
                  : "Disabled Journals"}
          </h2>

          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold uppercase">
            {filteredList.length} Item(s)
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left min-w-[950px]">
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
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400 italic">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredList.map((j) => {
                  const id = getId(j);

                  const pending = isPending(j?.status);
                  const active = isActive(j?.status);
                  const disabled = isDisabled(j?.status);

                  return (
                    <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 min-w-[220px]">
                        <div className="font-bold text-gray-700 truncate">{j?.name}</div>
                        <div className="text-xs text-gray-400 font-mono truncate">{j?.slug}</div>

                        {/* URL NI O‘CHIRMADIK ✅ */}
                        {j?.website_url ? (
                          <a
                            href={j.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 text-[10px] text-blue-700 hover:underline truncate block max-w-[260px]"
                          >
                            {j.website_url}
                          </a>
                        ) : null}
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-500 font-mono">{j?.issn}</td>

                      <td className="py-4 px-6 text-sm text-gray-500 italic">
                        <div>{j?.subject_area}</div>
                        {Number(j?.submission_fee) > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 mt-1 uppercase">
                            <FiDollarSign size={10} /> Fee: ${j.submission_fee}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <AdminAvatar j={j} />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-gray-700 truncate">{getAdminName(j)}</div>
                            <div className="text-[10px] text-gray-400 truncate">{j?.admin?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge j={j} />
                      </td>

                      <td className="py-4 px-6 text-center">
                        {!j.is_approved_by_admin ? (
                          <button
                            onClick={() => handleApprove(id)}
                            disabled={busyId === id}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-sm shadow-emerald-100"
                          >
                            <FiCheckCircle /> {busyId === id ? "..." : "Approve"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(id)}
                            disabled={busyId === id}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${j.is_active
                              ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                              : "bg-blue-700 text-white hover:bg-blue-800 shadow-sm shadow-blue-100"
                              }`}
                          >
                            {j.is_active ? <><FiSlash /> {busyId === id ? "..." : "Disable"}</> : <><FiPlay /> {busyId === id ? "..." : "Activate"}</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Journals;
