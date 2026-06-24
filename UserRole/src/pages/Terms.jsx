import React from "react";
import { FiBookOpen, FiAlertCircle, FiAward, FiInfo } from "react-icons/fi";
import { useSEO } from "../hooks/useSEO";

const Terms = () => {
  useSEO({
    title: "Foydalanish shartlari",
    description: "Academix platformasining foydalanish shartlari va qoidalari. Bizning xizmatlardan foydalanish tartibi va mualliflik huquqlari.",
    keywords: "foydalanish shartlari, qoidalar, mualliflik huquqi, akademix, akademix.uz",
    url: "https://akademix.uz/terms",
    image: "/logo.png",
    type: "website",
    locale: "uz_UZ",
    siteName: "Academix",
    twitterCard: "summary_large_image",
    twitterTitle: "Foydalanish shartlari - Academix",
    twitterDescription: "Academix platformasining foydalanish shartlari va qoidalari.",
    twitterImage: "/logo.png",
    ogUrl: "https://akademix.uz/terms",
    ogTitle: "Foydalanish shartlari - Academix",
    ogDescription: "Academix platformasining foydalanish shartlari va qoidalari.",
    ogImage: "/logo.png",
    ogType: "website",
    ogLocale: "uz_UZ",
    ogSiteName: "Academix",
  });

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#002147] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-blue-400 border border-white/20 shadow-2xl mb-8 mx-auto">
             <FiBookOpen size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">Foydalanish shartlari</h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Academix platformasidan foydalanish tartibi, mualliflik huquqlari hamda foydalanuvchilarning 
            huquq va majburiyatlari bilan tanishib chiqing.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-12">
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <FiInfo size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">1. Shartlarni qabul qilish</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Tizimda ro'yxatdan o'tishingiz yoki xizmatlardan foydalanishingiz orqali siz mazkur Foydalanish shartlariga to'liq rozilik bildirasiz. Agar siz ushbu shartlarning biror qismiga rozilik bermasangiz, iltimos, platforma xizmatlaridan foydalanmang.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <FiAward size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">2. Intellektual mulk va mualliflik huquqlari</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Platformaga yuklanadigan ilmiy maqola va materiallarga nisbatan mualliflik huquqi tegishli muallifda saqlanib qoladi. Nashr etilgan maqolalar ochiq kirish (Open Access) tamoyillari asosida, Creative Commons litsenziyasi bo'yicha tarqatilishi mumkin. Foydalanuvchilar materiallardan faqat ilmiy va shaxsiy maqsadlarda, to'g'ri iqtibos keltirgan holda foydalanishlari shart.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <FiAlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">3. Foydalanish cheklovlari</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Tizimdan foydalanishda quyidagi harakatlar taqiqlanadi:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-[#6B7280]">
                <li>Plagiat (ko'chirmachilik) holatlariga yo'l qo'yish yoki noto'g'ri ilmiy ma'lumotlarni ataylab yuklash.</li>
                <li>Platforma tizimi yoki serverlari xavfsizligiga ziyon yetkazuvchi harakatlarni amalga oshirish.</li>
                <li>Tizimdan boshqa foydalanuvchilarning shaxsiy ma'lumotlarini ruxsatsiz yig'ish maqsadida foydalanish.</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Oxirgi yangilanish: 2026-yil iyun</span>
            <span className="text-xs text-blue-600 font-black">Academix Huquqiy Jamoasi</span>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Terms;
