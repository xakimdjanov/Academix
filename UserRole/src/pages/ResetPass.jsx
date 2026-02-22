import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiArrowRight, FiShield } from "react-icons/fi";

const ResetPass = () => {
  const navigate = useNavigate();

  const token = sessionStorage.getItem("reset_token");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const passwordValid = useMemo(() => {
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasMinLength = newPassword.length >= 6;
    return hasUppercase && hasMinLength;
  }, [newPassword]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!token) {
        toast.error("Token not found. Please try again.");
        return;
      }

      if (!passwordValid) {
        toast.error("Password: min 6 chars + 1 uppercase.");
        return;
      }

      await userService.resetPassword({ token, newPassword });

      sessionStorage.removeItem("reset_token");

      toast.success("Password reset successful!");
      navigate("/signin");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Reset failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6">
          <div className="flex items-center gap-3">
            <FiShield className="text-white text-xl" />
            <h1 className="text-white font-bold text-lg">Reset Password</h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              New Password{" "}
              <span className="text-xs font-normal text-[#6B7280]">
                (1 uppercase, min 6 chars)
              </span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4F8F]"
              />
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F4F8F]" />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Buttons Centered */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
            {/* Back */}
            <Link
              to="/forgot-password"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-[#1F2937] hover:bg-gray-100 transition"
            >
              <FiArrowLeft />
              Back
            </Link>

            {/* Reset */}
            <button
              type="submit"
              disabled={loading || !token}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Reset"}
              {!loading && <FiArrowRight />}
            </button>
          </div>

          {/* Optional small link */}
          <p className="text-center text-sm text-[#6B7280]">
            <Link to="/signin" className="text-[#1F4F8F] font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPass;
