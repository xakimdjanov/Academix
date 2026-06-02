import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import toast, { Toaster } from "react-hot-toast";
import { FiCheck, FiX, FiRefreshCw, FiUser, FiMail, FiBook, FiEdit, FiLock, FiAlertCircle } from "react-icons/fi";
import { editorService, journalService } from "../../../services/api";

const EditorRequests = () => {
  const [loading, setLoading] = useState(true);
  const [allEditors, setAllEditors] = useState([]);
  const [allJournals, setAllJournals] = useState([]);
  
  // Tab state: "new" or "list"
  const [activeTab, setActiveTab] = useState("new");

  // Edit Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState(null);
  const [editForm, setEditForm] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const [edRes, jrRes] = await Promise.all([
        editorService.getAll(),
        journalService.getAll(),
      ]);

      const editors = Array.isArray(edRes?.data) 
        ? edRes.data 
        : Array.isArray(edRes?.data?.data) 
          ? edRes.data.data 
          : [];

      const journals = Array.isArray(jrRes?.data) 
        ? jrRes.data 
        : Array.isArray(jrRes?.data?.data) 
          ? jrRes.data.data 
          : [];

      setAllEditors(editors);
      setAllJournals(journals);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Menga tegishli jurnallar
  const myJournalIds = useMemo(() => {
    if (!myAdminId) return [];
    return allJournals
      .filter(j => String(j.journal_admin_id) === String(myAdminId))
      .map(j => String(j.id));
  }, [allJournals, myAdminId]);

  // Mening jurnallarimga tegishli Pending so'rovlar
  const pendingRequests = useMemo(() => {
    return allEditors.filter(ed => {
      const isPending = ed.status === "Pending";
      const isMyJournal = myJournalIds.includes(String(ed.journal_id));
      return isPending && isMyJournal;
    });
  }, [allEditors, myJournalIds]);

  // Mening jurnallarimga biriktirilgan tasdiqlangan Active muharrirlar ro'yxati
  const activeRequests = useMemo(() => {
    return allEditors.filter(ed => {
      const isActive = ed.status === "Active";
      const isMyJournal = myJournalIds.includes(String(ed.journal_id));
      return isActive && isMyJournal;
    });
  }, [allEditors, myJournalIds]);

  const handleApprove = async (id) => {
    try {
      await editorService.updateStatus(id, "Active");
      toast.success("Muharrir so'rovi qabul qilindi va faollashtirildi ✅");
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error("Tasdiqlashda xatolik yuz berdi");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Haqiqatdan ham ushbu so'rovni rad etib o'chirasizmi?")) return;
    try {
      await editorService.delete(id);
      toast.success("So'rov rad etildi va o'chirildi");
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error("Rad etishda xatolik yuz berdi");
    }
  };

  // Open Edit Modal
  const openEditModal = (editor) => {
    setSelectedEditor(editor);
    setEditForm({
      fullname: editor.fullname || editor.full_name || "",
      email: editor.email || "",
      password: "", // Always leave empty to start with
    });
    setIsEditModalOpen(true);
  };

  // Save Editor updates
  const handleSaveEditor = async (e) => {
    e.preventDefault();
    if (!selectedEditor) return;
    if (!editForm.fullname.trim() || !editForm.email.trim()) {
      return toast.error("Barcha maydonlarni to'ldiring");
    }

    try {
      setIsSaving(true);
      const payload = {
        fullname: editForm.fullname,
        email: editForm.email,
      };

      // Add password only if it's filled
      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      await editorService.update(selectedEditor.id, payload);
      toast.success("Muharrir ma'lumotlari muvaffaqiyatli saqlandi ✨");
      setIsEditModalOpen(false);
      fetchRequests();
    } catch (error) {
      console.error(error);
      const errMsg = error?.response?.data?.message || "Muharrir ma'lumotlarini tahrirlashda xatolik";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1F4F8F] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002147] tracking-tight">Muharrirlar Boshqaruvi</h1>
          <p className="text-gray-500 mt-1">
            Sizga biriktirilgan jurnallar muharrirlarini boshqarish va yangi so'rovlar
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Custom Modern Tabs inside header */}
          <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "new"
                  ? "bg-white text-[#002147] shadow-sm"
                  : "text-gray-500 hover:text-slate-800"
              }`}
            >
              Yangi so'rovlar ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "list"
                  ? "bg-white text-[#002147] shadow-sm"
                  : "text-gray-500 hover:text-slate-800"
              }`}
            >
              Muharrirlar Ro'yxati ({activeRequests.length})
            </button>
          </div>

          <button
            onClick={fetchRequests}
            className="flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl shadow-sm hover:bg-gray-50 hover:text-[#002147] transition-all font-semibold active:scale-95"
            title="Yangilash"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {!myAdminId && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-semibold flex items-center gap-2">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <span>⚠️ Admin ID topilmadi. Iltimos, qayta tizimga kiring.</span>
        </div>
      )}

      {myAdminId && myJournalIds.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-700 text-sm font-semibold flex items-center gap-2">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <span>ℹ️ Sizga biriktirilgan jurnallar topilmadi. Avval jurnalingiz mavjudligiga ishonch hosil qiling.</span>
        </div>
      )}

      {/* --- TAB CONTENT: NEW REQUESTS --- */}
      {activeTab === "new" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRequests.map((ed) => (
            <div
              key={ed.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="h-20 bg-gradient-to-r from-blue-600 to-[#002147] relative">
                <div className="absolute -bottom-8 left-6">
                  {ed.profile_img ? (
                    <img
                      src={ed.profile_img}
                      alt={ed.fullname}
                      className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm">
                      <FiUser className="text-2xl text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-10 p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{ed.fullname}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                    <FiMail className="flex-shrink-0" />
                    <span className="truncate">{ed.email}</span>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-3 flex items-start gap-3 border border-blue-100/30">
                  <FiBook className="text-[#002147] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase font-black text-blue-400 tracking-wider">Jurnal</p>
                    <p className="text-xs font-bold text-[#002147]">
                      {ed.journal?.name ||
                        allJournals.find(j => String(j.id) === String(ed.journal_id))?.name ||
                        `Jurnal #${ed.journal_id}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(ed.id)}
                    className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-2.5 rounded-xl font-extrabold text-xs hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 active:scale-95"
                  >
                    <FiCheck /> Tasdiqlash
                  </button>
                  <button
                    onClick={() => handleReject(ed.id)}
                    className="flex items-center justify-center gap-2 bg-rose-500 text-white py-2.5 rounded-xl font-extrabold text-xs hover:bg-rose-600 transition-all shadow-md shadow-rose-100 active:scale-95"
                  >
                    <FiX /> Rad etish
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingRequests.length === 0 && myJournalIds.length > 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50/60 rounded-3xl border-2 border-dashed border-slate-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-sm text-gray-300">
                <FiUser size={32} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Yangi so'rovlar yo'q</h2>
              <p className="text-gray-400 text-sm mt-1">Hozirda barcha kelgan so'rovlar ko'rib chiqilgan.</p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: ACTIVE EDITORS LIST --- */}
      {activeTab === "list" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-50 bg-slate-50/60">
                <tr>
                  <th className="py-4 px-6">Rasm</th>
                  <th className="py-4 px-6">Muharrir F.I.Sh</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Jurnal</th>
                  <th className="py-4 px-6 text-center">Amallar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {activeRequests.map((ed) => (
                  <tr key={ed.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      {ed.profile_img ? (
                        <img
                          src={ed.profile_img}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-gray-400">
                          <FiUser />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{ed.fullname || ed.full_name}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{ed.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-700 font-semibold border border-slate-200/50">
                        {ed.journal?.name ||
                          allJournals.find(j => String(j.id) === String(ed.journal_id))?.name ||
                          `Jurnal #${ed.journal_id}`}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(ed)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-semibold flex items-center gap-1 active:scale-95"
                          title="Tahrirlash"
                        >
                          <FiEdit size={16} /> <span className="text-xs px-1">Tahrirlash</span>
                        </button>
                        <button
                          onClick={() => handleReject(ed.id)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95"
                          title="O'chirish"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {activeRequests.length === 0 && (
                  <tr>
                    <td className="py-20 px-6 text-center text-slate-400" colSpan={5}>
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl mb-3 text-gray-300">
                        <FiUser size={24} />
                      </div>
                      <p className="font-bold">Faol muharrirlar topilmadi.</p>
                      <p className="text-xs text-gray-400 mt-1">Muharrirlar faollashtirilishi bilanoq shu yerda ko'rinadi.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (PREMIUM GLASSMORPHIC DIALOG) --- */}
      {isEditModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsEditModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[#002147]">Muharrirni Tahrirlash</h3>
                <p className="text-xs text-gray-400 mt-0.5">Email va parollarni o'zgartirish</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-[#002147] hover:bg-slate-100 rounded-xl transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditor} className="p-6 space-y-4">
              {/* Fullname input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">F.I.Sh (To'liq ismi)</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editForm.fullname}
                    onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#002147] focus:ring-4 focus:ring-blue-50/50 outline-none text-sm font-semibold text-slate-800 transition-all"
                    placeholder="Foydalanuvchining to'liq ismi"
                  />
                </div>
              </div>

              {/* Email input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Email manzili</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#002147] focus:ring-4 focus:ring-blue-50/50 outline-none text-sm font-semibold text-slate-800 transition-all"
                    placeholder="example@academix.uz"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Yangi Parol (ixtiyoriy)</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#002147] focus:ring-4 focus:ring-blue-50/50 outline-none text-sm font-semibold text-slate-800 transition-all"
                    placeholder="Parolni o'zgartirmaslik uchun bo'sh qoldiring"
                  />
                </div>
                <p className="text-[10px] text-gray-400 ml-1 leading-normal">
                  ⚠️ Agar parolni yangilamoqchi bo'lsangiz, yangi parol kiriting. Aks holda ushbu maydonni bo'sh qoldiring.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-[#002147] text-white rounded-2xl font-extrabold text-sm hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-60 active:scale-95"
                >
                  {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EditorRequests;
