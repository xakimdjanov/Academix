import React from "react";
import { FiTarget, FiEye, FiCheckCircle } from "react-icons/fi";
import { useLanguage } from "../context/LanguageContext";

const About = () => {
  const { language } = useLanguage();

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      {/* Hero */}
      <section className="bg-[#002147] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            {language === "uz" ? "Academix haqida" : language === "en" ? "About Academix" : "О платформе Academix"}
          </h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {language === "uz" ? "Yagona, shaffof va samarali akademik nashriyot platformasi orqali ilmiy kashfiyotlar chegaralarini kengaytirish." :
             language === "en" ? "Expanding the boundaries of scientific discovery through a unified, transparent and efficient academic publishing platform." :
             "Расширение границ научных открытий посредством единой, прозрачной и эффективной платформы академических публикаций."}
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
              <h2 className="text-3xl font-black text-[#002147] mb-6">
                {language === "uz" ? "Bizning vazifamiz" : language === "en" ? "Our Mission" : "Наша миссия"}
              </h2>
              <p className="text-[#6B7280] leading-relaxed text-lg text-justify">
                 {language === "uz" ? "Akademik jurnal boshqaruvi uchun zamonaviy infratuzilma yaratish orqali butun dunyo bo'ylab tadqiqotchilar va muassasalarga imkoniyat berish. Biz bilim almashishdagi to'siqlarni bartaraf etishni va taqriz jarayonining xolisligini ta'minlashni maqsad qilganmiz." :
                  language === "en" ? "Empowering researchers and institutions worldwide by creating a modern infrastructure for academic journal management. We aim to remove barriers to knowledge sharing and ensure the impartiality of the peer-review process." :
                  "Предоставление возможностей исследователям и учреждениям по всему миру путем создания современной инфраструктуры для управления академическими журналами. Мы стремимся устранить барьеры для обмена знаниями и обеспечить беспристрастность процесса рецензирования."}
              </p>
           </div>

           <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8">
                 <FiEye size={32} />
              </div>
              <h2 className="text-3xl font-black text-[#002147] mb-6">
                {language === "uz" ? "Bizning maqsadimiz" : language === "en" ? "Our Vision" : "Наше видение"}
              </h2>
              <p className="text-[#6B7280] leading-relaxed text-lg text-justify">
                 {language === "uz" ? "Biz har bir ilmiy kashfiyot bir zumda nashr etiladigan, qat'iy tekshiriladigan va butun dunyo bo'ylab to'siqlarsiz foydalanish mumkin bo'lgan dunyoni tasavvur qilamiz. Academix - bu xom ma'lumotlar va global ta'sir o'rtasidagi raqamli ko'prikdir." :
                  language === "en" ? "We envision a world where every scientific discovery is published instantly, rigorously reviewed, and accessible worldwide without barriers. Academix is the digital bridge between raw data and global impact." :
                  "Мы представляем себе мир, в котором каждое научное открытие публикуется мгновенно, строго проверяется и доступно во всем мире без барьеров. Academix — это цифровой мост между необработанными данными и глобальным влиянием."}
              </p>
           </div>
        </div>
      </section>

      {/* Why Academix */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-[#002147]">
                {language === "uz" ? "Asosiy qadriyatlarimiz" : language === "en" ? "Our Core Values" : "Наши ключевые ценности"}
              </h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <ValueItem 
                title={language === "uz" ? "Halollik" : language === "en" ? "Integrity" : "Честность"} 
                desc={language === "uz" ? "Ilmiy nashriyotda eng yuqori axloqiy standartlarga so'zsiz sodiqlik." :
                      language === "en" ? "Uncompromising commitment to the highest ethical standards in scientific publishing." :
                      "Бескомпромиссная приверженность высочайшим этическим стандартам в научных публикациях."} 
              />
              <ValueItem 
                title={language === "uz" ? "Innovatsiya" : language === "en" ? "Innovation" : "Инновации"} 
                desc={language === "uz" ? "Murakkab tahririyat va taqriz jarayonlarini soddalashtirish uchun texnologiyalardan foydalanish." :
                      language === "en" ? "Using technology to simplify complex editorial and peer-review processes." :
                      "Использование технологий для упрощения сложных редакционных процессов и рецензирования."} 
              />
              <ValueItem 
                title={language === "uz" ? "Ochiqlik" : language === "en" ? "Openness" : "Открытость"} 
                desc={language === "uz" ? "Bilimning global ijtimoiy ne'mat bo'lishini ta'minlash uchun ochiq kirish modellarini ilgari surish." :
                      language === "en" ? "Promoting open access models to ensure knowledge is a global public good." :
                      "Продвижение моделей открытого доступа для обеспечения того, чтобы знания были глобальным общественным благом."} 
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
