import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { 
  FiFileText, FiCheckCircle, FiClock, FiXCircle, 
  FiEye, FiTrash2, FiDownload, FiSearch, FiFilter, FiUser, FiCalendar, FiBook, FiInfo, FiLayers, FiGlobe, FiChevronRight, FiChevronLeft,
  FiPhone, FiMail, FiExternalLink
} from "react-icons/fi";
import { articleService } from "../services/api";

const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  
  if (s === "accepted" || s === "public" || s === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
        <FiCheckCircle /> {s === "published" ? "Nashr qilingan" : "Qabul qilingan"}
      </span>
    );
  }
  if (s === "submitted" || s === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
        <FiClock /> Yuborilgan
      </span>
    );
  }
  if (s === "under review") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
        <FiEdit3 /> Ko'rib chiqilmoqda
      </span>
    );
  }
  if (s === "needs revision") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wider">
        <FiAlertCircle /> Tahrir kutilmoqda
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">
        <FiXCircle /> Rad etilgan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border uppercase tracking-wider">
      {status || "Noma'lum"}
    </span>
  );
};

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("all"); // all | submitted | accepted | rejected
  
  // Details Modal state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Lightbox state
  const [selectedImg, setSelectedImg] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await articleService.getAll();
      const data = res?.data?.data || res?.data || [];
      setArticles(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Maqolalarni yuklashda xatolik yuz berdi");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Haqiqatan ham ushbu maqolani o'chirib tashlamoqchimisiz?")) return;
    try {
      await articleService.delete(id);
      toast.success("Maqola o'chirildi");
      setArticles((prev) => prev.filter((a) => (a.id || a._id) !== id));
      if (selectedArticle && (selectedArticle.id || selectedArticle._id) === id) {
        setSelectedArticle(null);
      }
    } catch (e) {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleStatusUpdate = async (id, nextStatus) => {
    setIsUpdating(true);
    try {
      await articleService.update(id, { status: nextStatus });
      toast.success(`Holat muvaffaqiyatli yangilandi: ${nextStatus}`);
      
      // Update local state
      setArticles(prev => prev.map(a => (a.id === id || a._id === id) ? { ...a, status: nextStatus } : a));
      
      if (selectedArticle && (selectedArticle.id === id || selectedArticle._id === id)) {
        setSelectedArticle({ ...selectedArticle, status: nextStatus });
      }
    } catch (error) {
      toast.error("Holatni yangilashda xatolik");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredArticles = useMemo(() => {
    let list = articles;

    // Tab filter
    if (tab === "submitted") {
      list = list.filter(a => String(a.status).toLowerCase().includes("submit") || String(a.status).toLowerCase().includes("pend") || String(a.status).toLowerCase().includes("review"));
    } else if (tab === "accepted") {
      list = list.filter(a => ["accepted", "public", "published"].includes(String(a.status).toLowerCase()));
    } else if (tab === "rejected") {
      list = list.filter(a => String(a.status).toLowerCase() === "rejected");
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a => 
        a.title?.toLowerCase().includes(q) || 
        a.category?.toLowerCase().includes(q) ||
        a.author?.full_name?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [articles, tab, searchTerm]);

  const stats = useMemo(() => ({
    all: articles.length,
    submitted: articles.filter(a => String(a.status).toLowerCase().includes("submit") || String(a.status).toLowerCase().includes("pend") || String(a.status).toLowerCase().includes("review")).length,
    accepted: articles.filter(a => ["accepted", "public", "published"].includes(String(a.status).toLowerCase())).length,
    rejected: articles.filter(a => String(a.status).toLowerCase() === "rejected").length,
  }), [articles]);

  const TabBtn = ({ value, label, count }) => {
    const active = tab === value;
    return (
      <button
        onClick={() => setTab(value)}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
          active
            ? "bg-blue-700 text-white border-blue-700 shadow-sm shadow-blue-100"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        }`}
      >
        <span className="flex items-center gap-2">
          {label}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
            active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
          }`}>
            {count}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 italic flex items-center gap-2 tracking-tight">
              <FiFileText className="text-blue-700" /> Maqolalar boshqaruvi
            </h1>
            <p className="text-sm text-gray-500 font-medium">Platformadagi barcha ilmiy maqolalarni kuzatish va boshqarish</p>
          </div>
          
          <div className="relative max-w-sm w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Sarlavha yoki foydalanuvchi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
          <TabBtn value="all" label="Barchasi" count={stats.all} />
          <TabBtn value="submitted" label="Yuborilgan/Jarayonda" count={stats.submitted} />
          <TabBtn value="accepted" label="Qabul qilingan" count={stats.accepted} />
          <TabBtn value="rejected" label="Rad etilgan" count={stats.rejected} />
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase italic">
              <tr>
                <th className="py-5 px-6">Maqola ma'lumotlari</th>
                <th className="py-5 px-6">Yuboruvchi</th>
                <th className="py-5 px-6">Toifa / Til</th>
                <th className="py-5 px-6">Jurnal</th>
                <th className="py-5 px-6">Holati</th>
                <th className="py-5 px-6 text-center">Amallar</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 font-medium italic">Yuklanmoqda...</td></tr>
              ) : filteredArticles.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400 font-medium italic">Ma'lumot topilmadi</td></tr>
              ) : (
                filteredArticles.map((a) => {
                    const id = a.id || a._id;
                    return (
                        <tr key={id} onClick={() => setSelectedArticle(a)} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                            <td className="py-5 px-6">
                            <div className="max-w-[300px]">
                                <div className="font-bold text-gray-800 leading-tight mb-1 group-hover:text-blue-700 transition-colors truncate" title={a.title}>
                                {a.title}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                                <FiEye className="shrink-0" /> {a.view_count || 0} ko'rishlar
                                </div>
                            </div>
                            </td>

                            <td className="py-5 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center font-bold text-slate-500 text-[10px] shrink-0">
                                        {a.author?.avatar_url ? (
                                          <img src={a.author.avatar_url} alt="avatar" className="w-full h-full object-cover" onError={(e)=>e.currentTarget.style.display='none'} />
                                        ) : (
                                          <span>{a.author?.full_name?.[0] || "?"}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-gray-700 text-xs truncate max-w-[120px]">{a.author?.full_name || "Noma'lum"}</div>
                                        <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{a.author?.email || "Email yo'q"}</div>
                                    </div>
                                </div>
                            </td>
                            
                            <td className="py-5 px-6">
                            <div className="text-gray-700 font-bold text-xs">{a.category || "Maqola"}</div>
                            <div className="text-[11px] text-gray-400 font-medium italic">{a.language || "O'zbek"}</div>
                            </td>

                            <td className="py-5 px-6">
                            <div className="text-blue-700 font-bold text-xs truncate max-w-[180px]">
                                {a.journal?.name || "Noma'lum jurnal"}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium italic">{new Date(a.createdAt).toLocaleDateString()}</div>
                            </td>

                            <td className="py-5 px-6">
                            <StatusBadge status={a.status} />
                            </td>

                            <td className="py-5 px-6">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedArticle(a); }}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    title="Batafsil"
                                >
                                    <FiEye size={16} />
                                </button>
                                {a.file_url && (
                                <a 
                                    href={a.file_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    title="PDF ni yuklab olish"
                                >
                                    <FiDownload size={16} />
                                </a>
                                )}
                                <button
                                onClick={(e) => handleDelete(e, id)}
                                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                title="O'chirish"
                                >
                                <FiTrash2 size={16} />
                                </button>
                            </div>
                            </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedArticle(null)} />
              
              <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
                  {/* Modal Header */}
                  <div className="bg-[#002147] p-6 text-white shrink-0 relative overflow-hidden">
                      <div className="relative z-10 flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded-full tracking-widest border border-blue-500/30">
                                        {selectedArticle.category || "Ilmiy maqola"}
                                    </span>
                                    <StatusBadge status={selectedArticle.status} />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold leading-tight" title={selectedArticle.title}>
                                    {selectedArticle.title}
                                </h2>
                          </div>
                          <button 
                            onClick={() => setSelectedArticle(null)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
                          >
                            <FiXCircle size={24} />
                          </button>
                      </div>
                      <FiFileText className="absolute -right-8 -bottom-8 text-white/5 text-[150px] rotate-12" />
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-auto p-6 md:p-8 space-y-10 scrollbar-none">
                      
                      {/* Submitter & Journal Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FiUser className="text-blue-600"/> Maqola yuboruvchi
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center font-bold text-blue-600 shadow-sm border border-slate-100 text-xl overflow-hidden shrink-0">
                                    {selectedArticle.author?.avatar_url ? (
                                        <img src={selectedArticle.author.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{selectedArticle.author?.full_name?.[0] || "?"}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-lg">{selectedArticle.author?.full_name || "Noma'lum"}</div>
                                    <div className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                        <FiMail size={13}/> {selectedArticle.author?.email || "Email mavjud emas"}
                                    </div>
                                    {selectedArticle.author?.phone && (
                                      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                          <FiPhone size={12}/> {selectedArticle.author.phone}
                                      </div>
                                    )}
                                    {selectedArticle.author?.affiliation && (
                                      <div className="text-xs text-slate-400 font-medium mt-0.5 italic">{selectedArticle.author.affiliation}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FiBook className="text-blue-600"/> Jurnal ma'lumotlari
                            </h3>
                            <div>
                                <div className="font-bold text-slate-800 text-lg">{selectedArticle.journal?.name || "Noma'lum jurnal"}</div>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <FiCalendar size={13}/> {new Date(selectedArticle.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <FiGlobe size={13}/> {selectedArticle.language || "O'zbek"}
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>

                      {/* Authors Section */}
                      <div>
                          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                              <FiUsers className="text-blue-600"/> Maqola mualliflari
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {selectedArticle.authors?.map((auth, i) => (
                                  <div key={i} className="flex flex-col gap-4 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:border-blue-100 transition-all">
                                      <div className="flex items-center gap-4">
                                          <div 
                                            className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center font-bold text-blue-600 shadow-sm border border-slate-100 shrink-0 overflow-hidden cursor-zoom-in group/img"
                                            onClick={() => auth.imageUrl && setSelectedImg(auth.imageUrl)}
                                          >
                                              {auth.imageUrl ? (
                                                  <img src={auth.imageUrl} alt={auth.fullName} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform" />
                                              ) : (
                                                  <span className="text-xl">{auth.fullName?.[0] || auth.name?.[0] || "?"}</span>
                                              )}
                                          </div>
                                          <div className="min-w-0">
                                              <div className="font-bold text-slate-800 truncate mb-1">{auth.fullName || auth.name}</div>
                                              {auth.phone && (
                                                  <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                                                      <FiPhone className="text-blue-500" size={12}/> {auth.phone}
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                      {(auth.orcidId || auth.orcid) && (
                                          <div className="flex items-center gap-2 text-[10px] bg-white px-4 py-2 rounded-xl border border-slate-100 text-blue-600 font-black uppercase tracking-wider">
                                              <FiGlobe size={12}/> {auth.orcidId || auth.orcid}
                                          </div>
                                      )}
                                  </div>
                              ))}
                              {!selectedArticle.authors?.length && <p className="text-slate-400 italic text-sm p-4">Mualliflar haqida qo'shimcha ma'lumot yo'q</p>}
                          </div>
                      </div>

                      {/* Content Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <FiInfo className="text-blue-600"/> Annotatsiya
                                </h3>
                                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 italic relative">
                                    <FiChevronRight className="absolute left-3 top-8 text-blue-100 text-4xl" />
                                    <span className="relative z-10">{selectedArticle.abstract || "Annotatsiya kiritilmagan"}</span>
                                </div>
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <FiLayers className="text-blue-600"/> Kalit so'zlar
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(selectedArticle.keywords) ? selectedArticle.keywords : (typeof selectedArticle.keywords === 'string' ? selectedArticle.keywords.split(',') : [])).map((kw, i) => (
                                        <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100 transition-all hover:bg-blue-100">
                                            {String(kw).trim()}
                                        </span>
                                    ))}
                                    {!selectedArticle.keywords && <span className="text-slate-400 italic text-xs">Hali yo'q</span>}
                                </div>
                            </div>
                         </div>
                      </div>

                      {/* Status Management */}
                      <div className="pt-6 border-t border-slate-100">
                          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                              <FiEdit3 className="text-amber-500"/> Maqola holatini o'zgartirish
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                              {[
                                  { id: 'Submitted', label: 'Yuborilgan', color: 'bg-amber-500' },
                                  { id: 'Under Review', label: 'Jarayonda', color: 'bg-blue-500' },
                                  { id: 'Needs Revision', label: 'Tahrir', color: 'bg-orange-500' },
                                  { id: 'Accepted', label: 'Qabul', color: 'bg-emerald-500' },
                                  { id: 'Rejected', label: 'Rad etish', color: 'bg-rose-500' },
                                  { id: 'Published', label: 'Nashr', color: 'bg-slate-800' },
                              ].map(st => (
                                  <button
                                    key={st.id}
                                    disabled={isUpdating || selectedArticle.status === st.id}
                                    onClick={() => handleStatusUpdate(selectedArticle.id || selectedArticle._id, st.id)}
                                    className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 flex flex-col items-center justify-center gap-2 h-24 ${
                                        selectedArticle.status === st.id
                                        ? `border-blue-600 text-blue-800 bg-blue-50 shadow-lg shadow-blue-100`
                                        : `border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200`
                                    }`}
                                  >
                                      <div className={`w-2 h-2 rounded-full ${st.color} ${selectedArticle.status === st.id ? 'animate-pulse' : 'opacity-40'}`} />
                                      {st.label}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 px-8">
                        {selectedArticle.file_url && (
                            <a 
                                href={selectedArticle.file_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 bg-[#002147] text-white px-10 py-4 rounded-[1.25rem] font-black text-sm shadow-2xl shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all"
                            >
                                <FiDownload size={18}/> PDF MAQOLANI KO'RISH
                            </a>
                        )}
                        <button 
                            onClick={() => setSelectedArticle(null)}
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.25rem] font-bold text-sm hover:bg-slate-100 transition-all"
                        >
                            Oynani yopish
                        </button>
                  </div>
              </div>
          </div>
      )}

      {/* Lightbox / Zoomed Image Modal */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImg(null)}
        >
          <button 
            onClick={() => setSelectedImg(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all"
          >
            ✕
          </button>
          <div className="max-w-4xl max-h-full overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            <img 
              src={selectedImg} 
              alt="Enlarged profile" 
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// SVG Icons
const FiEdit3 = ({ className }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
);
const FiAlertCircle = ({ className }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
const FiUsers = ({ className }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

export default Articles;
