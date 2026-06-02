import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { journalService, bobService } from "../../../services/api";
import toast from "react-hot-toast";
import { 
  FiFolder, FiPlus, FiTrash2, FiEdit2, FiX, 
  FiCheck, FiCalendar, FiBookOpen, FiFile, FiAlertTriangle 
} from "react-icons/fi";

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shrink-0">
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
    </div>,
    document.body
  );
};

const JournalBobs = () => {
  const [journals, setJournals] = useState([]);
  const [selectedJournalId, setSelectedJournalId] = useState("");
  const [bobs, setBobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bobsLoading, setBobsLoading] = useState(false);

  // File Upload State
  const [fileObj, setFileObj] = useState(null);

  // Modals States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBob, setEditingBob] = useState(null);
  const [deletingBob, setDeletingBob] = useState(null);

  // Form State
  const initialForm = {
    year: new Date().getFullYear(),
    name: "",
    file_url: "",
    status: "Active"
  };
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminId = useMemo(() => parseInt(localStorage.getItem("journal_admin_id")), []);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await journalService.getAll();
      const allJournals = res?.data?.data || res?.data || [];
      const myJournals = allJournals.filter(j => j.journal_admin_id === adminId);
      setJournals(myJournals);
      if (myJournals.length > 0) {
        setSelectedJournalId(myJournals[0].id);
      }
    } catch (error) {
      toast.error("Jurnallarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const fetchBobs = async (journalId) => {
    if (!journalId) return;
    setBobsLoading(true);
    try {
      const res = await bobService.getByJournal(journalId);
      // Backend returns grouped by year or direct array
      const data = res?.data || [];
      setBobs(data);
    } catch (error) {
      toast.error("Boblar ro'yxatini yuklab bo'lmadi");
    } finally {
      setBobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [adminId]);

  useEffect(() => {
    if (selectedJournalId) {
      fetchBobs(selectedJournalId);
    } else {
      setBobs([]);
    }
  }, [selectedJournalId]);

  const openAddModal = () => {
    setForm(initialForm);
    setFileObj(null);
    setIsAddOpen(true);
  };

  const openEditModal = (bob) => {
    setForm({
      year: bob.year || new Date().getFullYear(),
      name: bob.name || "",
      file_url: bob.file_url || "",
      status: bob.status || "Active"
    });
    setFileObj(null);
    setEditingBob(bob);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.year || !form.name) {
      return toast.error("Iltimos, yil va nom maydonlarini to'ldiring");
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("journal_id", selectedJournalId);
      fd.append("year", form.year);
      fd.append("name", form.name);
      fd.append("status", form.status);

      if (fileObj) {
        fd.append("file", fileObj);
      } else if (form.file_url) {
        fd.append("file_url", form.file_url);
      }

      if (isAddOpen) {
        await bobService.create(fd);
        toast.success("Yangi bob muvaffaqiyatli qo'shildi");
      } else {
        await bobService.update(editingBob.id, fd);
        toast.success("Bob muvaffaqiyatli yangilandi");
      }

      setIsAddOpen(false);
      setEditingBob(null);
      setFileObj(null);
      fetchBobs(selectedJournalId);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await bobService.delete(deletingBob.id);
      toast.success("Bob o'chirildi");
      setDeletingBob(null);
      fetchBobs(selectedJournalId);
    } catch (e) {
      toast.error("O'chirishda xatolik yuz berdi");
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
            <FiFolder className="text-blue-600" /> Jurnal Boblari (Issues)
          </h1>
          <p className="text-sm text-gray-500">Jurnalingizning yillik nashrlari (sonlari) ro'yxati va boshqaruvi</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {journals.length > 0 && (
            <select
              value={selectedJournalId}
              onChange={(e) => setSelectedJournalId(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all appearance-none"
            >
              {journals.map(j => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={openAddModal}
            disabled={!selectedJournalId}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            <FiPlus /> Yangi Bob Qo'shish
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading || bobsLoading ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium tracking-wide">Yuklanmoqda...</p>
          </div>
        ) : !selectedJournalId ? (
          <div className="p-20 text-center">
            <FiBookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Boshqarish uchun avval jurnal qo'shing</p>
          </div>
        ) : bobs.length === 0 ? (
          <div className="p-20 text-center">
            <FiFolder className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Ushbu jurnalda hozircha hech qanday bob yaratilmagan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-gray-100 text-[11px] uppercase font-bold text-gray-400 tracking-widest">
                <tr>
                  <th className="py-5 px-8">Bob nomi / Son</th>
                  <th className="py-5 px-8">Nashr yili</th>
                  <th className="py-5 px-8">Fayl manzili (PDF)</th>
                  <th className="py-5 px-8">Holati</th>
                  <th className="py-5 px-8 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bobs.map((bob) => (
                  <tr key={bob.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <FiBookOpen size={18} />
                        </div>
                        <p className="font-bold text-gray-800">{bob.name}</p>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                        <FiCalendar className="text-gray-400" size={14} />
                        {bob.year}-yil
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      {bob.file_url ? (
                        <a 
                          href={bob.file_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <FiFile size={14} /> Faylni ko'rish
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Yuklanmagan</span>
                      )}
                    </td>
                    <td className="py-5 px-8">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                        bob.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-gray-50 text-gray-500 border-gray-100"
                      }`}>
                        {bob.status === "Active" ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(bob)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Tahrirlash"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeletingBob(bob)}
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
      {(isAddOpen || editingBob) && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => { setIsAddOpen(false); setEditingBob(null); setFileObj(null); }} />

          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isAddOpen ? "Yangi Bob Qo'shish" : "Bob Tahrirlash"}
                </h2>
                <button onClick={() => { setIsAddOpen(false); setEditingBob(null); setFileObj(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FiX size={24} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-none">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nashr Yili *</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      name="year" 
                      type="number"
                      value={form.year} 
                      onChange={handleFormChange} 
                      placeholder="Masalan: 2026" 
                      className={inputCls} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Bob nomi (Son) *</label>
                  <div className="relative">
                    <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      name="name" 
                      value={form.name} 
                      onChange={handleFormChange} 
                      placeholder="Masalan: 1-son yoki Volume 2" 
                      className={inputCls} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nashr PDF Fayli (ixtiyoriy)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFileObj(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="bob-pdf-upload"
                    />
                    <label
                      htmlFor="bob-pdf-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-6 cursor-pointer bg-gray-50/50 hover:bg-white transition-all text-center group"
                    >
                      <FiFile className="text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" size={28} />
                      <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                        {fileObj ? fileObj.name : (form.file_url ? "Fayl yuklangan (Almashtirish uchun bosing)" : "Faylni tanlash (PDF)")}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">Maksimal hajm: 20MB</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Holati</label>
                  <div className="relative">
                    <FiCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      name="status" 
                      value={form.status} 
                      onChange={handleFormChange} 
                      className={`${inputCls} appearance-none`}
                    >
                      <option value="Active">Faol</option>
                      <option value="Inactive">Nofaol</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => { setIsAddOpen(false); setEditingBob(null); setFileObj(null); }} className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">Bekor qilish</button>
                  <button type="submit" disabled={isSubmitting} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-100">
                    {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                    {!isSubmitting && <FiCheck />}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!deletingBob}
        onClose={() => setDeletingBob(null)}
        onConfirm={handleDelete}
        loading={isSubmitting}
        title="Bobni o'chirish"
        message={`Haqiqatan ham "${deletingBob?.name}"ni o'chirib tashlamoqchimisiz? Bu bobga tegishli maqolalar uchun bob biriktirilishi bekor bo'ladi.`}
      />
    </div>
  );
};

export default JournalBobs;
