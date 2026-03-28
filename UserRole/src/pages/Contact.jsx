import React, { useState } from "react";
import { FiMail, FiPhone, FiSend, FiMessageCircle, FiMapPin } from "react-icons/fi";
import toast from "react-hot-toast";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Xabar muvaffaqiyatli yuborildi!");
      setForm({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-[#F6F8FB] min-h-screen">
      {/* Header */}
      <section className="bg-[#002147] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6">Biz bilan bog'lanish</h1>
          <p className="text-blue-100/70 text-lg md:text-xl max-w-2xl mx-auto">
            Obunalar yoki tahririyat jarayonlari bo'yicha savollaringiz bormi? 
            Bizning qo'llab-quvvatlash jamoamiz sizga 24/7 yordam berishga tayyor.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Sidebar */}
            <div className="lg:col-span-4 space-y-6">
               <ContactInfoCard 
                  icon={<FiMail />} 
                  label="Elektron pochta" 
                  value="support@academix.uz" 
                  sub="24 soat ichida javob beriladi"
               />
               <ContactInfoCard 
                  icon={<FiPhone />} 
                  label="To'g'ridan-to'g'ri bog'lanish" 
                  value="+998 (71) 123-45-67" 
                  sub="Du-Ju, 9:00-18:00"
               />
               <ContactInfoCard 
                  icon={<FiMessageCircle />} 
                  label="Telegram kanal" 
                  value="@academix_admin" 
                  sub="Jamiyatimizga qo'shiling"
               />
               <ContactInfoCard 
                  icon={<FiMapPin />} 
                  label="Asosiy ofis" 
                  value="123-uy, Fan ko'chasi, Toshkent, O'zbekiston" 
                  sub="Tashrif buyuruvchilar uchun ochiq"
               />
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
               <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-gray-100">
                  <h2 className="text-3xl font-black text-[#002147] mb-8">Xabar qoldiring</h2>
                  <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest">Ism-sharifingiz</label>
                        <input 
                           required
                           type="text" 
                           placeholder="Eshmatov Toshmat"
                           value={form.name}
                           onChange={e => setForm({...form, name: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest">Elektron pochta manzili</label>
                        <input 
                           required
                           type="email" 
                           placeholder="email@manzil.com"
                           value={form.email}
                           onChange={e => setForm({...form, email: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                     </div>
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest">Mavzu</label>
                        <input 
                           required
                           type="text" 
                           placeholder="Savol mavzusi"
                           value={form.subject}
                           onChange={e => setForm({...form, subject: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                     </div>
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest">Sizning xabaringiz</label>
                        <textarea 
                           required
                           rows="5"
                           placeholder="Sizga qanday yordam kerakligini ayting..."
                           value={form.message}
                           onChange={e => setForm({...form, message: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none text-sm"
                        ></textarea>
                     </div>
                     <div className="md:col-span-2">
                        <button 
                           type="submit" 
                           disabled={loading}
                           className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                           {loading ? "Yuborilmoqda..." : "Xabarni yuborish"} <FiSend />
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

const ContactInfoCard = ({ icon, label, value, sub }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-blue-200 transition-colors">
     <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
     </div>
     <div>
        <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{label}</div>
        <div className="text-sm font-bold text-[#002147] mb-0.5">{value}</div>
        <div className="text-[10px] font-medium text-blue-400 italic">{sub}</div>
     </div>
  </div>
);

export default Contact;
