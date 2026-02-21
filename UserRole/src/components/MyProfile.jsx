import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit3, FiSave, FiX, FiCamera, FiUser } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { userService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";

const Avatar = ({ src, name, size = 96 }) => {
  const [error, setError] = useState(false);
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center overflow-hidden rounded-3xl border border-gray-200 font-semibold ${color}`}
    >
      {src && !error ? (
        <img
          src={src}
          alt={name || "avatar"}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-3xl">{initial}</span>
      )}
    </div>
  );
};

const Row = ({ label, value, children }) => (
  <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
    <div className="text-sm font-semibold text-gray-800">{label}</div>
    <div className="sm:col-span-2">
      {children ? (
        children
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
          {value || "-"}
        </div>
      )}
    </div>
  </div>
);

const MyProfile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [editing, setEditing] = useState(false);

  // form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // readonly
  const [phone, setPhone] = useState("");
  const [orcid, setOrcid] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("user");

  // IMPORTANT: backend password majburiy bo‘lishi mumkin
  const [password, setPassword] = useState("");

  // avatar file
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const myId = useMemo(() => getUserIdFromToken(), []);

  const loadProfile = useCallback(async () => {
    if (!myId) {
      toast.error("Token topilmadi (user id yo‘q)");
      return;
    }
    setLoading(true);
    try {
      const res = await userService.getById(myId);
      const u = res?.data;
      setUser(u);

      setFullName(u?.full_name || "");
      setEmail(u?.email || "");
      setPhone(u?.phone || "");
      setOrcid(u?.orcid || "");
      setAffiliation(u?.affiliation || "");
      setCountry(u?.country || "");
      setRole(u?.role || "user");

      setPassword("");
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (e) {
      toast.error("Profilni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const currentAvatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    return user?.avatar_url || "";
  }, [avatarPreview, user?.avatar_url]);

  const startEdit = () => setEditing(true);

  const cancelEdit = () => {
    if (!user) return;
    setEditing(false);

    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setOrcid(user?.orcid || "");
    setAffiliation(user?.affiliation || "");
    setCountry(user?.country || "");
    setRole(user?.role || "user");

    setPassword("");
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
  };

  const onPickAvatar = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.error("Faqat rasm fayl (png/jpg/webp)");
      return;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > 5) {
      toast.error("Avatar 5MB dan katta bo‘lmasin");
      return;
    }

    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!user?.id) return;

    if (!fullName.trim()) return toast.error("Full name majburiy");

    // backend password majburiy bo‘lsa — user kiritishi kerak
    if (!password) {
      toast.error("Save qilish uchun password kiriting");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();

      // backend field nomlari
      fd.append("full_name", fullName.trim());
      fd.append("email", email);           // readonly ham yuboriladi
      fd.append("password", password);     // MUHIM: server 500 bo‘lmasin

      // Send empty value — bo‘sh bo‘lsa ham yuboramiz
      fd.append("phone", phone || "");
      fd.append("orcid", orcid || "");
      fd.append("affiliation", affiliation || "");
      fd.append("country", country || "");
      fd.append("role", role || "user");

      // avatar_url file bo‘lsa
      if (avatarFile) fd.append("avatar_url", avatarFile);

      await userService.update(user.id, fd);

      toast.success("Profil saqlandi");
      setEditing(false);
      await loadProfile();
    } catch (e) {
      console.log("PROFILE UPDATE ERROR:", e?.response?.data || e);
      toast.error("Server xatolik (500). Backend validation/field nomlarini tekshirish kerak.");
    } finally {
      setSaving(false);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <FiUser />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-600">
                {loading ? "Loading..." : editing ? "Edit mode" : "View mode"}
              </p>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={startEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
            >
              <FiEdit3 />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                <FiX />
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                <FiSave />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Profile image</div>
              <FiCamera className="text-gray-500" />
            </div>

            <div className="mt-4 flex flex-col items-center gap-3">
              <Avatar src={currentAvatarSrc} name={fullName} size={104} />
              <div className="text-center">
                <div className="text-base font-semibold text-gray-900">
                  {fullName || "-"}
                </div>
                <div className="text-sm text-gray-600">{email || "-"}</div>
              </div>

              {editing && (
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-800">
                    Upload avatar (file)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickAvatar(e.target.files?.[0])}
                    className="mt-2 block w-full text-sm"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    PNG/JPG/WebP • max 5MB
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
              <div>
                Created:{" "}
                <span className="font-semibold text-gray-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                </span>
              </div>
              <div className="mt-1">
                Updated:{" "}
                <span className="font-semibold text-gray-700">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-900">Profile details</div>

            <div className="mt-5 space-y-4">
              <Row label="Full name" value={user?.full_name}>
                {editing ? (
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                  />
                ) : null}
              </Row>

              <Row label="Email (readonly)" value={user?.email}>
                {editing ? (
                  <input
                    value={email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 outline-none"
                  />
                ) : null}
              </Row>

              <Row label="Phone" value={user?.phone}>
                {editing ? (
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                    placeholder="Phone..."
                  />
                ) : null}
              </Row>

              <Row label="ORCID" value={user?.orcid}>
                {editing ? (
                  <input
                    value={orcid}
                    onChange={(e) => setOrcid(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                    placeholder="0000-0000-0000-0000"
                  />
                ) : null}
              </Row>

              <Row label="Institution" value={user?.affiliation}>
                {editing ? (
                  <input
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                    placeholder="Affiliation..."
                  />
                ) : null}
              </Row>

              <Row label="Country" value={user?.country}>
                {editing ? (
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                    placeholder="Country..."
                  />
                ) : null}
              </Row>

              <Row label="Role" value={user?.role || "user"}>
                {editing ? (
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                  >
                    <option value="user">user</option>
                    <option value="editor">editor</option>
                    <option value="journal_admin">journal_admin</option>
                    <option value="admin">admin</option>
                  </select>
                ) : null}
              </Row>

              {editing && (
                <Row label="Password (required)" value="">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                    placeholder="Enter your password to save"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Backend update’da password majburiy bo‘lishi mumkin.
                  </div>
                </Row>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;