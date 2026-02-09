import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiBookOpen,
  FiHash,
  FiGlobe,
  FiImage,
  FiPlus,
  FiX,
  FiSave,
  FiTag,
  FiInfo,
} from "react-icons/fi";
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
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

const Input = ({ icon: Icon, label, required, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="text-slate-500" />}
      {label} {required && <span className="text-rose-600">*</span>}
    </span>
    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
    />
  </label>
);

const Textarea = ({ icon: Icon, label, required, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="text-slate-500" />}
      {label} {required && <span className="text-rose-600">*</span>}
    </span>
    <textarea
      {...props}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
    />
  </label>
);

const Select = ({ icon: Icon, label, className = "", children, ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="text-slate-500" />}
      {label}
    </span>
    <select
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
    >
      {children}
    </select>
  </label>
);

const AddJournal = () => {
  const [form, setForm] = useState(initialState);
  const [langInput, setLangInput] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.slug.trim() &&
      form.issn.trim() &&
      form.subject_area.trim() &&
      form.description.trim() &&
      form.languages.length > 0
    );
  }, [form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !prev.slug) next.slug = slugify(value);
      return next;
    });
  };

  const addLanguage = () => {
    const lang = langInput.trim();
    if (!lang) return;

    setForm((prev) => {
      if (prev.languages.some((l) => l.toLowerCase() === lang.toLowerCase())) {
        toast("Bu til allaqachon qo‘shilgan 🙂", { icon: "⚠️" });
        return prev;
      }
      return { ...prev, languages: [...prev.languages, lang] };
    });
    setLangInput("");
  };

  const removeLanguage = (lang) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("Iltimos, majburiy maydonlarni to‘ldiring (languages ham).");
      return;
    }

    // ✅ 2-yo‘l: admin id localStorage’dan olinadi
    const adminId = localStorage.getItem("journal_admin_id");
    if (!adminId) {
      toast.error("Admin ID topilmadi. Iltimos qayta login qiling.");
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      issn: form.issn,
      subject_area: form.subject_area,
      description: form.description,
      languages: form.languages,
      aims_scope: form.aims_scope,
      website_url: form.website_url,
      cover_image_url: form.cover_image_url,
      status: form.status, // backend qanday kutsa shunday
      journal_admin_id: adminId, // ⚠️ agar backend number kutsa: Number(adminId)
    };

    try {
      setLoading(true);

      await toast.promise(journalService.create(payload), {
        loading: "Saqlanmoqda...",
        success: "Jurnal muvaffaqiyatli yaratildi ✅",
        error: (err) =>
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Xatolik yuz berdi",
      });

      setForm(initialState);
      setLangInput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <FiBookOpen className="text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-900">Add Journal</h2>
          </div>
          <p className="text-sm text-slate-500">
            Majburiy maydonlar <span className="text-rose-600">*</span> bilan belgilangan.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input icon={FiBookOpen} label="Name" required name="name" value={form.name} onChange={onChange} />
            <Input
              icon={FiHash}
              label="Slug"
              required
              name="slug"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
            />
            <Input icon={FiTag} label="ISSN" required name="issn" value={form.issn} onChange={onChange} />
            <Input
              icon={FiInfo}
              label="Subject area"
              required
              name="subject_area"
              value={form.subject_area}
              onChange={onChange}
            />
          </div>

          <Textarea
            icon={FiInfo}
            label="Description"
            required
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <FiTag className="text-slate-500" />
              Languages <span className="text-rose-600">*</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                placeholder="Uzbek"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLanguage();
                  }
                }}
              />
              <button
                type="button"
                onClick={addLanguage}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 active:scale-[0.98]"
              >
                <FiPlus /> Add
              </button>
            </div>

            {form.languages.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      title="Remove"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Hozircha til qo‘shilmagan.</p>
            )}
          </div>

          <Textarea icon={FiInfo} label="Aims & Scope" name="aims_scope" value={form.aims_scope} onChange={onChange} rows={3} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input icon={FiGlobe} label="Website URL" name="website_url" value={form.website_url} onChange={onChange} />
            <Input
              icon={FiImage}
              label="Cover Image URL"
              name="cover_image_url"
              value={form.cover_image_url}
              onChange={onChange}
            />
            <Select icon={FiInfo} label="Status" name="status" value={form.status} onChange={onChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Saqlashdan oldin barcha majburiy maydonlar to‘ldirilganini tekshiring.
            </p>

            <button
              disabled={!canSubmit || loading}
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              <FiSave />
              {loading ? "Saving..." : "Create Journal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJournal;
