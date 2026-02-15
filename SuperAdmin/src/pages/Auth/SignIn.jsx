import React, { useState } from "react";
import { adminService } from "../../services/api"; // seniki shu
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaEnvelope, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

const SignIn = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await adminService.login({
        email: form.email.trim(),
        password: form.password,
      });

      const token =
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.data?.token ||
        res?.data?.data?.accessToken;

      if (!token) throw new Error("Token topilmadi");

      // Token saqlash
      localStorage.setItem("token", token);

      // Admin info saqlash (fullname + role)
      const admin = res?.data?.admin || res?.data?.data?.admin || res?.data?.data;
      if (admin) localStorage.setItem("admin", JSON.stringify(admin));

      toast.success("Muvaffaqiyatli login bo‘ldingiz!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Login xatoligi";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-4 rounded-full">
            <FaUserShield className="text-3xl text-indigo-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FaEnvelope className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email kiriting"
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Parol kiriting"
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? "Kutilmoqda..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
