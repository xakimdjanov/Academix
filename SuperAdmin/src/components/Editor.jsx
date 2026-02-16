import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiUserPlus, FiShield, FiX } from "react-icons/fi";
import { editorService } from "../services/api";

const safe = (v, fallback = "—") => (v === null || v === undefined || v === "" ? fallback : v);

const Editors = () => {
  const [editors, setEditors] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchEditors = useCallback(async () => {
    setLoadingList(true);
    try {
      // getAll yo'q bo'lsa xatoni aniq ko'rsatamiz
      if (!editorService?.getAll) {
        toast.error('editorService.getAll() topilmadi');
        setEditors([]);
        return;
      }

      const res = await editorService.getAll();
      const data = res?.data?.data || res?.data || [];
      setEditors(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch editors list");
      setEditors([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchEditors();
  }, [fetchEditors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm({ fullname: "", email: "", password: "", confirmPassword: "" });
  };

  const closeModal = () => {
    if (!creating) setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullname || !form.email || !form.password) {
      return toast.error("Please fill in all required fields");
    }
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setCreating(true);
    try {
      await editorService.register({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        role: "Editor",
      });

      toast.success("Editor account created successfully ✅");
      resetForm();
      setOpen(false);
      fetchEditors();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while creating the account";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header + New button */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Editors</h1>
          <p className="text-sm text-gray-500">View and manage editor accounts</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm font-medium bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            Total: {editors.length}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-700 text-white hover:bg-blue-800 transition-all shadow-sm shadow-blue-100"
          >
            <FiUserPlus /> New Editor
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loadingList ? (
          <div className="p-10 text-center text-gray-400">Loading editors...</div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6 italic">Full Name</th>
                  <th className="py-4 px-6 italic">Email</th>
                  <th className="py-4 px-6 italic text-center">Role</th>
                  <th className="py-4 px-6 italic text-right">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {editors.map((ed) => (
                  <tr key={ed?.id || ed?._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-700 truncate max-w-[220px]">
                        {safe(ed?.fullname || ed?.full_name || ed?.name)}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-500 truncate max-w-[260px]">
                      {safe(ed?.email)}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {safe(ed?.role, "Editor")}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right text-xs text-gray-400">
                      {safe(ed?.createdAt || ed?.created_at)}
                    </td>
                  </tr>
                ))}

                {editors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400 font-medium">
                      No editors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* modal card */}
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-800 p-7 text-white relative overflow-hidden">
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FiUserPlus /> Create New Editor
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Register a new editorial staff member with system access.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <FiShield className="absolute -right-4 -bottom-5 text-blue-500/25 text-9xl rotate-12" />
            </div>

            {/* Form Body */}
            <div className="p-6 md:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute top-3.5 left-4 text-gray-400" />
                    <input
                      type="text"
                      name="fullname"
                      value={form.fullname}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute top-3.5 left-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="editor@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute top-3.5 left-4 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm outline-none"
                      />
                    </div>
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                      Confirm
                    </label>
                    <div className="relative">
                      <FiLock className="absolute top-3.5 left-4 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creating ? (
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
      )}
    </div>
  );
};

export default Editors;
