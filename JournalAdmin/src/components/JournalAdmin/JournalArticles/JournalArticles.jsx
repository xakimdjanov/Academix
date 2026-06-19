// JournalArticles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { articleService, journalService, bobService, journalAdminService } from "../../../services/api";
import {
  FiEye,
  FiEdit2,
  FiRefreshCw,
  FiFileText,
  FiInfo,
  FiLayers,
  FiGlobe,
  FiCheckCircle,
  FiExternalLink,
} from "react-icons/fi";

const STATUSES = [
  "Submitted",
  "Under Review",
  "Revision Required",
  "Accepted",
  "Rejected",
  "Published",
];

const JournalArticles = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState("Submitted");

  // User Profile & Bobs States
  const [user, setUser] = useState(null);
  const [bobs, setBobs] = useState([]);
  const [bobsLoading, setBobsLoading] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishingArticleId, setPublishingArticleId] = useState(null);
  const [selectedBobId, setSelectedBobId] = useState("");

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
    bob_id: "",
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
      myJournalIds.includes(String(a?.journal_id)),
    );
  }, [articles, myJournalIds]);

  const filtered = useMemo(() => {
    return myArticles.filter((a) => getStatus(a) === filter);
  }, [myArticles, filter]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [jr, ar] = await Promise.all([
        journalService.getAll(),
        articleService.getAll(),
      ]);
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

  useEffect(() => {
    const loadUser = async () => {
      if (!myAdminId) return;
      try {
        const res = await journalAdminService.getById(myAdminId);
        const userData = res?.data?.data || res?.data?.user || res?.data || null;
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, [myAdminId]);

  const openEdit = (article) => {
    setEditArticle(article);
    setEditForm({
      title: article?.title || "",
      abstract: article?.abstract || "",
      keywordsText: Array.isArray(article?.keywords)
        ? article.keywords.join(", ")
        : "",
      category: article?.category || "",
      language: article?.language || "",
      authors: renderAuthor(article),
      file_url: article?.file_url || "",
      file_size: Number(article?.file_size || 0),
      apc_paid: article?.apc_paid === true,
      bob_id: article?.bob_id ? String(article.bob_id) : "",
    });
    
    if (user?.allow_bob_creation && article?.journal_id) {
      bobService.getByJournal(article.journal_id)
        .then(res => {
          setBobs(res?.data || []);
        })
        .catch(err => console.error("Error loading bobs in edit", err));
    }

    setEditOpen(true);
  };

  const renderAuthor = (article) => {
    const v = article?.authors ?? article?.author;

    if (!v) return "Not specified";
    if (typeof v === "string") return v;

    if (Array.isArray(v)) {
      return (
        v
          .map((x) =>
            typeof x === "string"
              ? x
              : x?.fullName ||
                x?.name ||
                x?.email ||
                x?.phone ||
                x?.orcidId ||
                "",
          )
          .filter(Boolean)
          .join(", ") || "Ko'rsatilmagan"
      );
    }

    if (typeof v === "object") {
      return (
        v?.fullName ||
        v?.name ||
        v?.email ||
        v?.phone ||
        v?.orcidId ||
        "Ko'rsatilmagan"
      );
    }

    return String(v);
  };

  const saveEdit = async () => {
    const id = getId(editArticle);
    if (!id) return toast.error("Article ID not found");

    const originalFormatted = renderAuthor(editArticle);
    let finalAuthors = editArticle.authors || [];
    if (editForm.authors !== originalFormatted) {
      const names = editForm.authors.split(",").map(n => n.trim()).filter(Boolean);
      finalAuthors = names.map((name, index) => {
        const originalAuthor = editArticle.authors?.[index];
        return {
          fullName: name,
          phone: originalAuthor?.phone || "",
          orcidId: originalAuthor?.orcidId || "",
        };
      });
    }

    const keywordsArray = editForm.keywordsText
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append("title", editForm.title.trim());
    formData.append("abstract", editForm.abstract.trim());
    formData.append("keywords", JSON.stringify(keywordsArray));
    formData.append("category", editForm.category.trim());
    formData.append("language", editForm.language.trim());
    formData.append("authors", JSON.stringify(finalAuthors));
    formData.append("file_url", editForm.file_url);
    formData.append("file_size", String(editForm.file_size || 0));
    formData.append("apc_paid", editForm.apc_paid ? "true" : "false");
    
    if (editForm.bob_id) {
      formData.append("bob_id", editForm.bob_id);
    } else {
      formData.append("bob_id", "");
    }

    try {
      setEditSaving(true);
      await articleService.update(id, formData);

      const updatedArticleFields = {
        title: editForm.title.trim(),
        abstract: editForm.abstract.trim(),
        keywords: keywordsArray,
        category: editForm.category.trim(),
        language: editForm.language.trim(),
        authors: finalAuthors,
        file_url: editForm.file_url,
        file_size: Number(editForm.file_size || 0),
        apc_paid: editForm.apc_paid === true,
        bob_id: editForm.bob_id ? parseInt(editForm.bob_id) : null,
      };

      setArticles((prev) =>
        prev.map((a) => (getId(a) === id ? { ...a, ...updatedArticleFields } : a)),
      );
      toast.success("Muvaffaqiyatli yangilandi");
      setEditOpen(false);
    } catch (err) {
      toast.error("Yangilashda xatolik");
    } finally {
      setEditSaving(false);
    }
  };

  const handleUpdateStatus = async (articleId, newStatus) => {
    try {
      await articleService.update(articleId, { status: newStatus });
      setArticles((prev) =>
        prev.map((a) => (getId(a) === articleId ? { ...a, status: newStatus } : a))
      );
      toast.success(`Maqola holati ${newStatus} ga o'zgartirildi`);
    } catch (err) {
      toast.error("Holatni yangilashda xatolik");
    }
  };

  const handlePublishClick = async (article) => {
    const artId = getId(article);
    if (user?.allow_bob_creation) {
      setPublishingArticleId(artId);
      setSelectedBobId("");
      setBobs([]);
      setBobsLoading(true);
      setPublishModalOpen(true);
      try {
        const res = await bobService.getByJournal(article.journal_id);
        const list = res?.data || [];
        setBobs(list);
        if (list.length > 0) {
          setSelectedBobId(String(list[0].id));
        }
      } catch (err) {
        toast.error("Boblar ro'yxatini yuklashda xatolik yuz berdi");
      } finally {
        setBobsLoading(false);
      }
    } else {
      await handleUpdateStatus(artId, "Published");
    }
  };

  const handleConfirmPublish = async () => {
    if (!selectedBobId) {
      return toast.error("Iltimos, maqola biriktirilishi kerak bo'lgan Bobni tanlang.");
    }
    try {
      setEditSaving(true);
      await articleService.update(publishingArticleId, {
        status: "Published",
        bob_id: parseInt(selectedBobId)
      });
      setArticles((prev) =>
        prev.map((a) => (getId(a) === publishingArticleId ? { ...a, status: "Published", bob_id: parseInt(selectedBobId) } : a))
      );
      toast.success("Maqola bobga biriktirilib, muvaffaqiyatli nashr etildi!");
      setPublishModalOpen(false);
      setPublishingArticleId(null);
      setSelectedBobId("");
    } catch (e) {
      toast.error("Nashr etishda xatolik yuz berdi");
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
            Maqolalarni boshqarish
          </h1>
          <p className="text-slate-500 mt-1 italic text-xs sm:text-sm">
            Jurnallaringizga yuborilgan arizalarni ko'rib chiqish
          </p>
        </div>
        <button
          onClick={loadAll}
          type="button"
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 sm:px-6 py-2.5 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-semibold text-slate-700 active:scale-[0.99]"
        >
          <FiRefreshCw /> Ma'lumotlarni yangilash
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
                {myArticles.filter((a) => getStatus(a) === s).length} Maqolalar
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
            <div
              key={id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4"
            >
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
                  <span className="font-bold">Author:</span> {renderAuthor(a)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/articles/${getId(a)}`)}
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
                  {status !== "Published" && (
                    <button
                      onClick={() => handlePublishClick(a)}
                      className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all font-bold"
                      title="Publish Now"
                    >
                      <FiGlobe size={18} />
                    </button>
                  )}
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
            <p className="text-slate-400 font-medium">
              No articles found in this category.
            </p>
          </div>
        )}
      </div>

      {/* ✅ Desktop/Tablet: Table */}
      <div className="hidden sm:block bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 sm:px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <FiLayers className="text-blue-600" /> {filter} navbati
          </h2>
          <span className="bg-white px-4 py-1.5 rounded-full border text-xs font-bold text-slate-500 shadow-sm">
            Jami: {filtered.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-50">
                <th className="py-5 px-8">Maqola sarlavhasi</th>
                <th className="py-5 px-8">Asosiy muallif</th>
                <th className="py-5 px-8 text-center">Holati</th>
                <th className="py-5 px-8 text-right">Amallar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filtered.map((a, idx) => {
                const status = getStatus(a);
                return (
                  <tr
                    key={getId(a) || idx}
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-5 px-8 max-w-md">
                      <div className="font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {a?.title || "Untitled Manuscript"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-tighter">
                        {a?.category || "General"}
                      </div>
                    </td>

                    <td className="py-5 px-8 text-slate-600 text-sm font-medium">
                      {renderAuthor(a)}
                    </td>

                    <td className="py-5 px-8">
                      <div className="flex justify-center">
                        <StatusBadge status={status} />
                      </div>
                    </td>

                    <td className="py-5 px-8">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/articledetails/${getId(a)}`)
                          }
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#002147] hover:text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                        {status === "Published" && (
                          <a
                            href={`https://akademix.uz/articles/${a.slug || getId(a)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center border border-blue-100"
                            title="Saytda o'qish (Sitesi)"
                          >
                            <FiExternalLink size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(a)}
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        {status !== "Published" && (
                          <button
                            onClick={() => handlePublishClick(a)}
                            className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Publish Now"
                          >
                            <FiGlobe size={18} />
                          </button>
                        )}
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
              <p className="text-slate-400 font-medium">
                No articles found in this category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal
        open={editOpen}
        onClose={() => !editSaving && setEditOpen(false)}
        title="Qo'lyozmani tahrirlash"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <CustomInput
            label="Maqola sarlavhasi"
            value={editForm.title}
            onChange={(e) =>
              setEditForm({ ...editForm, title: e.target.value })
            }
            full
          />
          <CustomInput
            label="Kategoriya"
            value={editForm.category}
            onChange={(e) =>
              setEditForm({ ...editForm, category: e.target.value })
            }
          />
          <CustomInput
            label="Til"
            value={editForm.language}
            onChange={(e) =>
              setEditForm({ ...editForm, language: e.target.value })
            }
          />
          <CustomInput
            label="Mualliflar (vergul bilan ajrating)"
            value={editForm.authors}
            onChange={(e) =>
              setEditForm({ ...editForm, authors: e.target.value })
            }
          />
          <CustomInput
            label="File URL"
            value={editForm.file_url}
            onChange={(e) =>
              setEditForm({ ...editForm, file_url: e.target.value })
            }
            full
          />

          <div className="md:col-span-2">
            <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
              Annotatsiya (Abstract)
            </label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 p-4 focus:ring-4 focus:ring-blue-50 outline-none min-h-[140px] transition-all text-sm leading-relaxed"
              value={editForm.abstract}
              onChange={(e) =>
                setEditForm({ ...editForm, abstract: e.target.value })
              }
            />
          </div>

          <CustomInput
            label="Kalit so'zlar (vergul bilan ajrating)"
            value={editForm.keywordsText}
            onChange={(e) =>
              setEditForm({ ...editForm, keywordsText: e.target.value })
            }
            full
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
            <CustomInput
              label="Fayl hajmi"
              type="number"
              value={editForm.file_size}
              onChange={(e) =>
                setEditForm({ ...editForm, file_size: e.target.value })
              }
            />

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3.5">
              <span className="text-sm font-bold text-slate-700">APC To'langan</span>
              <input
                type="checkbox"
                checked={editForm.apc_paid}
                onChange={(e) =>
                  setEditForm({ ...editForm, apc_paid: e.target.checked })
                }
                className="h-5 w-5 accent-[#002147]"
              />
            </label>
          </div>

          {user?.allow_bob_creation && (
            <div className="md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
                Biriktirilgan Bob (Son)
              </label>
              <select
                value={editForm.bob_id}
                onChange={(e) =>
                  setEditForm({ ...editForm, bob_id: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 sm:px-5 py-3 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-semibold text-slate-700 text-sm bg-white"
              >
                <option value="">-- Biriktirilmagan (Flat nashr) --</option>
                {bobs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.year}-yil) - {b.status === "Active" ? "Faol" : "Arxiv"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditOpen(false)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-colors"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={saveEdit}
            disabled={editSaving}
            className="w-full sm:w-auto bg-[#002147] text-white px-6 sm:px-10 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 hover:bg-blue-900 transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {editSaving ? "Saqlanmoqda..." : <>Saqlash</>}
          </button>
        </div>
      </Modal>

      {/* PUBLISH CONFIRMATION MODAL */}
      <Modal
        open={publishModalOpen}
        onClose={() => !editSaving && setPublishModalOpen(false)}
        title="Maqolani nashr qilish"
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-sm font-medium">
            Sizda Boblar (Issues) tizimi faollashtirilgan. Iltimos, maqolani nashr qilishdan oldin uni qaysi Bobga biriktirish kerakligini tanlang.
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-500 mb-2 block ml-1 uppercase">
              Bob (Volume/Issue)ni tanlang
            </label>
            {bobsLoading ? (
              <div className="py-4 text-center text-slate-400 text-sm font-medium">Boblar yuklanmoqda...</div>
            ) : bobs.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-sm">
                Ushbu jurnalda hali hech qanday Bob (Issue) yaratilmagan. Nashr qilishdan oldin avval sidebar-dagi <b>"Boblar"</b> sahifasiga o'tib, yangi Bob qo'shing.
              </div>
            ) : (
              <select
                value={selectedBobId}
                onChange={(e) => setSelectedBobId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 sm:px-5 py-3 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-semibold text-slate-700 text-sm bg-white"
              >
                {bobs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.year}-yil) - {b.status === "Active" ? "Faol" : "Arxiv"}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => setPublishModalOpen(false)}
            disabled={editSaving}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-colors"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleConfirmPublish}
            disabled={editSaving || bobs.length === 0}
            className="w-full sm:w-auto bg-[#002147] text-white px-6 sm:px-10 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 hover:bg-blue-900 transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {editSaving ? "Nashr etilmoqda..." : <>Nashr etish</>}
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
    Published: "bg-purple-50 text-purple-600 border-purple-100",
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
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl text-left shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 sm:p-7 border-b border-slate-100 shrink-0">
          <h2 className="text-base sm:text-xl font-bold text-slate-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto scrollbar-none flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

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
