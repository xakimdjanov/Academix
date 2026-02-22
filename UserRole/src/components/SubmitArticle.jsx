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
  // imageUrl backend tomonidan qo'shiladi, frontendda alohida state: authorImages
};

const SubmitArticle = () => {
  const [step, setStep] = useState(1);

  // Journals
  const [journals, setJournals] = useState([]);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState("");

  // Article info
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");

  // Authors - faqat matn ma'lumotlari
  const [authors, setAuthors] = useState([{ ...emptyAuthor }]);
  // Author images - alohida state (index -> File)
  const [authorImages, setAuthorImages] = useState({});

  // Article file
  const [articleFile, setArticleFile] = useState(null);

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [createdArticleId, setCreatedArticleId] = useState(null);

  // Load journals
  useEffect(() => {
    const loadJournals = async () => {
      setLoadingJournals(true);
      try {
        const res = await journalService.getAll();
        setJournals(res?.data || []);
      } catch (e) {
        toast.error("Journallarni yuklashda xatolik");
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

  // Keywords
  const addKeyword = () => {
    const v = keywordInput.trim();
    if (!v) return;
    if (keywords.some((k) => k.toLowerCase() === v.toLowerCase())) {
      toast.error("Bu keyword allaqachon qo'shilgan");
      return;
    }
    setKeywords((p) => [...p, v]);
    setKeywordInput("");
  };

  const removeKeyword = (idx) => {
    setKeywords((p) => p.filter((_, i) => i !== idx));
  };

  // Authors
  const addAuthor = () => {
    setAuthors((p) => [...p, { ...emptyAuthor }]);
  };

  const removeAuthor = (idx) => {
    if (authors.length === 1) {
      toast.error("Kamida bitta author bo'lishi kerak");
      return;
    }
    setAuthors((p) => p.filter((_, i) => i !== idx));
    // Remove associated image
    setAuthorImages((prev) => {
      const newState = { ...prev };
      delete newState[idx];
      return newState;
    });
  };

  const updateAuthor = (idx, field, value) => {
    setAuthors((p) =>
      p.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  };

  const handleAuthorImage = (idx, file) => {
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qabul qilinadi");
      return;
    }

    // Check size (5MB max for images)
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 5) {
      toast.error("Rasm hajmi 5MB dan katta bo'lmasin");
      return;
    }

    setAuthorImages((prev) => ({ ...prev, [idx]: file }));
  };

  // Format ORCID: 0000-0000-0000-0000
  const formatOrcid = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join("-");
  };

  // Format phone number
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 12) return value;
    
    // Uzbekistan format: +998 XX XXX XX XX
    if (digits.startsWith("998") && digits.length >= 12) {
      return digits.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "+$1 $2 $3 $4 $5");
    }
    return digits;
  };

  // Article file handler
  const handleArticleFile = (file) => {
    if (!file) return;

    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error("Faqat PDF yoki DOCX/DOC fayl qabul qilinadi");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_MB) {
      toast.error(`Fayl hajmi ${MAX_FILE_MB}MB dan katta bo'lmasin`);
      return;
    }

    setArticleFile(file);
  };

  // Validation
  const validateStep = (s) => {
    if (s === 1) {
      if (!selectedJournalId) return "Journal tanlang";
    }

    if (s === 2) {
      if (!title.trim()) return "Title majburiy";
      if (!abstract.trim()) return "Abstract majburiy";
      if (keywords.length === 0) return "Kamida 1 ta keyword kiriting";
      if (!category.trim()) return "Category majburiy";
      if (!language.trim()) return "Language majburiy";
    }

    if (s === 3) {
      // Check each author
      for (let i = 0; i < authors.length; i++) {
        const author = authors[i];
        
        if (!author.fullName?.trim()) {
          return `Author #${i + 1}: Full name majburiy`;
        }
        
        const phoneDigits = author.phone?.replace(/\D/g, "") || "";
        if (phoneDigits.length < 9) {
          return `Author #${i + 1}: Telefon raqam kamida 9 raqamdan iborat bo'lishi kerak`;
        }
        
        const orcidDigits = author.orcidId?.replace(/\D/g, "") || "";
        if (orcidDigits.length !== 16) {
          return `Author #${i + 1}: ORCID 16 raqamdan iborat bo'lishi kerak (0000-0000-0000-0000)`;
        }
        
        // Check ORCID format
        const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
        if (!orcidRegex.test(author.orcidId)) {
          return `Author #${i + 1}: ORCID formati noto'g'ri (0000-0000-0000-0000)`;
        }
        
        // Check image - MUHIM!
        if (!authorImages[i]) {
          return `Author #${i + 1} uchun rasm yuklang`;
        }
      }
    }

    if (s === 4) {
      if (!articleFile) return "Maqola faylini yuklang";
    }

    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((p) => Math.min(4, p + 1));
  };

  const prev = () => setStep((p) => Math.max(1, p - 1));

  // Submit with FormData
  const submit = async () => {
    const err = validateStep(4);
    if (err) {
      toast.error(err);
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      return toast.error("Token yo'q yoki yaroqsiz");
    }

    setSubmitting(true);
    setCreatedArticleId(null);

    try {
      const formData = new FormData();

      // 1. Basic fields
      formData.append("journal_id", selectedJournalId);
      formData.append("user_id", userId);
      formData.append("title", title.trim());
      formData.append("abstract", abstract.trim());
      formData.append("keywords", JSON.stringify(keywords));
      formData.append("category", category.trim());
      formData.append("language", language.trim());
      formData.append("apc_paid", "false");

      // 2. Authors - JSON string
      const authorsForBackend = authors.map((author) => ({
        fullName: author.fullName.trim(),
        phone: author.phone.replace(/\D/g, ""), // faqat raqamlar
        orcidId: author.orcidId.trim(),
        // imageUrl backend tomonidan qo'shiladi
      }));
      formData.append("authors", JSON.stringify(authorsForBackend));

      // 3. Article file - name "file_url" bo'lishi kerak
      if (articleFile) {
        formData.append("file_url", articleFile);
      }

      // 4. Author images - name "author_images"
      // MUHIM: har bir author uchun rasm borligi tekshirilgan
      Object.entries(authorImages).forEach(([index, file]) => {
        formData.append("author_images", file);
      });

      // Send to backend
      const res = await articleService.create(formData);
      
      const created = res?.data?.article || res?.data;
      setCreatedArticleId(created?.id ?? null);
      
      toast.success("Maqola muvaffaqiyatli yuborildi");

      // Reset form after successful submission
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
      }, 3000);

    } catch (e) {
      console.log("Submit Error:", e?.response?.data || e);
      
      // Backenddan kelgan xatolikni ko'rsatish
      if (e?.response?.data?.errors) {
        const errors = e.response.data.errors;
        errors.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(
          e?.response?.data?.message || 
          "Yuborishda xatolik yuz berdi"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Step component
  const StepPill = ({ n, label }) => {
    const active = step === n;
    const done = step > n;
    return (
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
            done ? "bg-gray-900 text-white border-gray-900" : ""
          } ${active && !done ? "border-gray-900 text-gray-900" : ""} ${
            !active && !done ? "border-gray-200 text-gray-600" : ""
          }`}
        >
          {done ? <FiCheck /> : n}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">Step {n} of 4</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Submit Article
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details to submit your article
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StepPill n={1} label="Journal" />
              <StepPill n={2} label="Article Info" />
              <StepPill n={3} label="Authors" />
              <StepPill n={4} label="Upload" />
            </div>
          </div>

          {/* Step Content */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            {/* Step 1: Journal */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 1: Select Journal
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Journal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedJournalId}
                    onChange={(e) => setSelectedJournalId(e.target.value)}
                    disabled={loadingJournals}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100 disabled:opacity-60"
                  >
                    <option value="">Select a journal...</option>
                    {journals.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name} {j.issn ? `(ISSN: ${j.issn})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedJournal && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900">
                      {selectedJournal.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>ISSN: {selectedJournal.issn || "N/A"}</p>
                      <p>Subject: {selectedJournal.subject_area || "N/A"}</p>
                      <p>Status: {selectedJournal.status || "Active"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Article Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 2: Article Information
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                    placeholder="Enter article title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Abstract <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                    placeholder="Enter abstract..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Keywords <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                      placeholder="Type keyword and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {keywords.map((k, idx) => (
                        <span
                          key={idx}
                          onClick={() => removeKeyword(idx)}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          {k}
                          <span className="text-gray-500">×</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                      placeholder="e.g., Research Article"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Language <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                      placeholder="e.g., English"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Authors */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Step 3: Authors
                  </h2>
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
                  >
                    <FiPlus />
                    Add Author
                  </button>
                </div>

                <div className="space-y-4">
                  {authors.map((author, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Author {idx + 1}
                          {idx === 0 && (
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                              Corresponding
                            </span>
                          )}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeAuthor(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              value={author.fullName}
                              onChange={(e) => updateAuthor(idx, "fullName", e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              value={author.phone}
                              onChange={(e) => updateAuthor(idx, "phone", formatPhone(e.target.value))}
                              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                              placeholder="+998 90 123 45 67"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            ORCID <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              value={author.orcidId}
                              onChange={(e) => updateAuthor(idx, "orcidId", formatOrcid(e.target.value))}
                              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                              placeholder="0000-0000-0000-0000"
                              maxLength={19}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Photo <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAuthorImage(idx, e.target.files?.[0])}
                            className="w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-black"
                          />
                          {authorImages[idx] ? (
                            <p className="mt-1 text-xs text-green-600">
                              ✓ Rasm yuklandi: {authorImages[idx].name}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-red-500">
                              * Rasm majburiy
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Upload */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 4: Upload Article
                </h2>

                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6">
                  <div className="text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
                      >
                        Select Article File
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleArticleFile(e.target.files?.[0])}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      PDF or DOC/DOCX up to {MAX_FILE_MB}MB
                    </p>
                  </div>

                  {articleFile && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-gray-400" size={20} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {articleFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(articleFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => setArticleFile(null)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Section - AI analitika olib tashlandi */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Submit Article
                  </h3>
                  
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Article"}
                  </button>

                  {createdArticleId && (
                    <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                      ✅ Article submitted successfully! ID: {createdArticleId}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1 || submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiArrowLeft />
              Back
            </button>

            <button
              type="button"
              onClick={step === 4 ? submit : next}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {step === 4 ? "Submit" : "Next"}
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitArticle;