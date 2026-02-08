import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { journalAdminService } from "../../../services/api";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiBriefcase,
  FiUpload,
  FiLock,
  FiCamera,
  FiCheck,
  FiXCircle,
} from "react-icons/fi";

const COUNTRY_OPTIONS = [
  "Uzbekistan",
  "Kazakhstan",
  "Kyrgyzstan",
  "Tajikistan",
  "Turkmenistan",
  "United States",
  "Others",
];

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 md:py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent";

function Field({ label, icon, input }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-2">
        {label}
      </label>
      <div className="relative">
        {input}
        <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
      </div>
    </div>
  );
}

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    orcid: "",
    affiliation: "",
    country: "Uzbekistan",
    country_other: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  const passwordValid = useMemo(() => {
    const hasUppercase = /[A-Z]/.test(form.password);
    const hasMinLength = form.password.length >= 6;
    return hasUppercase && hasMinLength;
  }, [form.password]);

  const formatOrcid = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const finalCountry = useMemo(() => {
    return form.country === "Others"
      ? form.country_other.trim()
      : form.country;
  }, [form.country, form.country_other]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "orcid") {
      setForm((p) => ({ ...p, orcid: formatOrcid(value) }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Avatar must be an image (jpg/png/webp).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image must be under 2MB.");
      return;
    }

    setAvatarFile(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !form.full_name.trim() ||
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.orcid.trim() ||
        !form.affiliation.trim()
      ) {
        toast.error("Please fill all required fields.");
        return;
      }

      if (!passwordValid) {
        toast.error("Password must have 1 uppercase and be at least 6 chars.");
        return;
      }

      if (!avatarFile) {
        toast.error("Please choose an avatar image.");
        return;
      }

      if (form.country === "Others" && !form.country_other.trim()) {
        toast.error("Please enter your country.");
        return;
      }

      const fd = new FormData();
      fd.append("full_name", form.full_name.trim());
      fd.append("email", form.email.trim());
      fd.append("password", form.password);
      fd.append("phone", form.phone.trim());
      fd.append("orcid", form.orcid.trim());
      fd.append("affiliation", form.affiliation.trim());
      fd.append("country", finalCountry);

      // ✅ avtomatik role
      fd.append("role", "JournalAdmin");

      fd.append("avatar", avatarFile);

      const res = await journalAdminService.register(fd);

      // (ixtiyoriy) user qaytsa saqlab qo‘yamiz
      const user = res?.data?.user || res?.user;
      if (user) localStorage.setItem("journal_user", JSON.stringify(user));

      toast.success("Sign up successful!");
      navigate("/journal-signin");
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
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#1F4F8F] to-[#3B82F6] px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white text-center md:text-left">
                Create Account
              </h1>
              <p className="text-white/90 text-sm md:text-base text-center md:text-left mt-2">
                Join our platform to manage journals
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex justify-center md:justify-end">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm">Secure</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Avatar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-semibold text-[#1F2937]">
                    Profile Picture
                  </h3>
                  <FiCamera className="text-[#1F4F8F]" />
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#F6F8FB] to-gray-100 border-4 border-white shadow-lg overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <FiUser className="w-8 h-8 md:w-12 md:h-12 text-[#9CA3AF]" />
                        <span className="text-xs text-[#6B7280] mt-1 md:mt-2">No image</span>
                      </div>
                    )}

                    {avatarFile && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <FiCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <label className="mt-4 md:mt-6 cursor-pointer w-full">
                    <div className="flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-[#1F4F8F] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all duration-300 text-sm md:text-base">
                      <FiUpload className="text-lg" />
                      Upload Photo
                    </div>
                    <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                  </label>

                  {avatarFile && (
                    <button
                      type="button"
                      onClick={() => setAvatarFile(null)}
                      className="mt-3 md:mt-4 flex items-center gap-1 md:gap-2 text-xs md:text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FiXCircle />
                      Remove
                    </button>
                  )}

                  <div className="mt-4 md:mt-6 w-full space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-[#4B5563]">Max size</span>
                      <span className="font-medium text-[#1F2937]">2MB</span>
                    </div>
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-[#4B5563]">Format</span>
                      <span className="font-medium text-[#1F2937]">JPG, PNG, WebP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 lg:p-8">
                <h3 className="text-lg md:text-xl font-bold text-[#1F2937] mb-1 md:mb-2">
                  Personal Information
                </h3>
                <p className="text-[#6B7280] text-sm mb-6 md:mb-8">
                  Fill in your details below
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Field
                    label="Full Name *"
                    icon={<FiUser className="text-[#1F4F8F]" />}
                    input={
                      <input
                        name="full_name"
                        value={form.full_name}
                        onChange={onChange}
                        placeholder="John Doe"
                        className={inputCls}
                      />
                    }
                  />

                  <Field
                    label="Email *"
                    icon={<FiMail className="text-[#1F4F8F]" />}
                    input={
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="johndoe@example.com"
                        className={inputCls}
                      />
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      Password *{" "}
                      <span className="text-xs font-normal text-[#6B7280]">
                        (1 uppercase, min 6 chars)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={onChange}
                        placeholder="Enter secure password"
                        className={`${inputCls} pr-12`}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FiLock className="text-[#1F4F8F]" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Field
                    label="Phone *"
                    icon={<FiPhone className="text-[#1F4F8F]" />}
                    input={
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="+998 90 123 4567"
                        className={inputCls}
                      />
                    }
                  />

                  <Field
                    label="ORCID *"
                    icon={<FiBriefcase className="text-[#1F4F8F]" />}
                    input={
                      <input
                        name="orcid"
                        value={form.orcid}
                        onChange={onChange}
                        placeholder="0000-0000-0000-0000"
                        className={inputCls}
                      />
                    }
                  />

                  <Field
                    label="Affiliation *"
                    icon={<FiBriefcase className="text-[#1F4F8F]" />}
                    input={
                      <input
                        name="affiliation"
                        value={form.affiliation}
                        onChange={onChange}
                        placeholder="University or Institution"
                        className={inputCls}
                      />
                    }
                  />

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      Country *
                    </label>
                    <div className="relative">
                      <select
                        name="country"
                        value={form.country}
                        onChange={onChange}
                        className={`${inputCls} appearance-none pr-10`}
                      >
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FiGlobe className="text-[#1F4F8F]" />
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {form.country === "Others" && (
                      <input
                        name="country_other"
                        value={form.country_other}
                        onChange={onChange}
                        placeholder="Specify your country..."
                        className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#1F4F8F] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-sm md:text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </div>
                      ) : (
                        "Sign Up"
                      )}
                    </button>

                    <div className="text-center md:text-right">
                      <p className="text-[#4B5563] text-sm">
                        Already have an account?{" "}
                        <Link
                          to="/journal-signin"
                          className="text-[#1F4F8F] font-semibold hover:text-blue-700 transition-colors"
                        >
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
