import React, { useEffect, useState, useCallback } from "react";
import { FiMessageSquare, FiRefreshCw, FiExternalLink, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { commentService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
};

const MyComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const myId = getUserIdFromToken();

  const fetchMyComments = useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    try {
      const res = await commentService.getAll();
      const all = Array.isArray(res?.data) ? res.data : [];
      // Filter comments where I am the author
      const filtered = all.filter(c => Number(c?.user_id) === Number(myId));
      filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(filtered);
    } catch (e) {
      toast.error("Izohlaringizni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => {
    fetchMyComments();
  }, [fetchMyComments]);

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-12 text-[#F6F8FB] -z-10 opacity-50">
        <FiMessageSquare size={120} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#002147]">Mening izohlarim</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Akademik munozaralardagi ishtirokingizni kuzatib boring</p>
        </div>
        <button 
          onClick={fetchMyComments}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#002147] text-white rounded-xl hover:bg-black transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-900/10"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Ro'yxatni yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Tarix yuklanmoqda...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">
            <FiMessageSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">Siz hali hech qanday munozaralarda qatnashmadingiz.</p>
            <Link to="/articles" className="text-blue-600 font-bold hover:underline text-sm mt-2 inline-block">Maqolalarni ko'rish &rarr;</Link>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:border-blue-100 hover:bg-white transition-all shadow-sm hover:shadow-xl group">
               <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    c.visibility === 'Public' || c.visibility === 'public' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {c.visibility === 'public' || c.visibility === 'Public' ? 'Ochiq' : 'Kutilmoqda'}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{formatDate(c.createdAt)}</span>
               </div>

               <p className="text-sm text-gray-600 leading-relaxed italic mb-6">
                "{c.comment}"
               </p>

               <div className="pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Maqolada:</span>
                  <Link to={`/articles/${c.article_id}`} className="text-xs font-bold text-[#002147] hover:text-blue-600 line-clamp-2 leading-tight flex items-center gap-2 group/link">
                    {c.article?.title} <FiExternalLink size={14} className="opacity-50 group-hover/link:opacity-100" />
                  </Link>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyComments;
