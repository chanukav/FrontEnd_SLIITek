import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Camera, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { api, API_ORIGIN } from "../../../lib/api";
import { UserDashboardShell } from "../../../components/user/UserDashboardShell";

const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const FACULTIES = [
  "Computing",
  "Engineering",
  "Business",
  "Architecture",
  "Humanities & Sciences",
  "Medicine",
];

const MASK = "••••••••";

export function Profile() {
  const { auth, login } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    academicYear: "",
    faculty: "",
    phone: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [clearAvatar, setClearAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!auth?.token) return;
      setLoading(true);
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const u = res.data?.user;
        if (u) {
          setForm({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            academicYear: u.academicYear || "",
            faculty: u.faculty || "",
            phone: u.phone || "",
          });
          if (u.avatar) {
            setAvatarPreview(`${API_ORIGIN}${u.avatar}`);
            setClearAvatar(false);
          } else {
            setAvatarPreview(null);
          }
        }
      } catch {
        setMessage({ type: "error", text: "Could not load profile." });
        const name = auth?.user?.name || "";
        const parts = name.split(" ");
        setForm((f) => ({
          ...f,
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          email: auth?.user?.email || "",
        }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth?.token, auth?.user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setClearAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onDeleteAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setClearAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth?.token) return;
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const fd = new FormData();
      fd.append("firstName", form.firstName);
      fd.append("lastName", form.lastName);
      fd.append("academicYear", form.academicYear);
      fd.append("faculty", form.faculty);
      fd.append("phone", form.phone);
      if (clearAvatar) fd.append("clearAvatar", "true");
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await api.patch("/auth/me", fd, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const updated = res.data?.user;
      if (updated) {
        login({
          token: auth.token,
          user: {
            ...auth.user,
            name: updated.name,
            email: updated.email,
            faculty: updated.faculty,
            academicYear: updated.academicYear,
            phone: updated.phone,
          },
        });
        if (updated.avatar) {
          setAvatarPreview(`${API_ORIGIN}${updated.avatar}`);
        } else if (!clearAvatar) {
          setAvatarPreview(null);
        }
        setAvatarFile(null);
        setClearAvatar(false);
      }
      setMessage({ type: "ok", text: res.data?.message || "Profile saved." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserDashboardShell>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-[28px] font-bold text-[#1f2937]">Profile</h2>
        <div className="flex h-14 w-[270px] items-center gap-3 rounded-2xl bg-white px-4 shadow-sm">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-gray-400"
            readOnly
          />
        </div>
      </div>

      <div className="rounded-[24px] bg-white p-8 shadow-sm md:p-10">
        {loading ? (
          <p className="text-[#64748b]">Loading profile…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {message.text && (
              <p
                className={`text-sm font-medium ${
                  message.type === "error" ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {message.text}
              </p>
            )}

            {/* Avatar */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0">
                <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-[#e2e8f0] bg-[#f1f5f9]">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#94a3b8]">
                      {(form.firstName?.[0] || "?").toUpperCase()}
                      {(form.lastName?.[0] || "").toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onPickAvatar}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#f9bf3b] text-[#343e43] shadow-md ring-2 ring-white"
                  aria-label="Change photo"
                >
                  <Camera size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={onAvatarFile}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onPickAvatar}
                  className="rounded-xl bg-[#f9bf3b] px-6 py-2.5 text-sm font-bold text-[#343e43] shadow-sm transition hover:brightness-95"
                >
                  Upload New
                </button>
                <button
                  type="button"
                  onClick={onDeleteAvatar}
                  className="rounded-xl bg-[#f1f5f9] px-6 py-2.5 text-sm font-semibold text-[#334155] transition hover:bg-[#e2e8f0]"
                >
                  Delete avatar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-8">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                  className="w-full rounded-lg border border-[#e2e8f0] px-4 py-3 text-[15px] text-[#0f172a] outline-none ring-[#2563eb] transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                  className="w-full rounded-lg border border-[#e2e8f0] px-4 py-3 text-[15px] text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">Email</label>
                <input
                  name="email"
                  value={form.email}
                  readOnly
                  tabIndex={-1}
                  className="w-full cursor-not-allowed rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[15px] text-[#64748b]"
                />
                <p className="mt-1 text-xs text-[#94a3b8]">Signed-in email cannot be changed.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Mobile number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+94 77 123 4567"
                  className="w-full rounded-lg border border-[#e2e8f0] px-4 py-3 text-[15px] text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Academic year <span className="text-red-500">*</span>
                </label>
                <select
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-[15px] text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
                >
                  <option value="">Select year</option>
                  {ACADEMIC_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Faculty <span className="text-red-500">*</span>
                </label>
                <select
                  name="faculty"
                  value={form.faculty}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-[15px] text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#bfdbfe]"
                >
                  <option value="">Select faculty</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    readOnly
                    value={MASK}
                    className="w-full cursor-not-allowed rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 pr-12 text-[15px] tracking-widest text-[#64748b]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#334155]">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    readOnly
                    value={MASK}
                    className="w-full cursor-not-allowed rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 pr-12 text-[15px] tracking-widest text-[#64748b]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#64748b]">
              Password cannot be changed here.{" "}
              <Link to="/forgot-password" className="font-semibold text-[#2563eb] hover:underline">
                Use Forgot password
              </Link>{" "}
              to reset it.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#f9bf3b] px-10 py-3.5 text-sm font-bold text-[#343e43] shadow-sm transition hover:brightness-95 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </UserDashboardShell>
  );
}
