import React from "react";
import { FiBookOpen, FiAlertCircle, FiAward, FiInfo } from "react-icons/fi";
import { useSEO } from "../hooks/useSEO";
import { useLanguage } from "../context/LanguageContext";

const Terms = () => {
  const { language } = useLanguage();

  useSEO({
    title: language === "uz" ? "Foydalanish shartlari" : language === "en" ? "Terms of Use" : "Условия использования",
    description: "Academix platformasining foydalanish shartlari va qoidalari.",
    keywords: "foydalanish shartlari, qoidalar, mualliflik huquqi, akademix, akademix.uz",
    url: "https://akademix.uz/terms",
    image: "/logo.png",
    type: "website",
    locale: "uz_UZ",
    siteName: "Academix",
  });

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#002147] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-blue-400 border border-white/20 shadow-2xl mb-8 mx-auto">
             <FiBookOpen size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            {language === "uz" ? "Foydalanish shartlari" : language === "en" ? "Terms of Use" : "Условия использования"}
          </h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {language === "uz" ? "Academix platformasidan foydalanish tartibi, mualliflik huquqlari hamda foydalanuvchilarning huquq va majburiyatlari bilan tanishib chiqing." :
             language === "en" ? "Get acquainted with the procedures of using the Academix platform, copyrights, and user rights and obligations." :
             "Ознакомьтесь с правилами использования платформы Academix, авторскими правами, а также правами и обязанностями пользователей."}
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
              <h2 className="text-2xl font-black text-[#002147] mb-4">
                {language === "uz" ? "1. Shartlarni qabul qilish" : language === "en" ? "1. Acceptance of Terms" : "1. Принятие условий"}
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                {language === "uz" ? "Tizimda ro'yxatdan o'tishingiz yoki xizmatlardan foydalanishingiz orqali siz mazkur Foydalanish shartlariga to'liq rozilik bildirasiz. Agar siz ushbu shartlarning biror qismiga rozilik bermasangiz, iltimos, platforma xizmatlaridan foydalanmang." :
                 language === "en" ? "By registering on the system or using the services, you fully agree to these Terms of Use. If you do not agree to any part of these terms, please do not use the platform's services." :
                 "Регистрируясь в системе или используя услуги, вы полностью соглашаетесь с настоящими Условиями использования. Если вы не согласны с какой-либо частью этих условий, пожалуйста, не используйте услуги платформы."}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <FiAward size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">
                {language === "uz" ? "2. Intellektual mulk va mualliflik huquqlari" : language === "en" ? "2. Intellectual Property and Copyrights" : "2. Интеллектуальная собственность и авторские права"}
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                {language === "uz" ? "Platformaga yuklanadigan ilmiy maqola va materiallarga nisbatan mualliflik huquqi tegishli muallifda saqlanib qoladi. Nashr etilgan maqolalar ochiq kirish (Open Access) tamoyillari asosida, Creative Commons litsenziyasi bo'yicha tarqatilishi mumkin. Foydalanuvchilar materiallardan faqat ilmiy va shaxsiy maqsadlarda, to'g'ri iqtibos keltirgan holda foydalanishlari shart." :
                 language === "en" ? "Copyrights for scientific articles and materials uploaded to the platform remain with the respective author. Published articles may be distributed on Open Access principles under a Creative Commons license. Users must use the materials only for scientific and personal purposes, citing them correctly." :
                 "Авторские права на научные статьи и материалы, загруженные на платформу, сохраняются за соответствующим автором. Опубликованные статьи могут распространяться на принципах открытого доступа под лицензией Creative Commons. Пользователи должны использовать материалы только в научных и личных целях, правильно их цитируя."}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <FiAlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">
                {language === "uz" ? "3. Foydalanish cheklovlari" : language === "en" ? "3. Usage Restrictions" : "3. Ограничения использования"}
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                {language === "uz" ? "Tizimdan foydalanishda quyidagi harakatlar taqiqlanadi:" :
                 language === "en" ? "The following actions are prohibited when using the system:" :
                 "При использовании системы запрещены следующие действия:"}
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-[#6B7280]">
                <li>{language === "uz" ? "Plagiat (ko'chirmachilik) holatlariga yo'l qo'yish yoki noto'g'ri ilmiy ma'lumotlarni ataylab yuklash." :
                     language === "en" ? "Committing plagiarism or deliberately uploading incorrect scientific data." :
                     "Допущение плагиата или умышленная загрузка неверных научных данных."}</li>
                <li>{language === "uz" ? "Platforma tizimi yoki serverlari xavfsizligiga ziyon yetkazuvchi harakatlarni amalga oshirish." :
                     language === "en" ? "Performing actions that harm the security of the platform's system or servers." :
                     "Выполнение действий, наносящих вред безопасности системы или серверов платформы."}</li>
                <li>{language === "uz" ? "Tizimdan boshqa foydalanuvchilarning shaxsiy ma'lumotlarini ruxsatsiz yig'ish maqsadida foydalanish." :
                     language === "en" ? "Using the system to collect personal data of other users without authorization." :
                     "Использование системы для сбора личных данных других пользователей без разрешения."}</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {language === "uz" ? "Oxirgi yangilanish: 2026-yil iyun" : language === "en" ? "Last updated: June 2026" : "Последнее обновление: Июнь 2026"}
            </span>
            <span className="text-xs text-blue-600 font-black">
              {language === "uz" ? "Academix Huquqiy Jamoasi" : language === "en" ? "Academix Legal Team" : "Юридическая команда Academix"}
            </span>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Terms;
