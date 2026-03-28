import React, { useEffect, useMemo, useState } from "react";
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
} from "react-icons/fi";
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
  const [step, setStep] = useState(1);
  const [journals, setJournals] = useState([]);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState("");

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

  useEffect(() => {
    const loadJournals = async () => {
      setLoadingJournals(true);
      try {
        const res = await journalService.getAll();
        setJournals(res?.data || []);
      } catch {
        toast.error("Jurnallarni yuklashda xatolik yuz berdi");
      } finally {
        setLoadingJournals(false);
      }
    };
    loadJournals();
  }, []);

  const selectedJournal = useMemo(
    () => journals.find((j) => String(j.id) === String(selectedJournalId)),
    [journals, selectedJournalId]
  );

  // Handlers (unchanged logic)
  const addKeyword = () => {
    const v = keywordInput.trim();
    if (!v) return;
    if (keywords.some((k) => k.toLowerCase() === v.toLowerCase())) {
      toast.error("Ushbu kalit so'z allaqachon qo'shilgan");
      return;
    }
    setKeywords((p) => [...p, v]);
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

  const validateStep = (s) => {
    if (s === 1 && !selectedJournalId) return "Iltimos, jurnalni tanlang";
    if (s === 2) {
      if (!title.trim()) return "Sarlavha majburiy";
      if (!abstract.trim()) return "Annotatsiya majburiy";
      if (!keywords.length) return "Kamida bitta kalit so'z bo'lishi shart";
      if (!category.trim()) return "Toifa majburiy";
      if (!language.trim()) return "Til majburiy";
    }
    if (s === 3) {
      for (let i = 0; i < authors.length; i++) {
        const a = authors[i];
        if (!a.fullName?.trim()) return `${i + 1}-muallif: To'liq ism majburiy`;
        if ((a.phone?.replace(/\D/g, "") || "").length < 9) return `${i + 1}-muallif: Telefon raqami noto'g'ri`;
        if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(a.orcidId || "")) return `${i + 1}-muallif: ORCID formati noto'g'ri`;
        if (!authorImages[i]) return `${i + 1}-muallif: Rasm majburiy`;
      }
    }
    if (s === 4 && !articleFile) return "Maqola fayli majburiy";
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) return toast.error(err);
    setStep((p) => Math.min(4, p + 1));
  };

  const prev = () => setStep((p) => Math.max(1, p - 1));

  const submit = async () => {
    const err = validateStep(4);
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

      const res = await articleService.create(formData);
      const id = res?.data?.article?.id ?? res?.data?.id;
      setCreatedArticleId(id);

      toast.success("Maqola muvaffaqiyatli yuborildi!", { duration: 5000 });

      setTimeout(() => {
        setStep(1);
        setSelectedJournalId("");
        setTitle("");
        setAbstract("");
        setKeywords([]);
        setCategory("");
        setLanguage("");
        setAuthors([{ ...emptyAuthor }]);
        setAuthorImages({});
        setArticleFile(null);
      }, 2800);
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

          {/* Header + Progress Steps */}
          <div className="bg-[#002147] px-6 py-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">Maqolani yuborish</h1>
            <p className="mt-2 text-blue-100 text-center opacity-90">
              Ma'lumotlarni bosqichma-bosqich to'ldiring
            </p>

            <div className="mt-6 flex justify-center gap-4 sm:gap-8 flex-wrap">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all ${
                      step > n
                        ? "bg-white text-[#002147] border-white"
                        : step === n
                        ? "bg-white text-[#002147] border-white ring-4 ring-blue-300/40"
                        : "bg-[#002147]/40 text-white border-blue-300/60"
                    }`}
                  >
                    {step > n ? <FiCheck /> : n}
                  </div>
                  <span className="mt-2 text-xs font-medium hidden sm:block">
                    {n === 1 ? "Jurnal" : n === 2 ? "Ma'lumotlar" : n === 3 ? "Mualliflar" : "Fayl"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 lg:p-10">

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6 max-w-xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 text-center">1-bosqich: Jurnalni tanlang</h2>
                <select
                  value={selectedJournalId}
                  onChange={(e) => setSelectedJournalId(e.target.value)}
                  disabled={loadingJournals}
                  className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition disabled:opacity-60"
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
                    <p className="text-[#002147]">ISSN: {selectedJournal.issn || "—"}</p>
                    <p className="text-[#002147]">Sohasi: {selectedJournal.subject_area || "—"}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 text-center">2-bosqich: Maqola ma'lumotlari</h2>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">Sarlavha *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Maqola sarlavhasini kiriting..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">Annotatsiya *</label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition resize-y"
                    placeholder="Annotatsiyani kiriting..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">Kalit so'zlar *</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                      className="flex-1 rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="Kalit so'zni yozing va Enter tugmasini bosing"
                    />
                    <button
                      onClick={addKeyword}
                      className="rounded-xl bg-[#002147] px-6 py-3 text-white font-medium hover:bg-[#001a3a] transition"
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
                      className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="Masalan: Tadqiqot maqolasi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700">Til *</label>
                    <input
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="Masalan: Ingliz tili"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 – Authors (unchanged except text) */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">3-bosqich: Mualliflar</h2>
                  <button
                    onClick={addAuthor}
                    className="inline-flex items-center gap-2 bg-[#002147] text-white px-5 py-2.5 rounded-xl hover:bg-[#001a3a] transition font-medium"
                  >
                    <FiPlus /> Muallif qo'shish
                  </button>
                </div>

                {authors.map((author, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg font-bold text-gray-800">
                        Muallif {idx + 1}
                        {idx === 0 && (
                          <span className="ml-3 text-xs bg-[#e6f0ff] text-[#002147] px-3 py-1 rounded-full">
                            Mas'ul muallif
                          </span>
                        )}
                      </h3>
                      {authors.length > 1 && (
                        <button onClick={() => removeAuthor(idx)} className="text-gray-500 hover:text-red-600">
                          <FiTrash2 size={20} />
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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="Ism Familiya"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Phone *</label>
                        <div className="relative">
                          <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={author.phone}
                            onChange={(e) => updateAuthor(idx, "phone", formatPhone(e.target.value))}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="+998 90 123 45 67"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">ORCID *</label>
                        <div className="relative">
                          <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={author.orcidId}
                            onChange={(e) => updateAuthor(idx, "orcidId", formatOrcid(e.target.value))}
                            maxLength={19}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="0000-0000-0000-0000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Rasm *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAuthorImage(idx, e.target.files?.[0])}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-[#002147] file:text-white hover:file:bg-[#001a3a] file:transition file:cursor-pointer cursor-pointer"
                        />
                        {authorImages[idx] ? (
                          <p className="text-green-600 text-sm mt-1">Yuklandi: {authorImages[idx].name}</p>
                        ) : (
                          <p className="text-red-500 text-sm mt-1">* Majburiy</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-8 max-w-xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 text-center">4-bosqich: Maqola faylini yuklash</h2>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-blue-400 transition">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-block bg-[#002147] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#001a3a] transition"
                  >
                    Faylni tanlang
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleArticleFile(e.target.files?.[0])}
                    className="hidden"
                  />
                  <p className="mt-4 text-gray-500 text-sm">
                    PDF, DOC, DOCX • maksimal {MAX_FILE_MB} MB
                  </p>
                </div>

                {articleFile && (
                  <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                    <FiFileText className="text-[#002147]" size={28} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{articleFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(articleFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button onClick={() => setArticleFile(null)} className="text-gray-500 hover:text-red-600">
                      <FiTrash2 />
                    </button>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold hover:bg-[#001a3a] disabled:opacity-60 transition shadow-md"
                  >
                    {submitting ? "Yuborilmoqda..." : "Maqolani yuborish"}
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* Navigation - yonma-yon */}
          <div className="flex flex-row justify-between items-center px-6 sm:px-10 py-6 border-t bg-gray-50 gap-4">
            <button
              onClick={prev}
              disabled={step === 1 || submitting}
              className="flex-1 max-w-xs flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 transition"
            >
              <FiArrowLeft /> Orqaga
            </button>

            <button
              onClick={step === 4 ? submit : next}
              disabled={submitting}
              className="flex-1 max-w-xs flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#002147] text-white font-medium hover:bg-[#001a3a] disabled:opacity-60 transition shadow-md"
            >
              {step === 4 ? "Yuborish" : "Keyingisi"} <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitArticle;