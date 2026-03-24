import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const faculties = [
  "Computing",
  "Engineering",
  "Business",
  "Architecture",
  "Humanities & Sciences",
  "Medicine",
];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const StaffDashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    academicYear: "",
    faculty: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    sliitIdPhoto: null,
  });
  const [logs, setLogs] = useState([]);

  const allowedRoles =
    auth.user?.role === "admin" ? ["user", "moderator", "admin"] : ["user"];

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await api.get("/auth/login-logs", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setLogs(res.data);
    };
    fetchLogs().catch(console.error);
  }, [auth.token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));

      const res = await api.post("/auth/create-user", body, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        academicYear: "",
        faculty: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "user",
        sliitIdPhoto: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#c9cedc] p-6">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-xl border border-[#343e43]/20">
        <header className="flex items-center justify-between rounded-t-2xl bg-[#343e43] px-6 py-4 text-white">
          <div>
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            <p className="text-sm text-white/80">Logged as {auth.user?.role}</p>
          </div>
          <button onClick={handleLogout} className="rounded-lg bg-[#f9bf3b] px-4 py-2 font-semibold text-[#343e43]">Logout</button>
        </header>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold text-[#343e43]">Create Account</h2>
            <p className="text-sm text-[#343e43]/80 mb-3">
              Admin can create admin/moderator/user. Moderator can create user only.
            </p>
            {message && <p className="mb-2 text-sm text-green-700">{message}</p>}
            {error && <p className="mb-2 text-sm text-red-700">{error}</p>}

            <form onSubmit={handleCreate} className="grid gap-3">
              <input className="input-theme" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
              <input className="input-theme" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
              <input className="input-theme" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <select className="input-theme" name="role" value={form.role} onChange={handleChange} required>
                {allowedRoles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="input-theme" name="academicYear" value={form.academicYear} onChange={handleChange} required>
                <option value="">Academic Year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className="input-theme" name="faculty" value={form.faculty} onChange={handleChange} required>
                <option value="">Faculty</option>
                {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <input className="input-theme" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
              <input className="input-theme" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              <input className="input-theme" name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
              <input className="input-theme" name="sliitIdPhoto" type="file" accept="image/*" onChange={handleChange} required />
              <button className="rounded-xl bg-[#f9bf3b] py-3 font-semibold text-[#343e43] hover:opacity-90" type="submit">
                Create User
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#343e43]">My Login Activity</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-[#343e43]/20">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#343e43] text-white">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={index} className="border-t border-[#343e43]/10">
                      <td className="px-4 py-3">{new Date(log.time).toLocaleString()}</td>
                      <td className="px-4 py-3">{log.ip}</td>
                      <td className="px-4 py-3 capitalize">{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
