import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiFileText,
  FiUser,
  FiGlobe,
  FiInfo,
  FiAward,
  FiSearch,
  FiLoader,
  FiBookOpen
} from "react-icons/fi";
import { articleService, journalService, userService } from "../../../services/api";

const MAX_FILE_MB = 20;

const getDefaultAvatarFile = async () => {
  try {
    const res = await fetch("https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png");
    const blob = await res.blob();
    return new File([blob], "default-author.png", { type: "image/png" });
  } catch (err) {
    console.error("Default avatar fetch error, using fallback", err);
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const res = await fetch(`data:image/png;base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], "default-author.png", { type: "image/png" });
  }
};

const emptyAuthor = {
  fullName: "",
  phone: "+998 ",
  orcidId: "",
  doi: "",
  photoFile: null,
  photoPreview: null
};

const SendOldArticle = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data lists
  const [journals, setJournals] = useState([]);
  const [users, setUsers] = useState([]);
  
  // User Search and Dropdown State
  const [userSearch, setUserSearch] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  // Form Fields
  const [selectedJournalId, setSelectedJournalId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserObject, setSelectedUserObject] = useState(null);
  
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  
  // Authors State
  const [authors, setAuthors] = useState([{ fullName: "", phone: "+998 ", orcidId: "", doi: "", photoFile: null, photoPreview: null }]);

  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jrRes, usRes] = await Promise.all([
          journalService.getAll(),
          userService.getAll()
        ]);

        // Parse journals
        const jList = jrRes?.data?.data || jrRes?.data?.journals || jrRes?.data || [];
        const myJournals = Array.isArray(jList)
          ? jList.filter((j) => String(j?.journal_admin_id) === String(myAdminId))
          : [];
        setJournals(myJournals);
        if (myJournals.length > 0) {
          setSelectedJournalId(myJournals[0]?.id || myJournals[0]?._id || "");
        }

        // Parse users
        const uList = usRes?.data?.data || usRes?.data?.users || usRes?.data || [];
        setUsers(Array.isArray(uList) ? uList : []);
      } catch (err) {
        console.error(err);
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    if (myAdminId) {
      fetchData();
    } else {
      toast.error("Tizimga qayta kiring (Admin ID topilmadi)");
      setLoading(false);
    }
  }, [myAdminId]);

  const selectedJournal = useMemo(
    () => journals.find((j) => String(j.id || j._id) === String(selectedJournalId)),
    [journals, selectedJournalId]
  );

  const journalCategories = useMemo(() => {
    if (selectedJournal && Array.isArray(selectedJournal.categories) && selectedJournal.categories.length > 0) {
      return selectedJournal.categories.map(c => typeof c === 'object' ? c.name : c);
    }
    return ["Research Article", "Review Article", "Case Study"];
  }, [selectedJournal]);

  // Filtered users for dropdown search
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    return users.filter((u) => {
      const name = (u?.full_name || u?.fullName || "").toLowerCase();
      const email = (u?.email || "").toLowerCase();
      const term = userSearch.toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [users, userSearch]);

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id || user._id);
    setSelectedUserObject(user);
    setUserSearch(user?.full_name || user?.fullName || user?.email || "");
    setIsUserDropdownOpen(false);
  };

  // Keyword tag manager
  const addKeyword = (rawValue) => {
    const source = rawValue !== undefined ? rawValue : keywordInput;
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

  // Authors dynamic controls
  const addAuthor = () => setAuthors((p) => [...p, { ...emptyAuthor }]);

  const removeAuthor = (idx) => {
    if (authors.length === 1) return toast.error("Kamida bitta muallif bo'lishi shart");
    setAuthors((p) => p.filter((_, i) => i !== idx));
  };

  const updateAuthor = (idx, field, value) => {
    setAuthors((p) => p.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const handleAuthorPhotoChange = (idx, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Faqat rasm fayllari ruxsat etiladi");
    if (file.size / (1024 * 1024) > 5) return toast.error("Rasm hajmi 5MB dan kam bo'lishi kerak");
    
    const preview = URL.createObjectURL(file);
    setAuthors((p) =>
      p.map((a, i) => (i === idx ? { ...a, photoFile: file, photoPreview: preview } : a))
    );
  };

  // Formatters
  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, "");
    if (!digits) return "";
    let clean = digits;
    if (clean.length > 0 && !clean.startsWith("998")) {
      clean = "998" + clean;
    }
    clean = clean.slice(0, 12);
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

  // PDF File upload handler
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Faqat PDF formatidagi fayllar qabul qilinadi");
        return;
      }
      if (file.size / (1024 * 1024) > MAX_FILE_MB) {
        toast.error(`Maksimal fayl hajmi: ${MAX_FILE_MB}MB`);
        return;
      }
      setPdfFile(file);
    }
  };

  // Navigation validation
  const validateStep = (s) => {
    if (s === 2) {
      if (!selectedJournalId) return "Iltimos, jurnalni tanlang";
      if (!selectedUserId) return "Yuboruvchi foydalanuvchini tanlang";
      if (!title.trim()) return "Maqola sarlavhasi majburiy";
      if (!abstract.trim()) return "Annotatsiya majburiy";
      if (!keywords.length) return "Kamida bitta kalit so'z bo'lishi shart";
      if (!category.trim()) return "Toifa majburiy";
      if (category === "Other" && !customCategory.trim()) return "Boshqa toifa nomini kiriting";
      if (!language.trim()) return "Til majburiy";
    }
    if (s === 3) {
      for (let i = 0; i < authors.length; i++) {
        const a = authors[i];
        if (!a.fullName.trim()) return `${i + 1}-muallif: To'liq ism majburiy`;
        if ((a.phone.replace(/\D/g, "") || "").length < 9) return `${i + 1}-muallif: Telefon raqami noto'g'ri`;
        if (!a.orcidId.trim()) return `${i + 1}-muallif: ORCID ID majburiy`;
        if (!a.doi.trim()) return `${i + 1}-muallif: DOI majburiy`;
      }
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) return toast.error(err);
    setStep((p) => p + 1);
  };
  const prevStep = () => setStep((p) => p - 1);

  // Form submission logic
  const submit = async () => {
    if (!pdfFile) {
      toast.error("Maqola PDF faylini yuklang");
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append("journal_id", selectedJournalId);
      formData.append("user_id", selectedUserId);
      formData.append("title", title.trim());
      formData.append("abstract", abstract.trim());
      formData.append("category", category === "Other" ? customCategory.trim() : category.trim());
      formData.append("language", language.trim());
      formData.append("apc_paid", "true"); // Archived old articles are marked as APC paid
      formData.append("status", "Published"); // Directly create with 'Published' status

      formData.append("keywords", JSON.stringify(keywords));

      // Prepare authors standard metadata array
      const authorsMetadata = authors.map((a) => ({
        fullName: a.fullName.trim(),
        phone: a.phone.replace(/\D/g, ""),
        orcidId: a.orcidId.trim(),
        doi: a.doi.trim()
      }));
      formData.append("authors", JSON.stringify(authorsMetadata));

      // Append Article PDF
      formData.append("file_url", pdfFile);

      // Append Author Photos in order
      let defaultFile = null;
      for (let i = 0; i < authors.length; i++) {
        const a = authors[i];
        if (a.photoFile) {
          formData.append(`author_image_${i}`, a.photoFile);
        } else {
          if (!defaultFile) {
            defaultFile = await getDefaultAvatarFile();
          }
          formData.append(`author_image_${i}`, defaultFile);
        }
      }

      await articleService.create(formData);

      toast.success("Eski maqola muvaffaqiyatli arxivga qo'shildi va nashr etildi!");
      
      setTimeout(() => {
        navigate("/journal-articles");
      }, 2000);
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.message || "Saqlashda xatolik yuz berdi";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#002147] border-t-transparent mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-3xl border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#002147] px-6 py-10 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center justify-center gap-2">
                <FiAward className="text-blue-400" /> Eski maqolalarni jo'natish (Arxiv)
              </h1>
              <p className="mt-2 text-blue-100 opacity-90 max-w-2xl mx-auto text-sm">
                Avval chop etilgan maqolalarni qadam-baqadam tizim arxiviga qo'shish va nashr qilish formasi.
              </p>
            </div>
            <div className="absolute inset-0 bg-blue-900/10 -skew-y-3 scale-110 pointer-events-none" />
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
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-150 -z-0">
                <div className="h-full bg-[#002147] transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
              </div>
            </div>

            {/* STEP 1: GUIDELINES */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-[#002147] flex items-center gap-3 mb-6">
                    <FiInfo className="text-blue-600" size={28} /> Arxiv maqolalarini kiritish bo'yicha yo'riqnoma
                  </h3>
                  
                  <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
                    <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm">!</div>
                      <p className="font-semibold text-amber-900">
                        DIQQAT: Tizimga yuklangan arxiv maqolalari tahririyat tomonidan tekshirilmaydi, balki to'g'ridan-to'g'ri chop etilgan statusi bilan tizim arxiviga joylashtiriladi.
                      </p>
                    </div>

                    <ul className="space-y-4 font-medium">
                      <li className="flex items-start gap-3">
                        <FiCheck className="text-emerald-500 mt-1 shrink-0" size={18} />
                        <span><b>1-bosqich:</b> Maqola chop etiladigan jurnal, yuboruvchi foydalanuvchi, annotatsiya va kalit so'zlarni kiriting.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiCheck className="text-emerald-500 mt-1 shrink-0" size={18} />
                        <span><b>2-bosqich:</b> Maqolaning barcha mualliflarini (rasmi, orcid va telefoni bilan) to'liq kiriting.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiCheck className="text-emerald-500 mt-1 shrink-0" size={18} />
                        <span><b>3-bosqich:</b> Maqola PDF faylini yuklang va tasdiqlang.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button onClick={nextStep} className="w-full bg-[#002147] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#001a3a] transition-all active:scale-[0.99] shadow-xl flex items-center justify-center gap-3">
                  Tushundim, davom etish <FiArrowRight />
                </button>
              </div>
            )}

            {/* STEP 2: JOURNAL, SUBMITTER & INFO */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                
                {/* 1. Jurnal va Yuboruvchi */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#002147] pb-2 border-b border-slate-100 flex items-center gap-2">
                    <FiBookOpen className="text-blue-500" /> 1. Jurnal va Maqola egasi
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Journal Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Chop etiladigan jurnal *</label>
                      <div className="relative">
                        <select
                          value={selectedJournalId}
                          onChange={(e) => setSelectedJournalId(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition bg-white appearance-none cursor-pointer text-sm font-semibold"
                        >
                          <option value="">Jurnalni tanlang...</option>
                          {journals.map((j) => (
                            <option key={j.id || j._id} value={j.id || j._id}>
                              {j.title || j.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Searchable Submitter Selection */}
                    <div className="space-y-2 relative">
                      <label className="block text-sm font-bold text-slate-700">Yuboruvchi Foydalanuvchi *</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Foydalanuvchi ism yoki email..."
                          className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition bg-white text-sm font-semibold"
                          value={userSearch}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            setIsUserDropdownOpen(true);
                            if (selectedUserId && e.target.value !== selectedUserObject?.full_name) {
                              setSelectedUserId("");
                              setSelectedUserObject(null);
                            }
                          }}
                          onFocus={() => setIsUserDropdownOpen(true)}
                        />
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        
                        {selectedUserId && (
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <FiCheck /> Tanlandi
                          </span>
                        )}
                      </div>

                      {isUserDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-2 max-h-56 overflow-y-auto bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 divide-y divide-slate-50 p-2">
                          {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400 font-medium">
                              Foydalanuvchilar topilmadi
                            </div>
                          ) : (
                            filteredUsers.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelectUser(u)}
                                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between group"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 text-xs truncate group-hover:text-blue-600">
                                    {u?.full_name || u?.fullName || "Ismsiz"}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {u?.email}
                                  </p>
                                </div>
                                <FiPlus className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedJournal && (
                    <div className="bg-[#e6f0ff] border border-blue-100 rounded-2xl p-5 space-y-2 animate-in zoom-in-95">
                      <h3 className="font-bold text-[#002147] text-md">{selectedJournal.title || selectedJournal.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p className="text-[#002147] text-xs flex items-center gap-2 font-semibold">
                          <FiInfo className="text-blue-500" /> ISSN: {selectedJournal.issn || "—"}
                        </p>
                        <p className="text-[#002147] text-xs flex items-center gap-2 font-semibold">
                          <FiGlobe className="text-blue-500" /> Sohasi: {selectedJournal.subject_area || "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Maqola Tafsilotlari */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#002147] pb-2 border-b border-slate-100 flex items-center gap-2">
                    <FiFileText className="text-blue-500" /> 2. Maqola ma'lumotlari
                  </h2>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Maqola sarlavhasi *</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition bg-white text-sm font-medium"
                      placeholder="Maqola to'liq sarlavhasini kiriting..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Annotatsiya (Abstract) *</label>
                    <textarea
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                      rows={5}
                      className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition resize-y bg-white text-sm font-medium leading-relaxed"
                      placeholder="Annotatsiyani to'liq kiriting..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Kalit so'zlar *</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                        className="flex-1 rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm"
                        placeholder="Kalit so'z yozing, vergul yoki Enter bilan ajrating"
                      />
                      <button type="button" onClick={() => addKeyword()} className="rounded-xl bg-[#002147] px-6 py-3 text-white font-bold hover:bg-[#001a3a] transition-all active:scale-95 shadow-sm text-sm">
                        Qo'shish
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {keywords.map((k, i) => (
                        <span key={i} onClick={() => removeKeyword(i)} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#e6f0ff] text-[#002147] text-xs font-bold cursor-pointer hover:bg-rose-50 hover:text-rose-700 transition">
                          {k} <span className="font-extrabold text-sm">×</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Toifa *</label>
                      <div className="relative">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:border-[#002147] focus:ring-2 focus:ring-blue-200 outline-none transition bg-white appearance-none cursor-pointer text-sm font-semibold">
                          <option value="">Toifani tanlang...</option>
                          {journalCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="Other">Boshqa...</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {category === "Other" && (
                        <input type="text" placeholder="Toifa nomini yozing..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full mt-2 rounded-xl border border-blue-300 px-5 py-3 outline-none bg-blue-50/20 text-sm font-medium" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Maqola tili *</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-gray-300 px-5 py-3 outline-none bg-white text-sm font-semibold">
                        <option value="">Tilni tanlang...</option>
                        <option value="English">English</option>
                        <option value="Uzbek">O'zbekcha</option>
                        <option value="Russian">Russian</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-6 border-t border-slate-100">
                  <button onClick={prevStep} className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition active:scale-95 text-sm">Orqaga</button>
                  <button onClick={nextStep} className="flex-1 bg-[#002147] text-white py-4 rounded-xl font-bold hover:bg-[#001a3a] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 text-sm">Keyingisi <FiArrowRight /></button>
                </div>
              </div>
            )}

            {/* STEP 3: AUTHORS */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-[#002147] flex items-center gap-2">
                    <FiUser className="text-blue-500" /> 3. Mualliflar
                  </h2>
                  <button onClick={addAuthor} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-150 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-all font-bold text-xs active:scale-95 shadow-sm">
                    <FiPlus /> Muallif qo'shish
                  </button>
                </div>

                <div className="space-y-6">
                  {authors.map((author, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 shadow-sm relative">
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-md font-bold text-gray-800 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-[#002147] text-white flex items-center justify-center text-xs font-black">{idx + 1}</span>
                          Muallif
                        </h3>
                        {authors.length > 1 && (
                          <button onClick={() => removeAuthor(idx)} className="text-red-500 hover:text-red-700 bg-rose-50 p-2.5 rounded-xl transition active:scale-95"><FiTrash2 size={16} /></button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">To'liq ismi *</label>
                          <input value={author.fullName} onChange={(e) => updateAuthor(idx, "fullName", e.target.value)} className="w-full px-5 py-3 rounded-xl border border-gray-300 bg-white text-sm font-medium" placeholder="Masalan: Aliyev Vali" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Telefon raqam *</label>
                          <input value={author.phone} onChange={(e) => updateAuthor(idx, "phone", formatPhone(e.target.value))} className="w-full px-5 py-3 rounded-xl border border-gray-300 bg-white text-sm font-semibold" placeholder="+998 90..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">ORCID ID *</label>
                          <input value={author.orcidId} onChange={(e) => updateAuthor(idx, "orcidId", e.target.value)} className="w-full px-5 py-3 rounded-xl border border-gray-300 bg-white text-sm font-semibold" placeholder="Masalan: 0000-0000-0000-0000" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">DOI *</label>
                          <input value={author.doi || ""} onChange={(e) => updateAuthor(idx, "doi", e.target.value)} className="w-full px-5 py-3 rounded-xl border border-gray-300 bg-white text-sm font-semibold" placeholder="Masalan: 10.1000/xyz123" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Muallif Rasmi (Ixtiyoriy)</label>
                          <div className="flex items-center gap-4">
                            {author.photoPreview && (
                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-inner shrink-0 flex items-center justify-center">
                                <img 
                                  src={author.photoPreview} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <label className="flex-1">
                              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-all group shadow-sm">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                                  <FiUploadCloud size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate">Rasm yuklash</p>
                                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">PNG, JPG (MAX. 5MB)</p>
                                </div>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleAuthorPhotoChange(idx, e.target.files?.[0])} 
                                className="hidden" 
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between gap-4 pt-6 border-t border-slate-100">
                  <button onClick={prevStep} className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition active:scale-95 text-sm">Orqaga</button>
                  <button onClick={nextStep} className="flex-1 bg-[#002147] text-white py-4 rounded-xl font-bold hover:bg-[#001a3a] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 text-sm">Keyingisi <FiArrowRight /></button>
                </div>
              </div>
            )}

            {/* STEP 4: FILE UPLOAD & SUBMIT */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-bold text-[#002147] pb-2 border-b border-slate-100 flex items-center gap-2">
                  <FiUploadCloud className="text-blue-500" /> 4. Maqola PDF fayli va yakunlash
                </h2>
                
                <div 
                  className="border-2 border-dashed border-blue-200 rounded-3xl p-12 text-center hover:border-blue-500 transition-all bg-blue-50/10 cursor-pointer group" 
                  onClick={() => document.getElementById('pdf-file-upload').click()}
                >
                  <FiUploadCloud className="mx-auto h-16 w-16 text-blue-400 group-hover:scale-110 transition-transform mb-4" />
                  <p className="text-gray-500 text-sm font-semibold mb-6">PDF formati (Maksimum: 20MB)</p>
                  <span className="inline-block bg-[#002147] text-white px-10 py-3.5 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-blue-950/15 text-sm">PDF faylini tanlang</span>
                  <input id="pdf-file-upload" type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
                </div>

                {pdfFile && (
                  <div className="flex items-center gap-4 p-5 bg-[#002147] text-white rounded-2xl shadow-xl animate-in zoom-in">
                    <FiFileText size={32} className="text-blue-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-sm">{pdfFile.name}</p>
                      <p className="text-[10px] text-blue-200 font-bold">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setPdfFile(null); }} className="p-3 bg-white/10 hover:bg-red-500 rounded-xl transition-all shrink-0">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}

                <div className="flex justify-between gap-4 pt-6 border-t border-slate-100">
                  <button onClick={prevStep} className="px-8 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition active:scale-95 text-sm" disabled={submitting}>Orqaga</button>
                  <button onClick={submit} disabled={submitting} className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition shadow-xl flex items-center justify-center gap-3 active:scale-[0.99] text-sm">
                    {submitting ? (
                      <>
                        <FiLoader className="animate-spin text-lg" /> Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        Yakunlash va Arxivlash <FiCheck />
                      </>
                    )}
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

export default SendOldArticle;
