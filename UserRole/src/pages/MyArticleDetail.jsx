import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiFileText, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiClock, 
  FiExternalLink,
  FiEye,
  FiUser,
  FiLayers
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService } from "../services/api";

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
};

const Timeline = ({ status }) => {
  const steps = [
    { key: "Submitted", label: "Yuborilgan" },
    { key: "Under Review", label: "Taqrizda" },
    { key: "Needs Revision", label: "Tuzatish kiritilishi kerak" },
    { key: "Accepted", label: "Qabul qilingan" },
    { key: "Published", label: "Nashr etilgan" },
  ];
  const rejected = status === "Rejected";
  const indexOf = (k) => steps.findIndex((s) => s.key === k);
  const currentIndex = rejected ? indexOf("Under Review") : indexOf(status);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-[#002147] mb-8">Maqola holati xronologiyasi</h3>
      <div className="relative flex flex-col gap-8">
        {steps.map((s, idx) => {
          const done = !rejected && currentIndex >= idx;
          const active = !rejected && status === s.key;
          return (
            <div key={s.key} className="flex gap-4 relative">
              {idx < steps.length - 1 && (
                <div className={`absolute left-[19px] top-10 w-0.5 h-8 ${done ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
              )}
              <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 transition-all ${
                done ? "bg-blue-600 border-blue-100 text-white" : 
                active ? "bg-white border-blue-600 text-blue-600 animate-pulse" : 
                "bg-white border-gray-100 text-gray-300"
              }`}>
                {done ? <FiCheckCircle size={18} /> : <FiClock size={18} />}
              </div>
              <div>
                <div className={`font-bold ${done || active ? "text-[#002147]" : "text-gray-400"}`}>{s.label}</div>
                <div className="text-xs text-gray-400">{active ? "Hozirgi bosqich" : done ? "Tugallangan" : "Kutilmoqda"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MyArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await articleService.getById(id);
        setArticle(res?.data);
      } catch (e) {
        toast.error("Maqolani yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#002147]">Maqola topilmadi</h2>
      <button onClick={() => navigate(-1)} className="text-blue-600 font-bold hover:underline flex items-center gap-2">
        <FiArrowLeft /> Orqaga qaytish
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8FB] pb-20">
      <Toaster position="top-right" />
      
      <div className="bg-[#002147] text-white pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <Link to="/dashboard/my-articles" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 transition-colors">
              <FiArrowLeft /> Ro'yxatga qaytish
           </Link>
           <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
              <div className="flex-1">
                 <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{article.status}</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><FiEye size={12}/> {article.view_count || 0}</span>
                 </div>
                 <h1 className="text-3xl font-black mb-4 leading-tight">{article.title}</h1>
                 <p className="text-blue-200/60 font-medium">Topshirilgan sana: {formatDate(article.createdAt)}</p>
              </div>
              <div className="flex gap-3">
                 <a href={article.file_url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white text-[#002147] rounded-xl font-bold text-sm shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
                    <FiExternalLink /> PDF KO'RISH
                 </a>
              </div>
           </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            {/* Editor Comments */}
            {article.editor_comment && (
               <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 italic">
                  <h3 className="text-lg font-bold text-[#002147] mb-4 flex items-center gap-2">
                     <FiMessageSquare className="text-amber-500" /> Tahririyat izohi:
                  </h3>
                  <div className="text-gray-700 leading-relaxed">
                     {article.editor_comment}
                  </div>
               </div>
            )}

            {/* Abstract */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm">
               <h3 className="text-xl font-bold text-[#002147] mb-6">Annotatsiya</h3>
               <div className="text-gray-600 leading-relaxed whitespace-pre-wrap italic border-l-4 border-blue-50 pl-6">
                  {article.abstract}
               </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <DetailCard icon={<FiLayers/>} label="Jurnal" value={article.journal?.name || "Global Science Journal"} />
               <DetailCard icon={<FiUser/>} label="Toifa" value={article.category || "Ilmiy maqola"} />
               <DetailCard icon={<FiClock/>} label="Oxirgi tahrir" value={formatDate(article.updatedAt)} />
               <DetailCard icon={<FiUser/>} label="Maqola tili" value={article.language || "O'zbek"} />
            </div>
         </div>

         <div className="lg:col-span-4">
            <Timeline status={article.status} />
         </div>
      </main>
    </div>
  );
};

const DetailCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{label}</div>
      <div className="font-bold text-[#002147]">{value}</div>
    </div>
  </div>
);

export default MyArticleDetail;
