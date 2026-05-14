import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiFileText,
  FiUser,
  FiPhone,
  FiGlobe,
  FiInfo
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { articleService, journalService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const MAX_FILE_MB = 20;
const ACCEPTED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const emptyAuthor = {
  fullName: "",
  phone: "",
  orcidId: "",
};

const SubmitArticle = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialJournalId = queryParams.get("journalId") || "";

  const [journals, setJournals] = useState([]);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState(initialJournalId);

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");

  const [authors, setAuthors] = useState([{ ...emptyAuthor }]);
  const [authorImages, setAuthorImages] = useState({});

  const [articleFile, setArticleFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [createdArticleId, setCreatedArticleId] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      const loadArticle = async () => {
        try {
          const res = await articleService.getById(id);
          const a = res.data;
          if (a) {
            setSelectedJournalId(a.journal_id);
            setTitle(a.title || "");
            setAbstract(a.abstract || "");
            
            let kw = [];
            if (a.keywords) {
              try {
                kw = typeof a.keywords === 'string' ? JSON.parse(a.keywords) : a.keywords;
              } catch {
                kw = a.keywords.split(',').map(k => k.trim());
              }
            }
            setKeywords(Array.isArray(kw) ? kw : []);
            
            setCategory(a.category || "");
            setLanguage(a.language || "");
            
            if (a.authors) {
              const parsedAuthors = typeof a.authors === 'string' ? JSON.parse(a.authors) : a.authors;
              setAuthors(parsedAuthors.map(auth => ({
                fullName: auth.fullName || auth.full_name || "",
                phone: auth.phone || "",
                orcidId: auth.orcidId || auth.orcid_id || "",
              })));
            }
          }
        } catch (error) {
          toast.error("Maqola ma'lumotlarini yuklashda xatolik");
          console.error(error);
        }
      };
      loadArticle();
    }
  }, [id, isEdit]);

  useEffect(() => {
    const loadJournals = async () => {
      setLoadingJournals(true);
      try {
        const res = await journalService.getAll();
        const jList = res?.data || [];
        setJournals(jList);
        
        // If initialJournalId is provided, try to find it
        if (initialJournalId && !isEdit) {
           const found = jList.find(j => String(j.id) === String(initialJournalId));
           if (found) setSelectedJournalId(initialJournalId);
        }
      } catch {
        toast.error("Jurnallarni yuklashda xatolik yuz berdi");
      } finally {
        setLoadingJournals(false);
      }
    };
    loadJournals();
  }, [initialJournalId, isEdit]);

  const selectedJournal = useMemo(
    () => journals.find((j) => String(j.id) === String(selectedJournalId)),
    [journals, selectedJournalId]
  );

  // Handlers (unchanged logic)
  const addKeyword = (rawValue) => {
    const source = rawValue !== undefined ? rawValue : keywordInput;
    // Vergul bilan ajratilgan so'zlarni alohida qo'shamiz
    const parts = source.split(",").map((v) => v.trim()).filter(Boolean);
    const added = [];
    const dupes = [];
    parts.forEach((v) => {
      if (keywords.some((k) => k.toLowerCase() === v.toLowerCase())) {
        dupes.push(v);
      } else {
        added.push(v);
      }
    });
    if (dupes.length) toast.error(`Allaqachon qo'shilgan: ${dupes.join(", ")}`);
    if (added.length) setKeywords((p) => [...p, ...added]);
    setKeywordInput("");
  };

  const removeKeyword = (idx) => setKeywords((p) => p.filter((_, i) => i !== idx));

  const addAuthor = () => setAuthors((p) => [...p, { ...emptyAuthor }]);

  const removeAuthor = (idx) => {
    if (authors.length === 1) return toast.error("Kamida bitta muallif bo'lishi shart");
    setAuthors((p) => p.filter((_, i) => i !== idx));
    setAuthorImages((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const updateAuthor = (idx, field, value) =>
    setAuthors((p) => p.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));

  const handleAuthorImage = (idx, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Faqat rasm fayllari ruxsat etiladi");
    if (file.size / (1024 * 1024) > 5) return toast.error("Rasm hajmi 5MB dan kam bo'lishi kerak");
    setAuthorImages((prev) => ({ ...prev, [idx]: file }));
  };

  const formatOrcid = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g)?.join("-") || digits;
  };

  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, "");
    if (digits.startsWith("998") && digits.length >= 12) {
      return digits.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "+$1 $2 $3 $4 $5");
    }
    return digits;
  };

  const handleArticleFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) return toast.error("Faqat PDF / DOC / DOCX formatlari ruxsat etiladi");
    if (file.size / (1024 * 1024) > MAX_FILE_MB) return toast.error(`Maksimal ${MAX_FILE_MB}MB`);
    setArticleFile(file);
  };

  const validateForm = () => {
    if (!selectedJournalId) return "Iltimos, jurnalni tanlang";
    if (!title.trim()) return "Sarlavha majburiy";
    if (!abstract.trim()) return "Annotatsiya majburiy";
    if (!keywords.length) return "Kamida bitta kalit so'z bo'lishi shart";
    if (!category.trim()) return "Toifa majburiy";
    if (!language.trim()) return "Til majburiy";
    for (let i = 0; i < authors.length; i++) {
      const a = authors[i];
      if (!a.fullName?.trim()) return `${i + 1}-muallif: To'liq ism majburiy`;
      if ((a.phone?.replace(/\D/g, "") || "").length < 9) return `${i + 1}-muallif: Telefon raqami noto'g'ri`;
      if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(a.orcidId || "")) return `${i + 1}-muallif: ORCID formati noto'g'ri`;
      if (!authorImages[i] && !isEdit) return `${i + 1}-muallif: Rasm majburiy`;
    }
    if (!articleFile && !isEdit) return "Maqola fayli majburiy";
    return null;
  };

  const submit = async () => {
    const err = validateForm();
    if (err) return toast.error(err);

    const userId = getUserIdFromToken();
    if (!userId) return toast.error("Seans topilmadi");

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("journal_id", selectedJournalId);
      formData.append("user_id", userId);
      formData.append("title", title.trim());
      formData.append("abstract", abstract.trim());
      formData.append("keywords", JSON.stringify(keywords));
      formData.append("category", category.trim());
      formData.append("language", language.trim());
      formData.append("apc_paid", "false");

      const authorsForBE = authors.map((a) => ({
        fullName: a.fullName.trim(),
        phone: a.phone.replace(/\D/g, ""),
        orcidId: a.orcidId.trim(),
      }));
      formData.append("authors", JSON.stringify(authorsForBE));

      if (articleFile) formData.append("file_url", articleFile);

      Object.values(authorImages).forEach((file) => {
        formData.append("author_images", file);
      });

      if (isEdit) {
        await articleService.update(id, formData);
        toast.success("Maqola muvaffaqiyatli yangilandi!");
      } else {
        const res = await articleService.create(formData);
        const idRes = res?.data?.article?.id ?? res?.data?.id;
        setCreatedArticleId(idRes);
        toast.success("Maqola muvaffaqiyatli yuborildi!", { duration: 5000 });
      }

      setTimeout(() => {
        if (isEdit) {
          navigate("/dashboard/my-articles");
        } else {
          setSelectedJournalId("");
          setTitle("");
          setAbstract("");
          setKeywords([]);
          setCategory("");
          setLanguage("");
          setAuthors([{ ...emptyAuthor }]);
          setAuthorImages({});
          setArticleFile(null);
        }
      }, 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Xato yuz berdi";
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-[#002147] px-6 py-8 text-white text-center">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {isEdit ? "Maqolani tahrirlash" : "Maqolani yuborish"}
            </h1>
            <p className="mt-2 text-blue-100 opacity-90 max-w-2xl mx-auto">
              Iltimos, maqolangizni yuborish uchun barcha kerakli ma'lumotlarni aniq to'ldiring.
            </p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 space-y-12">
            
            {/* Instructions Section */}
            {!isEdit && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-900 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <FiInfo className="text-blue-600" size={24} /> Qanday maqola yuboriladi?
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm md:text-base opacity-90">
                  <li>Avval <b>jurnalni tanlang</b>. Jurnal talablariga mos maqola tayyorlaganingizga ishonch hosil qiling.</li>
                  <li>Maqola sarlavhasi, annotatsiyasi va kamida bitta kalit so'zni kiriting.</li>
                  <li>Barcha mualliflarni kiriting. Har bir muallifning <b>ORCID ID</b>si va <b>Rasmi</b> talab qilinadi.</li>
                  <li>Maqola faylini (<b>.pdf, .doc, .docx</b>) formatlaridan birida yuklang. Maksimal hajm: {MAX_FILE_MB}MB.</li>
                  <li>Barcha maydonlarni tekshirib chiqqach, "Maqolani yuborish" tugmasini bosing.</li>
                </ul>
              </div>
            )}

            {/* Step 1: Journal */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#002147] pb-2 border-b border-gray-200">1. Jurnalni tanlang</h2>
              <select
                value={selectedJournalId}
                onChange={(e) => setSelectedJournalId(e.target.value)}
                disabled={loadingJournals || !!initialJournalId}
                className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition disabled:opacity-60 bg-white"
              >
                <option value="">Jurnalni tanlang...</option>
                {journals.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name} {j.issn && `(ISSN: ${j.issn})`}
                  </option>
                ))}
              </select>

              {selectedJournal && (
                <div className="bg-[#e6f0ff] border border-blue-100 rounded-xl p-6 space-y-2">
                  <h3 className="font-bold text-[#002147]">{selectedJournal.name}</h3>
                  <p className="text-[#002147] text-sm">ISSN: {selectedJournal.issn || "—"}</p>
                  <p className="text-[#002147] text-sm">Sohasi: {selectedJournal.subject_area || "—"}</p>
                </div>
              )}
            </div>

            {/* Step 2: Article Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#002147] pb-2 border-b border-gray-200">2. Maqola ma'lumotlari</h2>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Sarlavha *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                  placeholder="Maqola sarlavhasini kiriting..."
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Annotatsiya *</label>
                <textarea
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition resize-y bg-white"
                  placeholder="Annotatsiyani kiriting..."
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Kalit so'zlar *</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={keywordInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Vergul kiritilsa darhol ajratib qo'shamiz
                      if (val.includes(",")) {
                        addKeyword(val);
                      } else {
                        setKeywordInput(val);
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                    className="flex-1 rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    placeholder="Kalit so'z yozing, vergul yoki Enter bilan ajrating"
                  />
                  <button
                    onClick={addKeyword}
                    className="rounded-xl bg-[#002147] px-6 py-3 text-white font-medium hover:bg-[#001a3a] transition shadow-sm"
                  >
                    Qo'shish
                  </button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {keywords.map((k, i) => (
                      <span
                        key={i}
                        onClick={() => removeKeyword(i)}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#e6f0ff] text-[#002147] text-sm cursor-pointer hover:bg-blue-200 transition"
                      >
                        {k} <span className="font-bold">×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">Toifa *</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                    placeholder="Masalan: Tadqiqot maqolasi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">Til *</label>
                  <input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                    placeholder="Masalan: Ingliz tili"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Authors */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-bold text-[#002147]">3. Mualliflar</h2>
                <button
                  onClick={addAuthor}
                  className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-100 transition font-medium text-sm"
                >
                  <FiPlus /> Muallif qo'shish
                </button>
              </div>

              <div className="space-y-6">
                {authors.map((author, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm relative">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-[#002147] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                        Muallif
                        {idx === 0 && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                            Mas'ul muallif
                          </span>
                        )}
                      </h3>
                      {authors.length > 1 && (
                        <button onClick={() => removeAuthor(idx)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition">
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">To'liq ismi *</label>
                        <div className="relative">
                          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={author.fullName}
                            onChange={(e) => updateAuthor(idx, "fullName", e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                            placeholder="Ism Familiya"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Telefon raqam *</label>
                        <div className="relative">
                          <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={author.phone}
                            onChange={(e) => updateAuthor(idx, "phone", formatPhone(e.target.value))}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                            placeholder="+998 90 123 45 67"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">ORCID ID *</label>
                        <div className="relative">
                          <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={author.orcidId}
                            onChange={(e) => updateAuthor(idx, "orcidId", formatOrcid(e.target.value))}
                            maxLength={19}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                            placeholder="0000-0000-0000-0000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Muallif rasmi *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAuthorImage(idx, e.target.files?.[0])}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-[#002147] file:text-white hover:file:bg-[#001a3a] file:transition file:cursor-pointer cursor-pointer bg-white border border-gray-300 rounded-xl"
                        />
                        {authorImages[idx] ? (
                          <p className="text-green-600 text-sm mt-1 font-medium">Yuklandi: {authorImages[idx].name}</p>
                        ) : (
                          <p className="text-red-500 text-xs mt-1">* Majburiy (5MB gacha)</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: File Upload */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#002147] pb-2 border-b border-gray-200">4. Maqola fayli</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 text-center hover:border-blue-400 transition bg-white cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                <FiUpload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <span className="inline-block bg-[#002147] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#001a3a] transition shadow-md">
                  Faylni tanlang
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleArticleFile(e.target.files?.[0])}
                  className="hidden"
                />
                <p className="mt-4 text-gray-500 text-sm">
                  PDF, DOC, DOCX formatlari qo'llab-quvvatlanadi. Maksimal hajm: {MAX_FILE_MB} MB.
                </p>
              </div>

              {articleFile && (
                <div className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="bg-white p-3 rounded-lg text-blue-600 shadow-sm">
                    <FiFileText size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#002147] truncate">{articleFile.name}</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {(articleFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setArticleFile(null); }} className="text-red-500 hover:text-red-700 bg-red-100 p-2 rounded-lg transition">
                    <FiTrash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full bg-[#002147] text-white py-4 rounded-xl text-lg font-bold hover:bg-[#001a3a] disabled:opacity-60 transition shadow-xl flex items-center justify-center gap-3"
              >
                {submitting ? "Yuborilmoqda..." : isEdit ? "O'zgarishlarni saqlash" : "Maqolani yuborish"}
                {!submitting && <FiArrowRight />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitArticle;