import React from "react";
import { FiShield, FiLock, FiEye, FiServer } from "react-icons/fi";
import { useSEO } from "../hooks/useSEO";

const Privacy = () => {
  useSEO({
    title: "Maxfiylik siyosati",
    description: "Academix platformasining maxfiylik siyosati. Shaxsiy ma'lumotlaringizni himoya qilish va ulardan foydalanish qoidalari.",
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
          <h1 className="text-4xl md:text-6xl font-black mb-6">Maxfiylik siyosati</h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Sizning shaxsiy ma'lumotlaringiz va ularning xavfsizligi biz uchun ustuvor vazifadir. 
            Ma'lumotlaringizni qanday yig'ishimiz va himoya qilishimiz haqida batafsil ma'lumot oling.
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
              <h2 className="text-2xl font-black text-[#002147] mb-4">1. Ma'lumotlarni yig'ish</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Biz siz platformamizda ro'yxatdan o'tganingizda, maqola yuborganingizda, tahririyat ishlari bilan shug'ullanganingizda shaxsiy ma'lumotlarni yig'amiz. Bunga sizning ismingiz, familiyangiz, elektron pochta manzilingiz, telefon raqamingiz, ORCID identifikatoringiz va mualliflik faoliyatingizga oid boshqa ilmiy ma'lumotlar kiradi.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <FiLock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">2. Ma'lumotlardan foydalanish</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Yig'ilgan ma'lumotlardan quyidagi maqsadlarda foydalaniladi:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-[#6B7280]">
                <li>Platforma xizmatlarini taqdim etish va ulardan foydalanishni ta'minlash.</li>
                <li>Ilmiy maqolalarni taqrizdan o'tkazish va nashr qilish jarayonlarini boshqarish.</li>
                <li>Siz bilan bog'lanish va tizim yangiliklari, bildirishnomalari yoki xavfsizlik haqida ogohlantirishlar yuborish.</li>
                <li>Platforma xavfsizligini ta'minlash va firibgarlikning oldini olish.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <FiServer size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002147] mb-4">3. Ma'lumotlar xavfsizligi</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Biz sizning shaxsiy ma'lumotlaringizni ruxsatsiz kirish, o'zgartirish yoki yo'q qilishdan himoya qilish uchun zamonaviy shifrlash (SSL/TLS) texnologiyalari va xavfsizlik choralarini qo'llaymiz. Shaxsiy ma'lumotlaringiz hech qanday holatda uchinchi shaxslarga tijorat maqsadlarida sotilmaydi yoki ulashilmaydi.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Oxirgi yangilanish: 2026-yil iyun</span>
            <span className="text-xs text-blue-600 font-black">Academix Xavfsizlik Jamoasi</span>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Privacy;
