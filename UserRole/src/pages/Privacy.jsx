import React from "react";
import { FiShield, FiLock, FiEye, FiServer } from "react-icons/fi";
import { useSEO } from "../hooks/useSEO";
import { useLanguage } from "../context/LanguageContext";

const Privacy = () => {
  const { language } = useLanguage();

  useSEO({
    title: language === "uz" ? "Maxfiylik siyosati" : language === "en" ? "Privacy Policy" : "Политика конфиденциальности",
    description: "Academix platformasining maxfiylik siyosati.",
    keywords: "maxfiylik siyosati, shaxsiy ma'lumotlar, xavfsizlik, akademix, akademix.uz",
    url: "https://akademix.uz/privacy"
  });

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#002147] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-blue-400 border border-white/20 shadow-2xl mb-8 mx-auto">
             <FiShield size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            {language === "uz" ? "Maxfiylik siyosati" : language === "en" ? "Privacy Policy" : "Политика конфиденциальности"}
          </h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {language === "uz" ? "Sizning shaxsiy ma'lumotlaringiz va ularning xavfsizligi biz uchun ustuvor vazifadir. Ma'lumotlaringizni qanday yig'ishimiz va himoya qilishimiz haqida batafsil ma'lumot oling." :
             language === "en" ? "Your personal data and its security are our top priority. Learn details about how we collect and protect your information." :
             "Ваши личные данные и их безопасность являются нашим главным приоритетом. Узнайте подробности о том, как мы собираем и защищаем вашу информацию."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-12">
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <FiEye size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">
                {language === "uz" ? "1. Ma'lumotlarni yig'ish" : language === "en" ? "1. Information Collection" : "1. Сбор информации"}
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                {language === "uz" ? "Biz siz platformamizda ro'yxatdan o'tganingizda, maqola yuborganingizda, tahririyat ishlari bilan shug'ullanganingizda shaxsiy ma'lumotlarni yig'amiz. Bunga sizning ismingiz, familiyangiz, elektron pochta manzilingiz, telefon raqamingiz, ORCID identifikatoringiz va mualliflik faoliyatingizga oid boshqa ilmiy ma'lumotlar kiradi." :
                 language === "en" ? "We collect personal data when you register on our platform, submit articles, or engage in editorial activities. This includes your name, surname, email address, phone number, ORCID identifier, and other scientific data related to your authorship activity." :
                 "Мы собираем личные данные, когда вы регистрируетесь на нашей платформе, отправляете статьи или занимаетесь редакционной деятельностью. Сюда входят ваше имя, фамилия, адрес электронной почты, номер телефона, идентификатор ORCID и другие научные данные, связанные с вашей авторской деятельностью."}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <FiLock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">
                {language === "uz" ? "2. Ma'lumotlardan foydalanish" : language === "en" ? "2. Use of Information" : "2. Использование информации"}
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                {language === "uz" ? "Yig'ilgan ma'lumotlardan quyidagi maqsadlarda foydalaniladi:" :
                 language === "en" ? "The collected information is used for the following purposes:" :
                 "Собранная информация используется в следующих целях:"}
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-[#6B7280]">
                <li>{language === "uz" ? "Platforma xizmatlarini taqdim etish va ulardan foydalanishni ta'minlash." :
                     language === "en" ? "To provide and maintain the platform's services." :
                     "Предоставление и поддержка услуг платформы."}</li>
                <li>{language === "uz" ? "Ilmiy maqolalarni taqrizdan o'tish va nashr qilish jarayonlarini boshqarish." :
                     language === "en" ? "To manage peer-review and publication processes for scientific articles." :
                     "Управление процессами рецензирования и публикации научных статей."}</li>
                <li>{language === "uz" ? "Siz bilan bog'lanish va tizim yangiliklari, bildirishnomalari yoki xavfsizlik haqida ogohlantirishlar yuborish." :
                     language === "en" ? "To communicate with you and send system updates, notifications, or safety alerts." :
                     "Для связи с вами и отправки обновлений системы, уведомлений или предупреждений о безопасности."}</li>
                <li>{language === "uz" ? "Platforma xavfsizligini ta'minlash va firibgarlikning oldini olish." :
                     language === "en" ? "To ensure platform security and prevent fraud." :
                     "Обеспечение безопасности платформы и предотвращение мошенничества."}</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <FiServer size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">
                {language === "uz" ? "3. Ma'lumotlar xavfsizligi" : language === "en" ? "3. Information Security" : "3. Безопасность информации"}
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                {language === "uz" ? "Biz sizning shaxsiy ma'lumotlaringizni ruxsatsiz kirish, o'zgartirish yoki yo'q qilishdan himoya qilish uchun zamonaviy shifrlash (SSL/TLS) texnologiyalari va xavfsizlik choralarini qo'llaymiz. Shaxsiy ma'lumotlaringiz hech qanday holatda uchinchi shaxslarga tijorat maqsadlarida sotilmaydi yoki ulashilmaydi." :
                 language === "en" ? "We employ modern encryption (SSL/TLS) technologies and security measures to protect your personal data from unauthorized access, modification, or destruction. Your personal information will not be sold or shared with third parties for commercial purposes under any circumstances." :
                 "Мы используем современные технологии шифрования (SSL/TLS) и меры безопасности для защиты ваших личных данных от несанкционированного доступа, изменения или уничтожения. Ваши личные данные ни при каких обстоятельствах не будут проданы или переданы третьим лицам в коммерческих целях."}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {language === "uz" ? "Oxirgi yangilanish: 2026-yil iyun" : language === "en" ? "Last updated: June 2026" : "Последнее обновление: Июнь 2026"}
            </span>
            <span className="text-xs text-blue-600 font-black">
              {language === "uz" ? "Academix Xavfsizlik Jamoasi" : language === "en" ? "Academix Security Team" : "Команда безопасности Academix"}
            </span>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Privacy;
