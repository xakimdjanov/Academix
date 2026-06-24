import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { editorService, journalService } from "../services/api";
import { FiMail, FiLock, FiUser, FiPhone, FiBook, FiImage, FiBriefcase, FiEye, FiEyeOff } from "react-icons/fi";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [journals, setJournals] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    journal_id: "",
    profile_img: null
  });

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await journalService.getAll();
        setJournals(res.data || []);
      } catch (error) {
        console.error("Failed to fetch journals", error);
      }
    };
    fetchJournals();
  }, []);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_img") {
      setForm((prev) => ({ ...prev, profile_img: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullname || !form.email || !form.password || !form.journal_id) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", form.fullname);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("phone", form.phone);
    formData.append("age", form.age);
    formData.append("journal_id", form.journal_id);
    if (form.profile_img) {
      formData.append("profile_img", form.profile_img);
    }

    setLoading(true);
    try {
      await editorService.register(formData);
      toast.success("Hisob muvaffaqiyatli yaratildi! Iltimos, tizimga kiring.");
      navigate("/signin");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#1F4F8F] to-blue-600 px-8 py-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <FiUser className="text-3xl" />
          </div>
          <h1 className="text-3xl font-bold">Muharrir hisobini yaratish</h1>
          <p className="text-white/80 mt-2">Academix-ga muharrir sifatida qo'shiling</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FULLNAME */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">To'liq ism-sharif *</label>
            <div className="relative">
              <input
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={onChange}
                placeholder="John Doe"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1F4F8F] transition-all"
                required
              />
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Elektron pochta manzili *</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="editor@example.com"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1F4F8F] transition-all"
                required
              />
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parol *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-12 py-3 text-sm focus:ring-2 focus:ring-[#1F4F8F] transition-all"
                required
              />
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon raqami</label>
            <div className="relative">
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1F4F8F] transition-all"
              />
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          {/* AGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Yosh</label>
            <div className="relative">
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={onChange}
                placeholder="25"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1F4F8F] transition-all"
              />
              <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          {/* JOURNAL SELECT */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Jurnalni tanlang *</label>
            <div className="relative">
              <select
                name="journal_id"
                value={form.journal_id}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1F4F8F] appearance-none transition-all"
                required
              >
                <option value="">Jurnalni tanlang...</option>
                {journals.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
              <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          {/* PROFILE IMAGE */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profil rasmi</label>
            <div className="relative">
              <input
                type="file"
                name="profile_img"
                onChange={onChange}
                accept="image/*"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
              />
              <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1F4F8F] to-blue-600 text-white rounded-xl py-3.5 font-bold shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Hisob yaratilmoqda..." : "Hisob yaratish"}
            </button>
            <p className="text-center text-sm text-gray-500 mt-6">
              Hisobingiz bormi?{" "}
              <Link to="/signin" className="text-[#1F4F8F] font-semibold hover:underline">
                Kirish
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SignUp;
