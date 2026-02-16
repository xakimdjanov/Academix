import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/api";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ✅ Error message normalize helper
  const pickLoginErrorMessage = (error) => {
    const status = error?.response?.status;

    // backend xabarlarini har xil joydan o‘qiymiz
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.msg ||
      "";

    const code =
      error?.response?.data?.code ||
      error?.response?.data?.errorCode ||
      error?.response?.data?.name ||
      "";

    const text = `${code} ${msg}`.toLowerCase();

    // ✅ Email topilmagan holatlar (sizda 400/401 kelayotgan bo‘lsa ham)
    const looksLikeEmailNotFound =
      text.includes("user not found") ||
      text.includes("email not found") ||
      text.includes("no user") ||
      text.includes("not registered") ||
      text.includes("account not found") ||
      text.includes("does not exist");

    // ✅ Parol xato holatlar
    const looksLikeWrongPassword =
      text.includes("wrong password") ||
      text.includes("invalid password") ||
      text.includes("password incorrect") ||
      text.includes("incorrect password");

    if (looksLikeEmailNotFound) return "Email is incorrect (not found).";
    if (looksLikeWrongPassword) return "Password is incorrect.";

    // Agar backend hech narsa bermasa, status bo‘yicha taxmin qilamiz
    if (status === 401) return "Email or password is incorrect.";
    if (status === 400) return "Invalid login data. Please check your email and password.";
    if (status === 500) return "Server error. Please try again later.";

    return msg || "Email or password is incorrect.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminService.login({ email, password });

      const token =
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.data?.token ||
        res?.data?.data?.accessToken;

      if (!token) {
        toast.error("Login error: Token not found.");
        return;
      }

      localStorage.setItem("token", token);

      const adminData = res?.data?.admin || res?.data?.data?.admin || res?.data?.data;
      if (adminData) {
        localStorage.setItem("admin", JSON.stringify(adminData));
      }

      toast.success("Successfully signed in!");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (error) {
      toast.error(pickLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1F4F8F] to-blue-600 px-6 py-7 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3">
            <FiShield className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-white/90 text-sm mt-1">Access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent transition-all"
                required
              />
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-12 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent transition-all"
                required
              />
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1F4F8F] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : "Sign In"}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Admin Dashboard</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
