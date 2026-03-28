import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../../services/api";
import { FiMail, FiLock, FiEye, FiEyeOff, FiKey } from "react-icons/fi";

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      toast.error("Iltimos, elektron pochta va parolni kiriting.");
      return;
    }

    setLoading(true);
    try {
      // 1) login
      const res = await userService.login({ email, password });

      // token nomlari turlicha bo‘lishi mumkin
      const token =
        res?.data?.token || res?.data?.accessToken || res?.data?.access_token;

      // token bo‘lmasa ham ba’zi backendlar user qaytaradi
      if (token) localStorage.setItem("token", token);

      // 2) userni olish
      const user =
        res?.data?.user || res?.data?.data || res?.data?.me || null;

      // 3) id topish
      let id = user?._id || user?.id || res?.data?._id || res?.data?.id;

      // 4) ID bo‘lmasa: getAll() -> email bo‘yicha topamiz
      // (sizdagi backendda /users/getUser bor)
      if (!id) {
        const allRes = await userService.getAll();
        const list =
          allRes?.data?.data ||
          allRes?.data?.users ||
          allRes?.data?.result ||
          allRes?.data ||
          [];

        const me = Array.isArray(list)
          ? list.find((u) => (u?.email || "").trim().toLowerCase() === email)
          : null;

        id = me?._id || me?.id;
        if (me) localStorage.setItem("user_data", JSON.stringify(me));
      } else {
        if (user) localStorage.setItem("user_data", JSON.stringify(user));
      }

      if (!id) {
        toast.error("Tizimga kirildi, lekin foydalanuvchi IDsi topilmadi.");
        return;
      }

      // ✅ user id saqlaymiz
      localStorage.setItem("user_id", String(id));

      toast.success("Tizimga muvaffaqiyatli kirildi!");
      navigate("/dashboard"); // ✅ o'zingizning user dashboard route
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Elektron pochta yoki parol noto'g'ri.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-[#F6F8FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B2A6D] to-[#1F4F8F] px-6 py-7">
          <h1 className="text-2xl font-bold text-white">Tizimga kirish</h1>
          <p className="text-white/90 text-sm mt-1">Hisobingizga kiring</p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Elektron pochta
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="email@manzil.com"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0B2A6D] focus:border-transparent"
              />
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B2A6D]" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Parolni kiriting"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-12 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0B2A6D] focus:border-transparent"
              />
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B2A6D]" />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-[#0B2A6D] hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              <FiKey className="text-sm" />
              Parolni unutdingizmi?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0B2A6D] to-[#1F4F8F] hover:from-[#1F4F8F] hover:to-blue-700 text-white rounded-xl py-3 font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>

          {/* Sign Up Link */}
          <p className="text-sm text-center text-[#6B7280]">
            Hisobingiz yo'qmi?{" "}
            <Link
              to="/signup"
              className="text-[#0B2A6D] font-semibold hover:underline"
            >
              Ro'yxatdan o'ting
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
