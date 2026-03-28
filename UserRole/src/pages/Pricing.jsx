import React from "react";
import { FiCheck, FiX, FiZap, FiTarget, FiBox } from "react-icons/fi";
import { Link } from "react-router-dom";

const Pricing = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      {/* Header */}
      <section className="bg-[#002147] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Oddiy va shaffof tariflar</h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-2xl mx-auto">
            Har qanday miqyosda nashr qilish uchun kerak bo'lgan hamma narsa. Yashirin to'lovlar yo'q.
          </p>
        </div>
      </section>

      {/* Main Pricing Cards */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
                icon={<FiTarget className="text-blue-600 size-12" />}
                title="Bepul / Boshlang'ich" 
                price="0" 
                token={token}
                desc="Nashr qilish yo'lini endi boshlayotgan mualliflar uchun ajoyib."
                features={["Oyiga 1 ta maqola", "Standart taqriz", "Iqtiboslar bildirishnomasi", "Asosiy profil"]}
                notFeatures={["Ustuvor qo'llab-quvvatlash", "DOI biriktirish", "Institutsional integratsiya"]}
            />
            <PricingCard 
                icon={<FiZap className="text-yellow-500 size-12" />}
                title="Professional" 
                price="49" 
                popular={true}
                token={token}
                desc="Faol tadqiqotchilar va kichik tahririyat jamoalari uchun ideal."
                features={["Cheksiz maqolalar", "Tezkor tahririyat jarayoni", "DOI biriktirish", "Kengaytirilgan analitika", "Elektron sertifikat"]}
                notFeatures={["Bir nechta jurnal portallari"]}
            />
            <PricingCard 
                icon={<FiBox className="text-indigo-600 size-12" />}
                title="Korporativ" 
                price="Maxsus" 
                token={token}
                desc="Universitetlar va yirik kutubxonalar uchun maxsus yechimlar."
                features={["White-label brendlash", "Maxsus tahririyat jarayoni", "Ko'p jurnalli dashboard", "API integratsiyasi", "LMS integratsiyasi"]}
                notFeatures={[]}
            />
         </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl font-black text-[#002147] mb-12 text-center underline decoration-blue-500/30 underline-offset-8">Imkoniyatlarni solishtirish</h2>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100">
                       <th className="px-6 py-4">Imkoniyatlar</th>
                       <th className="px-6 py-4">Bepul</th>
                       <th className="px-6 py-4">Pro</th>
                       <th className="px-6 py-4">Korporativ</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    <ComparisonRow title="Maksimal maqolalar" free="Oyiga 1 ta" pro="Cheksiz" enterprise="Cheksiz" />
                    <ComparisonRow title="Taqriz tezligi" free="6-12 hafta" pro="2-4 hafta" enterprise="Ustuvor" />
                    <ComparisonRow title="DOI xizmati" isAvailableFree={false} isAvailablePro={true} isAvailableEnterprise={true} />
                    <ComparisonRow title="Tahririyat portali" isAvailableFree={false} isAvailablePro={true} isAvailableEnterprise={true} />
                    <ComparisonRow title="API kirish" isAvailableFree={false} isAvailablePro={false} isAvailableEnterprise={true} />
                    <ComparisonRow title="Qo'llab-quvvatlash" free="Hamjamiyat" pro="Elektron pochta (24s)" enterprise="Shaxsiy menejer" />
                 </tbody>
              </table>
           </div>
        </div>
      </section>
    </div>
  );
};

const PricingCard = ({ icon, title, price, desc, features, notFeatures, popular, token }) => (
  <div className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col h-full bg-white group ${popular ? 'border-blue-600 shadow-2xl relative' : 'border-gray-50 shadow-sm shadow-blue-900/5'}`}>
    {popular && <div className="absolute top-0 right-12 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-6 py-2 rounded-full">Tavsiya etiladi</div>}
    
    <div className="mb-8">{icon}</div>
    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{title}</div>
    <div className="flex items-baseline mb-4">
       <span className="text-4xl font-black text-[#002147]">{price === "Maxsus" ? "" : "$"}{price}</span>
       {price !== "Maxsus" && <span className="text-sm font-bold text-gray-400 ml-2">/ oyiga</span>}
    </div>
    <p className="text-gray-500 text-sm leading-relaxed mb-8">{desc}</p>
    
    <div className="flex-grow space-y-4 mb-10">
       {features.map((f, i) => (
         <div key={i} className="flex items-center gap-3 text-[#002147] text-sm font-semibold">
            <FiCheck className="text-emerald-500" /> {f}
         </div>
       ))}
       {notFeatures.map((f, i) => (
         <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
            <FiX className="text-gray-200" /> {f}
         </div>
       ))}
    </div>

    <Link 
      to={price === "Maxsus" ? "/contact" : (token ? "/dashboard" : "/signup")} 
      className={`w-full py-4 rounded-2xl font-black text-xs text-center transition-all ${popular ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700' : 'bg-gray-50 text-[#002147] hover:bg-gray-100'}`}
    >
       {price === "Maxsus" ? "BIZ BILAN BOG'LANING" : (token ? "BOSHQARUV PANELIGA O'TISH" : "REJANI TANLASH")}
    </Link>
  </div>
);

const ComparisonRow = ({ title, free, pro, enterprise, isAvailableFree, isAvailablePro, isAvailableEnterprise }) => (
  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
     <td className="px-6 py-5 font-bold text-[#002147]">{title}</td>
     <td className="px-6 py-5 text-gray-500">
        {free || (isAvailableFree ? <FiCheck className="text-emerald-500" /> : <FiX className="text-rose-200" />)}
     </td>
     <td className="px-6 py-5 text-[#002147] font-semibold">
        {pro || (isAvailablePro ? <FiCheck className="text-emerald-500" /> : <FiX className="text-rose-200" />)}
     </td>
     <td className="px-6 py-5 text-[#002147] font-bold">
        {enterprise || (isAvailableEnterprise ? <FiCheck className="text-emerald-500" /> : <FiX className="text-rose-200" />)}
     </td>
  </tr>
);

export default Pricing;
