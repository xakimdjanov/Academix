import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  FiUser, FiMail, FiLock, FiUserPlus, FiShield, FiX, 
  FiTrash2, FiEdit2, FiCheck, FiAlertTriangle 
} from "react-icons/fi";
import { editorService } from "../services/api";

const safe = (v, fallback = "—") => (v === null || v === undefined || v === "" ? fallback : v);

// --- Sub-components ---

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
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

const Editors = () => {
  const [editors, setEditors] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Modals States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEditor, setEditingEditor] = useState(null);
  const [deletingEditor, setDeletingEditor] = useState(null);

  // Form States
  const [form, setForm] = useState({ fullname: "", email: "", password: "", confirmPassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEditors = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await editorService.getAll();
      const data = res?.data?.data || res?.data || [];
      setEditors(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Muharrirlar ro'yxatini yuklab bo'lmadi");
      setEditors([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchEditors();
  }, [fetchEditors]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const openAddModal = () => {
    setForm({ fullname: "", email: "", password: "", confirmPassword: "" });
    setIsAddOpen(true);
  };

  const openEditModal = (ed) => {
    setEditingEditor(ed);
    setForm({
      fullname: ed.fullname || ed.full_name || ed.name || "",
      email: ed.email || "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullname || !form.email || !form.password) {
      return toast.error("Iltimos, barcha maydonlarni to'ldiring");
    }
    if (form.password.length < 6) {
      return toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
    }
    if (form.password !== form.confirmPassword) {
      return toast.error("Parollar mos kelmadi");
    }

    setIsSubmitting(true);
    try {
      await editorService.register({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        role: "Editor",
      });

      toast.success("Muharrir muvaffaqiyatli yaratildi ✅");
      setIsAddOpen(false);
      fetchEditors();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        fullname: form.fullname,
        email: form.email,
      };
      if (form.password) data.password = form.password;

      await editorService.update(editingEditor.id || editingEditor._id, data);
      toast.success("Muharrir ma'lumotlari yangilandi");
      setEditingEditor(null);
      fetchEditors();
    } catch (error) {
      toast.error("Yangilashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await editorService.delete(deletingEditor.id || deletingEditor._id);
      toast.success("Muharrir o'chirildi");
      setDeletingEditor(null);
      fetchEditors();
    } catch (e) {
      toast.error("O'chirishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiShield className="text-blue-600" /> Muharrirlar
          </h1>
          <p className="text-sm text-gray-500">Tizimdagi barcha muharrirlar ro'yxati</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <FiUserPlus /> Yangi Muharrir Qo'shish
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {loadingList ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Yuklanmoqda...</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-[#F8FAFC] border-b border-gray-100 text-[11px] uppercase font-bold text-gray-400 tracking-widest">
                <tr>
                  <th className="py-5 px-8">Muharrir</th>
                  <th className="py-5 px-8">Email manzili</th>
                  <th className="py-5 px-8 text-center">Roli</th>
                  <th className="py-5 px-8 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {editors.map((ed) => (
                  <tr key={ed?.id || ed?._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="font-bold text-gray-800">
                        {safe(ed?.fullname || ed?.full_name || ed?.name)}
                      </div>
                    </td>
                    <td className="py-5 px-8 text-sm text-gray-600 font-medium">
                      {safe(ed?.email)}
                    </td>
                    <td className="py-5 px-8 text-center">
                      <span className="px-3 py-1 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {safe(ed?.role, "Editor")}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(ed)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Tahrirlash"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeletingEditor(ed)}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="O'chirish"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {editors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-20 text-gray-400 font-medium"> Hech qanday muharrir topilmadi </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddOpen || editingEditor) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2"> 
                    {isAddOpen ? <><FiUserPlus /> Yangi Muharrir</> : <><FiEdit2 /> Muharrirni tahrirlash</>} 
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">Muharrir ma'lumotlarini boshqarish</p>
                </div>
                <button onClick={() => { setIsAddOpen(false); setEditingEditor(null); }} className="p-2 hover:bg-white/10 rounded-full transition"><FiX size={24} /></button>
              </div>
            </div>
            <form onSubmit={isAddOpen ? handleRegisterSubmit : handleUpdateSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">To'liq ismi</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="fullname" value={form.fullname} onChange={handleFormChange} placeholder="Ism familiya" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="editor@example.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm" />
                </div>
              </div>
              
              {isAddOpen ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Parol</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="••••••" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tasdiqlash</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleFormChange} placeholder="••••••" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Yangi Parol (ixtiyoriy)</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="O'zgartirish uchun kiriting" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm" />
                  </div>
                </div>
              )}

              <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98]">
                {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                {!isSubmitting && <FiCheck />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Modal */}
      <ConfirmModal 
        isOpen={!!deletingEditor}
        onClose={() => setDeletingEditor(null)}
        onConfirm={handleDelete}
        loading={isSubmitting}
        title="Muharrirni o'chirish"
        message={`Haqiqatan ham "${safe(deletingEditor?.fullname || deletingEditor?.full_name)}"ni tizimdan o'chirib tashlamoqchimisiz?`}
      />
    </div>
  );
};

export default Editors;
