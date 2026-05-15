import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suggestionService } from "../services/api";
import { FiMessageSquare, FiEye, FiCheckCircle, FiClock, FiTrash2, FiMapPin } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const Suggestions = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await suggestionService.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setSuggestions(data);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await suggestionService.updateStatus(id, status);
      toast.success("Status yangilandi");
      fetchSuggestions();
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Yangi": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Ko'rib chiqilmoqda": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Bajarildi": return "bg-green-100 text-green-700 border-green-200";
      case "Rad etildi": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002147]"></div>
    </div>
  );

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#002147] flex items-center gap-3">
          <FiMessageSquare className="text-blue-600" /> Taklif va Shikoyatlar
        </h1>
        <p className="text-gray-500 mt-1">Foydalanuvchilardan kelgan barcha murojaatlar va takliflar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {suggestions.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelected(item)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selected?.id === item.id 
                  ? "bg-white border-[#002147] shadow-xl ring-2 ring-blue-50" 
                  : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-gray-800 line-clamp-1">{item.type}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.message}</p>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                   <FiMapPin /> {item.ip_address || "Noma'lum"}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/suggestions/${item.id}`);
                  }}
                  className="px-4 py-1.5 bg-[#002147] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/10"
                >
                   <FiEye /> Ko'rish
                </button>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
               <FiMessageSquare size={48} className="mx-auto mb-4 opacity-20" />
               <p className="font-bold">Hozircha murojaatlar yo'q</p>
            </div>
          )}
        </div>

        {/* Details (Preview) */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-6">
               <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                     <div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(selected.status)}`}>
                           {selected.status}
                        </span>
                        <h2 className="text-2xl font-black text-gray-800 mt-3">{selected.type}</h2>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => handleStatus(selected.id, "Ko'rib chiqilmoqda")} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all shadow-sm" title="Ko'rib chiqilmoqda"><FiClock /></button>
                        <button onClick={() => handleStatus(selected.id, "Bajarildi")} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all shadow-sm" title="Bajarildi"><FiCheckCircle /></button>
                        <button onClick={() => handleStatus(selected.id, "Rad etildi")} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all shadow-sm" title="Rad etildi"><FiTrash2 /></button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                     <div className="space-y-1">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Foydalanuvchi</p>
                        <p className="font-bold text-gray-800 break-words">{selected.user?.full_name || "Mehmon"}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Email</p>
                        <p className="font-bold text-gray-800 break-all">{selected.user?.email || "—"}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">IP Manzil</p>
                        <p className="font-bold text-blue-600 flex items-center gap-1 break-all"><FiMapPin /> {selected.ip_address}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sana</p>
                        <p className="font-bold text-gray-800">{new Date(selected.createdAt).toLocaleString()}</p>
                     </div>
                  </div>
               </div>

               <div className="p-8 space-y-8">
                  <div className="space-y-3">
                     <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Xabar</p>
                     <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                        {selected.message}
                     </div>
                  </div>

                  {selected.images?.length > 0 && (
                     <div className="space-y-3">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Biriktirilgan rasmlar ({selected.images.length})</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {selected.images.map((img, i) => (
                              <a key={i} href={img} target="_blank" rel="noreferrer" className="aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:ring-4 hover:ring-blue-50 transition-all">
                                 <img src={img} alt="" className="w-full h-full object-cover" />
                              </a>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
               <FiEye size={64} className="text-gray-200 mb-6" />
               <h2 className="text-2xl font-black text-gray-300">Tafsilotlarni ko'rish uchun chapdan tanlang</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Suggestions;
