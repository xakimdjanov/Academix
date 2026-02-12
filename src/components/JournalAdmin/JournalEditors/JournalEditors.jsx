import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiRefreshCw, FiSend } from "react-icons/fi";
import {
  editorService,
  ReviewAssignments,
  articleService,
  journalService,
  userService,
} from "../../../services/api";

const safeArr = (x) => (Array.isArray(x) ? x : []);
const parseList = (res) => {
  const raw =
    res?.data?.data ??
    res?.data?.result ??
    res?.data?.articles ??
    res?.data?.journals ??
    res?.data?.editors ??
    res?.data ??
    [];
  return safeArr(raw);
};

const getId = (x) => x?.id ?? x?._id ?? x?.editor_id ?? x?.article_id ?? x?.journal_id;

const getEditorName = (e) =>
  e?.full_name ||
  e?.name ||
  [e?.first_name, e?.last_name].filter(Boolean).join(" ") ||
  e?.email ||
  `Editor #${getId(e)}`;

const getArticleTitle = (a) => a?.title || a?.name || `Article #${getId(a)}`;

const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const todayISO = () => addDays(new Date(), 0);

const formatNameWithLastInitial = (fullName) => {
  const s = String(fullName || "").trim();
  if (!s) return "N/A";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  const initial = last?.[0] ? `${last[0].toUpperCase()}.` : "";
  return `${first} ${initial}`.trim();
};

