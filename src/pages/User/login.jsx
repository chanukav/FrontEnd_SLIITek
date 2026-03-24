import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { api } from "../../lib/api";

const LoginPage = () => {
  const [form, setForm] = useState({
    email: localStorage.getItem("rememberEmail") || "",
    password: "",
    otp: "",
    rememberMe: !!localStorage.getItem("rememberEmail"),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      if (form.rememberMe) {
        localStorage.setItem("rememberEmail", form.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      login(res.data);

      if (res.data.user.role === "admin" || res.data.user.role === "moderator") {
        navigate("/admin");
      } else {
        navigate("/dashboard/user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#c9cedc] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-[#343e43]/20">
        <h1 className="text-3xl font-bold text-[#343e43] text-center">Login</h1>
        <p className="mt-2 text-center text-[#343e43]/80">
          User: ITxxxx@my.sliit.lk | Admin/Moderator: standard verified email
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#343e43] mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="it85757874@my.sliit.lk"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              className="w-full rounded-xl border border-[#343e43]/30 px-4 py-3 outline-none focus:ring-2 focus:ring-[#f9bf3b]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#343e43] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#343e43]/30 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#f9bf3b]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#343e43]"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[#343e43]">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-[#343e43] underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#f9bf3b] py-3 font-semibold text-[#343e43] hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#343e43]">
          New student account? <Link to="/" className="font-semibold underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;