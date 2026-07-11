import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiBookOpen, FiHash, FiGlobe, FiImage, FiPlus, FiX, FiSave, FiTag, FiInfo, FiArrowLeft, FiDollarSign } from "react-icons/fi";
import { journalService } from "../../../services/api";
import { convertToWebP } from "../../../utils/webpHelper";

const initialState = {
  name: "",
  slug: "",
  issn: "",
  subject_area: "",
  description: "",
  languages: [],
  categories: [],
  aims_scope: "",
  website_url: "",
  cover_image_url: "",
  status: "Active",
  submission_price: 0,
};

function slugify(text) {
  const cyrillicToLatin = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h'
  };

  let str = String(text || "").toLowerCase().trim();

  // Kirill harflarini transliteratsiya qilish
  str = str.split('').map(char => cyrillicToLatin[char] || char).join('');

  return str
    .replace(/o[''‘’`]/g, "o") // O' harfi uchun
    .replace(/g[''‘’`]/g, "g") // G' harfi uchun
    .replace(/[\s_]+/g, "-")    // Bo'shliqlarni chiziqqa almashtirish
    .replace(/[^\w-]+/g, "")    // No-alphanumeric belgilarni o'chirish
    .replace(/--+/g, "-")       // Ketma-ket chiziqlarni bittaga keltirish
    .replace(/^-+|-+$/g, "");   // Boshi va oxiridagi chiziqlarni o'chirish
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
  const [categoryInput, setCategoryInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  // Edit rejimida bo'lsa ma'lumotlarni to'ldirish
  useEffect(() => {
    if (id && location.state?.journal) {
      const journalData = location.state.journal;
      const journal = {
        ...journalData,
        categories: Array.isArray(journalData.categories)
          ? journalData.categories.map(c => typeof c === 'object' ? c.name : c)
          : []
      };
      setForm(journal);
      if (journal.cover_image_url) setCoverPreview(journal.cover_image_url);
      if (journal.banner_url) setBannerPreview(journal.banner_url);
    } else if (id) {
      const fetchById = async () => {
        try {
          const res = await journalService.getById(id);
          const journalData = res.data.data || res.data;
          const journal = {
            ...journalData,
            categories: Array.isArray(journalData.categories)
              ? journalData.categories.map(c => typeof c === 'object' ? c.name : c)
              : []
          };
          setForm(journal);
          if (journal.cover_image_url) setCoverPreview(journal.cover_image_url);
          if (journal.banner_url) setBannerPreview(journal.banner_url);
        } catch (err) {
          toast.error("Ma'lumotni yuklashda xatolik");
        }
      };
      fetchById();
    }
  }, [id, location.state]);

  const addCategory = () => {
    const cat = categoryInput.trim();
    if (!cat) return;
    if (form.categories && form.categories.includes(cat)) return toast.error("Bu kategoriya qo'shilgan");
    if (form.categories && form.categories.length >= 10) return toast.error("Maksimal 10ta kategoriya qo'shish mumkin");
    setForm(prev => ({ ...prev, categories: [...(prev.categories || []), cat] }));
    setCategoryInput("");
  };

  const removeCategory = (cat) => {
    setForm(prev => ({ ...prev, categories: (prev.categories || []).filter(c => c !== cat) }));
  };

  const canSubmit = useMemo(() => {
    return form.name.trim() && 
           form.slug.trim() && 
           form.issn.trim() && 
           form.subject_area.trim() && 
           form.languages.length > 0 && 
           (form.categories || []).length > 0;
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

    const fd = new FormData();
    fd.append("journal_admin_id", adminId);
    fd.append("name", form.name);
    fd.append("slug", form.slug);
    fd.append("issn", form.issn);
    fd.append("subject_area", form.subject_area);
    fd.append("description", form.description || "");
    fd.append("aims_scope", form.aims_scope || "");
    fd.append("website_url", form.website_url || "");
    fd.append("status", form.status || "Active");
    fd.append("submission_price", form.submission_price || 0);

    // Send languages as JSON string or comma-separated string
    fd.append("languages", JSON.stringify(form.languages));
    fd.append("categories", JSON.stringify(form.categories || []));

    if (coverFile) {
      fd.append("cover_image", coverFile);
    } else {
      fd.append("cover_image_url", form.cover_image_url || "");
    }

    if (bannerFile) {
      fd.append("banner", bannerFile);
    } else {
      fd.append("banner_url", form.banner_url || "");
    }

    try {
      setLoading(true);
      if (id) {
        await journalService.update(id, fd);
        toast.success("Muvaffaqiyatli yangilandi");
      } else {
        await journalService.create(fd);
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
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <span className="mb-2 block text-sm font-medium text-slate-700">Kategoriyalar (Categories) * (Maksimal 10 ta)</span>
            <div className="flex gap-2 mb-3">
              <input
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                placeholder="Masalan: Matematika"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-blue-400"
              />
              <button type="button" onClick={addCategory} className="bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-2">
                <FiPlus /> Qo'shish
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.categories || []).map(cat => (
                <span key={cat} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {cat} <FiX className="cursor-pointer" onClick={() => removeCategory(cat)} />
                </span>
              ))}
              {(!form.categories || form.categories.length === 0) && <span className="text-slate-400 text-sm italic">Hech qanday kategoriya qo'shilmagan</span>}
            </div>
          </div>

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
            <Input icon={FiInfo} label="Soha (Yo'nalish)" required name="subject_area" value={form.subject_area} onChange={onChange} />
          </div>

          <Textarea icon={FiInfo} label="Tavsif (Description)" required name="description" value={form.description} onChange={onChange} rows={3} />

          <Textarea icon={FiInfo} label="Aims & Scope" name="aims_scope" value={form.aims_scope} onChange={onChange} rows={3} />

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tillar (Languages) *</span>
            <div className="flex gap-2 mb-3">
              <input
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(); } }}
                placeholder="Masalan: O'zbekcha"
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

          <div className="grid gap-6 sm:grid-cols-2">
            <Input icon={FiGlobe} label="Veb-sayt URL" name="website_url" value={form.website_url} onChange={onChange} />
            <Select icon={FiInfo} label="Holati" name="status" value={form.status} onChange={onChange}>
              <option value="Active">Faol</option>
              <option value="Inactive">Nofaol</option>
              <option value="Draft">Qoralama</option>
            </Select>
            <Input icon={FiDollarSign} label="Maqola yuborish narxi (UZS)" type="number" step="1" name="submission_price" value={form.submission_price} onChange={onChange} className="sm:col-span-2" />
          </div>

          {/* Cover & Banner File Uploads */}
          <div className="grid gap-6 sm:grid-cols-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            {/* Muqova rasmi (Cover Image) */}
            <div className="space-y-2">
              <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <FiImage className="text-slate-500" />
                Muqova rasmi (Cover Image)
              </span>
              <div className="relative group border-2 border-dashed border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all p-4 flex flex-col items-center justify-center min-h-[140px] cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const webpFile = await convertToWebP(file);
                        setCoverFile(webpFile);
                        setCoverPreview(URL.createObjectURL(webpFile));
                      } catch (err) {
                        toast.error("Muqova rasmini qayta ishlashda xatolik");
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {coverPreview ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" loading="lazy" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverFile(null);
                        setCoverPreview("");
                        setForm(p => ({ ...p, cover_image_url: "" }));
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition shadow-md z-20"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <FiImage className="mx-auto text-slate-400 group-hover:scale-110 transition duration-300" size={32} />
                    <span className="block text-xs font-semibold text-slate-500">Rasm yuklang</span>
                    <span className="block text-[10px] text-slate-400">PNG, JPG (tavsiya: 300x400)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Banner rasmi (Banner Image) */}
            <div className="space-y-2">
              <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <FiImage className="text-slate-500" />
                Banner rasmi (Banner Image)
              </span>
              <div className="relative group border-2 border-dashed border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all p-4 flex flex-col items-center justify-center min-h-[140px] cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const webpFile = await convertToWebP(file);
                        setBannerFile(webpFile);
                        setBannerPreview(URL.createObjectURL(webpFile));
                      } catch (err) {
                        toast.error("Banner rasmini qayta ishlashda xatolik");
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {bannerPreview ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" loading="lazy" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBannerFile(null);
                        setBannerPreview("");
                        setForm(p => ({ ...p, banner_url: "" }));
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition shadow-md z-20"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <FiImage className="mx-auto text-slate-400 group-hover:scale-110 transition duration-300" size={32} />
                    <span className="block text-xs font-semibold text-slate-500">Banner yuklang</span>
                    <span className="block text-[10px] text-slate-400">Keng (tavsiya: 1200x400)</span>
                  </div>
                )}
              </div>
            </div>
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