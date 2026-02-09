import React, { useEffect, useMemo, useState } from "react";
import { journalService, settingsService } from "../../../services/api";
import toast from "react-hot-toast";
import { FaRegSave, FaSyncAlt, FaRegFileAlt, FaRegImage, FaHashtag } from "react-icons/fa";

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

  // ✅ localStorage’dan admin id olamiz
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
      const list = res?.data?.data || res?.data || [];

      const all = Array.isArray(list) ? list : [];

      // ✅ faqat o'zingiz yaratgan jurnallarni chiqaramiz
      const mine = myAdminId
        ? all.filter((j) => String(j?.journal_admin_id) === String(myAdminId))
        : [];

      setJournals(mine);

      // agar adminId yo'q bo'lsa ogohlantiramiz
      if (!myAdminId) {
        toast.error("journal_admin_id topilmadi. Qayta login qiling.");
      }
    } catch (err) {
      toast.error("Jurnallarni yuklashda xatolik!");
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
    if (!canSubmit) return toast.error("Majburiy maydonlarni to'ldiring!");

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
        loading: "Saqlanmoqda...",
        success: "Muvaffaqiyatli saqlandi! ✅",
        error: (err) =>
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Xatolik yuz berdi",
      });

      setForm((p) => ({ ...initialSettings, journal_id: p.journal_id }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
          <FaRegFileAlt className="text-blue-500" /> Journal Settings
        </h2>

        <button
          type="button"
          onClick={fetchJournals}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
          title="Yangilash"
        >
          <FaSyncAlt className={`${loadingJournals ? "animate-spin" : ""} text-gray-600`} />
        </button>
      </div>

      {/* ✅ Agar journal topilmasa */}
      {journals.length === 0 && !loadingJournals && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Siz yaratgan journal topilmadi (yoki admin ID yo‘q). Avval journal yarating yoki qayta login qiling.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Journal *</label>
            <select
              name="journal_id"
              value={form.journal_id}
              onChange={onChange}
              className="w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Tanlang...</option>
              {journals.map((j) => {
                const id = j?.id ?? j?._id ?? j?.journal_id;
                const name = j?.name ?? j?.title ?? "Untitled";
                return (
                  <option key={String(id)} value={String(id)}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Page Name *</label>
            <input
              name="page_name"
              value={form.page_name}
              onChange={onChange}
              className="w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="About"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className="w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Content *</label>
          <textarea
            name="content"
            value={form.content}
            onChange={onChange}
            rows={4}
            className="w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaRegImage /> Image URL
            </label>
            <input
              name="image_url"
              value={form.image_url}
              onChange={onChange}
              className="w-full rounded-lg border p-2.5 outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaHashtag /> Order
            </label>
            <input
              name="order"
              type="number"
              value={form.order}
              onChange={onChange}
              className="w-full rounded-lg border p-2.5 outline-none"
              min={0}
            />
          </div>
        </div>

        <button
          disabled={!canSubmit || saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          <FaRegSave size={18} /> {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
};

export default JournalSettings;
