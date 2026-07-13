import React, { useEffect, useState } from "react";
import { FiCheck, FiX, FiZap, FiTarget, FiBox } from "react-icons/fi";
import { Link } from "react-router-dom";
import { tariffService } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const Pricing = () => {
  const token = localStorage.getItem("token");
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('Article'); // Default view
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        const res = await tariffService.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setTariffs(data);
      } catch (err) {
        console.error("Tariflarni yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTariffs();
  }, []);

  const filteredTariffs = tariffs.filter(t => t.type === activeType);

  const getIcon = (type, index) => {
    if (type === 'Journal') return <FiBox className="text-indigo-600 size-12" />;
    if (index === 0) return <FiTarget className="text-blue-600 size-12" />;
    return <FiZap className="text-yellow-500 size-12" />;
  };

  const getTariffNameTranslation = (name) => {
    const cleanName = (name || "").toLowerCase().trim();
    if (cleanName === "boshlang'ich" || cleanName === "starter" || cleanName === "начальный") {
      return t("pricing.starter");
    } else if (cleanName === "professional" || cleanName === "профессиональный") {
      return t("pricing.professional");
    } else if (cleanName === "korporativ" || cleanName === "corporate" || cleanName === "корпоративный") {
      return t("pricing.corporate");
    }
    return name;
  };

  const getJournalLimitText = (limit) => {
    if (limit) {
      return `${limit} ${t("pricing.journal_limit")}`;
    }
    return language === "uz" ? "Cheksiz jurnallar" : language === "en" ? "Unlimited journals" : "Безлимитные журналы";
  };

  const getArticleLimitText = (limit) => {
    if (limit) {
      return `${limit} ${t("pricing.article_limit")}`;
    }
    return language === "uz" ? "Cheksiz maqolalar" : language === "en" ? "Unlimited articles" : "Безлимитные статьи";
  };

  const getDurationText = (days) => {
    if (days) {
      return `${days} ${t("pricing.duration_days")}`;
    }
    return t("pricing.lifetime");
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen pb-20">
      {/* Header */}
      <section className="bg-[#002147] text-white py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">{t("pricing.h1")}</h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            {t("pricing.sub")}
          </p>
        </div>
      </section>

      {/* Type Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
            <button
              onClick={() => setActiveType('Article')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeType === 'Article' ? 'bg-[#002147] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t("pricing.authors")}
            </button>
            <button
              onClick={() => setActiveType('Journal')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeType === 'Journal' ? 'bg-[#002147] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t("pricing.admins")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Pricing Cards */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTariffs.map((tariff, idx) => (
              <PricingCard 
                key={tariff.id}
                id={tariff.id}
                icon={getIcon(tariff.type, idx)}
                title={getTariffNameTranslation(tariff.name)} 
                price={tariff.price} 
                token={token}
                desc={tariff.description || `${t("pricing.default_desc")}`}
                features={[
                  tariff.type === 'Journal' ? getJournalLimitText(tariff.journal_limit) : null,
                  getArticleLimitText(tariff.article_limit),
                  getDurationText(tariff.duration_days),
                  ...(tariff.description ? tariff.description.split(/[\n,]+/).map(f => f.trim()).filter(f => f.length > 0) : [])
                ].filter(Boolean)}
                notFeatures={idx === 0 ? [t("pricing.doi_service"), t("pricing.support")] : []}
                popular={idx === 1}
              />
            ))}
            
            {/* Fallback if no tariffs found */}
            {filteredTariffs.length === 0 && (
                <div className="col-span-full bg-white p-16 rounded-[3rem] text-center shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiBox className="text-gray-300 size-10" />
                    </div>
                    <p className="text-gray-400 font-bold text-lg">{t("pricing.no_tariffs")}</p>
                </div>
            )}
          </div>
        )}
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl md:text-4xl font-black text-[#002147] mb-16 text-center">{t("pricing.compare")}</h2>
           <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-sm">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100">
                       <th className="px-8 py-6">{t("pricing.features")}</th>
                       <th className="px-8 py-6 text-center">{t("pricing.starter")}</th>
                       <th className="px-8 py-6 text-center">{t("pricing.professional")}</th>
                       <th className="px-8 py-6 text-center">{t("pricing.corporate")}</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    <ComparisonRow title={t("pricing.articles_limit")} free={t("pricing.limited")} pro={t("pricing.unlimited")} enterprise={t("pricing.unlimited")} />
                    <ComparisonRow title={t("pricing.doi_service")} isAvailableFree={false} isAvailablePro={true} isAvailableEnterprise={true} />
                    <ComparisonRow title={t("pricing.editorial_portal")} isAvailableFree={false} isAvailablePro={true} isAvailableEnterprise={true} />
                    <ComparisonRow title={t("pricing.support")} free={t("pricing.support_free")} pro={t("pricing.support_pro")} enterprise={t("pricing.support_corp")} />
                 </tbody>
              </table>
           </div>
        </div>
      </section>
    </div>
  );
};

