import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { 
  FiCheckCircle, FiClock, FiSlash, FiPlay, FiBook, FiDollarSign, 
  FiEye, FiXCircle, FiUser, FiMail, FiGlobe, FiInfo 
} from "react-icons/fi";
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

  // View/Edit Modal states
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editIssn, setEditIssn] = useState("");
  const [editSubjectArea, setEditSubjectArea] = useState("");
  const [editSubmissionFee, setEditSubmissionFee] = useState("");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    if (selectedJournal) {
      setEditName(selectedJournal.name || "");
      setEditSlug(selectedJournal.slug || "");
      setEditIssn(selectedJournal.issn || "");
      setEditSubjectArea(selectedJournal.subject_area || "");
      setEditSubmissionFee(selectedJournal.submission_fee || "");
      setEditWebsiteUrl(selectedJournal.website_url || "");
      setEditCategory(selectedJournal.category || "");
      setIsEditingDetails(false);
    }
  }, [selectedJournal]);

  const handleSaveDetails = async () => {
    if (!editName.trim()) {
      toast.error("Jurnal nomi bo'sh bo'lishi mumkin emas");
      return;
    }
    setIsUpdating(true);
    try {
      const updatedFields = {
        name: editName.trim(),
        slug: editSlug.trim(),
        issn: editIssn.trim(),
        subject_area: editSubjectArea.trim(),
        submission_fee: editSubmissionFee,
        website_url: editWebsiteUrl.trim(),
        category: editCategory.trim(),
      };
      
      const journalId = getId(selectedJournal);
      await journalService.update(journalId, updatedFields);
      
      toast.success("Jurnal ma'lumotlari yangilandi");
      
      // Update local state
      setJournals(prev => prev.map(j => getId(j) === journalId ? { ...j, ...updatedFields } : j));
      setSelectedJournal(prev => ({ ...prev, ...updatedFields }));
      setIsEditingDetails(false);
    } catch (error) {
      toast.error("Yangilashda xatolik yuz berdi");
    } finally {
      setIsUpdating(false);
    }
  };

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

                      <td className="py-4 px-6 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedJournal(j)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Tahrirlash / Batafsil"
                        >
                          <FiEye size={14} />
                        </button>
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

      {/* DETAIL & EDIT MODAL */}
      {selectedJournal && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-10 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedJournal(null)} />
              
              <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
                  {/* Modal Header */}
                  <div className="bg-[#002147] p-6 text-white shrink-0 relative overflow-hidden">
                      <div className="relative z-10 flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                                {isEditingDetails ? (
                                    <div className="space-y-2 w-full mt-2 max-w-xl">
                                        <input
                                            type="text"
                                            value={editCategory}
                                            onChange={(e) => setEditCategory(e.target.value)}
                                            placeholder="Kategoriya (masalan: Pedagogika)"
                                            className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-lg text-xs w-full focus:outline-none focus:border-blue-400"
                                        />
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Jurnal nomi"
                                            className="px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-lg font-bold w-full focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded-full tracking-widest border border-blue-500/30">
                                                {selectedJournal.category || "Kategoriyasiz"}
                                            </span>
                                            <StatusBadge j={selectedJournal} />
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold leading-tight" title={selectedJournal.name}>
                                            {selectedJournal.name}
                                        </h2>
                                    </>
                                )}
                          </div>
                          <button 
                            onClick={() => setSelectedJournal(null)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
                          >
                            <FiXCircle size={24} />
                          </button>
                      </div>
                      <FiBook className="absolute -right-8 -bottom-8 text-white/5 text-[150px] rotate-12" />
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-auto p-6 md:p-8 space-y-8 scrollbar-none">
                      
                      {/* Admin Info */}
                      <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <FiUser className="text-blue-700"/> Jurnal Boshqaruvchisi
                          </h3>
                          <div className="flex items-center gap-4">
                              <AdminAvatar j={selectedJournal} />
                              <div>
                                  <div className="font-bold text-slate-800 text-lg">{getAdminName(selectedJournal)}</div>
                                  <div className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                      <FiMail size={13}/> {selectedJournal.admin?.email || "Email kiritilmagan"}
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Journal details form/grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Jurnal Slugi</label>
                                  {isEditingDetails ? (
                                      <input
                                          type="text"
                                          value={editSlug}
                                          onChange={(e) => setEditSlug(e.target.value)}
                                          className="w-full text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                                      />
                                  ) : (
                                      <div className="text-sm font-mono text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedJournal.slug || "Yo'q"}</div>
                                  )}
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ISSN</label>
                                  {isEditingDetails ? (
                                      <input
                                          type="text"
                                          value={editIssn}
                                          onChange={(e) => setEditIssn(e.target.value)}
                                          className="w-full text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                                      />
                                  ) : (
                                      <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedJournal.issn || "Yo'q"}</div>
                                  )}
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Soha (Subject Area)</label>
                                  {isEditingDetails ? (
                                      <input
                                          type="text"
                                          value={editSubjectArea}
                                          onChange={(e) => setEditSubjectArea(e.target.value)}
                                          className="w-full text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                                      />
                                  ) : (
                                      <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedJournal.subject_area || "Yo'q"}</div>
                                  )}
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Raqamli ID / To'lov summasi (Submission Fee)</label>
                                  {isEditingDetails ? (
                                      <input
                                          type="number"
                                          value={editSubmissionFee}
                                          onChange={(e) => setEditSubmissionFee(e.target.value)}
                                          className="w-full text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                                      />
                                  ) : (
                                      <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">${selectedJournal.submission_fee || "0"}</div>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Veb-sayt manzili (Website URL)</label>
                          {isEditingDetails ? (
                              <input
                                  type="text"
                                  value={editWebsiteUrl}
                                  onChange={(e) => setEditWebsiteUrl(e.target.value)}
                                  className="w-full text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                              />
                          ) : (
                              selectedJournal.website_url ? (
                                  <a 
                                      href={selectedJournal.website_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm text-blue-700 hover:underline bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-2"
                                  >
                                      <FiGlobe size={14}/> {selectedJournal.website_url}
                                  </a>
                              ) : (
                                  <div className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">Sayt manzili kiritilmagan</div>
                              )
                          )}
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 px-8">
                        <div className="flex items-center gap-3">
                            {isEditingDetails ? (
                                <>
                                    <button 
                                        onClick={handleSaveDetails}
                                        disabled={isUpdating}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-[1.25rem] font-bold text-xs hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                                    >
                                        {isUpdating ? "Saqlanmoqda..." : "Saqlash"}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditingDetails(false)}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[1.25rem] font-bold text-xs hover:bg-gray-300 transition-all"
                                    >
                                        Bekor qilish
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsEditingDetails(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-[1.25rem] font-bold text-xs hover:bg-blue-700 transition-all shadow-md"
                                >
                                    Tahrirlash
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={() => setSelectedJournal(null)}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-[1.25rem] font-bold text-xs hover:bg-slate-100 transition-all"
                        >
                            Oynani yopish
                        </button>
                  </div>
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default Journals;
