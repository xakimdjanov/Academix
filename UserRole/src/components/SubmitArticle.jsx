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
  FiInfo,
  FiDollarSign
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
  phone: "+998 ",
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
  const [customCategory, setCustomCategory] = useState("");
  const [language, setLanguage] = useState("");

  const [authors, setAuthors] = useState([{ fullName: "", phone: "+998 ", orcidId: "" }]);
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
    
    // To'liq o'chirishga ruxsat beramiz
    if (!digits) return "";

    // Agar foydalanuvchi yozishni boshlasa va 998 bo'lmasa, uni qo'shib qo'yamiz
    let clean = digits;
    if (clean.length > 0 && !clean.startsWith("998")) {
      clean = "998" + clean;
    }

    // Maksimal 12 ta raqam
    clean = clean.slice(0, 12);

    // Dinamik formatlash
    const match = clean.match(/^(\d{3})(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (match) {
      const parts = [
        `+${match[1]}`,
        match[2],
        match[3],
        match[4],
        match[5]
      ].filter(Boolean);
      return parts.join(" ");
    }
    
    return "+" + clean;
  };

  const handleArticleFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) return toast.error("Faqat PDF / DOC / DOCX formatlari ruxsat etiladi");
    if (file.size / (1024 * 1024) > MAX_FILE_MB) return toast.error(`Maksimal ${MAX_FILE_MB}MB`);
    setArticleFile(file);
  };

  const [step, setStep] = useState(1);

  const nextStep = () => {
     const err = validateStep(step);
     if (err) return toast.error(err);
     setStep(p => p + 1);
  };
  const prevStep = () => setStep(p => p - 1);

  const validateStep = (s) => {
    if (s === 2) {
      if (!selectedJournalId) return "Iltimos, jurnalni tanlang";
      if (!title.trim()) return "Sarlavha majburiy";
      if (!abstract.trim()) return "Annotatsiya majburiy";
      if (!keywords.length) return "Kamida bitta kalit so'z bo'lishi shart";
      if (!category.trim()) return "Toifa majburiy";
      if (category === "Other" && !customCategory.trim()) return "Toifa nomini yozing";
      if (!language.trim()) return "Til majburiy";
    }
    if (s === 3) {
      for (let i = 0; i < authors.length; i++) {
        const a = authors[i];
        if (!a.fullName?.trim()) return `${i + 1}-muallif: To'liq ism majburiy`;
        if ((a.phone?.replace(/\D/g, "") || "").length < 9) return `${i + 1}-muallif: Telefon raqami noto'g'ri`;
        if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(a.orcidId || "")) return `${i + 1}-muallif: ORCID formati noto'g'ri`;
      }
    }
    return null;
  };

  const submit = async () => {
    if (!articleFile && !isEdit) return toast.error("Maqola fayli majburiy");

    const userId = getUserIdFromToken();
    if (!userId) return toast.error("Seans topilmadi");

    setSubmitting(true);
    // ... same submit logic

    try {
      const formData = new FormData();
      formData.append("journal_id", selectedJournalId);
      formData.append("user_id", userId);
      formData.append("title", title.trim());
      formData.append("abstract", abstract.trim());
      formData.append("keywords", JSON.stringify(keywords));
      formData.append("category", category === "Other" ? customCategory.trim() : category.trim());
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

          <div className="p-6 sm:p-8 lg:p-10">
            {/* STEPPER INDICATOR */}
            <div className="flex items-center justify-between mb-12 relative px-4">
               {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex flex-col items-center relative z-10">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${
                        step >= s ? "bg-[#002147] text-white border-[#002147] shadow-lg shadow-blue-900/20" : "bg-white text-gray-400 border-gray-200"
                     }`}>
                        {step > s ? <FiCheck /> : s}
                     </div>
                     <span className={`text-[10px] mt-2 font-black uppercase tracking-widest ${step >= s ? "text-[#002147]" : "text-gray-400"}`}>
                        {s === 1 ? "Qo'llanma" : s === 2 ? "Ma'lumotlar" : s === 3 ? "Mualliflar" : "Fayl"}
                     </span>
                  </div>
               ))}
               <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-100 -z-0">
                  <div className="h-full bg-[#002147] transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
               </div>
            </div>

            {/* STEP 1: GUIDELINES */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-[#002147] flex items-center gap-3 mb-6">
                    <FiInfo className="text-blue-600" size={28} /> Qanday maqola yuboriladi?
                  </h3>
                  
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <div className="flex gap-4">
                       <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-md">!</div>
                       <p className="font-bold text-red-600">
                          DIQQAT: Maqolani yuborayotgan shaxs (platforma foydalanuvchisi) avtomatik ravishda muallif hisoblanmaydi. 
                          Agar siz ham muallif bo'lsangiz, o'zingizni "Mualliflar" bo'limida alohida kiritishingiz shart!
                       </p>
                    </div>

                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <FiCheck className="text-green-500 mt-1 shrink-0" />
                        <span><b>1-bosqich:</b> Jurnalni tanlang va maqola sarlavhasi, annotatsiyasi hamda kalit so'zlarini kiriting.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiCheck className="text-green-500 mt-1 shrink-0" />
                        <span><b>2-bosqich:</b> Maqolada ishtirok etgan barcha mualliflarni birma-bir kiriting. Har bir muallifning ORCID ID raqami bo'lishi shart.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiCheck className="text-green-500 mt-1 shrink-0" />
                        <span><b>3-bosqich:</b> Maqola faylini (.pdf, .doc, .docx) yuklang. Fayl hajmi 20MB dan oshmasligi kerak.</span>
                      </li>
                    </ul>

                    <p className="bg-white p-4 rounded-2xl border border-blue-100 text-sm italic">
                       * Maqolangiz tahririyat tomonidan ko'rib chiqiladi va natijasi haqida profilingizga xabarnoma yuboriladi.
                    </p>
                  </div>
                </div>

                <button onClick={nextStep} className="w-full bg-[#002147] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#001a3a] transition shadow-xl flex items-center justify-center gap-3">
                   Tushundim, boshlash <FiArrowRight />
                </button>
              </div>
            )}

            {/* STEP 2: JOURNAL & INFO */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#002147] pb-2 border-b border-gray-200">1. Jurnalni tanlang</h2>
                  <div className="relative">
                    <select
                      value={selectedJournalId}
                      onChange={(e) => setSelectedJournalId(e.target.value)}
                      disabled={loadingJournals || !!initialJournalId}
                      className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition disabled:opacity-60 bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Jurnalni tanlang...</option>
                      {journals.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name} {j.issn && `(ISSN: ${j.issn})`}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {selectedJournal && (
                    <div className="bg-[#e6f0ff] border border-blue-100 rounded-xl p-6 space-y-3">
                      <h3 className="font-bold text-[#002147] text-lg">{selectedJournal.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p className="text-[#002147] text-sm flex items-center gap-2 font-medium">
                          <FiInfo className="text-blue-500" /> ISSN: {selectedJournal.issn || "—"}
                        </p>
                        <p className="text-[#002147] text-sm flex items-center gap-2 font-medium">
                          <FiGlobe className="text-blue-500" /> Sohasi: {selectedJournal.subject_area || "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

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
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                        className="flex-1 rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                        placeholder="Kalit so'z yozing, vergul yoki Enter bilan ajrating"
                      />
                      <button onClick={() => addKeyword()} className="rounded-xl bg-[#002147] px-6 py-3 text-white font-medium hover:bg-[#001a3a] transition shadow-sm">
                        Qo'shish
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                       {keywords.map((k, i) => (
                          <span key={i} onClick={() => removeKeyword(i)} className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#e6f0ff] text-[#002147] text-sm cursor-pointer hover:bg-blue-200 transition">
                             {k} <span className="font-bold">×</span>
                          </span>
                       ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700">Toifa *</label>
                      <div className="relative">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition bg-white appearance-none cursor-pointer">
                          <option value="">Toifani tanlang...</option>
                          <option value="Research Article">Research Article</option>
                          <option value="Review Article">Review Article</option>
                          <option value="Case Study">Case Study</option>
                          <option value="Other">Boshqa...</option>
                        </select>
                      </div>
                      {category === "Other" && (
                        <input type="text" placeholder="Toifa nomini yozing..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full mt-2 rounded-xl border border-blue-300 px-5 py-3 outline-none bg-blue-50/30" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700">Til *</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-gray-300 px-5 py-3 outline-none bg-white">
                        <option value="">Tilni tanlang...</option>
                        <option value="English">English</option>
                        <option value="Uzbek">O'zbekcha</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-6 border-t">
                   <button onClick={prevStep} className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition">Orqaga</button>
                   <button onClick={nextStep} className="flex-1 bg-[#002147] text-white py-4 rounded-xl font-bold hover:bg-[#001a3a] transition shadow-lg flex items-center justify-center gap-2">Keyingisi <FiArrowRight /></button>
                </div>
              </div>
            )}

            {/* STEP 3: AUTHORS */}
            {step === 3 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                     <h2 className="text-xl font-bold text-[#002147]">3. Mualliflar</h2>
                     <button onClick={addAuthor} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-100 transition font-medium text-sm">
                        <FiPlus /> Muallif qo'shish
                     </button>
                  </div>

                  <div className="space-y-6">
                    {authors.map((author, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 shadow-sm relative">
                        <div className="flex justify-between items-center mb-5">
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                             <span className="w-8 h-8 rounded-lg bg-[#002147] text-white flex items-center justify-center text-xs">{idx + 1}</span>
                             Muallif
                          </h3>
                          {authors.length > 1 && (
                            <button onClick={() => removeAuthor(idx)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition"><FiTrash2 /></button>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">To'liq ismi *</label>
                              <input value={author.fullName} onChange={(e) => updateAuthor(idx, "fullName", e.target.value)} className="w-full px-5 py-3 rounded-xl border border-gray-300 bg-white" placeholder="Ism Familiya" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">Telefon raqam *</label>
                              <input value={author.phone} onChange={(e) => updateAuthor(idx, "phone", formatPhone(e.target.value))} className="w-full px-5 py-3 rounded-xl border border-gray-300 bg-white" placeholder="+998 90..." />
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">ORCID ID *</label>
                              <input value={author.orcidId} onChange={(e) => updateAuthor(idx, "orcidId", formatOrcid(e.target.value))} maxLength={19} className="w-full px-5 py-3 rounded-xl border border-gray-300 bg-white" placeholder="0000-0000..." />
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">Rasmi (Ixtiyoriy)</label>
                              <div className="flex items-center gap-4">
                                 {authorImages[idx] && (
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-100 shadow-sm shrink-0">
                                       <img 
                                          src={URL.createObjectURL(authorImages[idx])} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover"
                                          onLoad={() => { /* cleanup would be better but simple preview is fine */ }}
                                       />
                                    </div>
                                 )}
                                 <label className="flex-1">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all group">
                                       <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                          <FiUpload size={20} />
                                       </div>
                                       <div className="flex-1">
                                          <p className="text-sm font-bold text-gray-700">Rasm yuklash</p>
                                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-black">PNG, JPG (MAX. 5MB)</p>
                                       </div>
                                    </div>
                                    <input 
                                       type="file" 
                                       accept="image/*" 
                                       onChange={(e) => handleAuthorImage(idx, e.target.files?.[0])} 
                                       className="hidden" 
                                    />
                                 </label>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between gap-4 pt-6 border-t">
                     <button onClick={prevStep} className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition">Orqaga</button>
                     <button onClick={nextStep} className="flex-1 bg-[#002147] text-white py-4 rounded-xl font-bold hover:bg-[#001a3a] transition shadow-lg flex items-center justify-center gap-2">Keyingisi <FiArrowRight /></button>
                  </div>
               </div>
            )}

            {/* STEP 4: FILE UPLOAD */}
            {step === 4 && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-xl font-bold text-[#002147] pb-2 border-b border-gray-200">4. Maqola fayli va tasdiqlash</h2>
                  
                  <div className="border-2 border-dashed border-blue-200 rounded-3xl p-12 text-center hover:border-blue-500 transition-all bg-blue-50/20 cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                     <FiUpload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                     <p className="text-gray-500 mb-6">PDF, DOC, DOCX formatlari (Maks: 20MB)</p>
                     <span className="inline-block bg-[#002147] text-white px-10 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">Faylni yuklash</span>
                     <input id="file-upload" type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleArticleFile(e.target.files?.[0])} className="hidden" />
                  </div>

                  {articleFile && (
                    <div className="flex items-center gap-4 p-6 bg-[#002147] text-white rounded-2xl shadow-xl animate-in zoom-in">
                       <FiFileText size={32} className="text-blue-300" />
                       <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{articleFile.name}</p>
                          <p className="text-xs text-blue-200 font-medium">{(articleFile.size / 1024 / 1024).toFixed(2)} MB</p>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); setArticleFile(null); }} className="p-3 bg-white/10 hover:bg-red-500 rounded-xl transition-all">
                          <FiTrash2 size={20} />
                       </button>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 pt-6 border-t">
                     <button onClick={prevStep} className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition">Orqaga</button>
                     <button onClick={submit} disabled={submitting} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition shadow-xl flex items-center justify-center gap-3">
                        {submitting ? "Yuborilmoqda..." : "Yakunlash va Yuborish"} <FiCheck />
                     </button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitArticle;