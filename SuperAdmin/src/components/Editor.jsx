import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiUserPlus, FiShield } from "react-icons/fi";
import { editorService } from "../services/api";

const Editor = () => {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.fullname || !form.email || !form.password) {
      return toast.error("Please fill in all required fields");
    }

    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);

    try {
      await editorService.register({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        role: "Editor",
      });

      toast.success("Editor account created successfully ✅");

      setForm({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while creating the account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-full flex justify-center items-start min-h-[80vh]">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Decorative Header */}
        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiUserPlus /> Create New Editor
            </h1>
            <p className="text-indigo-100 text-sm mt-1">Register a new editorial staff member with system access.</p>
          </div>
          <FiShield className="absolute -right-4 -bottom-4 text-indigo-500/30 text-9xl rotate-12" />
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute top-3.5 left-4 text-gray-400" />
                <input
                  type="text"
                  name="fullname"
                  value={form.fullname}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Email Address</label>
              <div className="relative">
                <FiMail className="absolute top-3.5 left-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="editor@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Password</label>
                <div className="relative">
                  <FiLock className="absolute top-3.5 left-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Confirm</label>
                <div className="relative">
                  <FiLock className="absolute top-3.5 left-4 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            <p className="text-center text-[11px] text-gray-400 italic">
              New accounts are assigned the "Editor" role by default.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Editor;