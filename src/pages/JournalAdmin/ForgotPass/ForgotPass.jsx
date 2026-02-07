import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { journalAdminService } from "../../../services/api";
import { FiMail, FiArrowLeft, FiArrowRight, FiKey } from "react-icons/fi";

const ForgotPass = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email.trim()) {
        toast.error("Please enter your email.");
        return;
      }

      const res = await journalAdminService.forgotPassword({
        email: email.trim(),
      });

      const resetToken = res?.data?.resetToken;

      if (!resetToken) {
        toast.error("No reset token received.");
        return;
      }

      // tokenni yashirib saqlaymiz
      sessionStorage.setItem("reset_token", resetToken);

      toast.success("Redirecting...");
      navigate("/reset-password");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F4F8F] to-blue-600 px-6 py-6">
          <div className="flex items-center gap-3">
            <FiKey className="text-white text-xl" />
            <h1 className="text-white font-bold text-lg">
              Forgot Password
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4F8F]"
              />
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
            </div>
          </div>

          {/* Buttons Centered */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">

            {/* Back */}
            <Link
              to="/journal-signin"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-[#1F2937] hover:bg-gray-100 transition"
            >
              <FiArrowLeft />
              Back
            </Link>

            {/* Next */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1F4F8F] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Next"}
              {!loading && <FiArrowRight />}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default ForgotPass;
