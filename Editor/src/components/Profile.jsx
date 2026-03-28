import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, FiMail, FiShield, FiArrowLeft, 
  FiLogOut, FiPhone, FiCalendar, FiCamera, FiEdit2, FiCheck, FiX 
} from "react-icons/fi";
import { editorService } from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    age: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const savedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("admin"));
    if (!savedUser) { navigate("/login"); return; }

    setUser(savedUser);
    setFormData({
      fullname: savedUser.fullname || "",
      phone: savedUser.phone || "",
      age: savedUser.age || ""
    });
  }, [navigate]);

  const handleProfileUpdate = async () => {
    try {
      setUploading(true);
      const response = await editorService.update(user.id, formData);
      const updatedUser = response.data.editor || response.data;
      
      if (updatedUser) {
        setUser(updatedUser);
        const key = localStorage.getItem("user") ? "user" : "admin";
        localStorage.setItem(key, JSON.stringify(updatedUser));
        setIsEditing(false);
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      alert("Xatolik: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("profile_img", file);
    
    try {
      setUploading(true);
      const response = await editorService.update(user.id, data);
      const updatedUser = response.data.editor || response.data;

      if (updatedUser) {
        setUser(updatedUser);
        const key = localStorage.getItem("user") ? "user" : "admin";
        localStorage.setItem(key, JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      alert("Rasmni yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <button 
          onClick={() => navigate("/dashboard")} 
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-[#002147] transition-all font-medium group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1" /> Boshqaruv paneliga qaytish
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:row min-h-[500px] md:flex-row">
          
          <div className="md:w-1/3 bg-[#002147] p-10 flex flex-col items-center justify-center text-white relative">
            <div className="relative group mb-6">
              <div className="h-40 w-40 rounded-[2.5rem] bg-white/10 border-4 border-white/20 overflow-hidden flex items-center justify-center backdrop-blur-sm">
                {user.profile_img ? (
                  <img src={user.profile_img} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <FiUser size={60} className="text-white/40" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[2.5rem] opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                <FiCamera size={30} />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent animate-spin rounded-full"></div>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-center tracking-tight">{user.fullname}</h3>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-4 py-1 rounded-full mt-2 font-black tracking-widest uppercase">
              {user.role}
            </span>
          </div>

          <div className="md:w-2/3 p-8 md:p-12 relative">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-2xl font-black text-[#002147]">Shaxsiy ma'lumotlar</h1>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                >
                  <FiEdit2 /> Profilni tahrirlash
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleProfileUpdate} 
                    className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <FiCheck size={20}/>
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="bg-rose-500 text-white p-2 rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                  >
                    <FiX size={20}/>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <EditableRow 
                icon={<FiUser/>} 
                label="F.I.Sh" 
                value={formData.fullname} 
                isEditing={isEditing} 
                onChange={(e) => setFormData({...formData, fullname: e.target.value})}
              />
              <EditableRow 
                icon={<FiMail/>} 
                label="Email manzili" 
                value={user.email} 
                isEditing={false} 
              />
              <EditableRow 
                icon={<FiPhone/>} 
                label="Telefon raqami" 
                value={formData.phone} 
                isEditing={isEditing}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <EditableRow 
                icon={<FiCalendar/>} 
                label="Yosh" 
                value={formData.age} 
                isEditing={isEditing}
                type="number"
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>

            <button 
              onClick={handleLogout} 
              className="mt-12 flex items-center justify-center gap-2 text-slate-400 hover:text-rose-600 font-bold transition-all mx-auto"
            >
              <FiLogOut /> Tizimdan chiqish
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const EditableRow = ({ icon, label, value, isEditing, onChange, type="text" }) => (
  <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">{label}</p>
      {isEditing ? (
        <input 
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      ) : (
        <p className="text-slate-700 font-bold">{value || "Ma'lumot berilmagan"}</p>
      )}
    </div>
  </div>
);

export default Profile;