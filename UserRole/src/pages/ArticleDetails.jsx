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
  FiEye,
  FiSend,
  FiCheck,
  FiCopy
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService, commentService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";
import { useSEO } from "../hooks/useSEO";
import { formatTitle } from "../utils/textFormatter";
import { useLanguage } from "../context/LanguageContext";

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const ArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const myId = useMemo(() => getUserIdFromToken(), []);
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(t("journals.shared"));
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(
      language === "uz" ? `Academix platformasida qiziqarli ilmiy maqola:\n\n"${article?.title}"\n\n` :
      language === "en" ? `Interesting scientific article on Academix platform:\n\n"${article?.title}"\n\n` :
      `Интересная научная статья на платформе Academix:\n\n"${article?.title}"\n\n`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  useSEO({
    title: article ? article.title : undefined,
    description: article
      ? (article.abstract || "").substring(0, 250)
      : undefined,
    keywords: article
      ? [
          article.title,
          article.category,
          ...(Array.isArray(article.keywords) ? article.keywords : []),
          ...(Array.isArray(article.authors)
            ? article.authors.map(a => a.fullName).filter(Boolean)
            : []),
          article.language,
          "ilmiy maqola",
          "akademix",
          "akademix.uz"
        ].filter(Boolean).join(", ")
      : undefined,
    image: article?.journal?.banner_url || article?.journal?.cover_image_url,
    url: `https://akademix.uz/articles/${article?.slug || id}`,
    type: "article",
    googleScholar: article ? {
      title: article.title,
      authors: Array.isArray(article.authors) ? article.authors.map(a => a.fullName).filter(Boolean) : [],
      publicationDate: article.createdAt,
      journalTitle: article.journal?.name,
      pdfUrl: article.file_url,
      doi: article.doi || (Array.isArray(article.authors) && article.authors[0]?.doi) || undefined,
      language: article.language,
      issn: article.journal?.issn,
      volume: article.bob?.volume,
      issue: article.bob?.name
    } : undefined
  });

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await articleService.getById(id);
      setArticle(res?.data);

      setCommentsLoading(true);
      try {
        const cRes = await commentService.getAll();
        const all = Array.isArray(cRes?.data) ? cRes.data : [];
        const forThis = all.filter(c => Number(c?.article_id || c?.articleId) === Number(id));
        forThis.sort((x, y) => new Date(y?.createdAt) - new Date(x?.createdAt));
        setComments(forThis);
      } catch (e) {
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    } catch (e) {
      toast.error(
        language === "uz" ? "Maqolani yuklashda xatolik yuz berdi" :
        language === "en" ? "An error occurred while loading the article" :
        "Произошла ошибка при загрузке статьи"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!myId) return toast.error(
      language === "uz" ? "Izoh qoldirish uchun tizimga kiring" :
      language === "en" ? "Please sign in to leave a comment" :
      "Пожалуйста, войдите в систему, чтобы оставить комментарий"
    );
    if (!userComment.trim()) return toast.error(
      language === "uz" ? "Izoh bo'sh bo'lishi mumkin emas" :
      language === "en" ? "Comment cannot be empty" :
      "Комментарий не может быть пустым"
    );

    setIsSubmitting(true);
    try {
      const payload = {
        article_id: id,
        user_id: myId,
        comment: userComment.trim(),
        visibility: "Pending",
      };
      await commentService.create(payload);
      toast.success(
        language === "uz" ? "Izoh yuborildi!" :
        language === "en" ? "Comment submitted!" :
        "Комментарий отправлен!"
      );
      setUserComment("");
      fetchAll(); // Refresh comments
    } catch (e) {
      toast.error(
        language === "uz" ? "Izohni yuborishda xatolik yuz berdi" :
        language === "en" ? "An error occurred while submitting the comment" :
        "Произошла ошибка при отправке комментария"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApproveComment = async (commentId) => {
    try {
      await commentService.update(commentId, { visibility: "Public" });
      toast.success(
        language === "uz" ? "Izoh tasdiqlandi!" :
        language === "en" ? "Comment approved!" :
        "Комментарий одобрен!"
      );
      fetchAll();
    } catch (e) {
      toast.error(
        language === "uz" ? "Izohni tasdiqlashda xatolik yuz berdi" :
        language === "en" ? "An error occurred while approving the comment" :
        "Произошла ошибка при одобрении комментария"
      );
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const isAuthor = useMemo(() => {
    return myId && Number(article?.user_id) === Number(myId);
  }, [article, myId]);

  if (loading) return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#002147]">{t("journals.not_found")}</h2>
      <button onClick={() => navigate(-1)} className="text-blue-600 font-bold hover:underline flex items-center gap-2">
        <FiArrowLeft /> {t("common.back")}
      </button>
    </div>
  );

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-20">
      <Toaster position="top-right" />
      
      {/* 🟦 Dark Hero Section */}
      <section 
        className="text-white pt-20 pb-32 relative overflow-hidden bg-[#002147]"
        style={article.journal?.banner_url ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0, 33, 71, 0.85), rgba(0, 33, 71, 0.95)), url(${article.journal.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/journals" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors">
            <FiArrowLeft /> {t("journals.back_search")}
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-blue-400 border border-white/20 shadow-2xl">
                <FiFileText size={40} />
             </div>
             <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-4">
                   <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded-full tracking-widest border border-blue-500/30">
                      {article.category || (language === "uz" ? "Ilmiy maqola" : language === "en" ? "Scientific article" : "Научная статья")}
                   </span>
                   {article.journal && (
                     <Link to={`/journals/${article.journal.slug}`} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase rounded-full tracking-widest border border-white/20 transition-colors">
                        {language === "uz" ? "Jurnal" : language === "en" ? "Journal" : "Журнал"}: {formatTitle(article.journal.name)}
                     </Link>
                   )}
                   <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase rounded-full tracking-widest border border-white/20 flex items-center gap-1">
                      <FiEye size={12}/> {article.view_count || 0} {t("common.views")}
                   </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black mb-4 leading-tight">{formatTitle(article.title)}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-blue-200/60 font-medium">
                   <span>{language === "uz" ? "Nashr etilgan" : language === "en" ? "Published" : "Опубликовано"}: {formatDate(article.createdAt)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-6">
                    <div className="flex gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                       <button 
                          onClick={shareTelegram}
                          className="px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                       >
                          <FiSend size={14} /> {t("journals.share")}
                       </button>
                       <button 
                          onClick={handleCopyLink}
                          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
                       >
                          <FiCopy size={14} /> {copied ? t("journals.copied") : t("journals.copy")}
                       </button>
                    </div>
                 </div>
              </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F6F8FB] to-transparent"></div>
      </section>

      {/* 📄 Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            {/* Editor Comments (Visible only to Author) */}
            {isAuthor && article.editor_comment && (
              <div className="bg-amber-50 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-amber-100 animate-in fade-in duration-700">
                <h2 className="text-2xl font-black text-[#002147] mb-6 flex items-center gap-3">
                   <FiMessageSquare className="text-amber-600" /> {language === "uz" ? "Tahririyat izohlari" : language === "en" ? "Editorial comments" : "Комментарии редакции"}
                </h2>
                <div className="text-amber-900 leading-relaxed text-lg whitespace-pre-wrap italic">
                   {article.editor_comment}
                </div>
              </div>
            )}

            {/* Abstract */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50">
               <h2 className="text-2xl font-black text-[#002147] mb-6 flex items-center gap-3">
                  {language === "uz" ? "Annotatsiya" : language === "en" ? "Abstract" : "Аннотация"}
               </h2>
               <div className="text-[#4B5563] leading-relaxed text-lg whitespace-pre-wrap italic border-l-4 border-blue-100 pl-6">
                  {article.abstract}
               </div>
            </div>

            {/* Authors */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50">
               <h2 className="text-2xl font-black text-[#002147] mb-8">{t("articles.authors")}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Array.isArray(article.authors) ? article.authors.map((auth, idx) => (
                    <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl border border-gray-50 hover:border-blue-100 transition-colors group">
                       <img src={auth.imageUrl || "/image.png"} alt={auth.fullName} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" loading="lazy" />
                       <div>
                          <div className="font-bold text-[#002147]">{auth.fullName}</div>
                          <div className="text-xs text-blue-600 font-medium mb-1">{auth.orcidId}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{auth.phone || "Oliy ta'lim muassasasi"}</div>
                       </div>
                    </div>
                  )) : <p className="text-gray-400">{language === "uz" ? "Mualliflar haqida ma'lumot mavjud emas." : language === "en" ? "No information about authors is available." : "Информация об авторах отсутствует."}</p>}
               </div>
            </div>

            {/* Public Discussion / Comments Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50 animate-in fade-in duration-700">
               <h2 className="text-2xl font-black text-[#002147] mb-8 flex items-center justify-between">
                  {language === "uz" ? "Muhokama" : language === "en" ? "Discussion" : "Обсуждение"}
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">{comments.length} {language === "uz" ? "Izohlar" : language === "en" ? "Comments" : "Комментариев"}</span>
               </h2>

               {/* Add Comment Form */}
               {myId ? (
                  <div className="mb-10 space-y-4">
                     <textarea 
                       value={userComment}
                       onChange={(e) => setUserComment(e.target.value)}
                       placeholder={language === "uz" ? "Ushbu tadqiqot haqida fikringizni yoki savollaringizni qoldiring..." : language === "en" ? "Leave your feedback or questions about this research..." : "Оставьте свое мнение или вопросы об этом исследовании..."}
                       className="w-full rounded-2xl border border-gray-100 p-5 focus:ring-4 focus:ring-blue-50 outline-none min-h-[120px] transition-all text-sm leading-relaxed bg-gray-50"
                     />
                     <div className="flex justify-end">
                        <button 
                          onClick={handlePostComment}
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-[#002147] text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? (language === "uz" ? "Yuborilmoqda..." : language === "en" ? "Submitting..." : "Отправка...") : <>{language === "uz" ? "Izoh qoldirish" : language === "en" ? "Leave comment" : "Оставить комментарий"} <FiSend /></>}
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="mb-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
                     <p className="text-sm text-blue-800 font-medium mb-4">{language === "uz" ? "Muhokamada qatnashish uchun tizimga kiring." : language === "en" ? "Please sign in to participate in the discussion." : "Пожалуйста, войдите в систему, чтобы принять участие в обсуждении."}</p>
                     <Link to="/signin" className="inline-block px-6 py-2 bg-[#002147] text-white rounded-lg font-bold text-xs uppercase tracking-widest">{t("auth.signin_link")}</Link>
                  </div>
               )}

               <div className="space-y-8">
                  {comments.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 italic">{language === "uz" ? "Hali muhokama mavjud emas. Birinchi bo'lib fikr bildiring!" : language === "en" ? "No discussions yet. Be the first to comment!" : "Обсуждений пока нет. Будьте первым, кто прокомментирует!"}</div>
                    ) : (
                      comments
                        .filter(c => c.visibility === "Public" || c.visibility === "public")
                        .map(c => (
                         <div key={c.id} className="flex gap-4">
                             <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                <img src={c.author?.avatar_url || "/image.png"} alt="Foydalanuvchi" className="w-full h-full object-cover" loading="lazy" />
                             </div>
                            <div className="flex-1 bg-gray-50/50 p-5 rounded-3xl rounded-tl-none border border-gray-100 relative group">
                               <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                     <div className="text-xs font-black text-[#002147] uppercase tracking-tighter">
                                        {c.author?.full_name || c.author?.fullName || "Akademik foydalanuvchi"}
                                     </div>
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-bold">{formatDate(c.createdAt)}</div>
                               </div>
                               <div className="text-sm text-gray-600 leading-relaxed">{c.comment}</div>
                            </div>
                         </div>
                      ))
                   )}
               </div>
            </div>
         </div>

         {/* 🪜 Sidebar */}
         <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
               <h3 className="text-lg font-black text-[#002147] mb-6 uppercase tracking-widest text-sm">{language === "uz" ? "Kalit so'zlar" : language === "en" ? "Keywords" : "Ключевые слова"}</h3>
               <div className="flex flex-wrap gap-2">
                  {Array.isArray(article.keywords) ? article.keywords.map((k, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-50 text-gray-500 text-xs font-bold rounded-xl border border-gray-100 italic transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 cursor-default">
                       #{k}
                    </span>
                  )) : <span className="text-gray-300 text-xs">{language === "uz" ? "Kalit so'zlar mavjud emas" : language === "en" ? "No keywords available" : "Ключевые слова отсутствуют"}</span>}
               </div>
            </div>
         </aside>
      </main>
    </div>
  );
};

export default ArticleDetails;