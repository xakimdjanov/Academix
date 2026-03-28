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
  FiCheck
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

const Timeline = ({ status }) => {
  const steps = [
    { key: "Submitted", label: "Yuborilgan" },
    { key: "Under Review", label: "Taqriz jarayonida" },
    { key: "Needs Revision", label: "Tuzatish kiritilishi kerak" },
    { key: "Accepted", label: "Qabul qilingan" },
    { key: "Published", label: "Nashr etilgan" },
  ];
  const rejected = status === "Rejected";
  const indexOf = (k) => steps.findIndex((s) => s.key === k);
  const currentIndex = rejected ? indexOf("Under Review") : indexOf(status);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-black text-[#002147] uppercase tracking-widest mb-6">Holat xronologiyasi</div>
      <div className="space-y-6">
        {steps.map((s, idx) => {
          const done = !rejected && currentIndex >= idx;
          const active = !rejected && status === s.key;
          return (
            <div key={s.key} className="flex items-center gap-4 relative">
              {idx < steps.length - 1 && (
                 <div className={`absolute left-[17px] top-9 w-0.5 h-6 ${done ? 'bg-gray-900' : 'bg-gray-100'}`}></div>
              )}
              <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                  done ? "bg-[#002147] border-[#002147] text-white shadow-lg shadow-blue-900/20" : 
                  active ? "border-[#002147] text-[#002147] animate-pulse" : "border-gray-100 text-gray-300"
                }`}>
                {done ? <FiCheckCircle size={16} /> : <FiClock size={16} />}
              </div>
              <div>
                <div className={`text-sm font-bold ${done || active ? 'text-[#002147]' : 'text-gray-400'}`}>{s.label}</div>
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">
                  {active ? "Joriy bosqich" : done ? "Yakunlangan" : "Kutilmoqda"}
                </div>
              </div>
            </div>
          );
        })}
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
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.error("Maqolani yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!myId) return toast.error("Izoh qoldirish uchun tizimga kiring");
    if (!userComment.trim()) return toast.error("Izoh bo'sh bo'lishi mumkin emas");

    setIsSubmitting(true);
    try {
      const payload = {
        article_id: id,
        user_id: myId,
        comment: userComment.trim(),
        visibility: "Pending",
      };
      await commentService.create(payload);
      toast.success("Izoh yuborildi!");
      setUserComment("");
      fetchAll(); // Refresh comments
    } catch (e) {
      toast.error("Izohni yuborishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApproveComment = async (commentId) => {
    try {
      await commentService.update(commentId, { visibility: "Public" });
      toast.success("Izoh tasdiqlandi!");
      fetchAll();
    } catch (e) {
      toast.error("Izohni tasdiqlashda xatolik yuz berdi");
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
      <h2 className="text-2xl font-bold text-[#002147]">Maqola topilmadi</h2>
      <button onClick={() => navigate(-1)} className="text-blue-600 font-bold hover:underline flex items-center gap-2">
        <FiArrowLeft /> Orqaga
      </button>
    </div>
  );

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-20">
      <Toaster position="top-right" />
      
      {/* 🟦 Dark Hero Section */}
      <section className="bg-[#002147] text-white pt-20 pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/journals" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors">
            <FiArrowLeft /> Qidiruvga qaytish
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-blue-400 border border-white/20 shadow-2xl">
                <FiFileText size={40} />
             </div>
             <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-4">
                   <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded-full tracking-widest border border-blue-500/30">
                      {article.category || "Ilmiy maqola"}
                   </span>
                   <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase rounded-full tracking-widest border border-white/20 flex items-center gap-1">
                      <FiEye size={12}/> {article.view_count || 0} ko'rishlar
                   </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black mb-4 leading-tight">{article.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-blue-200/60 font-medium">
                   <span>Nashr etilgan: {formatDate(article.createdAt)}</span>
                   <span>•</span>
                   <span>Holati: {article.status}</span>
                </div>
             </div>
             <div className="mt-4 md:mt-0">
                <a 
                  href={article.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-8 py-4 bg-white text-[#002147] rounded-2xl font-black text-sm transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                >
                   PDF YUKLASH <FiExternalLink />
                </a>
             </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F6F8FB] to-transparent"></div>
      </section>

      {/* 📄 Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            {/* Abstract */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50">
               <h2 className="text-2xl font-black text-[#002147] mb-6 flex items-center gap-3">
                  Annotatsiya
               </h2>
               <div className="text-[#4B5563] leading-relaxed text-lg whitespace-pre-wrap italic border-l-4 border-blue-100 pl-6">
                  {article.abstract}
               </div>
            </div>

            {/* Authors */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50">
               <h2 className="text-2xl font-black text-[#002147] mb-8">Mualliflar</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Array.isArray(article.authors) ? article.authors.map((auth, idx) => (
                    <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl border border-gray-50 hover:border-blue-100 transition-colors group">
                       <img src={auth.imageUrl || "https://ui-avatars.com/api/?name="+auth.fullName} alt={auth.fullName} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                       <div>
                          <div className="font-bold text-[#002147]">{auth.fullName}</div>
                          <div className="text-xs text-blue-600 font-medium mb-1">{auth.orcidId}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{auth.phone || "Oliy ta'lim muassasasi"}</div>
                       </div>
                    </div>
                  )) : <p className="text-gray-400">Mualliflar haqida ma'lumot mavjud emas.</p>}
               </div>
            </div>


            {/* Public Discussion / Comments Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50 animate-in fade-in duration-700">
               <h2 className="text-2xl font-black text-[#002147] mb-8 flex items-center justify-between">
                  Muhokama
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">{comments.length} Izohlar</span>
               </h2>

               {/* Add Comment Form */}
               {myId ? (
                 <div className="mb-10 space-y-4">
                    <textarea 
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Ushbu tadqiqot haqida fikringizni yoki savollaringizni qoldiring..."
                      className="w-full rounded-2xl border border-gray-100 p-5 focus:ring-4 focus:ring-blue-50 outline-none min-h-[120px] transition-all text-sm leading-relaxed bg-gray-50"
                    />
                    <div className="flex justify-end">
                       <button 
                         onClick={handlePostComment}
                         disabled={isSubmitting}
                         className="px-8 py-3 bg-[#002147] text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
                       >
                         {isSubmitting ? "Yuborilmoqda..." : <>Izoh qoldirish <FiSend /></>}
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="mb-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
                    <p className="text-sm text-blue-800 font-medium mb-4">Muhokamada qatnashish uchun tizimga kiring.</p>
                    <Link to="/login" className="inline-block px-6 py-2 bg-[#002147] text-white rounded-lg font-bold text-xs uppercase tracking-widest">Kirish</Link>
                 </div>
               )}

               <div className="space-y-8">
                  {comments.length === 0 ? (
                     <div className="text-center py-10 text-gray-400 italic">Hali muhokama mavjud emas. Birinchi bo'lib fikr bildiring!</div>
                   ) : (
                     comments
                       .filter(c => c.visibility === "Public" || c.visibility === "public")
                       .map(c => (
                        <div key={c.id} className="flex gap-4">
                           <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                              {c.author?.avatar_url ? (
                                <img src={c.author.avatar_url} alt="Foydalanuvchi" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#002147] font-black text-xs">
                                   {c.author?.full_name ? c.author.full_name[0] : (c.author?.fullName ? c.author.fullName[0] : "?")}
                                </div>
                              )}
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
            {isAuthor && <Timeline status={article.status} />}
            
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
               <h3 className="text-lg font-black text-[#002147] mb-6 uppercase tracking-widest text-sm">Kalit so'zlar</h3>
               <div className="flex flex-wrap gap-2">
                  {Array.isArray(article.keywords) ? article.keywords.map((k, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-50 text-gray-500 text-xs font-bold rounded-xl border border-gray-100 italic transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 cursor-default">
                       #{k}
                    </span>
                  )) : <span className="text-gray-300 text-xs">Kalit so'zlar mavjud emas</span>}
               </div>
            </div>

            <div className="bg-[#002147] rounded-[2.5rem] p-8 shadow-sm text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 italic text-sm uppercase tracking-widest text-blue-200">Meta-ma'lumotlar</h3>
                  <div className="space-y-3 text-xs opacity-70">
                     <p>Fayl hajmi: {(article.file_size / 1024 / 1024).toFixed(2)} MB</p>
                     <p>Jurnal: {article.journal?.name || "Global Science Journal"}</p>
                     <p>Til: {article.language || "O'zbek"}</p>
                     <p>To'lov qilingan: {article.apc_paid ? "✅ Ha" : "❌ Yo'q"}</p>
                  </div>
               </div>
               <FiExternalLink className="absolute -bottom-4 -right-4 text-white/5 size-32" />
            </div>
         </aside>
      </main>
    </div>
  );
};

export default ArticleDetails;