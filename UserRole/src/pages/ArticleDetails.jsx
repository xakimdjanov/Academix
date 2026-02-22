import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiFileText,
  FiUpload,
  FiCreditCard,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService, commentService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const StatusBadge = ({ status }) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1";
  const map = {
    Submitted: "bg-gray-50 text-gray-700 ring-gray-200",
    "Under Review": "bg-blue-50 text-blue-700 ring-blue-200",
    "Needs Revision": "bg-amber-50 text-amber-700 ring-amber-200",
    Accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    Published: "bg-purple-50 text-purple-700 ring-purple-200",
  };
  const cls = map[status] || "bg-gray-50 text-gray-700 ring-gray-200";
  return <span className={`${base} ${cls}`}>{status || "Unknown"}</span>;
};

const Timeline = ({ status }) => {
  // status mapping: qaysigacha "done" bo‘lishini aniqlaymiz
  const steps = [
    { key: "Submitted", label: "Submitted" },
    { key: "Under Review", label: "Under review" },
    { key: "Needs Revision", label: "Needs revision" },
    { key: "Accepted", label: "Accepted" },
    { key: "Published", label: "Published" },
  ];

  // Rejected bo‘lsa alohida final status
  const rejected = status === "Rejected";

  const indexOf = (k) => steps.findIndex((s) => s.key === k);
  const currentIndex = rejected ? indexOf("Under Review") : indexOf(status);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-900">Status timeline</div>

      <div className="mt-4 grid gap-3">
        {steps.map((s, idx) => {
          const done = !rejected && currentIndex >= idx;
          const active = !rejected && status === s.key;

          return (
            <div key={s.key} className="flex items-center gap-3">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border",
                  done ? "bg-gray-900 border-gray-900 text-white" : "",
                  active && !done ? "border-gray-900 text-gray-900" : "",
                  !active && !done ? "border-gray-200 text-gray-500" : "",
                ].join(" ")}
              >
                {done ? <FiCheckCircle /> : <FiClock />}
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                <div className="text-xs text-gray-500">
                  {active ? "Current" : done ? "Done" : "Pending"}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="ml-auto hidden h-px w-10 bg-gray-200 sm:block" />
              )}
            </div>
          );
        })}

        {rejected && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700">
              <FiXCircle />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Rejected</div>
              <div className="text-xs text-gray-500">Final decision</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentCard = ({ apcPaid }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <FiCreditCard />
        Payment status
      </div>

      <div className="mt-3">
        {apcPaid ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <FiCheckCircle />
            Paid (confirmed)
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
            <FiClock />
            Not paid / Pending
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Bu yerda `apc_paid` true bo‘lsa to‘lov tasdiqlangan deb ko‘rsatadi.
      </div>
    </div>
  );
};

const ArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const myId = useMemo(() => getUserIdFromToken(), []);

  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);

  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState([]);

  // Revision
  const [revisionUrl, setRevisionUrl] = useState("");
  const [revisionFile, setRevisionFile] = useState(null);
  const [submittingRevision, setSubmittingRevision] = useState(false);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await articleService.getById(id);
      const a = res?.data;

      // Faqat user o‘zi yaratgan maqola bo‘lsin
      if (myId && Number(a?.user_id) !== Number(myId)) {
        toast.error("Bu maqola sizga tegishli emas");
        navigate("/"); // xohlasangiz /my-articles ga yo'naltiring
        return;
      }

      setArticle(a);

      // comments
      setCommentsLoading(true);
      try {
        const cRes = await commentService.getAll();
        const all = Array.isArray(cRes?.data) ? cRes.data : [];

        // !!! FIELD NOMI: backendda commentlar article_id yoki articleId bo‘lishi mumkin
        const forThis = all.filter(
          (c) =>
            Number(c?.article_id) === Number(id) ||
            Number(c?.articleId) === Number(id)
        );

        // newest first
        forThis.sort((x, y) => new Date(y?.createdAt) - new Date(x?.createdAt));
        setComments(forThis);
      } catch (e) {
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    } catch (e) {
      toast.error("Maqolani yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const keywords = useMemo(() => {
    if (!article?.keywords) return [];
    if (Array.isArray(article.keywords)) return article.keywords;
    // agar string bo‘lib kelsa
    try {
      const parsed = JSON.parse(article.keywords);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [article]);

  const needRevision = article?.status === "Needs Revision";

  const onPickRevisionFile = (f) => {
    if (!f) return;
    const ok =
      f.type === "application/pdf" ||
      f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      f.type === "application/msword";
    if (!ok) return toast.error("Faqat PDF/DOC/DOCX");
    const mb = f.size / (1024 * 1024);
    if (mb > 20) return toast.error("Max 20MB");
    setRevisionFile(f);
  };

  const submitRevision = async () => {
    if (!needRevision) return toast.error("Revision faqat Needs Revision bo‘lganda");
    if (!revisionUrl.trim() && !revisionFile) {
      return toast.error("Revision URL kiriting yoki fayl tanlang");
    }

    // Backend upload endpoint yo‘q bo‘lishi mumkin.
    // Shuning uchun default: revisionUrl orqali yuboramiz.
    // Fayl tanlansa ham, URL bo‘lmasa — foydalanuvchi URL kiritishi kerak (CDN/Drive).
    // (Sizning backend upload bor bo‘lsa keyin moslab beraman)
    if (!revisionUrl.trim()) {
      return toast.error("Backend upload bo‘lmasa revision uchun URL majburiy");
    }

    setSubmittingRevision(true);
    try {
      const payload = {
        file_url: revisionUrl.trim(),
        file_size: revisionFile?.size ? Number(revisionFile.size) : (article?.file_size || 0),
        // statusni backend qanday kutadi bilmaymiz.
        // Agar backend status update qilishga ruxsat bersa:
        status: "Submitted", // yoki "Under Review" / "Revision Submitted" - sizdagi qoidaga moslang
      };

      await articleService.update(article.id, payload);
      toast.success("Revision yuborildi");
      setRevisionUrl("");
      setRevisionFile(null);
      await fetchAll();
    } catch (e) {
      console.log("REVISION ERROR:", e?.response?.data || e);
      toast.error("Revision yuborishda xatolik");
    } finally {
      setSubmittingRevision(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              <FiArrowLeft />
              Back
            </button>

            <div className="ml-1">
              <div className="text-lg font-semibold text-gray-900">Article details</div>
              <div className="text-sm text-gray-600">
                {loading ? "Loading..." : "Full info + timeline + comments"}
              </div>
            </div>
          </div>

          <button
            onClick={fetchAll}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* TOP */}
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {/* Article info */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-sm text-gray-500">Article info</div>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  {article?.title || "-"}
                </h2>
                <div className="mt-2">
                  <StatusBadge status={article?.status} />
                </div>
              </div>

              {article?.journal?.name && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                  Journal: <span className="font-semibold">{article.journal.name}</span>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">Category</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {article?.category || "-"}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">Language</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {article?.language || "-"}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">Submitted</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDate(article?.createdAt)}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">Last update</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDate(article?.updatedAt)}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-900">Abstract</div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                {article?.abstract || "-"}
              </p>
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-900">Keywords</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {keywords.length === 0 ? (
                  <span className="text-sm text-gray-500">-</span>
                ) : (
                  keywords.map((k, idx) => (
                    <span
                      key={`${k}-${idx}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      {k}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-900">Authors</div>
              <div className="mt-2 text-sm text-gray-800">
                {article?.authors || "-"}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FiFileText />
                Submitted file
              </div>

              {article?.file_url ? (
                <a
                  href={article.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  Open file <FiExternalLink />
                </a>
              ) : (
                <div className="mt-2 text-sm text-gray-500">-</div>
              )}
            </div>
          </div>

          {/* Right column: timeline + payment */}
          <div className="space-y-4">
            <Timeline status={article?.status} />
            <PaymentCard apcPaid={!!article?.apc_paid} />

            {needRevision && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FiUpload />
                  Revision upload
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Backend upload endpoint bo‘lmasa revision uchun URL kiriting.
                </div>

                <div className="mt-3">
                  <label className="text-sm font-semibold text-gray-800">
                    Revision file URL
                  </label>
                  <input
                    value={revisionUrl}
                    onChange={(e) => setRevisionUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-sm font-semibold text-gray-800">
                    Optional: choose file (size/type check)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => onPickRevisionFile(e.target.files?.[0])}
                    className="mt-2 block w-full text-sm"
                  />
                  {revisionFile && (
                    <div className="mt-2 text-xs text-gray-600">
                      {revisionFile.name} • {(revisionFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                </div>

                <button
                  onClick={submitRevision}
                  disabled={submittingRevision}
                  className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                >
                  {submittingRevision ? "Submitting..." : "Submit revision"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviewer comments */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FiMessageSquare />
            Reviewer comments
          </div>

          <div className="mt-4 space-y-3">
            {commentsLoading && (
              <div className="text-sm text-gray-600">Loading comments...</div>
            )}

            {!commentsLoading && comments.length === 0 && (
              <div className="text-sm text-gray-600">Hozircha comment yo‘q</div>
            )}

            {comments.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm font-semibold text-gray-900">
                    {c?.title || "Comment"}
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(c?.createdAt)}</div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                  {c?.message || "-"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* quick links */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/my-articles"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Back to My Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails;