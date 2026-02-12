import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { articleService, userService } from "../../../services/api";
import { FiArrowLeft, FiFileText, FiUser } from "react-icons/fi";

const ArticlesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [user, setUser] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      // 1) Article
      const ar = await articleService.getById(id);
      const a = ar?.data?.data || ar?.data?.article || ar?.data || null;
      setArticle(a);

      // 2) User (agar bo‘lsa)
      if (a?.user_id) {
        try {
          const ur = await userService.getById(a.user_id);
          setUser(ur?.data?.data || ur?.data?.user || ur?.data || null);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      toast.error("Article topilmadi yoki yuklashda xatolik");
      setArticle(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#002147] border-t-transparent" />
      </div>
    );

  if (!article)
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border bg-white hover:bg-slate-50 font-bold text-slate-700"
        >
          <FiArrowLeft /> Back
        </button>
        <div className="mt-6 bg-white border rounded-3xl p-8 text-slate-500">
          Article topilmadi.
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border bg-white hover:bg-slate-50 font-bold text-slate-700"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="text-right">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Article Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 italic">
            Full manuscript information
          </p>
        </div>
      </div>

      {/* Submission Info */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/60 flex items-center gap-2 font-extrabold text-slate-800">
          <FiFileText className="text-blue-600" /> Submission Info
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow label="Title" value={article?.title} primary />
          <InfoRow label="Category" value={article?.category} />
          <InfoRow label="Language" value={article?.language} />
          <InfoRow label="Authors" value={article?.authors} />
          <InfoRow
            label="Keywords"
            value={Array.isArray(article?.keywords) ? article.keywords.join(", ") : article?.keywords}
          />
          <InfoRow label="APC Status" value={article?.apc_paid ? "Paid" : "Pending"} />
          <InfoRow label="File URL" value={article?.file_url} />
          <InfoRow label="File Size" value={article?.file_size} />
          <div className="sm:col-span-2">
            <InfoRow label="Abstract" value={article?.abstract} />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/60 flex items-center gap-2 font-extrabold text-slate-800">
          <FiUser className="text-emerald-600" /> Submitter Details
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow label="Full Name" value={user?.name || user?.full_name} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Phone" value={user?.phone || user?.phone_number} />
          <InfoRow label="Organization" value={user?.organization || user?.university} />
          <InfoRow label="Country" value={user?.country} />
        </div>

        {!user && (
          <div className="px-6 pb-6 text-xs text-slate-400">
            User data unavailable (user topilmadi yoki user_id yo‘q).
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesDetails;

const InfoRow = ({ label, value, primary }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.14em]">
      {label}
    </span>
    <span
      className={`${
        primary ? "text-slate-900 font-black text-base" : "text-slate-700 text-sm font-medium"
      } leading-relaxed break-words`}
    >
      {value || "N/A"}
    </span>
  </div>
);
