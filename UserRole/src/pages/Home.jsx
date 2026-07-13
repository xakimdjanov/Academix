import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiFileText,
  FiSearch,
  FiCreditCard,
  FiActivity,
  FiLock,
  FiLayers,
  FiCheckCircle,
  FiStar,
  FiUsers,
  FiEye
} from "react-icons/fi";
import { journalService, tariffService } from "../services/api";
import { useSEO } from "../hooks/useSEO";
import { formatTitle } from "../utils/textFormatter";
import { useLanguage } from "../context/LanguageContext";

const Home = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tariffs, setTariffs] = useState([]);
  const [loadingTariffs, setLoadingTariffs] = useState(true);
  const [whyChooseUs, setWhyChooseUs] = useState([]);
  const [stats, setStats] = useState({
    articles: 0,
    journals: 0,
    reviewers: 0,
    impact: 0
  });
  
  const { t, language } = useLanguage();

  useSEO({
    title: t("home.hero_title") + " | Academix.uz",
    description: "Academix / Akademix.uz — O'zbekistondagi akademik jurnallar, ilmiy maqolalar va tadqiqotlarni nashr qilish hamda tahririyat ishlarini avtomatlashtirish bo'yicha eng mukammal platforma.",
    keywords: "Academix, Academix.uz, ilmiy maqolalar, akademik jurnallar, doi maqola, tadqiqotlar",
    url: "https://akademix.uz",
    type: "website"
  });

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await journalService.getAll();
        const data = res?.data?.data || res?.data || [];
        const approvedData = Array.isArray(data) ? data.filter(j => j.is_approved_by_admin && j.is_active) : [];
        setJournals(approvedData.slice(0, 3));

        // 🎯 Fetch Global Stats
        try {
          const statsRes = await journalService.getStats();
          if (statsRes?.data) setStats(statsRes.data);
        } catch (sErr) {
          console.error("Stats fetch failed:", sErr);
        }

        // 🎯 Fetch Global "Why Choose Us" settings
        try {
          const settingsRes = await journalService.getById(1); 
          const sData = settingsRes?.data?.settings || [];
          const filtered = sData.filter(s => s.page_name === 'why-choose-us');
          if (filtered.length > 0) setWhyChooseUs(filtered);
        } catch (settingsError) {
          console.warn("Global settings (ID 1) not found. Using defaults.");
        }

      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchTariffs = async () => {
      try {
        const res = await tariffService.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setTariffs(data.filter(t => t.type === 'Article'));
      } catch (err) {
        console.error("Tariff fetch failed:", err);
      } finally {
        setLoadingTariffs(false);
      }
    };

    fetchJournals();
    fetchTariffs();
  }, []);

  const getWhyChooseUsTranslation = (title, defaultContent) => {
    const cleanTitle = (title || "").trim();
    if (cleanTitle === "Shaffof ish jarayoni") {
      return { title: t("home.why1_title"), content: t("home.why1_desc") };
    }
    if (cleanTitle === "Tezkor taqriz tizimi") {
      return { title: t("home.why2_title"), content: t("home.why2_desc") };
    }
    if (cleanTitle === "Xavfsiz to'lovlar") {
      return { title: t("home.why3_title"), content: t("home.why3_desc") };
    }
    if (cleanTitle === "Global standartlar") {
      return { title: t("home.why4_title"), content: t("home.why4_desc") };
    }
    return { title, content: defaultContent };
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
    <div className="bg-white overflow-hidden">
      {/* 🚀 1. HERO SECTION */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 bg-gradient-to-br from-[#002147] via-[#003366] to-[#001a33] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex flex-col items-center gap-12">
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom duration-1000">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {t("home.hero_title")}
              </h1>
              <p className="mt-6 text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto">
                {t("home.hero_desc")}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/submit-article"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {t("home.hero_btn_submit")} <FiArrowRight />
                </Link>
                <Link
                  to="/journals"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-lg transition-all backdrop-blur-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  {t("home.hero_btn_journals")} <FiSearch />
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-blue-200/60">
                <span className="flex items-center gap-1"><FiCheckCircle className="text-blue-400" /> {t("home.hero_badge_peer")}</span>
                <span className="flex items-center gap-1"><FiCheckCircle className="text-blue-400" /> {t("home.hero_badge_open")}</span>
                <span className="flex items-center gap-1"><FiCheckCircle className="text-blue-400" /> {t("home.hero_badge_secure")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ 2. FEATURES SECTION */}
      <section className="py-24 bg-[#F6F8FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#002147]">{t("home.features_title")}</h2>
            <p className="mt-4 text-[#6B7280] text-lg max-w-2xl mx-auto">
              {t("home.features_desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FiFileText size={24} />}
              title={t("home.feature_submit_title")}
              desc={t("home.feature_submit_desc")}
            />
            <FeatureCard
              icon={<FiSearch size={24} />}
              title={t("home.feature_review_title")}
              desc={t("home.feature_review_desc")}
            />
            <FeatureCard
              icon={<FiCreditCard size={24} />}
              title={t("home.feature_pay_title")}
              desc={t("home.feature_pay_desc")}
            />
            <FeatureCard
              icon={<FiActivity size={24} />}
              title={t("home.feature_track_title")}
              desc={t("home.feature_track_desc")}
            />
            <FeatureCard
              icon={<FiLock size={24} />}
              title={t("home.feature_role_title")}
              desc={t("home.feature_role_desc")}
            />
            <FeatureCard
              icon={<FiLayers size={24} />}
              title={t("home.feature_mgmt_title")}
              desc={t("home.feature_mgmt_desc")}
            />
          </div>
        </div>
      </section>

      {/* 👣 3. HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#002147]">{t("home.how_it_works")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <Step number="1" title={t("home.step1_title")} desc={t("home.step1_desc")} />
            <Step number="2" title={t("home.step2_title")} desc={t("home.step2_desc")} />
            <Step number="3" title={t("home.step3_title")} desc={t("home.step3_desc")} />
            <Step number="4" title={t("home.step4_title")} desc={t("home.step4_desc")} />

            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-0.5 bg-gray-100 -z-10"></div>
          </div>
        </div>
      </section>

      {/* 📚 4. JOURNALS SHOWCASE */}
      <section className="py-24 bg-[#F6F8FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#002147]">{t("home.explore_title")}</h2>
              <p className="mt-4 text-[#6B7280] text-lg">{t("home.explore_desc")}</p>
            </div>
            <Link to="/journals" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              {t("home.explore_all")} <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {journals.map((journal) => (
                <div key={journal._id || journal.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FiLayers size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[#002147] mb-2">{formatTitle(journal.journal_name || journal.name)}</h3>
                  <p className="text-[#6B7280] text-sm line-clamp-3 mb-4">{journal.short_description || journal.description || "No description available."}</p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-6">
                    <span className="px-2 py-1 bg-gray-100 rounded">ISSN: {journal.issn || "N/A"}</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded flex items-center gap-1">
                      <FiEye size={12} /> {journal.view_count || 0} {t("common.views_count")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/journals/${journal.slug || journal.journal_name || journal.name}`} className="flex-1 py-2 text-center text-sm font-bold text-[#002147] bg-gray-50 hover:bg-gray-100 rounded-lg transition">{t("common.details")}</Link>
                    <Link to="/submit-article" className="flex-1 py-2 text-center text-sm font-bold text-white bg-[#002147] hover:bg-[#003366] rounded-lg transition">{t("common.submit")}</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🏆 5. WHY CHOOSE US & STATS */}
      <section className="py-24 bg-[#002147] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 italic tracking-tight">{t("home.why_title")}</h2>
              <div className="space-y-6">
                {whyChooseUs.length > 0 ? (
                  whyChooseUs.map((item, idx) => {
                    const translated = getWhyChooseUsTranslation(item.title, item.content);
                    return <TrustItem key={idx} title={translated.title} desc={translated.content} />;
                  })
                ) : (
                  <>
                    <TrustItem title={t("home.why1_title")} desc={t("home.why1_desc")} />
                    <TrustItem title={t("home.why2_title")} desc={t("home.why2_desc")} />
                    <TrustItem title={t("home.why3_title")} desc={t("home.why3_desc")} />
                    <TrustItem title={t("home.why4_title")} desc={t("home.why4_desc")} />
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center bg-white/5 backdrop-blur-md rounded-3xl p-10 border border-white/10">
              <StatItem label={t("home.stats_articles")} value={`${stats.articles}+`} />
              <StatItem label={t("home.stats_journals")} value={`${stats.journals}+`} />
              <StatItem label={t("home.stats_reviewers")} value={`${stats.reviewers}+`} />
              <StatItem label={t("home.stats_views")} value={`${(stats.impact / 1000).toFixed(1)}k+`} />
            </div>
          </div>
        </div>
      </section>

      {/* 💰 6. PRICING PLANS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#002147]">{t("home.pricing_title")}</h2>
            <p className="mt-4 text-[#6B7280] text-lg max-w-2xl mx-auto">
              {t("home.pricing_desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingTariffs ? (
              [1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-50 animate-pulse rounded-3xl"></div>)
            ) : (
              tariffs.map((tItem, idx) => (
                <PricingCard
                  key={tItem.id}
                  title={getTariffNameTranslation(tItem.name)}
                  price={tItem.price}
                  popular={idx === 1}
                  features={[
                    tItem.type === 'Journal' ? getJournalLimitText(tItem.journal_limit) : null,
                    getArticleLimitText(tItem.article_limit),
                    getDurationText(tItem.duration_days),
                    ...(tItem.description ? tItem.description.split(/[\n,]+/).map(f => f.trim()).filter(f => f.length > 0) : [])
                  ].filter(Boolean)}
                  btnText={tItem.price === 0 ? t("home.pricing_free") : t("home.pricing_start")}
                  link={`/signup?tariff_id=${tItem.id}`}
                />
              ))
            )}
            
            {!loadingTariffs && tariffs.length === 0 && (
                <div className="col-span-full text-center p-12 bg-gray-50 rounded-3xl">
                    <p className="text-gray-400 font-bold">{t("pricing.no_tariffs")}</p>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* ⭐ 7. TESTIMONIALS */}
      <section className="py-24 bg-[#F6F8FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#002147]">{t("home.testimonials_title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Testimonial
              text="Taqriz jarayoni men kutganimdan ham qulayroq o'tdi. Academix haqiqatan ham zamonaviy tadqiqotchilar ehtiyojlarini tushunadi."
              author="Dr. Sarah Johnson"
              role="Katta ilmiy xodim"
            />
            <Testimonial
              text="Jurnal muharriri sifatida o'nlab maqolalarni boshqarish ilgari juda qiyin edi. Academix bizga vaqtimizni qaytarib berdi."
              author="Prof. Alan Turing"
              role="Tahririyat bosh muharriri"
            />
          </div>
        </div>
      </section>

      {/* 🚀 CTA SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t("home.cta_title")}</h2>
              <p className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto">{t("home.cta_desc")}</p>
              <Link to="/signup" className="px-10 py-5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-bold text-xl transition-all shadow-xl active:scale-95">
                {t("home.cta_btn")}
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          </div>
        </div>
      </section>

    </div>
  );
};

/* --- UI COMPONENTS --- */

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 font-bold">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#002147] mb-3">{title}</h3>
    <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="text-center relative z-10">
    <div className="w-20 h-20 bg-white border-2 border-blue-100 text-[#002147] rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
      {number}
    </div>
    <h3 className="text-xl font-bold text-[#002147] mb-2">{title}</h3>
    <p className="text-[#6B7280] text-xs px-4">{desc}</p>
  </div>
);

const TrustItem = ({ title, desc }) => (
  <div className="flex gap-4">
    <div className="mt-1 flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[#002147]">
      <FiCheckCircle size={14} />
    </div>
    <div>
      <h4 className="font-bold text-lg mb-1">{title}</h4>
      <p className="text-blue-200/60 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const StatItem = ({ label, value }) => (
  <div>
    <div className="text-3xl md:text-4xl font-black mb-1">{value}</div>
    <div className="text-xs md:text-sm text-blue-200/60 font-medium uppercase tracking-widest">{label}</div>
  </div>
);

const PricingCard = ({ title, price, features, popular, btnText, link }) => {
  const { t } = useLanguage();
  return (
    <div className={`p-10 rounded-3xl border ${popular ? 'border-blue-600 shadow-2xl relative bg-blue-600 text-white' : 'border-gray-200 bg-white text-[#002147]'} transition-all`}>
      {popular && <div className="absolute top-0 right-10 -translate-y-1/2 bg-yellow-400 text-[#002147] text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">{t("home.pricing_popular")}</div>}
      <div className="mb-8">
        <span className="text-sm font-bold uppercase tracking-widest opacity-60">{title}</span>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-black">{price === "Maxsus" || isNaN(price) ? "" : "$"}{price}</span>
          {!(price === "Maxsus" || isNaN(price)) && <span className="text-sm opacity-60 ml-2">{t("home.pricing_month")}</span>}
        </div>
      </div>
      <ul className="space-y-4 mb-10">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <FiCheckCircle className={popular ? 'text-white' : 'text-blue-600'} /> {f}
          </li>
        ))}
      </ul>
      <Link to={link || "/signup"} className={`block w-full text-center py-4 rounded-xl font-bold transition ${popular ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-[#002147] text-white hover:bg-[#003366]'}`}>
        {btnText}
      </Link>
    </div>
  );
};

const Testimonial = ({ text, author, role }) => (
  <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm italic text-[#4B5563] text-lg leading-relaxed relative">
    <FiStar className="absolute top-10 right-10 text-yellow-400 opacity-20" size={48} />
    "{text}"
    <div className="mt-8 not-italic flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
        {author[0]}
      </div>
      <div>
        <div className="font-black text-[#002147] text-sm">{author}</div>
        <div className="text-xs font-medium text-gray-400">{role}</div>
      </div>
    </div>
  </div>
);

export default Home;
