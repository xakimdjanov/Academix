import React, { useEffect, useMemo, useState } from "react";
import { journalService, settingsService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiSave,
  FiRefreshCw,
  FiSettings,
  FiImage,
  FiType,
  FiAlignLeft,
  FiHash,
  FiInfo,
  FiBookOpen,
  FiChevronDown,
  FiPlusCircle,
  FiEdit2,
  FiTrash2,
  FiX
} from "react-icons/fi";

const initialSettings = {
  journal_id: "",
  page_name: "",
  title: "",
  content: "",
  image_url: "",
  order: 0,
};

const JournalSettings = () => {
  const [journals, setJournals] = useState([]);
  const [form, setForm] = useState(initialSettings);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState(initialSettings);
  
  const navigate = useNavigate();

  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const canSubmit = useMemo(() => {
    return (
      String(form.journal_id).trim() &&
      form.page_name.trim() &&
      form.title.trim() &&
      form.content.trim()
    );
  }, [form]);

  const fetchJournals = async () => {
    try {
      setLoadingJournals(true);
      const res = await journalService.getAll();
      const list = res?.data?.data || res?.data?.journals || res?.data || [];
      const all = Array.isArray(list) ? list : [];

      const mine = myAdminId
        ? all.filter((j) => String(j?.journal_admin_id) === String(myAdminId))
        : [];

      setJournals(mine);
    } catch (err) {
      toast.error("Failed to load journals");
      setJournals([]);
    } finally {
      setLoadingJournals(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await settingsService.getAll();
      const list = Array.isArray(res?.data) ? res.data : [];
      
      // Filter settings belonging to this admin's journals
      const myJournalIds = journals.map(j => String(j.id));
      const filtered = list.filter(s => myJournalIds.includes(String(s.journal_id)));
      
      setSettings(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  useEffect(() => {
    if (journals.length > 0) {
      fetchSettings();
    }
  }, [journals]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return toast.error("Please fill in all required fields!");

    const journalIdRaw = String(form.journal_id).trim();
    const journal_id = /^\d+$/.test(journalIdRaw) ? Number(journalIdRaw) : journalIdRaw;

    const payload = {
      journal_id,
      page_name: form.page_name.trim(),
      title: form.title.trim(),
      content: form.content.trim(),
      image_url: form.image_url.trim(),
      order: Number.isFinite(form.order) ? form.order : 0,
    };

    try {
      setSaving(true);
      await toast.promise(settingsService.create(payload), {
        loading: "Saving configuration...",
        success: "Settings saved successfully!",
        error: (err) => err?.response?.data?.message || "Failed to save settings",
      });
      setForm((p) => ({ ...initialSettings, journal_id: p.journal_id }));
      fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      journal_id: item.journal_id,
      page_name: item.page_name,
      title: item.title,
      content: item.content,
      image_url: item.image_url || "",
      order: item.order || 0,
    });
    setIsEditModalOpen(true);
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSaving(true);
      await toast.promise(settingsService.update(editingItem.id, editForm), {
        loading: "Updating configuration...",
        success: "Settings updated!",
        error: "Failed to update",
      });
      setIsEditModalOpen(false);
      fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) return;
    try {
      await settingsService.delete(id);
      toast.success("Deleted successfully");
      fetchSettings();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Jurnal sozlamalari
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm italic">
            Jurnallaringiz uchun dinamik sahifalar va kontentni boshqaring
          </p>
        </div>

        <button
          onClick={fetchJournals}
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 sm:px-5 py-2.5 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-semibold text-slate-700 active:scale-[0.98]"
        >
          <FiRefreshCw className={loadingJournals ? "animate-spin" : ""} />
          Jurnallarni yangilash
        </button>
      </div>

      {/* 📋 Configuration List Table */}
      {journals.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-50 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 shrink-0">
                <FiBookOpen size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-slate-800 text-base sm:text-lg">
                  Mavjud sozlamalar
                </h2>
                <p className="text-xs text-slate-500">
                  Qoidalar, maqsadlar va sahifa mazmunini boshqaring
                </p>
              </div>
            </div>
            <span className="text-xs font-black bg-white px-3 py-1.5 rounded-full text-slate-400 border border-slate-100">
              {settings.length} SOZLAMALAR
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Jurnal</th>
                  <th className="px-6 py-4">Sahifa</th>
                  <th className="px-6 py-4">Sarlavha</th>
                  <th className="px-6 py-4 text-center">Tartib</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {loadingSettings ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <FiRefreshCw className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                      <span className="text-slate-400 font-medium">Sozlamalar yuklanmoqda...</span>
                    </td>
                  </tr>
                ) : settings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                      Sozlamalar topilmadi. Quyida yangisini qo'shing.
                    </td>
                  </tr>
                ) : (
                  settings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-700">
                        {journals.find(j => String(j.id) === String(item.journal_id))?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">
                          {item.page_name}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-600 font-medium">{item.title}</td>
                      <td className="px-6 py-5 text-center text-slate-400 font-bold">{item.order}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚀 Create New Configuration Form */}
      {journals.length > 0 ? (
        <div className="bg-white rounded-3xl sm:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-50 bg-slate-50/60 flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 shrink-0">
              <FiPlusCircle size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-800 text-base sm:text-lg">
                Yangi sozlama qo'shish
              </h2>
              <p className="text-xs text-slate-500">
                Yangi dinamik sahifa yoki bo'lim yarating
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label icon={<FiBookOpen className="text-blue-500" />}>
                  Mo'ljallangan jurnal *
                </Label>
                <div className="relative">
                  <select
                    name="journal_id"
                    value={form.journal_id}
                    onChange={onChange}
                    className="w-full rounded-2xl border border-slate-200 pl-4 pr-10 py-3.5 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Jurnalni tanlang...</option>
                    {journals.map((j) => {
                      const id = String(j?.id ?? j?._id ?? j?.journal_id);
                      const name = j?.name || j?.title || "Untitled Journal";
                      return (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <CustomInput
                icon={<FiType className="text-blue-500" />}
                label="Sahifa identifikatori *"
                name="page_name"
                value={form.page_name}
                onChange={onChange}
                placeholder="masalan: About, Editorial-Board"
              />
            </div>

            <CustomInput
              icon={<FiAlignLeft className="text-blue-500" />}
              label="Ko'rinadigan sarlavha *"
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Bo'lim sarlavhasini kiriting"
              full
            />

            <div className="space-y-2">
              <Label icon={<FiAlignLeft className="text-blue-500" />}>
                Sahifa mazmuni *
              </Label>
              <textarea
                name="content"
                value={form.content}
                onChange={onChange}
                rows={7}
                placeholder="Batafsil mazmun yoki HTML kodini kiriting..."
                className="w-full rounded-2xl border border-slate-200 p-4 sm:p-5 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm leading-relaxed text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <CustomInput
                icon={<FiImage className="text-blue-500" />}
                label="Muqova rasm URL manzili"
                name="image_url"
                value={form.image_url}
                onChange={onChange}
                placeholder="https://example.com/image.jpg"
              />
              <CustomInput
                icon={<FiHash className="text-blue-500" />}
                type="number"
                label="Ko'rsatish tartibi"
                name="order"
                value={form.order}
                onChange={onChange}
                min={0}
              />
            </div>

            <div className="pt-2">
              <button
                disabled={!canSubmit || saving}
                className="group w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-3.5 sm:py-4 font-extrabold text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/15 disabled:opacity-50 active:scale-[0.99]"
              >
                {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                {saving ? "Saqlanmoqda..." : "Sozlamani saqlash"}
              </button>
            </div>
          </form>
        </div>
      ) : !loadingJournals ? (
        /* Empty State */
        <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
            <FiBookOpen size={40} />
          </div>
          <div className="max-w-sm">
            <h3 className="text-xl font-bold text-slate-900">Jurnallar topilmadi</h3>
            <p className="text-slate-500 mt-2 text-sm">
              Siz hali hech qanday jurnal yaratmagansiz. Sozlamalar va sahifalarni boshqarish uchun avval jurnal yarating.
            </p>
          </div>
          <button
            onClick={() => navigate("/journal-list")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            <FiPlusCircle size={20} />
            Birinchi jurnalingizni yarating
          </button>
        </div>
      ) : (
        /* Loading State */
        <div className="flex justify-center py-20">
          <FiRefreshCw className="animate-spin text-blue-500" size={40} />
        </div>
      )}

      {/* 📝 Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !saving && setIsEditModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <FiEdit2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Sozlamani tahrirlash</h3>
                  <p className="text-xs text-slate-500">Jurnal sahifasi sozlamalarini yangilang</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                disabled={saving}
              >
                <FiX size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 opacity-60">
                  <Label icon={<FiBookOpen className="text-blue-500" />}>Jurnal (Bloklangan)</Label>
                  <div className="w-full bg-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-500 text-sm">
                    {journals.find(j => String(j.id) === String(editForm.journal_id))?.name || "Mo'ljallangan jurnal"}
                  </div>
                </div>
                <CustomInput
                  icon={<FiType className="text-blue-500" />}
                  label="Sahifa identifikatori"
                  name="page_name"
                  value={editForm.page_name}
                  onChange={onEditChange}
                  disabled
                />
              </div>

              <CustomInput
                icon={<FiAlignLeft className="text-blue-500" />}
                label="Ko'rinadigan sarlavha *"
                name="title"
                value={editForm.title}
                onChange={onEditChange}
                full
              />

              <div className="space-y-2">
                <Label icon={<FiAlignLeft className="text-blue-500" />}>Sahifa mazmuni *</Label>
                <textarea
                  name="content"
                  value={editForm.content}
                  onChange={onEditChange}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 p-5 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm leading-relaxed text-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomInput
                  icon={<FiImage className="text-blue-500" />}
                  label="Cover Image URL"
                  name="image_url"
                  value={editForm.image_url}
                  onChange={onEditChange}
                />
                <CustomInput
                  icon={<FiHash className="text-blue-500" />}
                  type="number"
                  label="Display Order"
                  name="order"
                  value={editForm.order}
                  onChange={onEditChange}
                />
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-all"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={onUpdate}
                disabled={saving}
                className="flex-[2] py-3.5 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                {saving ? "Updating..." : "Update Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalSettings;

/* ----------------- Helpers ----------------- */

const Label = ({ icon, children }) => (
  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
    {icon} {children}
  </label>
);

const CustomInput = ({ label, icon, full, ...props }) => (
  <div className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
    <Label icon={icon}>{label}</Label>
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 px-4 sm:px-5 py-3.5 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700 text-sm"
    />
  </div>
);