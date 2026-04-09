import React, { useEffect, useState, useMemo } from "react";
import { journalAdminService } from "../services/api";
import toast from "react-hot-toast";
import { 
  FiUsers, FiMail, FiShield, FiPlus, FiTrash2, FiEdit2, FiX, 
  FiCamera, FiCheck, FiUser, FiGlobe, FiBriefcase, FiPhone, FiLock, FiAlertTriangle 
} from "react-icons/fi";

const COUNTRY_OPTIONS = ["Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Tajikistan", "Turkmenistan", "United States", "Others"];

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all";

// --- Sub-components ---

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FiAlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Bekor qilish</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 disabled:opacity-50">
            {loading ? "O'chirilmoqda..." : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  );
};

const JournalAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);

  // Form State (Combined for Add/Edit)
  const initialForm = {
    full_name: "",
    email: "",
    password: "",
    phone: "",
    orcid: "",
    affiliation: "",
    country: "Uzbekistan",
    country_other: "",
  };
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await journalAdminService.getAll();
      const data = res?.data?.data || res?.data?.users || res?.data || [];
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openAddModal = () => {
    setForm(initialForm);
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsAddOpen(true);
  };

  const openEditModal = (admin) => {
    const countryInList = COUNTRY_OPTIONS.includes(admin.country);
    setForm({
      full_name: admin.full_name || "",
      email: admin.email || "",
      password: "",
      phone: admin.phone || "",
      orcid: admin.orcid || "",
      affiliation: admin.affiliation || "",
      country: countryInList ? admin.country : "Others",
      country_other: countryInList ? "" : admin.country || "",
    });
    setAvatarPreview(admin.avatar_url);
    setAvatarFile(null);
    setEditingAdmin(admin);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAddOpen && (!form.full_name || !form.email || !form.password || !avatarFile)) {
      return toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring");
    }
    
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(key => {
        if (key === "country") {
          fd.append("country", form.country === "Others" ? form.country_other : form.country);
        } else if (key === "country_other") {
          // skip
        } else if (key === "password") {
          if (form.password) fd.append("password", form.password);
        } else {
          fd.append(key, form[key]);
        }
      });
      fd.append("role", "JournalAdmin");
      if (avatarFile) fd.append("avatar", avatarFile);

      if (isAddOpen) {
        await journalAdminService.register(fd);
        toast.success("Yangi admin muvaffaqiyatli qo'shildi");
      } else {
        await journalAdminService.update(editingAdmin._id || editingAdmin.id, fd);
        toast.success("Ma'lumotlar yangilandi");
      }
      
      setIsAddOpen(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await journalAdminService.delete(deletingAdmin._id || deletingAdmin.id);
      toast.success("Admin o'chirildi");
      setDeletingAdmin(null);
      fetchAdmins();
    } catch (e) {
      toast.error("O'chirishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiShield className="text-blue-600" /> Journal Adminlar
          </h1>
          <p className="text-sm text-gray-500">Tizimdagi barcha jurnal boshqaruvchilari ro'yxati</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <FiPlus /> Yangi Admin Qo'shish
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium tracking-wide">Yuklanmoqda...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-20 text-center">
            <FiUsers className="w-16 h-16 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Hech qanday admin topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-gray-100 text-[11px] uppercase font-bold text-gray-400 tracking-widest">
                <tr>
                  <th className="py-5 px-8">Foydalanuvchi</th>
                  <th className="py-5 px-8">Aloqa ma'lumotlari</th>
                  <th className="py-5 px-8">Tashkilot</th>
                  <th className="py-5 px-8 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map((admin) => (
                  <tr key={admin._id || admin.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 uppercase overflow-hidden ring-2 ring-white">
                          {admin.avatar_url ? (
                            <img src={admin.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            (admin.full_name || "A")[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{admin.full_name || "Noma'lum"}</p>
                          <p className="text-xs text-gray-400 font-medium">{admin.country || 'O\'zbekiston'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <FiMail size={14} className="text-gray-400" />
                          {admin.email}
                        </div>
                        <div className="text-xs text-gray-400">{admin.phone}</div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <p className="text-sm font-semibold text-gray-700">{admin.affiliation || 'Noma\'lum'}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">ORCID: {admin.orcid || 'Mavjud emas'}</p>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(admin)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Tahrirlash"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeletingAdmin(admin)}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="O'chirish"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddOpen || editingAdmin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">
                {isAddOpen ? "Yangi Admin Qo'shish" : "Admin Tahrirlash"}
              </h2>
              <button onClick={() => { setIsAddOpen(false); setEditingAdmin(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[70vh] overflow-y-auto scrollbar-none">
              <div className="md:col-span-4 flex flex-col items-center gap-6 border-r border-gray-100 pr-8">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="w-16 h-16 text-gray-200" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all ring-4 ring-white">
                    <FiCamera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
                  </label>
                </div>
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 leading-relaxed">Profil rasmini yuklash majburiy*</p>
              </div>

              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">To'liq ismi *</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="full_name" value={form.full_name} onChange={handleFormChange} placeholder="Ism familiya" className={inputCls} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email *</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="email" value={form.email} onChange={handleFormChange} placeholder="email@example.com" className={inputCls} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{isAddOpen ? "Parol *" : "Yangi Parol (ixtiyoriy)"}</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="••••••" className={inputCls} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Telefon *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="+998" className={inputCls} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">ORCID ID *</label>
                    <div className="relative">
                      <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="orcid" value={form.orcid} onChange={handleFormChange} placeholder="0000-0000-..." className={inputCls} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tashkilot *</label>
                    <div className="relative">
                      <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="affiliation" value={form.affiliation} onChange={handleFormChange} placeholder="OTM yoki Markaz" className={inputCls} />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Davlat *</label>
                    <div className="relative">
                      <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="country" value={form.country} onChange={handleFormChange} className={`${inputCls} appearance-none`}>
                        {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {form.country === "Others" && (
                      <input name="country_other" value={form.country_other} onChange={handleFormChange} placeholder="Davlat nomini kiriting" className={`${inputCls} mt-3`} />
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsAddOpen(false); setEditingAdmin(null); }} className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">Bekor qilish</button>
                <button type="submit" disabled={isSubmitting} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-100">
                  {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                  {!isSubmitting && <FiCheck />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Modal */}
      <ConfirmModal 
        isOpen={!!deletingAdmin}
        onClose={() => setDeletingAdmin(null)}
        onConfirm={handleDelete}
        loading={isSubmitting}
        title="Adminni o'chirish"
        message={`Haqiqatan ham "${deletingAdmin?.full_name}"ni tizimdan o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`}
      />
    </div>
  );
};

export default JournalAdmins;
