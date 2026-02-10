import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { articleService, journalService, userService } from "../../../services/api";
import {
  FiEye,
  FiEdit2,
  FiX,
  FiSave,
  FiRefreshCw,
  FiFileText,
  FiUser,
  FiInfo,
  FiLayers,
} from "react-icons/fi";

const STATUSES = ["Submitted", "Under Review", "Needs Revision", "Accepted", "Rejected"];

const JournalArticles = () => {
  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState("Submitted");

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewArticle, setViewArticle] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [viewUserLoading, setViewUserLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    abstract: "",
    keywordsText: "",
    category: "",
    language: "",
    authors: "",
    file_url: "",
    file_size: 0,
    apc_paid: false,
  });

  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const getStatus = (article) => {
    if (article?.status) return article.status;
    return article?.apc_paid === true ? "Accepted" : "Under Review";
  };

  const getId = (article) => article?.id || article?._id || article?.article_id;

  const myJournalIds = useMemo(() => {
    if (!myAdminId) return [];
    return (Array.isArray(journals) ? journals : [])
      .filter((j) => String(j?.journal_admin_id) === String(myAdminId))
      .map((j) => String(j?.id ?? j?._id ?? j?.journal_id))
      .filter(Boolean);
  }, [journals, myAdminId]);

  const myArticles = useMemo(() => {
    if (myJournalIds.length === 0) return [];
    return (Array.isArray(articles) ? articles : []).filter((a) =>
      myJournalIds.includes(String(a?.journal_id))
    );
  }, [articles, myJournalIds]);

  const filtered = useMemo(() => {
    return myArticles.filter((a) => getStatus(a) === filter);
  }, [myArticles, filter]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [jr, ar] = await Promise.all([journalService.getAll(), articleService.getAll()]);
      const j = jr?.data?.data || jr?.data?.journals || jr?.data || [];
      const a = ar?.data?.data || ar?.data?.articles || ar?.data || [];
      setJournals(Array.isArray(j) ? j : []);
      setArticles(Array.isArray(a) ? a : []);
    } catch (e) {
      toast.error("Failed to load data");
      setJournals([]);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openView = async (article) => {
    setViewArticle(article);
    setViewUser(null);
    setViewOpen(true);

    if (!article?.user_id) return;

    try {
      setViewUserLoading(true);
      const res = await userService.getById(article.user_id);
      setViewUser(res?.data?.data || res?.data?.user || res?.data || null);
    } catch {
      toast.error("User information not found");
    } finally {
      setViewUserLoading(false);
    }
  };

  const openEdit = (article) => {
    setEditArticle(article);
    setEditForm({
      title: article?.title || "",
      abstract: article?.abstract || "",
      keywordsText: Array.isArray(article?.keywords) ? article.keywords.join(", ") : "",
      category: article?.category || "",
      language: article?.language || "",
      authors: article?.authors || "",
      file_url: article?.file_url || "",
      file_size: Number(article?.file_size || 0),
      apc_paid: article?.apc_paid === true,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const id = getId(editArticle);
    if (!id) return toast.error("Article ID not found");

    const payload = {
      title: editForm.title,
      abstract: editForm.abstract,
      keywords: editForm.keywordsText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      category: editForm.category,
      language: editForm.language,
      authors: editForm.authors,
      file_url: editForm.file_url,
      file_size: Number(editForm.file_size || 0),
      apc_paid: editForm.apc_paid === true,
    };

    try {
      setEditSaving(true);
      await articleService.update(id, payload);
      setArticles((prev) => prev.map((a) => (getId(a) === id ? { ...a, ...payload } : a)));
      toast.success("Successfully updated");
      setEditOpen(false);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setEditSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-72 sm:h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#002147] border-t-transparent" />
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 sm:space-y-8 px-3 sm:px-6 md:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Article Management
          </h1>
          <p className="text-slate-500 mt-1 italic text-xs sm:text-sm">
            Reviewing submissions for your journals
          </p>
        </div>
        <button
          onClick={loadAll}
          type="button"
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 sm:px-6 py-2.5 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-semibold text-slate-700 active:scale-[0.99]"
        >
          <FiRefreshCw /> Refresh Data
        </button>
      </div>

      {!myAdminId && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-700">
          <FiInfo size={20} />
          <span className="text-sm font-medium">
            Session expired. Please log in again (Admin ID missing).
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={[
                "min-w-[140px] px-4 sm:px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200",
                filter === s
                  ? "bg-[#002147] text-white shadow-lg shadow-blue-900/20"
                  : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              ].join(" ")}
            >
              {s}
              <div
                className={[
                  "text-[10px] mt-1 opacity-80",
                  filter === s ? "text-blue-100" : "text-slate-400",
                ].join(" ")}
              >
                {myArticles.filter((a) => getStatus(a) === s).length} Articles
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Mobile: Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((a, idx) => {
          const id = getId(a) || idx;
          const status = getStatus(a);
          return (
            <div key={id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm line-clamp-2">
                    {a?.title || "Untitled Manuscript"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">
                    {a?.category || "General"}
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span className="font-bold">Author:</span>{" "}
                  {a?.authors || "Not specified"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openView(a)}
                    className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-[#002147] hover:text-white transition-all"
                    title="View"
                  >
                    <FiEye size={18} />
                  </button>
                  <button
                    onClick={() => openEdit(a)}
                    className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-amber-500 hover:text-white transition-all"
                    title="Edit"
                  >
                    <FiEdit2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="text-slate-200 mb-3">
              <FiFileText size={56} className="mx-auto" />
            </div>
            <p className="text-slate-400 font-medium">No articles found in this category.</p>
          </div>
        )}
      </div>

      {/* ✅ Desktop/Tablet: Table */}
      <div className="hidden sm:block bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 sm:px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <FiLayers className="text-blue-600" /> {filter} Queue
          </h2>
          <span className="bg-white px-4 py-1.5 rounded-full border text-xs font-bold text-slate-500 shadow-sm">
            Total: {filtered.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-50">
                <th className="py-5 px-8">Article Title</th>
                <th className="py-5 px-8">Main Author</th>
                <th className="py-5 px-8 text-center">Status</th>
                <th className="py-5 px-8 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filtered.map((a, idx) => {
                const status = getStatus(a);
                return (
                  <tr key={getId(a) || idx} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="py-5 px-8 max-w-md">
                      <div className="font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {a?.title || "Untitled Manuscript"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-tighter">
                        {a?.category || "General"}
                      </div>
                    </td>

                    <td className="py-5 px-8 text-slate-600 text-sm font-medium">
                      {a?.authors || "Not specified"}
                    </td>

                    <td className="py-5 px-8">
                      <div className="flex justify-center">
                        <StatusBadge status={status} />
                      </div>
                    </td>

                    <td className="py-5 px-8">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openView(a)}
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#002147] hover:text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => openEdit(a)}
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <div className="text-slate-200 mb-3">
                <FiFileText size={56} className="mx-auto" />
              </div>
              <p className="text-slate-400 font-medium">No articles found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Manuscript Details">
        <div className="space-y-5 sm:space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100">
            <h3 className="text-xs font-black uppercase text-blue-600 mb-4 flex items-center gap-2 tracking-widest">
              <FiFileText /> Submission Info
            </h3>

            <div className="grid grid-cols-1 gap-y-4">
              <InfoRow label="Title" value={viewArticle?.title} primary />
              <InfoRow label="Abstract" value={viewArticle?.abstract} />
              <InfoRow
                label="Keywords"
                value={Array.isArray(viewArticle?.keywords) ? viewArticle.keywords.join(", ") : "-"}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-2 border-t border-slate-200 pt-4">
                <InfoRow label="Language" value={viewArticle?.language} />
                <InfoRow label="APC Status" value={viewArticle?.apc_paid ? "Paid" : "Pending"} />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100">
            <h3 className="text-xs font-black uppercase text-emerald-600 mb-4 flex items-center gap-2 tracking-widest">
              <FiUser /> Submitter Details
            </h3>

            {viewUserLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            ) : viewUser ? (
              <div className="grid grid-cols-1 gap-y-3 text-sm">
                <InfoRow label="Full Name" value={viewUser?.name || viewUser?.full_name} />
                <InfoRow label="Contact Email" value={viewUser?.email} />
              </div>
            ) : (
              <p className="text-xs text-slate-400">User data unavailable</p>
            )}
          </div>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => !editSaving && setEditOpen(false)} title="Edit Manuscript">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <CustomInput
            label="Article Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            full
          />
          <CustomInput
            label="Category"
            value={editForm.category}
            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
          />
          <CustomInput
            label="Language"
            value={editForm.language}
            onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
          />
          <CustomInput
            label="Authors (comma separated)"
            value={editForm.authors}
            onChange={(e) => setEditForm({ ...editForm, authors: e.target.value })}
          />
          <CustomInput
            label="File URL"
            value={editForm.file_url}
            onChange={(e) => setEditForm({ ...editForm, file_url: e.target.value })}
            full
          />

          <div className="md:col-span-2">
            <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
              Abstract
            </label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 p-4 focus:ring-4 focus:ring-blue-50 outline-none min-h-[140px] transition-all text-sm leading-relaxed"
              value={editForm.abstract}
              onChange={(e) => setEditForm({ ...editForm, abstract: e.target.value })}
            />
          </div>

          <CustomInput
            label="Keywords (comma separated)"
            value={editForm.keywordsText}
            onChange={(e) => setEditForm({ ...editForm, keywordsText: e.target.value })}
            full
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
            <CustomInput
              label="File Size"
              type="number"
              value={editForm.file_size}
              onChange={(e) => setEditForm({ ...editForm, file_size: e.target.value })}
            />

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3.5">
              <span className="text-sm font-bold text-slate-700">APC Paid</span>
              <input
                type="checkbox"
                checked={editForm.apc_paid}
                onChange={(e) => setEditForm({ ...editForm, apc_paid: e.target.checked })}
                className="h-5 w-5 accent-[#002147]"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditOpen(false)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveEdit}
            disabled={editSaving}
            className="w-full sm:w-auto bg-[#002147] text-white px-6 sm:px-10 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 hover:bg-blue-900 transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {editSaving ? "Saving..." : (
              <>
                <FiSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default JournalArticles;

/* ---------------- UI Sub Components ---------------- */

const StatusBadge = ({ status }) => {
  const styles = {
    Accepted: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Rejected: "bg-rose-50 text-rose-600 border-rose-100",
    "Needs Revision": "bg-amber-50 text-amber-600 border-amber-100",
    "Under Review": "bg-blue-50 text-blue-600 border-blue-100",
    Submitted: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border ${
        styles[status] || styles.Submitted
      }`}
    >
      {status}
    </span>
  );
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-5 sm:p-7 border-b border-slate-50">
          <h2 className="text-base sm:text-xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="p-4 sm:p-8 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, primary }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.14em]">
      {label}
    </span>
    <span
      className={`${
        primary ? "text-slate-900 font-black text-base" : "text-slate-600 text-sm"
      } leading-relaxed`}
    >
      {value || "N/A"}
    </span>
  </div>
);

const CustomInput = ({ label, full, ...props }) => (
  <div className={`${full ? "md:col-span-2" : ""}`}>
    <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 px-4 sm:px-5 py-3 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 text-sm"
    />
  </div>
);