const JournalEditors = () => {
  const [loading, setLoading] = useState(true);

  const [editors, setEditors] = useState([]);
  const [journals, setJournals] = useState([]);
  const [articles, setArticles] = useState([]);

  // Article owner (user) info
  const [authorFullName, setAuthorFullName] = useState("");
  const [authorUserId, setAuthorUserId] = useState(null);

  const [assignLoading, setAssignLoading] = useState(false);
  const [form, setForm] = useState({
    article_id: "",
    editor_id: "",
    due_date: addDays(new Date(), 7),
    message: "",
  });

  // faqat article filtr uchun (sizda oldin ham shunday)
  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const myJournalIds = useMemo(() => {
    if (!myAdminId) return [];
    return safeArr(journals)
      .filter((j) => String(j?.journal_admin_id) === String(myAdminId))
      .map((j) => String(j?.id ?? j?._id ?? j?.journal_id))
      .filter(Boolean);
  }, [journals, myAdminId]);

  const myArticles = useMemo(() => {
    if (myJournalIds.length === 0) return [];
    return safeArr(articles).filter((a) => myJournalIds.includes(String(a?.journal_id)));
  }, [articles, myJournalIds]);

  const loadAll = async () => {
    try {
      setLoading(true);

      const [edRes, jrRes, arRes] = await Promise.all([
        editorService.getAll(),
        journalService.getAll(),
        articleService.getAll(),
      ]);

      setEditors(parseList(edRes));
      setJournals(parseList(jrRes));
      setArticles(parseList(arRes));
    } catch (e) {
      console.error(e);
      toast.error("Ma'lumotlarni yuklashda xatolik");
      setEditors([]);
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

  // ✅ Article tanlanganda: user_id -> full_name olib kelamiz
  const loadAuthorFromArticle = async (articleId) => {
    const a = myArticles.find((x) => String(getId(x)) === String(articleId));
    const uid = a?.user_id;

    setAuthorUserId(uid ?? null);
    setAuthorFullName(""); // reset

    if (!uid) return;

    try {
      const res = await userService.getById(uid);
      const u = res?.data?.data || res?.data?.user || res?.data || null;
      const full = u?.full_name || u?.name || [u?.first_name, u?.last_name].filter(Boolean).join(" ");
      setAuthorFullName(full || `User #${uid}`);
    } catch (err) {
      console.error(err);
      setAuthorFullName(`User #${uid}`);
    }
  };

  const handleArticleChange = async (e) => {
    const id = e.target.value;
    setForm((p) => ({ ...p, article_id: id }));
    if (id) await loadAuthorFromArticle(id);
    else {
      setAuthorUserId(null);
      setAuthorFullName("");
    }
  };

  const submitAssignment = async () => {
    if (!form.article_id) return toast.error("Article tanlang");
    if (!form.editor_id) return toast.error("Editor tanlang");
    if (!form.due_date) return toast.error("Due date kiriting");

    const articleIdNum = Number(form.article_id);
    const editorIdNum = Number(form.editor_id);

    if (Number.isNaN(articleIdNum) || articleIdNum <= 0) return toast.error("article_id xato");
    if (Number.isNaN(editorIdNum) || editorIdNum <= 0) return toast.error("editor_id xato");

    // ✅ FK xato chiqmasligi uchun assigned_by = editor_id
    // UI’da esa Assigned By input = article owner name (user)
    const payload = {
      article_id: articleIdNum,
      editor_id: editorIdNum,
      assigned_by: editorIdNum, // ✅ FK Editors.id
      due_date: form.due_date,
      message: form.message?.trim() || "",
    };

    try {
      setAssignLoading(true);
      await ReviewAssignments.create(payload);
      toast.success("Review assignment yaratildi!");
      setForm((p) => ({
        ...p,
        editor_id: "",
        due_date: addDays(new Date(), 7),
        message: "",
      }));
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Assignment yaratishda xatolik!";
      toast.error(msg);
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#002147] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Review Assignments</h1>
          <p className="text-sm text-slate-500 italic">Editor tanlab article biriktirish</p>
        </div>

        <button
          type="button"
          onClick={loadAll}
          className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm hover:bg-slate-50 font-semibold text-slate-700"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {!myAdminId && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700 text-sm font-semibold">
          journal_admin_id topilmadi. (Article filtr ishlamaydi) Qayta login qiling.
        </div>
      )}

      {/* Assign Form */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/60 font-extrabold text-slate-800">
          Assign Review
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Article select */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
              Article (sizning journallaringiz)
            </label>
            <select
              value={form.article_id}
              onChange={handleArticleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-semibold text-slate-700"
            >
              <option value="">Select article...</option>
              {myArticles.map((a) => {
                const id = getId(a);
                return (
                  <option key={String(id)} value={String(id)}>
                    {getArticleTitle(a)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Assigned By (UI) = Article owner full name, read-only */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
              Assigned By (Article Owner) — o‘zgarmaydi
            </label>
            <input
              value={formatNameWithLastInitial(authorFullName)}
              disabled
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-100 text-slate-800 font-extrabold text-sm cursor-not-allowed"
            />
            <div className="mt-2 text-[11px] text-slate-400">
              user_id: <span className="font-bold">{authorUserId ?? "N/A"}</span>
            </div>
          </div>

          {/* Editor select */}
          <div>
            <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
              Editor (barcha editorlar)
            </label>
            <select
              value={form.editor_id}
              onChange={(e) => setForm((p) => ({ ...p, editor_id: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-semibold text-slate-700"
            >
              <option value="">Select editor...</option>
              {editors.map((ed) => {
                const id = getId(ed);
                return (
                  <option key={String(id)} value={String(id)}>
                    {getEditorName(ed)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
              Due date
            </label>
            <input
              type="date"
              value={form.due_date}
              min={todayISO()}
              onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-semibold text-slate-700"
            />
          </div>

          {/* Message optional */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
              Message (optional)
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 p-4 focus:ring-4 focus:ring-blue-50 outline-none min-h-[110px] text-sm leading-relaxed"
              placeholder="Editor uchun izoh (ixtiyoriy)..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              disabled={assignLoading}
              onClick={submitAssignment}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#002147] text-white font-extrabold shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition disabled:opacity-60"
            >
              <FiSend /> {assignLoading ? "Sending..." : "Create Assignment"}
            </button>
          </div>

          <div className="md:col-span-2 text-[11px] text-slate-400">
            Eslatma: UI’dagi “Assigned By” — maqola egasi (user).  
            Backend FK sababli payload’dagi <b>assigned_by</b> editor_id bo‘lib yuboriladi.
          </div>
        </div>
      </div>

      {/* Editors Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/60 font-extrabold text-slate-800">
          Editors (All)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-50">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Full Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {editors.map((ed, idx) => {
                const id = getId(ed) ?? idx;
                return (
                  <tr key={String(id)} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-700">{id}</td>
                    <td className="py-4 px-6 text-slate-800 font-semibold">{getEditorName(ed)}</td>
                    <td className="py-4 px-6 text-slate-600">{ed?.email || "—"}</td>
                    <td className="py-4 px-6 text-slate-600">{ed?.phone || ed?.phone_number || "—"}</td>
                  </tr>
                );
              })}

              {editors.length === 0 && (
                <tr>
                  <td className="py-10 px-6 text-center text-slate-400" colSpan={4}>
                    Editor topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JournalEditors;
