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
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
          {value || "—"}
        </div>
      )}
    </div>
  </div>
);

// Fields allowed to be updated via API
const allowedUpdateFields = ["full_name", "phone", "orcid", "affiliation", "country"];

const pickChangedFields = (original, edited) => {
  const payload = {};
  for (const key of allowedUpdateFields) {
    const oldVal = (original?.[key] ?? "").toString().trim();
    const newVal = (edited?.[key] ?? "").toString().trim();
    if (newVal !== oldVal) payload[key] = newVal;
  }
  return payload;
};

const MyProfile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [orcid, setOrcid] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [country, setCountry] = useState("");

  // Readonly
  const [email, setEmail] = useState("");

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const myId = useMemo(() => getUserIdFromToken(), []);

  const loadProfile = useCallback(async () => {
    if (!myId) {
      toast.error("Session not found (user ID missing)");
      return;
    }

    setLoading(true);
    try {
      const res = await userService.getById(myId);
      const u = res?.data;
      setUser(u);

      setFullName(u?.full_name || "");
      setPhone(u?.phone || "");
      setOrcid(u?.orcid || "");
      setAffiliation(u?.affiliation || "");
      setCountry(u?.country || "");
      setEmail(u?.email || "");

      setAvatarFile(null);
      setAvatarPreview("");
    } catch (e) {
      toast.error("Failed to load profile");
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
    setPhone(user?.phone || "");
    setOrcid(user?.orcid || "");
    setAffiliation(user?.affiliation || "");
    setCountry(user?.country || "");
    setEmail(user?.email || "");

    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
  };

  const onPickAvatar = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.error("Only image files allowed (png/jpg/webp)");
      return;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > 5) {
      toast.error("Avatar must be under 5MB");
      return;
    }

    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removePickedAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
  };

  const formatOrcid = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  const save = async () => {
    if (!user?.id) return;

    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setSaving(true);
    try {
      // 1) Update text fields (only changed ones)
      const edited = {
        full_name: fullName.trim(),
        phone: phone.trim() || "",
        orcid: orcid.trim() || "",
        affiliation: affiliation.trim() || "",
        country: country.trim() || "",
      };

      const payload = pickChangedFields(user, edited);

      if (Object.keys(payload).length > 0) {
        await userService.update(user.id, payload);
      }

      // 2) Update avatar if selected
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar_url", avatarFile);
        await userService.imgUpdate(user.id, fd);
      }

      if (Object.keys(payload).length === 0 && !avatarFile) {
        toast("No changes were made 🙂");
      } else {
        toast.success("Profile updated successfully");
      }

      setEditing(false);
      await loadProfile();
    } catch (e) {
      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", e?.response?.data);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
              <FiUser className="text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                {loading ? "Loading..." : editing ? "Edit mode" : "View mode"}
              </p>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={startEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition shadow-sm"
            >
              <FiEdit3 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                <FiX size={16} />
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 transition shadow-sm"
              >
                <FiSave size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Avatar Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Profile Picture</div>
              <FiCamera className="text-gray-500" />
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <Avatar src={currentAvatarSrc} name={fullName} size={120} />
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{fullName || "—"}</div>
                <div className="text-sm text-gray-600">{email || "—"}</div>
              </div>

              {editing && (
                <div className="w-full mt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Upload new avatar
                  </label>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      <div className="h-20 w-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex-shrink-0">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          Drag & drop or{" "}
                          <label className="cursor-pointer font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700">
                            browse files
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onPickAvatar(file);
                              }}
                            />
                          </label>
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, WebP • max 5MB
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <label className="cursor-pointer inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition">
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onPickAvatar(file);
                              }}
                            />
                          </label>

                          {avatarPreview && (
                            <button
                              type="button"
                              onClick={removePickedAvatar}
                              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-900 mb-5">Profile Information</div>

            <div className="space-y-5">
              <Row label="Full Name">
                {editing ? (
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-300 transition"
                    placeholder="Enter your full name"
                  />
                ) : (
                  user?.full_name || "—"
                )}
              </Row>

              <Row label="Email (cannot be changed)">
                {editing ? (
                  <input
                    value={email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 outline-none"
                  />
                ) : (
                  email || "—"
                )}
              </Row>

              <Row label="Phone Number">
                {editing ? (
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-300 transition"
                    placeholder="+998 90 123 45 67"
                  />
                ) : (
                  phone || "—"
                )}
              </Row>

              <Row label="ORCID iD">
                {editing ? (
                  <input
                    value={orcid}
                    onChange={(e) => setOrcid(formatOrcid(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-300 transition"
                    placeholder="0000-0000-0000-0000"
                    maxLength={19}
                  />
                ) : (
                  orcid || "—"
                )}
              </Row>

              <Row label="Affiliation / Institution">
                {editing ? (
                  <input
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-300 transition"
                    placeholder="University / Organization"
                  />
                ) : (
                  affiliation || "—"
                )}
              </Row>

              <Row label="Country">
                {editing ? (
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-300 transition"
                    placeholder="Country"
                  />
                ) : (
                  country || "—"
                )}
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;