import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { settingsService } from "../../../services/api";
import { FiPlus, FiSave, FiTrash2, FiEdit2 } from "react-icons/fi";

const DEFAULT_APC = 150;

const JournalSettings = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // backenddan kelgan settings pages
  const [saving, setSaving] = useState(false);

  // ===== Journal Info (page_name: "JournalInfo") =====
  const [journalInfo, setJournalInfo] = useState({
    journal_name: "",
    issn: "",
    description: "",
    aims_scope: "",
    languages: "",
    apc_price: DEFAULT_APC,
    editorial_board: "",
    status: "Active", // Active/Inactive
  });

  // ===== Page modal/editor =====
  const [editingId, setEditingId] = useState(null);
  const [pageForm, setPageForm] = useState({
    journal_id: 0,
    page_name: "About",
    title: "",
    content: "",
    image_url: "",
    order: 1,
  });

  // load all settings
  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsService.getAll();
        const list = res?.data?.data || res?.data || [];
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        toast.error("Settings load failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // JournalInfo ni backenddan topib olish
  const journalInfoRow = useMemo(() => {
    return items.find((x) => x.page_name === "JournalInfo");
  }, [items]);

  useEffect(() => {
    if (!journalInfoRow?.content) return;

    // content ichida JSON bo‘lsa parse qilamiz
    try {
      const parsed = JSON.parse(journalInfoRow.content);
      setJournalInfo((p) => ({
        ...p,
        ...parsed,
        apc_price: Number(parsed?.apc_price ?? p.apc_price),
        status: parsed?.status || p.status,
      }));
    } catch {
      // agar JSON bo‘lmasa, ignore
    }
  }, [journalInfoRow]);

  const pages = useMemo(() => {
    return items
      .filter((x) => x.page_name !== "JournalInfo")
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [items]);

  const refresh = async () => {
    const res = await settingsService.getAll();
    const list = res?.data?.data || res?.data || [];
    setItems(Array.isArray(list) ? list : []);
  };

  // ===== Journal Info save =====
  const saveJournalInfo = async () => {
    setSaving(true);
    try {
      const payload = {
        journal_id: 0,
        page_name: "JournalInfo",
        title: "Journal Info",
        content: JSON.stringify(journalInfo),
        image_url: "",
        order: 0,
      };

      if (journalInfoRow?.id || journalInfoRow?.journal_settings_id) {
        const id = journalInfoRow?.id || journalInfoRow?.journal_settings_id;
        await settingsService.update(id, payload);
      } else {
        await settingsService.create(payload);
      }

      toast.success("Journal Info saved");
      await refresh();
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ===== Page create/update =====
  const submitPage = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!pageForm.page_name?.trim() || !pageForm.title?.trim()) {
        toast.error("Page name and title required");
        return;
      }

      const payload = {
        ...pageForm,
        order: Number(pageForm.order || 0),
        journal_id: Number(pageForm.journal_id || 0),
      };

      if (editingId) {
        await settingsService.update(editingId, payload);
        toast.success("Page updated");
      } else {
        await settingsService.create(payload);
        toast.success("Page created");
      }

      setEditingId(null);
      setPageForm({
        journal_id: 0,
        page_name: "About",
        title: "",
        content: "",
        image_url: "",
        order: pages.length + 1,
      });

      await refresh();
    } catch (e) {
      toast.error("Action failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row) => {
    const id = row?.id || row?.journal_settings_id;
    setEditingId(id);
    setPageForm({
      journal_id: row?.journal_id ?? 0,
      page_name: row?.page_name ?? "About",
      title: row?.title ?? "",
      content: row?.content ?? "",
      image_url: row?.image_url ?? "",
      order: row?.order ?? 1,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (row) => {
    const id = row?.id || row?.journal_settings_id;
    if (!id) return;

    setSaving(true);
    try {
      await settingsService.delete(id);
      toast.success("Deleted");
      await refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Journal Settings</h1>
        <p className="text-sm text-gray-500">
          Manage journal info and static pages
        </p>
      </div>

      {/* ===== Journal Info Form ===== */}
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">Journal Info</h2>

          <button
            onClick={saveJournalInfo}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#002147] text-white hover:opacity-95 disabled:opacity-60"
          >
            <FiSave />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Journal name"
            value={journalInfo.journal_name}
            onChange={(v) => setJournalInfo((p) => ({ ...p, journal_name: v }))}
          />
          <Input
            label="ISSN"
            value={journalInfo.issn}
            onChange={(v) => setJournalInfo((p) => ({ ...p, issn: v }))}
          />
          <Input
            label="Languages"
            placeholder="English, Uzbek, Russian..."
            value={journalInfo.languages}
            onChange={(v) => setJournalInfo((p) => ({ ...p, languages: v }))}
          />
          <Input
            label="APC price"
            type="number"
            value={journalInfo.apc_price}
            onChange={(v) =>
              setJournalInfo((p) => ({ ...p, apc_price: Number(v || 0) }))
            }
          />

          <Select
            label="Journal status"
            value={journalInfo.status}
            onChange={(v) => setJournalInfo((p) => ({ ...p, status: v }))}
            options={["Active", "Inactive"]}
          />

          <Textarea
            label="Editorial Board"
            value={journalInfo.editorial_board}
            onChange={(v) =>
              setJournalInfo((p) => ({ ...p, editorial_board: v }))
            }
          />

          <Textarea
            label="Description"
            value={journalInfo.description}
            onChange={(v) =>
              setJournalInfo((p) => ({ ...p, description: v }))
            }
          />

          <Textarea
            label="Aims & Scope"
            value={journalInfo.aims_scope}
            onChange={(v) => setJournalInfo((p) => ({ ...p, aims_scope: v }))}
          />
        </div>
      </div>

      {/* ===== Pages Editor ===== */}
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">Pages</h2>
          <button
            onClick={() => {
              setEditingId(null);
              setPageForm({
                journal_id: 0,
                page_name: "About",
                title: "",
                content: "",
                image_url: "",
                order: pages.length + 1,
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            <FiPlus />
            New Page
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submitPage} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Page name"
            value={pageForm.page_name}
            onChange={(v) => setPageForm((p) => ({ ...p, page_name: v }))}
            placeholder="About / Contact / Policies..."
          />
          <Input
            label="Title"
            value={pageForm.title}
            onChange={(v) => setPageForm((p) => ({ ...p, title: v }))}
          />
          <Input
            label="Image URL (optional)"
            value={pageForm.image_url}
            onChange={(v) => setPageForm((p) => ({ ...p, image_url: v }))}
            placeholder="https://..."
          />
          <Input
            label="Order"
            type="number"
            value={pageForm.order}
            onChange={(v) => setPageForm((p) => ({ ...p, order: v }))}
          />
          <div className="md:col-span-2">
            <Textarea
              label="Content"
              value={pageForm.content}
              onChange={(v) => setPageForm((p) => ({ ...p, content: v }))}
              rows={6}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002147] text-white hover:opacity-95 disabled:opacity-60"
            >
              <FiSave />
              {editingId ? "Update Page" : "Create Page"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setPageForm({
                    journal_id: 0,
                    page_name: "About",
                    title: "",
                    content: "",
                    image_url: "",
                    order: pages.length + 1,
                  });
                }}
                className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2">Order</th>
                <th>Page</th>
                <th>Title</th>
                <th className="w-[170px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id || p.journal_settings_id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{p.order}</td>
                  <td className="font-medium">{p.page_name}</td>
                  <td className="truncate max-w-[420px]">{p.title}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        <FiEdit2 />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-400">
                    No pages yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JournalSettings;

/* ===== Small UI components ===== */

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 4 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-2">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
