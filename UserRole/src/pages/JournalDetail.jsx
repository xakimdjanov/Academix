import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiBook, 
  FiInfo, 
  FiFileText, 
  FiSend,
  FiAward,
  FiEye,
  FiLayers,
  FiChevronRight,
  FiMessageSquare
} from "react-icons/fi";
import { journalService, articleService, settingsService } from "../services/api";

const JournalDetail = () => {
  const { slug } = useParams();
  const [journal, setJournal] = useState(null);
  const [settings, setSettings] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const jRes = await journalService.getBySlug(slug);
        const jData = jRes?.data?.data || jRes?.data;
        setJournal(jData);

        if (jData) {
          const jId = jData.id || jData._id;

          // 1. Published maqolalarni olish
          const aRes = await articleService.getAll();
          const allArticles = Array.isArray(aRes?.data?.data) ? aRes.data.data : (Array.isArray(aRes?.data) ? aRes.data : []);
          const published = allArticles.filter(a => 
            (String(a.journal_id) === String(jId) || String(a.journal?.id) === String(jId)) && 
            a.status === "Published"
          );
          setArticles(published);

          // 2. Sayt sozlamalarini (Page/Settings) olish
          const sRes = await settingsService.getAll();
          const allSettings = Array.isArray(sRes?.data?.data) ? sRes.data.data : (Array.isArray(sRes?.data) ? sRes.data : []);
          const journalSettings = allSettings.filter(s => String(s.journal_id) === String(jId));
          setSettings(journalSettings);
        }
      } catch (error) {
        console.error("Error fetching journal details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-[#002147]">Jurnal topilmadi</h2>
        <Link to="/journals" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
          <FiArrowLeft /> Jurnallarga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-20">
      {/* 🟦 Hero / Header */}
      <section className="bg-[#002147] text-white pt-20 pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/journals" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors">
            <FiArrowLeft /> Qidiruvga qaytish
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-blue-400 border border-white/20 shadow-2xl">
                <FiBook size={48} className="md:size-64" />
             </div>
             <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-4">
                   <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded-full tracking-widest border border-blue-500/30">
                      {journal.category || "Taqrizdan o'tgan"}
                   </span>
                   <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase rounded-full tracking-widest border border-emerald-500/30">
                      ISSN: {journal.issn || "Kutilmoqda"}
                   </span>
                   <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase rounded-full tracking-widest border border-white/20 flex items-center gap-1">
                      <FiEye size={12}/> {journal.view_count || 0} ko'rildi
                   </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{journal.journal_name || journal.name}</h1>
                <p className="text-blue-100/70 text-lg max-w-3xl italic">
                   "{journal.short_description || "Ilmiy tadqiqotlar va akademik mukammallik uchun yetakchi nashriyot maydoni."}"
                </p>
             </div>
             <div className="mt-4 md:mt-0">
                <Link to="/submit-article" className="px-8 py-4 bg-white text-[#002147] rounded-2xl font-black text-sm transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                   MAQOLA YUBORISH <FiSend />
                </Link>
             </div>
          </div>
        </div>
        {/* Decorative mask */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F6F8FB] to-transparent"></div>
      </section>

      {/* 🔘 Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
         <div className="bg-white rounded-2xl shadow-xl p-2 flex overflow-x-auto no-scrollbar gap-2 border border-gray-100">
            <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<FiInfo/>} label="Haqida" />
            <TabButton active={activeTab === 'scope'} onClick={() => setActiveTab('scope')} icon={<FiAward/>} label="Maqsad va yo'nalishlar" />
            <TabButton active={activeTab === 'articles'} onClick={() => setActiveTab('articles')} icon={<FiFileText/>} label={`Maqolalar (${articles.length})`} />
            
            {/* 💎 Dynamic Tabs from Backend Settings (Site Pages) */}
            {settings.map((s) => (
               <TabButton 
                  key={s.id} 
                  active={activeTab === `setting-${s.id}`} 
                  onClick={() => setActiveTab(`setting-${s.id}`)} 
                  icon={<FiLayers/>} 
                  label={s.title || s.page_name} 
               />
            ))}
         </div>
      </div>

      {/* 📄 Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            {activeTab === 'about' && (
               <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black text-[#002147] mb-6">Jurnal haqida</h2>
                  <div className="prose prose-blue max-w-none text-[#4B5563] leading-relaxed space-y-4 text-justify">
                     {journal.description || "Ushbu jurnal haqida batafsil ma'lumot tayyorlanmoqda. Bizning vazifamiz qat'iy taqriz orqali akademik o'sishga ko'maklashishdir."}
                  </div>
               </div>
            )}

            {activeTab === 'scope' && (
               <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black text-[#002147] mb-6">Maqsad va yo'nalishlar</h2>
                  <div className="prose prose-blue max-w-none text-[#4B5563] leading-relaxed space-y-4 whitespace-pre-wrap text-justify">
                     {journal.aims_scope || "Ushbu jurnalning maqsad va yo'nalishlari yangilanmoqda."}
                  </div>
               </div>
            )}


            {activeTab === 'articles' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black text-[#002147] mb-6">Yaqinda nashr etilgan maqolalar</h2>
                  {articles.length === 0 ? (
                     <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 text-gray-400 font-medium">
                        Ushbu jurnalda hali maqolalar nashr etilmagan.
                     </div>
                  ) : (
                     articles.map(article => (
                        <div key={article._id || article.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex gap-4 hover:shadow-md transition-shadow group">
                           <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                              <FiFileText size={20} />
                           </div>
                           <div className="flex-1">
                              <h3 className="text-lg font-bold text-[#002147] mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                                 {article.title}
                              </h3>
                              <div className="flex items-center gap-4 mb-3">
                                 <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">{new Date(article.createdAt).toLocaleDateString()}</p>
                                 <span className="flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 font-black">
                                    <FiEye size={12}/> {article.view_count || 0} KO'RILDI
                                 </span>
                              </div>
                              <div className="flex gap-4">
                                 <Link to={`/articles/${article._id || article.id}`} className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-800 tracking-wider">
                                    MAQOLANI O'QISH <FiChevronRight />
                                 </Link>
                                 <a href={article.file_url} target="_blank" rel="noreferrer" className="text-xs font-black text-gray-400 hover:text-gray-600 tracking-wider">PDF YUKLAB OLISH</a>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            )}

            {/* 💎 Dynamic Settings Content */}
            {settings.map((s) => activeTab === `setting-${s.id}` && (
               <div key={s.id} className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black text-[#002147] mb-6">{s.title || s.page_name}</h2>
                  {s.image_url && (
                     <img src={s.image_url} alt={s.title} className="w-full h-auto rounded-2xl mb-8 shadow-lg border border-gray-100" />
                  )}
                  <div className="prose prose-blue max-w-none text-[#4B5563] leading-relaxed whitespace-pre-wrap text-justify">
                     {s.content}
                  </div>
               </div>
            ))}
         </div>

         {/* 🪜 Sidebar */}
         <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
               <h3 className="text-xl font-black text-[#002147] mb-6 uppercase tracking-widest text-sm">Jurnal ko'rsatkichlari</h3>
               <div className="space-y-4">
                  <Metric label="Qabul qilish darajasi" value="18%" />
                  <Metric label="Birinchi qarorgacha vaqt" value="24 kun" />
                  <Metric label="Impakt faktor" value="4.2 (2025)" />
               </div>
            </div>

            <div className="bg-[#002147] rounded-3xl p-8 shadow-sm text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">Nashr qilishga tayyormisiz?</h3>
                  <p className="text-blue-200/60 text-sm mb-6 leading-relaxed">Bugun tadqiqotingizni yuboring va jahon darajasidagi olimlar jamoasiga qo'shiling.</p>
                  <Link to="/submit-article" className="block w-full text-center py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg active:scale-95">
                     Qo'lyozmani yuborish
                  </Link>
               </div>
               <FiSend className="absolute -bottom-4 -right-4 text-white/5 size-32" />
            </div>
         </aside>
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
   <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap border-2 ${
         active ? 'bg-[#002147] text-white border-[#002147] shadow-xl' : 'text-gray-500 hover:bg-gray-50 border-transparent hover:text-[#002147]'
      }`}
   >
      {icon} {label}
   </button>
);

const Metric = ({ label, value }) => (
   <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
      <span className="text-sm font-bold text-gray-500">{label}</span>
      <span className="text-sm font-black text-[#002147]">{value}</span>
   </div>
);

export default JournalDetail;
