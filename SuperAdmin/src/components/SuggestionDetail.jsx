import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { suggestionService } from "../services/api";
import { FiArrowLeft, FiMapPin, FiCheckCircle, FiClock, FiTrash2, FiCalendar, FiUser, FiMail, FiTag } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const SuggestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await suggestionService.getAll();
        const found = res.data.find(s => s.id === parseInt(id));
        if (found) setSuggestion(found);
        else toast.error("Murojaat topilmadi");
      } catch (error) {
        toast.error("Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleStatus = async (newStatus) => {
    try {
      await suggestionService.updateStatus(id, newStatus);
      toast.success("Status yangilandi");
      setSuggestion(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Yangi": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Ko'rib chiqilmoqda": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Bajarildi": return "bg-green-50 text-green-600 border-green-100";
      case "Rad etildi": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002147]"></div>
    </div>
  );

  if (!suggestion) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-400">Murojaat topilmadi</h2>
      <button onClick={() => navigate("/suggestions")} className="mt-4 text-blue-600 font-bold flex items-center justify-center gap-2 mx-auto">
        <FiArrowLeft /> Orqaga qaytish
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Toaster position="top-right" />
      
      <button 
        onClick={() => navigate("/suggestions")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#002147] font-bold mb-8 transition-colors group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Orqaga qaytish
      </button>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 sm:p-12 bg-gray-50/50 border-b border-gray-100">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(suggestion.status)}`}>
                    {suggestion.status}
                 </span>
                 <h1 className="text-4xl font-black text-gray-900 mt-4 leading-tight">{suggestion.type}</h1>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                 <button onClick={() => handleStatus("Ko'rib chiqilmoqda")} className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all font-bold text-sm">
                    <FiClock /> Ko'rib chiqish
                 </button>
                 <button onClick={() => handleStatus("Bajarildi")} className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all font-bold text-sm">
                    <FiCheckCircle /> Bajarildi
                 </button>
                 <button onClick={() => handleStatus("Rad etildi")} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-sm">
                    <FiTrash2 /> Rad etish
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FiUser size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Foydalanuvchi</p>
                    <p className="font-bold text-gray-800 break-words">{suggestion.user?.full_name || "Mehmon"}</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FiMail size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="font-bold text-gray-800 break-all">{suggestion.user?.email || "—"}</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FiMapPin size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">IP Manzil</p>
                    <p className="font-bold text-blue-600 break-all">{suggestion.ip_address}</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FiCalendar size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sana</p>
                    <p className="font-bold text-gray-800">{new Date(suggestion.createdAt).toLocaleString()}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 space-y-12">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
                 <FiTag /> Xabar matni
              </div>
              <div className="bg-gray-50/50 p-8 rounded-[2rem] text-gray-700 text-xl leading-relaxed whitespace-pre-wrap border border-gray-100 shadow-inner">
                 {suggestion.message}
              </div>
           </div>

           {suggestion.images?.length > 0 && (
              <div className="space-y-6">
                 <div className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
                    Biriktirilgan rasmlar ({suggestion.images.length})
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestion.images.map((img, i) => (
                       <a 
                          key={i} 
                          href={img} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="group relative aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-lg hover:ring-8 hover:ring-blue-50 transition-all bg-gray-100"
                       >
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                             Kattalashtirish
                          </div>
                       </a>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionDetail;
