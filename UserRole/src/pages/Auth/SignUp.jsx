import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../../services/api";
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
  FiShield,
} from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

const getDefaultAvatarFile = async () => {
  try {
    const res = await fetch("https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png");
    const blob = await res.blob();
    return new File([blob], "default-author.png", { type: "image/png" });
  } catch (err) {
    console.error("Default avatar fetch error, using fallback", err);
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const res = await fetch(`data:image/png;base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], "default-author.png", { type: "image/png" });
  }
};

const COUNTRY_OPTIONS = [
  "O'zbekiston",
  "Qozog'iston",
  "Qirg'iziston",
  "Tojikiston",
  "Turkmaniston",
  "AQSH",
  "Boshqalar",
];

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 md:py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0B2A6D] focus:border-transparent";

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
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null); 

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    orcid: "",
    affiliation: "",
    country: "O'zbekiston",
    country_other: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const passwordValid = useMemo(() => {
    const hasUppercase = /[A-Z]/.test(form.password);
    const hasMinLength = form.password.length >= 6;
    return hasUppercase && hasMinLength;
  }, [form.password]);

  const formatOrcid = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const getCountryName = (c) => {
    const clean = c.trim();
    if (clean === "O'zbekiston") return language === "uz" ? "O'zbekiston" : language === "en" ? "Uzbekistan" : "Узбекистан";
    if (clean === "Qozog'iston") return language === "uz" ? "Qozog'iston" : language === "en" ? "Kazakhstan" : "Казахстан";
    if (clean === "Qirg'iziston") return language === "uz" ? "Qirg'iziston" : language === "en" ? "Kyrgyzstan" : "Кыргызстан";
    if (clean === "Tojikiston") return language === "uz" ? "Tojikiston" : language === "en" ? "Tajikistan" : "Таджикистан";
    if (clean === "Turkmaniston") return language === "uz" ? "Turkmaniston" : language === "en" ? "Turkmenistan" : "Туркменистан";
    if (clean === "AQSH") return language === "uz" ? "AQSH" : language === "en" ? "USA" : "США";
    if (clean === "Boshqalar") return language === "uz" ? "Boshqalar" : language === "en" ? "Others" : "Другие";
    return c;
  };

  const finalCountry = useMemo(() => {
    return form.country === "Boshqalar"
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
      toast.error(
        language === "uz" ? "Avatar rasm (jpg/png/webp) bo'lishi kerak." :
        language === "en" ? "Avatar must be an image (jpg/png/webp)." :
        "Аватар должен быть изображением (jpg/png/webp)."
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        language === "uz" ? "Avatar hajmi 2MB dan kam bo'lishi kerak." :
        language === "en" ? "Avatar size must be less than 2MB." :
        "Размер аватара должен быть меньше 2 МБ."
      );
      return;
    }

    setAvatarFile(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requiredKeys = [
        "full_name",
        "email",
        "password",
        "phone",
        "orcid",
        "affiliation",
      ];

      for (const k of requiredKeys) {
        if (!String(form[k] || "").trim()) {
          toast.error(
            language === "uz" ? "Iltimos, barcha majburiy maydonlarni to'ldiring." :
            language === "en" ? "Please fill in all required fields." :
            "Пожалуйста, заполните все обязательные поля."
          );
          setLoading(false);
          return;
        }
      }

      if (!passwordValid) {
        toast.error(
          language === "uz" ? "Parolda kamida 1 ta bosh harf va 6 ta belgi bo'lishi kerak." :
          language === "en" ? "Password must contain at least 1 uppercase letter and be at least 6 characters long." :
          "Пароль должен содержать как минимум 1 заглавную букву и быть длиной не менее 6 символов."
        );
        setLoading(false);
        return;
      }

      if (form.country === "Boshqalar" && !form.country_other.trim()) {
        toast.error(
          language === "uz" ? "Iltimos, davlatingizni kiriting." :
          language === "en" ? "Please enter your country." :
          "Пожалуйста, введите вашу страну."
        );
        setLoading(false);
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
      fd.append("role", "user");
      if (avatarFile) {
        fd.append("avatar_url", avatarFile);
      } else {
        const defaultFile = await getDefaultAvatarFile();
        fd.append("avatar_url", defaultFile);
      }
      
      await userService.register(fd);

      toast.success(
        language === "uz" ? "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!" :
        language === "en" ? "Registration completed successfully!" :
        "Регистрация успешно завершена!"
      );
      navigate("/signin");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Xatolik yuz berdi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-[#F6F8FB] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2A6D] to-[#1F4F8F] px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white text-center md:text-left">
                {t("auth.signup_title")}
              </h1>
              <p className="text-white/90 text-sm md:text-base text-center md:text-left mt-2">
                {t("auth.signup_sub")}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 lg:p-8">
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Avatar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-semibold text-[#1F2937]">
                    {language === "uz" ? "Profil rasmi (Ixtiyoriy)" : language === "en" ? "Profile photo (Optional)" : "Фото профиля (Необязательно)"}
                  </h3>
                  <FiCamera className="text-[#0B2A6D]" />
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#F6F8FB] to-gray-100 border-4 border-white shadow-lg overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <FiUser className="w-8 h-8 md:w-12 md:h-12 text-[#9CA3AF]" />
                        <span className="text-xs text-[#6B7280] mt-1 md:mt-2">
                          {language === "uz" ? "Rasm yo'q" : language === "en" ? "No photo" : "Нет фото"}
                        </span>
                      </div>
                    )}

                    {avatarFile && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <FiCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <label className="mt-4 md:mt-6 cursor-pointer w-full">
                    <div className="flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-[#0B2A6D] to-[#1F4F8F] hover:from-[#1F4F8F] hover:to-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all duration-300 text-sm md:text-base">
                      <FiUpload className="text-lg" />
                      {language === "uz" ? "Rasm yuklash" : language === "en" ? "Upload photo" : "Загрузить фото"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onAvatarChange}
                      className="hidden"
                    />
                  </label>

                  {avatarFile && (
                    <button
                      type="button"
                      onClick={() => setAvatarFile(null)}
                      className="mt-3 md:mt-4 flex items-center gap-1 md:gap-2 text-xs md:text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FiXCircle />
                      {language === "uz" ? "O'chirish" : language === "en" ? "Delete" : "Удалить"}
                    </button>
                  )}

                  <div className="mt-4 md:mt-6 w-full space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-[#4B5563]">{language === "uz" ? "Maks hajmi" : language === "en" ? "Max size" : "Макс. размер"}</span>
                      <span className="font-medium text-[#1F2937]">2MB</span>
                    </div>
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-[#4B5563]">{language === "uz" ? "Format" : language === "en" ? "Format" : "Формат"}</span>
                      <span className="font-medium text-[#1F2937]">
                        JPG, PNG, WebP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTariff && (
                  <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-6 space-y-4">
                      <div className="flex items-center gap-2 text-blue-800 font-bold">
                          <FiShield /> {language === "uz" ? "Tarif imkoniyatlari" : language === "en" ? "Tariff features" : "Возможности тарифа"}
                      </div>
                      <div className="space-y-2 text-sm text-blue-700 font-medium">
                          <div className="flex justify-between">
                              <span>{language === "uz" ? "Jurnallar:" : language === "en" ? "Journals:" : "Журналы:"}</span>
                              <span className="font-bold">{selectedTariff.journal_limit || (language === "uz" ? "Cheksiz" : language === "en" ? "Unlimited" : "Безлимитно")}</span>
                          </div>
                          <div className="flex justify-between">
                              <span>{language === "uz" ? "Maqolalar:" : language === "en" ? "Articles:" : "Статьи:"}</span>
                              <span className="font-bold">{selectedTariff.article_limit || (language === "uz" ? "Cheksiz" : language === "en" ? "Unlimited" : "Безлимитно")}</span>
                          </div>
                          <div className="flex justify-between">
                              <span>{language === "uz" ? "Muddati:" : language === "en" ? "Duration:" : "Срок действия:"}</span>
                              <span className="font-bold">{selectedTariff.duration_days ? `${selectedTariff.duration_days} ${language === "uz" ? "kun" : language === "en" ? "days" : "дней"}` : (language === "uz" ? "Umrbod" : language === "en" ? "Lifetime" : "Пожизненно")}</span>
                          </div>
                      </div>
                  </div>
              )}
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 lg:p-8">
                <h3 className="text-lg md:text-xl font-bold text-[#1F2937] mb-1 md:mb-2">
                  {language === "uz" ? "Shaxsiy ma'lumotlar" : language === "en" ? "Personal information" : "Личные данные"}
                </h3>
                <p className="text-[#6B7280] text-sm mb-6 md:mb-8">
                  {language === "uz" ? "Ma'lumotlaringizni quyida to'ldiring" : language === "en" ? "Fill in your details below" : "Заполните ваши данные ниже"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Field
                    label={`${t("auth.fullname")} *`}
                    icon={<FiUser className="text-[#0B2A6D]" />}
                    input={
                      <input
                        name="full_name"
                        value={form.full_name}
                        onChange={onChange}
                        placeholder={t("auth.enter_fullname")}
                        className={inputCls}
                      />
                    }
                  />

                  <Field
                    label={`${t("auth.email")} *`}
                    icon={<FiMail className="text-[#0B2A6D]" />}
                    input={
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder={t("auth.enter_email")}
                        className={inputCls}
                      />
                    }
                  />

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      {t("auth.password")} *{" "}
                      <span className="text-xs font-normal text-[#6B7280]">
                        {language === "uz" ? "(1 ta bosh harf, kamida 6 ta belgi)" : language === "en" ? "(1 uppercase, at least 6 characters)" : "(1 заглавная буква, минимум 6 символов)"}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={onChange}
                        placeholder={t("auth.enter_password")}
                        className={`${inputCls} pr-12`}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FiLock className="text-[#0B2A6D]" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
                        aria-label={language === "uz" ? (showPassword ? "Parolni yashirish" : "Parolni ko'rsatish") : language === "en" ? (showPassword ? "Hide password" : "Show password") : (showPassword ? "Скрыть пароль" : "Показать пароль")}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Field
                    label={`${t("auth.phone")} *`}
                    icon={<FiPhone className="text-[#0B2A6D]" />}
                    input={
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="901234567"
                        className={inputCls}
                      />
                    }
                  />

                  <Field
                    label="ORCID *"
                    icon={<FiBriefcase className="text-[#0B2A6D]" />}
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
                    label={language === "uz" ? "Muassasa *" : language === "en" ? "Institution *" : "Организация *"}
                    icon={<FiBriefcase className="text-[#0B2A6D]" />}
                    input={
                      <input
                        name="affiliation"
                        value={form.affiliation}
                        onChange={onChange}
                        placeholder={language === "uz" ? "Universitet / Institut" : language === "en" ? "University / Institute" : "Университет / Институт"}
                        className={inputCls}
                      />
                    }
                  />

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">
                      {language === "uz" ? "Davlat *" : language === "en" ? "Country *" : "Страна *"}
                    </label>
                    <div className="relative">
                      <select
                        name="country"
                        value={form.country}
                        onChange={onChange}
                        className={`${inputCls} appearance-none pr-10 hover:cursor-pointer`}
                      >
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {getCountryName(c)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FiGlobe className="text-[#0B2A6D]" />
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {form.country === "Boshqalar" && (
                      <input
                        name="country_other"
                        value={form.country_other}
                        onChange={onChange}
                        placeholder={language === "uz" ? "Davlat nomini kiriting..." : language === "en" ? "Enter country name..." : "Введите название страны..."}
                        className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0B2A6D] focus:border-transparent"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#0B2A6D] to-[#1F4F8F] hover:from-[#1F4F8F] hover:to-blue-700 text-white rounded-xl font-semibold text-sm md:text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t("auth.signing_up")}
                        </div>
                      ) : (
                        t("auth.signup_link")
                      )}
                    </button>

                    <div className="text-center md:text-right">
                      <p className="text-[#4B5563] text-sm">
                        {t("auth.has_account")}{" "}
                        <Link
                          to="/signin"
                          className="text-[#0B2A6D] font-semibold hover:text-blue-700 transition-colors"
                        >
                          {t("auth.signin_link")}
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