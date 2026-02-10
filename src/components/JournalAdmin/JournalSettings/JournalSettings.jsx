import React, { useEffect, useMemo, useState } from "react";
import { journalService, settingsService } from "../../../services/api";
import toast from "react-hot-toast";
import {
  FiSave,
  FiRefreshCw,
  FiSettings,
  FiImage,
  FiType,
  FiAlignLeft,
  FiHash,
  FiInfo,
  FiBookOpen,
  FiChevronDown,
} from "react-icons/fi";

const initialSettings = {
  journal_id: "",
  page_name: "",
  title: "",
  content: "",
  image_url: "",
  order: 0,
};

const JournalSettings = () => {
  const [journals, setJournals] = useState([]);
  const [form, setForm] = useState(initialSettings);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [saving, setSaving] = useState(false);

  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const canSubmit = useMemo(() => {
    return (
      String(form.journal_id).trim() &&
      form.page_name.trim() &&
      form.title.trim() &&
      form.content.trim()
    );
  }, [form]);

  const fetchJournals = async () => {
    try {
      setLoadingJournals(true);

      const res = await journalService.getAll();
      const list = res?.data?.data || res?.data?.journals || res?.data || [];
      const all = Array.isArray(list) ? list : [];

      const mine = myAdminId
        ? all.filter((j) => String(j?.journal_admin_id) === String(myAdminId))
        : [];

      setJournals(mine);

      if (!myAdminId) toast.error("Admin session not found. Please log in again.");
    } catch (err) {
      toast.error("Failed to load journals");
      setJournals([]);
    } finally {
      setLoadingJournals(false);
    }
  };

  useEffect(() => {
    fetchJournals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return toast.error("Please fill in all required fields!");

    const journalIdRaw = String(form.journal_id).trim();
    const journal_id = /^\d+$/.test(journalIdRaw) ? Number(journalIdRaw) : journalIdRaw;

    const payload = {
      journal_id,
      page_name: form.page_name.trim(),
      title: form.title.trim(),
      content: form.content.trim(),
      image_url: form.image_url.trim(),
      order: Number.isFinite(form.order) ? form.order : 0,
    };

    try {
      setSaving(true);
      await toast.promise(settingsService.create(payload), {
        loading: "Saving configuration...",
        success: "Settings saved successfully!",
        error: (err) =>
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to save settings",
      });

      setForm((p) => ({ ...initialSettings, journal_id: p.journal_id }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Journal Configuration
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm italic">
            Manage dynamic pages and content for your journals
          </p>
        </div>

        <button
          onClick={fetchJournals}
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 sm:px-5 py-2.5 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-semibold text-slate-700 active:scale-[0.98]"
        >
          <FiRefreshCw className={loadingJournals ? "animate-spin" : ""} />
          Sync Journals
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl sm:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-50 bg-slate-50/60 flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 shrink-0">
            <FiSettings size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-800 text-base sm:text-lg">
              Page Settings
            </h2>
            <p className="text-xs text-slate-500">
              Choose journal → create page → save
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-5 sm:p-8 space-y-5 sm:space-y-6">
          {/* Empty Journals Info */}
          {journals.length === 0 && !loadingJournals && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-700">
              <FiInfo className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium leading-relaxed">
                No journals found. Please create a journal first or re-login.
              </p>
            </div>
          )}

          {/* Grid 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Select Journal */}
            <div className="space-y-2">
              <Label icon={<FiBookOpen className="text-blue-500" />}>
                Target Journal *
              </Label>

              <div className="relative">
                <select
                  name="journal_id"
                  value={form.journal_id}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-slate-200 pl-4 pr-10 py-3.5 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select a journal...</option>
                  {journals.map((j) => {
                    const id = String(j?.id ?? j?._id ?? j?.journal_id);
                    const name = j?.name || j?.title || "Untitled Journal";
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <p className="text-[11px] text-slate-400">
                Only your journals are shown.
              </p>
            </div>

            {/* Page Name */}
            <CustomInput
              icon={<FiType className="text-blue-500" />}
              label="Page Identifier *"
              name="page_name"
              value={form.page_name}
              onChange={onChange}
              placeholder="e.g., About, Editorial-Board"
              autoComplete="off"
            />
          </div>

          {/* Title */}
          <CustomInput
            icon={<FiAlignLeft className="text-blue-500" />}
            label="Display Title *"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Enter the section title"
            full
            autoComplete="off"
          />

          {/* Content */}
          <div className="space-y-2">
            <Label icon={<FiAlignLeft className="text-blue-500" />}>
              Page Content *
            </Label>
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              rows={7}
              placeholder="Enter detailed content or HTML..."
              className="w-full rounded-2xl border border-slate-200 p-4 sm:p-5 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm leading-relaxed text-slate-700 placeholder:text-slate-300"
            />
            <p className="text-[11px] text-slate-400">
              You can paste plain text or HTML.
            </p>
          </div>

          {/* Grid 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <CustomInput
              icon={<FiImage className="text-blue-500" />}
              label="Cover Image URL"
              name="image_url"
              value={form.image_url}
              onChange={onChange}
              placeholder="https://example.com/image.jpg"
              autoComplete="off"
            />

            <CustomInput
              icon={<FiHash className="text-blue-500" />}
              type="number"
              label="Display Order"
              name="order"
              value={form.order}
              onChange={onChange}
              min={0}
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              disabled={!canSubmit || saving}
              className="group w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-3.5 sm:py-4 font-extrabold text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/15 disabled:opacity-50 active:scale-[0.99]"
            >
              {saving ? (
                <FiRefreshCw className="animate-spin" />
              ) : (
                <FiSave className="group-hover:scale-110 transition-transform" />
              )}
              {saving ? "Saving..." : "Save Configuration"}
            </button>

            {!canSubmit && (
              <p className="mt-2 text-xs text-slate-400">
                Required: journal, page identifier, title, content
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalSettings;

/* ----------------- Helpers (same file) ----------------- */

const Label = ({ icon, children }) => (
  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
    {icon} {children}
  </label>
);

const CustomInput = ({ label, icon, full, ...props }) => (
  <div className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
    <Label icon={icon}>{label}</Label>
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 px-4 sm:px-5 py-3.5 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 text-sm"
    />
  </div>
);
