import React, { useState } from "react";
import { FiSend, FiImage, FiX, FiCheckCircle, FiAlertTriangle, FiPlusCircle, FiMessageSquare } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const Suggestions = () => {
  const [type, setType] = useState("Kamchilik");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      return toast.error("Maksimal 10 ta rasm yuklash mumkin");
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error("Iltimos, xabarni yozing");

    setSubmitting(true);
    try {
      const userId = getUserIdFromToken();
      const formData = new FormData();
      formData.append("type", type);
      formData.append("message", message);
      if (userId) formData.append("user_id", userId);
      
      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post("http://localhost:5000/suggestion/create", formData);
      setSuccess(true);
      toast.success("Raxmat! Taklifingiz qabul qilindi.");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-inner rotate-3">
            <FiCheckCircle size={48} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">Raxmat!</h2>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Taklifingiz muvaffaqiyatli yuborildi. Biz uni albatta ko'rib chiqamiz va platformani yaxshilaymiz.
          </p>
          <button 
            onClick={() => { setSuccess(false); setMessage(""); setImages([]); }}
            className="w-full bg-[#002147] text-white py-5 rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-900/20 transition-all active:scale-95"
          >
            Yana murojaat qilish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <Toaster position="top-center" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
               <FiMessageSquare /> Takliflar oynasi
            </div>
            <h1 className="text-5xl font-black text-[#002147] leading-[1.1] mb-6">
              Platformani <span className="text-blue-600">birgalikda</span> yaxshilaymiz
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-md">
              Sizning har bir taklifingiz yoki xabar bergan kamchiligingiz biz uchun juda muhim. Iltimos, fikrlaringizni ulashing.
            </p>
          </div>

          <div className="space-y-4">
             {[
                { title: "Tezkor javob", desc: "Har bir murojaat 24 soat ichida ko'rib chiqiladi." },
                { title: "Skrinshotlar", desc: "Muammoni yaxshiroq tushunishimiz uchun rasm yuklang." },
             ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                   <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 shrink-0">
                      <FiCheckCircle />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 p-8 sm:p-12 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Type Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Murojaat turi</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "Kamchilik", icon: <FiAlertTriangle />, label: "Kamchilik", color: "hover:bg-red-50 hover:text-red-600 hover:border-red-200" },
                    { id: "Qo'shimcha", icon: <FiPlusCircle />, label: "Taklif", color: "hover:bg-green-50 hover:text-green-600 hover:border-green-200" },
                    { id: "Boshqa", icon: <FiSend />, label: "Boshqa", color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" },
                  ].map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setType(item.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer font-bold ${
                        type === item.id 
                          ? "bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-900/10 scale-105" 
                          : `bg-gray-50 border-transparent text-gray-500 ${item.color}`
                      }`}
                    >
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Xabar matni</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Iltimos, batafsilroq tushuntiring..."
                  className="w-full h-44 p-6 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-[#002147] focus:bg-white outline-none transition-all text-gray-800 placeholder-gray-400 text-lg shadow-inner"
                />
              </div>

              {/* Images */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Rasmlar ({images.length}/10)</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                      <img 
                        src={URL.createObjectURL(img)} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-md text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#002147] hover:bg-blue-50/30 transition-all text-gray-400 hover:text-[#002147] group shadow-sm">
                      <FiImage size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Yuklash</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-[#002147] text-white py-6 rounded-3xl text-lg font-black hover:bg-[#001a3a] disabled:opacity-50 transition-all shadow-2xl shadow-blue-900/20 flex items-center justify-center gap-3 group active:scale-[0.98]"
              >
                {submitting ? "Yuborilmoqda..." : "Yuborish"} 
                <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suggestions;
