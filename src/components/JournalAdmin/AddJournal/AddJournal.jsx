import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiBookOpen, FiHash, FiGlobe, FiImage, FiPlus, FiX, FiSave, FiTag, FiInfo, FiArrowLeft } from "react-icons/fi";
import { journalService } from "../../../services/api";

const initialState = {
  name: "",
  slug: "",
  issn: "",
  subject_area: "",
  description: "",
  languages: [],
  aims_scope: "",
  website_url: "",
  cover_image_url: "",
  status: "Active",
};

function slugify(text) {
  return String(text || "").toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
}

const Input = ({ icon: Icon, label, required, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="text-slate-500" />}
      {label} {required && <span className="text-rose-600">*</span>}
    </span>
    <input {...props} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50" />
  </label>
);

const Textarea = ({ icon: Icon, label, required, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="text-slate-500" />}
      {label} {required && <span className="text-rose-600">*</span>}
    </span>
    <textarea {...props} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50" />
  </label>
);

const Select = ({ icon: Icon, label, className = "", children, ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="text-slate-500" />}
      {label}
    </span>
    <select {...props} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 cursor-pointer">
      {children}
    </select>
  </label>
);

const AddJournal = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [langInput, setLangInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit rejimida bo'lsa ma'lumotlarni to'ldirish
  useEffect(() => {
    if (id && location.state?.journal) {
      setForm(location.state.journal);
    } else if (id) {
      const fetchById = async () => {
        try {
          const res = await journalService.getById(id);
          setForm(res.data.data);
        } catch (err) {
          toast.error("Ma'lumotni yuklashda xatolik");
        }
      };
      fetchById();
    }
  }, [id, location.state]);

  const canSubmit = useMemo(() => {
    return form.name.trim() && form.slug.trim() && form.issn.trim() && form.subject_area.trim() && form.languages.length > 0;
  }, [form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !id) next.slug = slugify(value);
      return next;
    });
  };

  const addLanguage = () => {
    const lang = langInput.trim();
    if (!lang) return;
    if (form.languages.includes(lang)) return toast.error("Bu til qo'shilgan");
    setForm(prev => ({ ...prev, languages: [...prev.languages, lang] }));
    setLangInput("");
  };

  const removeLanguage = (lang) => {
    setForm(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const adminId = localStorage.getItem("journal_admin_id");
    
    if (!adminId) return toast.error("Admin ID topilmadi");

    const payload = { ...form, journal_admin_id: adminId };

    try {
      setLoading(true);
      if (id) {
        await journalService.update(id, payload);
        toast.success("Muvaffaqiyatli yangilandi");
      } else {
        await journalService.create(payload);
        toast.success("Muvaffaqiyatli yaratildi");
      }
      navigate("/journal-list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <button onClick={() => navigate("/journal-list")} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition">
        <FiArrowLeft /> Orqaga qaytish
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-6 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FiBookOpen className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">{id ? "Jurnalni tahrirlash" : "Yangi jurnal qo'shish"}</h2>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input icon={FiBookOpen} label="Jurnal nomi" required name="name" value={form.name} onChange={onChange} />
            <Input 
              icon={FiHash} 
              label="Slug" 
              required 
              name="slug" 
              value={form.slug} 
              onChange={(e) => setForm(p => ({ ...p, slug: slugify(e.target.value) }))} 
            />
            <Input icon={FiTag} label="ISSN" required name="issn" value={form.issn} onChange={onChange} />
            <Input icon={FiInfo} label="Soha (Subject area)" required name="subject_area" value={form.subject_area} onChange={onChange} />
          </div>

          <Textarea icon={FiInfo} label="Tavsif (Description)" required name="description" value={form.description} onChange={onChange} rows={3} />
          
          <Textarea icon={FiInfo} label="Aims & Scope" name="aims_scope" value={form.aims_scope} onChange={onChange} rows={3} />

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tillar (Languages) *</span>
            <div className="flex gap-2 mb-3">
              <input 
                value={langInput} 
                onChange={(e) => setLangInput(e.target.value)} 
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addLanguage(); } }}
                placeholder="Masalan: Uzbek" 
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-blue-400" 
              />
              <button type="button" onClick={addLanguage} className="bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-2">
                <FiPlus /> Qo'shish
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.languages.map(lang => (
                <span key={lang} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {lang} <FiX className="cursor-pointer" onClick={() => removeLanguage(lang)} />
                </span>
              ))}
              {form.languages.length === 0 && <span className="text-slate-400 text-sm italic">Hech qanday til qo'shilmagan</span>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input icon={FiGlobe} label="Veb-sayt URL" name="website_url" value={form.website_url} onChange={onChange} />
            <Input icon={FiImage} label="Muqova rasmi (URL)" name="cover_image_url" value={form.cover_image_url} onChange={onChange} />
            <Select icon={FiInfo} label="Status" name="status" value={form.status} onChange={onChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={!canSubmit || loading}
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition active:scale-[0.98]"
            >
              <FiSave /> {loading ? "Saqlanmoqda..." : (id ? "Yangilash" : "Saqlash")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJournal;