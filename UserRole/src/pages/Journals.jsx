import React, { useEffect, useState, useMemo } from "react";
import { journalService } from "../services/api";
import { FiSearch, FiFilter, FiLayers, FiArrowRight, FiBookOpen, FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await journalService.getAll();
        const data = res?.data?.data || res?.data || [];
        setJournals(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(journals.map(j => j.category || "Kategoriyasiz"));
    return ["Barchasi", ...Array.from(cats)];
  }, [journals]);

  const filtered = journals
    .filter(j => {
      const matchesSearch = (j.name || j.journal_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (j.description || j.short_description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Barchasi" || (j.category || "Kategoriyasiz") === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      {/* Header Section */}
      <section className="bg-[#002147] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Akademik jurnallar</h1>
          <p className="text-blue-100/70 text-lg max-w-2xl mx-auto">
            Turli ilmiy sohalardagi taqrizdan o'tgan jurnallarni kashf eting. 
            Yuqori sifatli tadqiqotlardan foydalaning va so'nggi yangiliklardan boxabar bo'ling.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-4 -translate-y-1/2">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Jurnalni nomi yoki sohasi bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
          <div className="w-full md:w-64 relative">
             <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none font-bold text-[#002147]"
             >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 bg-white animate-pulse rounded-2xl shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FiBookOpen size={40} />
             </div>
             <h3 className="text-2xl font-bold text-[#002147] mb-2">Jurnallar topilmadi</h3>
             <p className="text-gray-500">Qidiruv yoki filtrlarni o'zgartirib ko'ring.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(journal => (
              <JournalCard key={journal._id || journal.id} journal={journal} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const JournalCard = ({ journal }) => (
  <div className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all border border-gray-50 group flex flex-col h-full">
    <div className="flex justify-between items-start mb-6">
       <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <FiLayers size={28} />
       </div>
       <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full tracking-widest">{journal.category || "Ilmiy"}</span>
    </div>
    
    <h3 className="text-2xl font-bold text-[#002147] leading-tight mb-4 group-hover:text-blue-600 transition-colors">
      {journal.journal_name || journal.name}
    </h3>
    
    <p className="text-[#6B7280] text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
      {journal.description || journal.short_description || "O'z sohasidagi ilmiy ma'lumotlarning yetakchi manbasi."}
    </p>
    
    <div className="flex flex-col gap-4 pt-6 border-t border-gray-50">
       <div className="flex items-center justify-between text-xs font-bold text-gray-400">
          <span>ISSN: {journal.issn || "N/A"}</span>
          <span className="flex items-center gap-1 text-blue-600">
             <FiEye size={14}/> {journal.view_count || 0} KO'RILDI
          </span>
       </div>
       <div className="flex gap-2">
         <Link 
            to={`/journals/${journal.slug || journal.journal_name || journal.name}`} 
            className="flex-1 py-3 text-center text-xs font-black text-[#002147] bg-[#F6F8FB] hover:bg-gray-200 rounded-xl transition-all"
         >
            BATAFSIL
         </Link>
         <Link 
            to="/submit-article" 
            className="flex-1 py-3 text-center text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
         >
            MAQOLA YUBORISH
         </Link>
       </div>
    </div>
  </div>
);

export default Journals;
