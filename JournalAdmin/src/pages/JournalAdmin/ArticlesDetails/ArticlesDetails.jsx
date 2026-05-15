import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { articleService, userService } from "../../../services/api";
import { FiArrowLeft, FiFileText, FiUser, FiDownload } from "react-icons/fi";

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

    const formatAuthors = (v) => {
  if (!v) return "N/A";
  if (typeof v === "string") return v;

  if (Array.isArray(v)) {
    return (
      v
        .map((x) =>
          typeof x === "string"
            ? x
            : x?.fullName || x?.name || x?.email || x?.phone || x?.orcidId || ""
        )
        .filter(Boolean)
        .join(", ") || "N/A"
    );
  }

  if (typeof v === "object") {
    return v?.fullName || v?.name || v?.email || v?.phone || v?.orcidId || "N/A";
  }

  return String(v);
};

  if (!article)
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border bg-white hover:bg-slate-50 font-bold text-slate-700"
        >
          <FiArrowLeft /> Orqaga
        </button>
        <div className="mt-6 bg-white border rounded-3xl p-8 text-slate-500">
          Maqola topilmadi.
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
          <FiArrowLeft /> Orqaga
        </button>
        <div className="text-right">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Maqola tafsilotlari
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 italic">
            Qo'lyozma haqida to'liq ma'lumot
          </p>
        </div>
      </div>

      {/* Submission Info */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/60 flex items-center gap-2 font-extrabold text-slate-800">
          <FiFileText className="text-blue-600" /> Maqola ma'lumotlari
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow label="Sarlavha" value={article?.title} primary />
          <InfoRow label="Kategoriya" value={article?.category} />
          <InfoRow label="Til" value={article?.language} />
          <InfoRow label="Kalit so'zlar" value={Array.isArray(article?.keywords) ? article.keywords.join(", ") : article?.keywords} />
          <InfoRow label="To'lov holati (APC)" value={article?.apc_paid ? "To'langan" : "To'lanmagan"} />
          <InfoRow label="Fayl hajmi" value={article?.file_size ? `${(article.file_size / 1024).toFixed(2)} KB` : "Mavjud emas"} />
          
          <div className="sm:col-span-2 space-y-4 pt-4 border-t border-slate-50">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.14em]">Qo'lyozma fayli</span>
              {article?.file_url ? (
                <a 
                  href={article.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#002147] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all w-fit"
                >
                  <FiDownload /> Maqolani yuklab olish (PDF)
                </a>
              ) : (
                <span className="text-slate-400 text-sm italic">Fayl biriktirilmagan</span>
              )}
            </div>
          </div>

          <div className="sm:col-span-2 pt-4 border-t border-slate-50">
            <InfoRow label="Annotatsiya (Abstract)" value={article?.abstract} />
          </div>

          <div className="sm:col-span-2 pt-4 border-t border-slate-50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.14em] mb-4">Hammualliflar / Ishtirokchilar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(article?.authors) && article.authors.length > 0 ? (
                article.authors.map((auth, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-bold text-blue-600 shadow-sm border border-slate-100 shrink-0">
                      {auth?.fullName?.[0] || auth?.name?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-sm truncate">{auth?.fullName || auth?.name || "Noma'lum"}</div>
                      <div className="text-[10px] text-slate-400 truncate">{auth?.orcidId || auth?.email || "Ma'lumot yo'q"}</div>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 text-sm italic">Qo'shimcha mualliflar kiritilmagan</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/60 flex items-center gap-2 font-extrabold text-slate-800">
          <FiUser className="text-emerald-600" /> Yuboruvchi ma'lumotlari
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow label="To'liq ismi" value={user?.name || user?.full_name} />
          <InfoRow label="Email manzili" value={user?.email} />
          <InfoRow label="Telefon" value={user?.phone || user?.phone_number} />
          <InfoRow label="Tashkilot / Universitet" value={user?.organization || user?.university} />
          <InfoRow label="Davlat" value={user?.country} />
        </div>

        {!user && (
          <div className="px-6 pb-6 text-xs text-slate-400">
            Foydalanuvchi ma'lumotlari topilmadi.
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
