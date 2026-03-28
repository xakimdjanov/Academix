import React, { useEffect, useState, useCallback } from "react";
import { FiCheck, FiTrash2, FiMessageSquare, FiRefreshCw, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { commentService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
};

const MyArticleComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const myId = getUserIdFromToken();

  const fetchComments = useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    try {
      const res = await commentService.getAll();
      const all = Array.isArray(res?.data) ? res.data : [];
      // Filter comments belonging to articles owned by the current user
      const filtered = all.filter(c => Number(c?.article?.user_id) === Number(myId));
      filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(filtered);
    } catch (e) {
      toast.error("Izohlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApprove = async (id) => {
    try {
      await commentService.update(id, { visibility: "Public" });
      toast.success("Izoh tasdiqlandi va e'lon qilindi!");
      fetchComments();
    } catch (e) {
      toast.error("Izohni tasdiqlashda xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ushbu izohni o'chirishga aminmisiz?")) return;
    try {
      await commentService.delete(id);
      toast.success("Izoh o'chirildi");
      fetchComments();
    } catch (e) {
      toast.error("Izohni o'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#002147]">Maqola izohlari</h1>
          <p className="text-sm text-gray-500 font-medium">Ilmiy maqolalaringizga bildirilgan fikrlarni boshqaring</p>
        </div>
        <button 
          onClick={fetchComments}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Yangilash
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 italic text-gray-400 text-xs uppercase tracking-widest">
              <th className="py-4 px-4 font-black">Maqola</th>
              <th className="py-4 px-4 font-black">Sharhlovchi</th>
              <th className="py-4 px-4 font-black">Izoh</th>
              <th className="py-4 px-4 font-black">Holati</th>
              <th className="py-4 px-4 font-black text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="py-20 text-center text-gray-400">Baholash ma'lumotlari yuklanmoqda...</td></tr>
            ) : comments.length === 0 ? (
              <tr><td colSpan="5" className="py-20 text-center text-gray-400">Maqolalaringizda izohlar topilmadi.</td></tr>
            ) : (
              comments.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-5 px-4">
                    <Link to={`/articles/${c.article_id}`} className="font-bold text-[#002147] hover:text-blue-600 flex items-center gap-2 group/link">
                      {c.article?.title} <FiExternalLink className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="py-5 px-4 font-medium text-gray-600">
                    {c.author?.full_name || c.author?.fullName || "Kitobxon"}
                  </td>
                  <td className="py-5 px-4 max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2">{c.comment}</p>
                    <span className="text-[10px] text-gray-400 font-bold">{formatDate(c.createdAt)}</span>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      c.visibility === 'Public' || c.visibility === 'public' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {c.visibility === 'public' || c.visibility === 'Public' ? 'Ochiq' : 'Kutilmoqda'}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {(c.visibility === 'Pending' || c.visibility === 'pending') && (
                        <button 
                          onClick={() => handleApprove(c.id)}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Approve & Publish"
                        >
                          <FiCheck />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="Delete Comment"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyArticleComments;
