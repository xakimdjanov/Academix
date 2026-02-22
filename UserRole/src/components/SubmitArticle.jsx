import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiLink,
  FiUpload,
  FiFileText,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService, journalService } from "../services/api";
import axiosInstance from "../services/axiosInstance";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const MAX_FILE_MB = 20;
const ACCEPTED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const emptyAuthor = { name: "", email: "", orcid: "" };

const isValidUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
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

  // Backend upload yo‘q, shuning uchun file URL ishlatamiz
  const [fileUrl, setFileUrl] = useState("");
  // Fayl tanlash ixtiyoriy: faqat size/type ko‘rsatish uchun
  const [file, setFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [createdArticleId, setCreatedArticleId] = useState(null);
  const [aiReport, setAiReport] = useState("");

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

  const formatOrcid = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16); // faqat raqam
    return digits.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const selectedJournal = useMemo(
    () => journals.find((j) => String(j.id) === String(selectedJournalId)),
    [journals, selectedJournalId],
  );

  const addKeyword = () => {
    const v = keywordInput.trim();
    if (!v) return;
    if (keywords.some((k) => k.toLowerCase() === v.toLowerCase())) {
      setKeywordInput("");
      return;
    }
    setKeywords((p) => [...p, v]);
    setKeywordInput("");
  };

  const removeKeyword = (idx) => {
    setKeywords((p) => p.filter((_, i) => i !== idx));
  };

  const addAuthor = () => setAuthors((p) => [...p, { ...emptyAuthor }]);

  const removeAuthor = (idx) => {
    setAuthors((p) => p.filter((_, i) => i !== idx));
  };

  const updateAuthor = (idx, field, value) => {
    setAuthors((p) =>
      p.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
    );
  };

  const onPickFile = (f) => {
    if (!f) return;

    if (!ACCEPTED_MIME.includes(f.type)) {
      toast.error("Faqat PDF yoki DOCX/DOC fayl qabul qilinadi");
      return;
    }

    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_MB) {
      toast.error(`Fayl hajmi ${MAX_FILE_MB}MB dan katta bo‘lmasin`);
      return;
    }

    setFile(f);
  };

  const buildAuthorsString = () => {
    return authors
      .filter((a) => a.name || a.email || a.orcid)
      .map((a) => {
        const parts = [];
        if (a.name) parts.push(a.name.trim());
        if (a.email) parts.push(`<${a.email.trim()}>`);
        if (a.orcid) parts.push(`ORCID:${a.orcid.trim()}`);
        return parts.join(" ");
      })
      .join("; ");
  };

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
      const first = authors[0];
      if (!first?.name?.trim()) return "Kamida 1 ta author name majburiy";
      if (!first?.email?.trim()) return "Kamida 1 ta author email majburiy";
      const badEmail = authors.find(
        (a) => a.email && !/^\S+@\S+\.\S+$/.test(a.email),
      );
      if (badEmail) return "Email format xato";
    }

    if (s === 4) {
      if (!fileUrl.trim()) return "File URL kiriting";
      if (!isValidUrl(fileUrl.trim()))
        return "File URL noto‘g‘ri (https://...)";
    }

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
    if (!userId)
      return toast.error("Token yo‘q yoki yaroqsiz (user_id topilmadi)");

    setSubmitting(true);
    setCreatedArticleId(null);
    setAiReport("");

    try {
      const payload = {
        journal_id: Number(selectedJournalId),
        user_id: Number(userId),
        title: title.trim(),
        abstract: abstract.trim(),
        keywords, // ARRAY
        category: category.trim(),
        language: language.trim(),
        authors: buildAuthorsString(),
        file_url: fileUrl.trim(), // MUHIM
        file_size: file?.size ? Number(file.size) : 0,
        apc_paid: false,
      };

      const res = await articleService.create(payload);
      const created = res?.data;
      setCreatedArticleId(created?.id ?? null);
      toast.success("Maqola yuborildi");

      // AI analysis (agar backendda /ai/analyze bo‘lsa)
      setAnalyzing(true);
      try {
        const aiRes = await axiosInstance.post("/ai/analyze", {
          title: payload.title,
          abstract: payload.abstract,
          keywords: payload.keywords,
          category: payload.category,
          language: payload.language,
          journalName: selectedJournal?.name || "",
          authors,
        });
        setAiReport(aiRes?.data?.report || "AI javob bo‘sh qaytdi");
        toast.success("AI tahlil tayyor");
      } catch (aiErr) {
        console.log("AI ERROR:", aiErr?.response?.data || aiErr);
        toast.error("/ai/analyze endpoint yo‘q yoki xatolik");
      } finally {
        setAnalyzing(false);
      }
    } catch (e) {
      console.log("CREATE ERROR:", e?.response?.data || e);
      toast.error(
        "Yuborishda xatolik (backend 400 bo‘lsa payloadni tekshiring)",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const StepPill = ({ n, label }) => {
    const active = step === n;
    const done = step > n;
    return (
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
            done ? "bg-gray-900 text-white border-gray-900" : "",
            active && !done ? "border-gray-900 text-gray-900" : "",
            !active && !done ? "border-gray-200 text-gray-600" : "",
          ].join(" ")}
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Submit Article
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StepPill n={1} label="Journal" />
              <StepPill n={2} label="Article Info" />
              <StepPill n={3} label="Authors" />
              <StepPill n={4} label="File URL" />
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 1: Journal
                </h2>

                <label className="block text-sm font-semibold text-gray-800">
                  Journal tanlash
                </label>

                <select
                  value={selectedJournalId}
                  onChange={(e) => setSelectedJournalId(e.target.value)}
                  disabled={loadingJournals}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300 disabled:opacity-60"
                >
                  <option value="">Select journal...</option>
                  {journals.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name} {j.issn ? `(${j.issn})` : ""}
                    </option>
                  ))}
                </select>

                {selectedJournal && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedJournal.name}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Subject area: {selectedJournal.subject_area || "-"}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Status: {selectedJournal.status || "-"}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 2: Article Info
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                    placeholder="Article title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Abstract
                  </label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    className="mt-1 min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                    placeholder="Abstract..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Keywords (tag)
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                      placeholder="keyword yozing va Enter bosing"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {keywords.map((k, idx) => (
                      <button
                        key={`${k}-${idx}`}
                        type="button"
                        onClick={() => removeKeyword(idx)}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                        title="Remove"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Category
                    </label>
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                      placeholder="Category..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Language
                    </label>
                    <input
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                      placeholder="Language..."
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Step 3: Authors
                  </h2>
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                  >
                    <FiPlus />
                    Add author
                  </button>
                </div>

                <div className="space-y-3">
                  {authors.map((a, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-gray-900">
                          Author {idx + 1}
                        </div>

                        {authors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAuthor(idx)}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                          >
                            <FiTrash2 />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800">
                            Author name
                          </label>
                          <input
                            value={a.name}
                            onChange={(e) =>
                              updateAuthor(idx, "name", e.target.value)
                            }
                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
                            placeholder="Full name..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800">
                            Email
                          </label>
                          <input
                            value={a.email}
                            onChange={(e) =>
                              updateAuthor(idx, "email", e.target.value)
                            }
                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800">
                            ORCID
                          </label>

                          <input
                            value={a.orcid}
                            onChange={(e) =>
                              updateAuthor(
                                idx,
                                "orcid",
                                formatOrcid(e.target.value),
                              )
                            }
                            maxLength={19}
                            inputMode="numeric"
                            className="
    mt-1 w-full rounded-xl border border-gray-200
    bg-white px-3 py-2 text-sm text-gray-900
    outline-none transition
    focus:border-gray-900 focus:ring-2 focus:ring-gray-200
  "
                            placeholder="0000-0000-0000-0000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 4: File URL
                </h2>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FiLink />
                    File URL (majburiy)
                  </div>

                  <input
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                  />

                  {fileUrl.trim() && (
                    <a
                      href={fileUrl.trim()}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-semibold underline underline-offset-4"
                    >
                      Open link
                    </a>
                  )}
                </div>

                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FiUpload />
                    Optional: File choose (faqat size/type tekshiruv)
                  </div>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => onPickFile(e.target.files?.[0])}
                    className="
    mt-3 w-full text-sm text-gray-700
    file:mr-4 file:rounded-xl file:border-0
    file:bg-gray-900 file:px-4 file:py-2
    file:text-sm file:font-semibold
    file:text-white hover:file:bg-black
    cursor-pointer
  "
                  />

                  {file && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <FiFileText />
                        {file.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="text-sm font-semibold text-gray-900">
                    Submit + AI analysis
                  </div>

                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || analyzing}
                    className="mt-3 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                  >
                    {submitting
                      ? "Submitting..."
                      : analyzing
                        ? "Analyzing..."
                        : "Submit Article"}
                  </button>

                  {createdArticleId && (
                    <div className="mt-3 text-xs text-gray-600">
                      Created article ID: {createdArticleId}
                    </div>
                  )}

                  {aiReport && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-sm font-semibold text-gray-900">
                        AI analysis
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                        {aiReport}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
            >
              <FiArrowLeft />
              Back
            </button>

            <button
              type="button"
              onClick={step === 4 ? submit : next}
              disabled={submitting || analyzing}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
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
