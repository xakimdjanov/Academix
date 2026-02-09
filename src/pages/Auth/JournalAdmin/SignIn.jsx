import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { journalAdminService } from "../../../services/api";
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
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      // 1) login
      const res = await journalAdminService.login({ email, password });

      const token =
        res?.data?.token || res?.data?.accessToken || res?.data?.access_token;

      if (!token) {
        console.log("LOGIN RESPONSE:", res?.data);
        toast.error("Login failed. No token received.");
        return;
      }

      localStorage.setItem("token", token);

      // 2) login response ichidan id qidiramiz
      const user = res?.data?.user || res?.data?.admin || res?.data?.data || null;
      let id = user?._id || user?.id || res?.data?._id || res?.data?.id;

      // 3) ID bo‘lmasa: getAll() -> email bo‘yicha topamiz
      if (!id) {
        const allRes = await journalAdminService.getAll();
        const list =
          allRes?.data?.data ||
          allRes?.data?.users ||
          allRes?.data?.admins ||
          allRes?.data ||
          [];

        const me = Array.isArray(list)
          ? list.find((u) => (u?.email || "").trim().toLowerCase() === email)
          : null;

        id = me?._id || me?.id;
      }

      if (!id) {
        toast.error("Login ok, lekin admin ID topilmadi.");
        return;
      }

      // ✅ admin id saqlab qo'yamiz
      localStorage.setItem("journal_admin_id", String(id));

      toast.success("Login successful!");
      navigate("/journal-dashboard");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Invalid email or password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1F4F8F] to-blue-600 px-6 py-7">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="text-white/90 text-sm mt-1">Access your dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="johndoe@example.com"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
              />
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-12 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
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

          <div className="flex justify-end">
            <Link
              to="/journal-forgot-password"
              className="text-sm text-[#1F4F8F] hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              <FiKey className="text-sm" />
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1F4F8F] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm text-center text-[#6B7280]">
            Don’t have an account?{" "}
            <Link
              to="/journal-signup"
              className="text-[#1F4F8F] font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