const PricingCard = ({ id, icon, title, price, desc, features, notFeatures, popular, token }) => {
  const { t } = useLanguage();
  return (
    <div className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col h-full bg-white group hover:scale-[1.02] duration-500 ${popular ? 'border-blue-600 shadow-2xl relative z-10 scale-105' : 'border-gray-50 shadow-sm shadow-blue-900/5 hover:border-blue-200'}`}>
      {popular && <div className="absolute top-0 right-12 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-tighter">{t("pricing.popular")}</div>}
      
      <div className="mb-8 p-4 bg-gray-50 rounded-3xl w-fit group-hover:bg-blue-50 transition-colors">{icon}</div>
      <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{title}</div>
      <div className="flex items-baseline mb-4">
         <span className="text-5xl font-black text-[#002147]">${price}</span>
         <span className="text-sm font-bold text-gray-400 ml-2">{t("pricing.final")}</span>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed mb-8 h-12 overflow-hidden">{desc}</p>
      
      <div className="flex-grow space-y-4 mb-10">
         {features.map((f, i) => (
           <div key={i} className="flex items-center gap-3 text-[#002147] text-sm font-bold">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <FiCheck className="text-emerald-600 size-3" />
              </div>
              {f}
           </div>
         ))}
         {notFeatures.map((f, i) => (
           <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
              <FiX className="text-gray-200" /> {f}
           </div>
         ))}
      </div>

      <Link 
        to={token ? "/dashboard" : `/signup?tariff_id=${id}`} 
        className={`w-full py-5 rounded-2xl font-black text-[10px] tracking-widest text-center transition-all ${popular ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700' : 'bg-[#002147] text-white hover:bg-blue-900'}`}
      >
         {token ? t("pricing.btn_panel") : t("pricing.btn_start")}
      </Link>
    </div>
  );
};

const ComparisonRow = ({ title, free, pro, enterprise, isAvailableFree, isAvailablePro, isAvailableEnterprise }) => (
  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
     <td className="px-8 py-6 font-bold text-[#002147]">{title}</td>
     <td className="px-8 py-6 text-center text-gray-500">
        {free || (isAvailableFree ? <FiCheck className="text-emerald-500 mx-auto" /> : <FiX className="text-rose-200 mx-auto" />)}
     </td>
     <td className="px-8 py-6 text-center text-[#002147] font-semibold">
        {pro || (isAvailablePro ? <FiCheck className="text-emerald-500 mx-auto" /> : <FiX className="text-rose-200 mx-auto" />)}
     </td>
     <td className="px-8 py-6 text-center text-[#002147] font-bold">
        {enterprise || (isAvailableEnterprise ? <FiCheck className="text-emerald-500 mx-auto" /> : <FiX className="text-rose-200 mx-auto" />)}
     </td>
  </tr>
);

export default Pricing;