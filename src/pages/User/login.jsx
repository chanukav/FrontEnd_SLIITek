import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiMoon, FiSun } from "react-icons/fi";

const LoginPage = () => {
  const [form, setForm] = useState({
    email: localStorage.getItem("rememberEmail") || "",
    password: "",
    otp: "",
    rememberMe: !!localStorage.getItem("rememberEmail"),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

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
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: form.email,
          password: form.password,
          otp: form.otp,
        },
        { withCredentials: true }
      );

      if (form.rememberMe) {
        localStorage.setItem("rememberEmail", form.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      login(res.data);

      if (res.data.user.role === "admin") {
        navigate("/dashboard");
      } else if (res.data.user.role === "manager") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response?.data?.otpRequired) {
        setOtpRequired(true);
        setError("Enter your OTP to continue");
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white flex items-center justify-center px-4 py-6 transition-colors">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute right-6 top-6 z-50 rounded-full border border-slate-300 bg-white/80 px-3 py-3 shadow-md backdrop-blur dark:border-white/20 dark:bg-slate-900/70"
      >
        {darkMode ? <FiSun /> : <FiMoon />}
      </button>

      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl dark:bg-white/5 md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative hidden min-h-[700px] md:flex flex-col justify-between overflow-hidden p-10 text-white">
          {/* MAIN BACKGROUND IMAGE - sliit.png fills whole left panel */}
          <img
            src="/images/sliit.png"
            alt="SLIIT Background"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Optional soft blur layer look */}
          <div className="absolute inset-0 backdrop-blur-[2px]" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/65 via-violet-700/55 to-cyan-600/45" />

          {/* Dark overlay for text clarity */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Top Content */}
          <div className="relative z-10 max-w-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-white/85">
              Smart Access
            </p>

            <h1 className="mt-6 text-6xl font-extrabold leading-[1.08]">
              Welcome back to your secure portal
            </h1>

            <p className="mt-6 max-w-lg text-2xl leading-9 text-white/90">
              Role-based login with protected access for admins, managers, and
              users.
            </p>
          </div>

          {/* Bottom Glass Card */}
          <div className="relative z-10 w-full max-w-[540px] rounded-[28px] border border-white/15 bg-white/10 px-8 py-6 backdrop-blur-md shadow-lg">
            <p className="text-center text-lg font-medium text-white/95">
              Secure authentication • Role-based access • Dark mode
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-8 md:p-12 lg:p-16 dark:bg-slate-900">
          <div className="mx-auto max-w-md">
            <h2 className="text-center text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              LOG IN
            </h2>

            <p className="mt-4 text-center text-lg text-slate-500 dark:text-slate-300">
              Enter your credentials to continue
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="mb-3 block text-center text-lg font-semibold">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="manager.it@sliit.lk"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-3 block text-center text-lg font-semibold">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-16 text-lg outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-indigo-500/20"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {otpRequired && (
                <div>
                  <label className="mb-3 block text-center text-lg font-semibold">
                    OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={form.otp}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-indigo-500/20"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-base">
                <label className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded"
                  />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold text-indigo-600 transition hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-8 rounded-[24px] bg-slate-50 p-6 text-center text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                Demo roles
              </p>
              <p className="mt-2 text-xl">Admin / Manager / User</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;