import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { editorService } from "../services/api"; // ✅ Editor API
import { FiMail, FiLock, FiEye, FiEyeOff, FiEdit3 } from "react-icons/fi";

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await editorService.login(form); // ✅ Editor login
      const token = res?.data?.token || res?.data?.data?.token;

      if (!token) {
        toast.error("Login failed: Token not received.");
        return;
      }

      localStorage.setItem("token", token);
      const editorData = res?.data?.editor || res?.data?.data;
      if (editorData) {
        localStorage.setItem("admin", JSON.stringify(editorData)); // Sidebar admin deb o'qiganiga o'zgartirmadim
      }

      toast.success("Welcome back, Editor!");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1F4F8F] to-blue-600 px-6 py-7 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3">
            <FiEdit3 className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Editor Login</h1>
          <p className="text-white/90 text-sm mt-1">Manage journals and reviews</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="editor@example.com"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] transition-all"
                required
              />
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-12 py-3 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] transition-all"
                required
              />
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1F4F8F] to-blue-600 text-white rounded-xl py-3 font-semibold shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;