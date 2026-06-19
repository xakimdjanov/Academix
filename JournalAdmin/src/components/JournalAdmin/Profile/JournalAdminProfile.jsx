import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiAward,
  FiGlobe,
  FiSave,
  FiRefreshCw,
  FiCamera
} from "react-icons/fi";
import { journalAdminService } from "../../../services/api";

const API_BASE = "https://academixbackend-productionn.up.railway.app";

const JournalAdminProfile = () => {
  const adminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    orcid: "",
    affiliation: "",
    country: "",
    avatar_url: ""
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!adminId) return;
      try {
        setLoading(true);
        const res = await journalAdminService.getById(adminId);
        const userData = res?.data?.data || res?.data?.user || res?.data || null;
        if (userData) {
          setForm({
            full_name: userData.full_name || "",
            email: userData.email || "",
            password: "", // blank password by default
            phone: userData.phone || "",
            orcid: userData.orcid || "",
            affiliation: userData.affiliation || "",
            country: userData.country || "",
            avatar_url: userData.avatar_url || ""
          });

          if (userData.avatar_url) {
            const raw = userData.avatar_url;
            const fullUrl = raw.startsWith("http") ? raw : `${API_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`;
            setAvatarPreview(fullUrl);
          }
        }
      } catch {
        toast.error("Profil ma'lumotlarini yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [adminId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit avatar size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Rasm hajmi 5MB dan oshmasligi kerak");
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const canSubmit = useMemo(() => {
    return (
      form.full_name.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.orcid.trim() &&
      form.affiliation.trim() &&
      form.country.trim()
    );
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!");

    const fd = new FormData();
    fd.append("full_name", form.full_name.trim());
    fd.append("email", form.email.trim());
    
    if (form.password.trim()) {
      fd.append("password", form.password.trim());
    }
    
    fd.append("phone", form.phone.trim());
    fd.append("orcid", form.orcid.trim());
    fd.append("affiliation", form.affiliation.trim());
    fd.append("country", form.country.trim());

    if (avatarFile) {
      fd.append("avatar", avatarFile);
    }

    try {
      setSaving(true);
      await journalAdminService.update(adminId, fd);
      toast.success("Profil muvaffaqiyatli yangilandi");
      // Reload page to reflect header and sidebar updates
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Yangilashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FiRefreshCw className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mening profilim
        </h1>
        <p className="text-slate-500 mt-1 text-sm italic">
          Shaxsiy ma'lumotlaringizni tahrirlang va hisobingizni boshqaring
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <form onSubmit={onSubmit} className="p-6 sm:p-10 space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row gap-6 pb-6 border-b border-slate-100">
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                  {form.full_name ? form.full_name.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer">
                <FiCamera size={20} className="mb-1" />
                Yangilash
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-xl font-bold text-slate-800">{form.full_name || "Ism familiya"}</h3>
              <p className="text-slate-500 text-sm">{form.email}</p>
              <p className="text-slate-400 text-xs italic">Avatarni yangilash uchun rasm ustiga bosing (Maks: 5MB)</p>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInput
              icon={<FiUser className="text-blue-500" />}
              label="To'liq ism-familiya *"
              name="full_name"
              value={form.full_name}
              onChange={onChange}
              placeholder="Ism familiyangizni kiriting"
            />

            <CustomInput
              icon={<FiMail className="text-blue-500" />}
              label="Elektron pochta (Email) *"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="example@mail.com"
            />

            <CustomInput
              icon={<FiPhone className="text-blue-500" />}
              label="Telefon raqami *"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="+998 90 123 45 67"
            />

            <CustomInput
              icon={<FiAward className="text-blue-500" />}
              label="ORCID ID *"
              name="orcid"
              value={form.orcid}
              onChange={onChange}
              placeholder="0000-0002-1825-0097"
            />

            <CustomInput
              icon={<FiUser className="text-blue-500" />}
              label="Tashkilot (Affiliation) *"
              name="affiliation"
              value={form.affiliation}
              onChange={onChange}
              placeholder="Masalan: TATU, Dotsent"
            />

            <CustomInput
              icon={<FiGlobe className="text-blue-500" />}
              label="Mamlakat (Country) *"
              name="country"
              value={form.country}
              onChange={onChange}
              placeholder="Masalan: O'zbekiston"
            />

            <CustomInput
              icon={<FiLock className="text-blue-500" />}
              label="Yangi parol (O'zgartirmaslik uchun bo'sh qoldiring)"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Yangi parolni kiriting"
            />
          </div>

          {/* Save Action */}
          <div className="pt-4">
            <button
              disabled={!canSubmit || saving}
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-4 font-extrabold text-white transition-all shadow-lg shadow-emerald-600/15 disabled:opacity-50 active:scale-[0.99]"
            >
              {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
              {saving ? "Saqlanmoqda..." : "Profilni saqlash"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default JournalAdminProfile;

/* Helper custom inputs */
const Label = ({ icon, children }) => (
  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
    {icon} {children}
  </label>
);

const CustomInput = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <Label icon={icon}>{label}</Label>
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700 text-sm"
    />
  </div>
);
