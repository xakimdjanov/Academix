import React, { useState } from "react";
import { FiMail, FiPhone, FiSend, FiMessageCircle, FiMapPin } from "react-icons/fi";
import toast from "react-hot-toast";
import { suggestionService } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const { t, language } = useLanguage();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const combinedMessage = `Mavzu: ${form.subject}\nIsm: ${form.name}\nEmail: ${form.email}\n\nXabar:\n${form.message}`;
      
      const formData = new FormData();
      formData.append("type", "Boshqa");
      formData.append("message", combinedMessage);
      
      const userId = localStorage.getItem("user_id");
      if (userId) formData.append("user_id", userId);

      await suggestionService.create(formData);

      toast.success(
        language === "uz" ? "Xabar muvaffaqiyatli yuborildi!" :
        language === "en" ? "Message sent successfully!" :
        "Сообщение успешно отправлено!"
      );
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error(
        language === "uz" ? "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring." :
        language === "en" ? "An error occurred. Please try again." :
        "Произошла ошибка. Пожалуйста, попробуйте еще раз."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans selection:bg-blue-500 selection:text-white">
      {/* Premium Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001f3f] via-[#0a2e5c] to-[#001f3f] text-white py-24 md:py-40">
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/30 blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 blur-[100px]"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-blue-200 text-xs font-bold tracking-widest uppercase mb-8 shadow-xl">
             <FiMessageCircle className="text-sm" /> {language === "uz" ? "Biz bilan aloqa" : language === "en" ? "Contact us" : "Связаться с нами"}
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300">
            {language === "uz" ? <>Savollaringiz bormi? <br className="hidden md:block"/> Biz yordamga tayyormiz</> :
             language === "en" ? <>Have questions? <br className="hidden md:block"/> We are here to help</> :
             <>Есть вопросы? <br className="hidden md:block"/> Мы готовы помочь</>}
          </h1>
          <p className="text-blue-100/80 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            {language === "uz" ? "Platforma faoliyati yoki obunalar bo'yicha savollaringizni yo'llang. Bizning qo'llab-quvvatlash jamoamiz sizga 24/7 yordam beradi." :
             language === "en" ? "Send your questions about platform operations or subscriptions. Our support team is ready to assist you 24/7." :
             "Отправляйте ваши вопросы о работе платформы или подписках. Наша служба поддержки готова помочь вам 24/7."}
          </p>
        </div>
        
        {/* Custom shape divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
           <svg className="relative block w-full h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.83,124.22,190.61,115.17,235.32,108.41,278.4,85.29,321.39,56.44Z" className="fill-[#f8fafc]"></path>
           </svg>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Info Sidebar */}
            <div className="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
               <ContactInfoCard 
                  icon={<FiMail />} 
                  label={t("auth.email")} 
                  value="stacknowa@gmail.com" 
                  sub={language === "uz" ? "24 soat ichida javob beriladi" : language === "en" ? "Replied within 24 hours" : "Ответ в течение 24 часов"}
                  href="mailto:stacknowa@gmail.com"
               />
               <ContactInfoCard 
                  icon={<FiPhone />} 
                  label={language === "uz" ? "To'g'ridan-to'g'ri bog'lanish" : language === "en" ? "Direct contact" : "Прямой контакт"} 
                  value="+998 (20) 014-66-67" 
                  sub={language === "uz" ? "Du-Ju, 9:00-18:00" : language === "en" ? "Mon-Fri, 9:00-18:00" : "Пн-Пт, 9:00-18:00"}
                  href="tel:+998200146667"
               />
               <ContactInfoCard 
                  icon={<FiMessageCircle />} 
                  label={language === "uz" ? "Telegram kanal" : language === "en" ? "Telegram channel" : "Telegram канал"} 
                  value="@stacknowa" 
                  sub={language === "uz" ? "Jamiyatimizga qo'shiling" : language === "en" ? "Join our community" : "Присоединяйтесь к сообществу"}
                  href="https://t.me/stacknowa"
               />
               <ContactInfoCard 
                  icon={<FiMapPin />} 
                  label={language === "uz" ? "Asosiy ofis" : language === "en" ? "Main office" : "Главный офис"} 
                  value={language === "uz" ? "Namangan shahar" : language === "en" ? "Namangan city" : "город Наманган"} 
                  sub={language === "uz" ? "Tashrif buyuruvchilar uchun ochiq" : language === "en" ? "Open for visitors" : "Открыто для посетителей"}
               />
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
               <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 border border-gray-100/50 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
                  
                  <div className="relative z-10">
                      <h2 className="text-3xl font-black text-[#001f3f] mb-8">
                        {language === "uz" ? "Xabar qoldirishingiz mumkin" : language === "en" ? "Leave a message" : "Оставьте сообщение"}
                      </h2>
                      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">{t("auth.fullname")}</label>
                            <input 
                               required
                               type="text" 
                               placeholder={language === "uz" ? "Eshmatov Toshmat" : language === "en" ? "John Doe" : "Иван Иванов"}
                               value={form.name}
                               onChange={e => setForm({...form, name: e.target.value})}
                               className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-medium"
                            />
                         </div>
                         <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">{t("auth.email")}</label>
                            <input 
                               required
                               type="email" 
                               placeholder={t("auth.enter_email")}
                               value={form.email}
                               onChange={e => setForm({...form, email: e.target.value})}
                               className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-medium"
                            />
                         </div>
                         <div className="md:col-span-2 space-y-2 group">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                              {language === "uz" ? "Mavzu" : language === "en" ? "Subject" : "Тема"}
                            </label>
                            <input 
                               required
                               type="text" 
                               placeholder={language === "uz" ? "Xabaringiz mavzusi" : language === "en" ? "Subject of your message" : "Тема вашего сообщения"}
                               value={form.subject}
                               onChange={e => setForm({...form, subject: e.target.value})}
                               className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-medium"
                            />
                         </div>
                         <div className="md:col-span-2 space-y-2 group">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">
                              {language === "uz" ? "Sizning xabaringiz" : language === "en" ? "Your message" : "Ваше сообщение"}
                            </label>
                            <textarea 
                               required
                               rows="5"
                               placeholder={language === "uz" ? "Sizga qanday yordam kerakligini batafsil yozing..." : language === "en" ? "Describe how we can help you in detail..." : "Подробно опишите, как мы можем вам помочь..."}
                               value={form.message}
                               onChange={e => setForm({...form, message: e.target.value})}
                               className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-medium resize-none"
                            ></textarea>
                         </div>
                         <div className="md:col-span-2 pt-2">
                            <button 
                               type="submit" 
                               disabled={loading}
                               className="w-full py-4 bg-[#0052cc] hover:bg-[#0043a8] text-white rounded-xl font-bold transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-[0.98] flex items-center justify-center gap-3 group overflow-hidden relative"
                            >
                               <span className="relative z-10 flex items-center gap-2">
                                  {loading ? (language === "uz" ? "Yuborilmoqda..." : language === "en" ? "Submitting..." : "Отправка...") : (language === "uz" ? "Xabarni yuborish" : language === "en" ? "Send message" : "Отправить сообщение")} 
                                  <FiSend className={`transition-transform duration-300 ${loading ? 'animate-pulse' : 'group-hover:-translate-y-1 group-hover:translate-x-1'}`} />
                               </span>
                               <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            </button>
                         </div>
                      </form>
                  </div>
               </div>
            </div>
         </div>
      </section>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

const ContactInfoCard = ({ icon, label, value, sub, href }) => {
  const content = (
    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 flex items-center gap-5 group hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-200 transition-all duration-300 h-full relative overflow-hidden">
       {/* Card highlight effect */}
       <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
       
       <div className="w-14 h-14 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold group-hover:bg-[#0052cc] group-hover:text-white group-hover:scale-110 transition-all duration-300 relative z-10 shadow-sm">
          {icon}
       </div>
       <div className="relative z-10">
          <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1.5">{label}</div>
          <div className="text-base font-bold text-[#001f3f] mb-1 group-hover:text-[#0052cc] transition-colors">{value}</div>
          <div className="text-xs font-medium text-gray-500">{sub}</div>
       </div>
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl">
      {content}
    </a>
  ) : (
    <div className="h-full">
      {content}
    </div>
  );
};

export default Contact;
