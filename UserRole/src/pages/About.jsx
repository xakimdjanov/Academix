import React from "react";
import { FiTarget, FiEye, FiCheckCircle } from "react-icons/fi";

const About = () => {
  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      {/* Hero */}
      <section className="bg-[#002147] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6">Academix haqida</h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Yagona, shaffof va samarali akademik nashriyot platformasi orqali
            ilmiy kashfiyotlar chegaralarini kengaytirish.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                 <FiTarget size={32} />
              </div>
              <h2 className="text-3xl font-black text-[#002147] mb-6">Bizning vazifamiz</h2>
              <p className="text-[#6B7280] leading-relaxed text-lg">
                 Akademik jurnal boshqaruvi uchun zamonaviy infratuzilma yaratish orqali 
                 butun dunyo bo'ylab tadqiqotchilar va muassasalarga imkoniyat berish. 
                 Biz bilim almashishdagi to'siqlarni bartaraf etishni va taqriz 
                 jarayonining xolisligini ta'minlashni maqsad qilganmiz.
              </p>
           </div>

           <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8">
                 <FiEye size={32} />
              </div>
              <h2 className="text-3xl font-black text-[#002147] mb-6">Bizning maqsadimiz</h2>
              <p className="text-[#6B7280] leading-relaxed text-lg">
                 Biz har bir ilmiy kashfiyot bir zumda nashr etiladigan, qat'iy 
                 tekshiriladigan va butun dunyo bo'ylab to'siqlarsiz foydalanish 
                 mumkin bo'lgan dunyoni tasavvur qilamiz. Academix - bu xom 
                 ma'lumotlar va global ta'sir o'rtasidagi raqamli ko'prikdir.
              </p>
           </div>
        </div>
      </section>

      {/* Why Academix */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-[#002147]">Asosiy qadriyatlarimiz</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <ValueItem 
                title="Halollik" 
                desc="Ilmiy nashriyotda eng yuqori axloqiy standartlarga so'zsiz sodiqlik." 
              />
              <ValueItem 
                title="Innovatsiya" 
                desc="Murakkab tahririyat va taqriz jarayonlarini soddalashtirish uchun texnologiyalardan foydalanish." 
              />
              <ValueItem 
                title="Ochiqlik" 
                desc="Bilimning global ijtimoiy ne'mat bo'lishini ta'minlash uchun ochiq kirish modellarini ilgari surish." 
              />
           </div>
        </div>
      </section>
    </div>
  );
};

const ValueItem = ({ title, desc }) => (
  <div className="text-center">
     <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
        <FiCheckCircle size={24} />
     </div>
     <h3 className="text-xl font-bold text-[#002147] mb-3">{title}</h3>
     <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
  </div>
);

export default About;
