import React, { useEffect } from "react";
import { FiUser, FiSettings, FiEdit, FiX } from "react-icons/fi";

const RoleSelectionModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const roles = [
    {
      id: "user",
      title: "Foydalanuvchi",
      desc: "Maqola yuborish va kuzatish",
      icon: <FiUser className="w-8 h-8" />,
      url: "/signin",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      external: false,
    },
    {
      id: "journal_admin",
      title: "Jurnal Admin",
      desc: "Jurnalni boshqarish va taqrizlar",
      icon: <FiSettings className="w-8 h-8" />,
      url: "https://journal.akadmix.uz",
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
      external: true,
    },
    {
      id: "editor",
      title: "Muharrir",
      desc: "Maqolalarni tahrirlash",
      icon: <FiEdit className="w-8 h-8" />,
      url: "https://editor.akadmix.uz",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      external: true,
    },
  ];

  const handleSelect = (role) => {
    onClose();
    if (role.external) {
      window.location.href = role.url;
    } else {
      window.location.href = role.url; // Or use useNavigate if passed
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001429]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={24} />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#002147] mb-3">Tizimga kirish</h2>
            <p className="text-gray-500">Iltimos, o'z rolingizga mos panellni tanlang</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleSelect(role)}
                className="group relative flex flex-col items-center text-center p-6 rounded-3xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
              >
                {/* Hover Glow */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10 ${role.bgColor}`} />
                
                <div className={`w-16 h-16 ${role.bgColor} ${role.iconColor} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  {role.icon}
                </div>
                
                <h3 className="text-lg font-bold text-[#002147] mb-2">{role.title}</h3>
                <p className="text-sm text-gray-500 leading-tight">{role.desc}</p>
                
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity italic text-xs font-semibold text-blue-600">
                  Kirish →
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-12 text-center text-sm text-gray-400">
            Hisobingiz yo'qmi?{" "}
            <a href="/signup" className="text-blue-600 font-bold hover:underline">Ro'yxatdan o'tish</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
