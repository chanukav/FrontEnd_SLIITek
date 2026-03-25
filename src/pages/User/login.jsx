import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/questions";

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
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (form.rememberMe) {
        localStorage.setItem("rememberEmail", form.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      login(res.data);
      // All roles go to the shared home page
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  from-[#c9cedc] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/60 bg-white/20 shadow-2xl backdrop-blur md:min-h-[640px] md:grid-cols-2">

        {/* LEFT SIDE WITH IMAGE */}
        <div className="relative hidden overflow-hidden p-10 text-white md:flex md:flex-col md:justify-between">

          {/* BACKGROUND IMAGE */}
          <img
            src="/Sliit.png"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* CONTENT */}
          <div className="relative z-10">
           
            <h2 className="mt-24 text-5xl font-extrabold leading-tight ">
             <br/>    Hello,<br />welcome the SLIITEK
            </h2>
            
          </div>

         

        </div>

        {/* RIGHT SIDE */}
        <div className="bg-[#f2f6ff] p-8 md:p-12">
          <h1 className="text-center text-4xl font-bold text-[#3d69b7]">Login</h1>
          <p className="mt-3 text-center text-sm text-[#7b8db3]">
            User: ITxxxx@my.sliit.lk | Admin/Moderator: standard verified email
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="mx-auto mt-10 max-w-md space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#6f84ad]">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="it85757874@my.sliit.lk"
                value={form.email}
                onChange={handleChange}
                autoComplete="username"
                className="w-full rounded-md border border-[#dbe6f6] bg-white px-4 py-3 text-[#4d5f83] shadow-sm outline-none transition focus:border-[#8bb0ff] focus:ring-2 focus:ring-[#d7e6ff]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#6f84ad]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-[#dbe6f6] bg-white px-4 py-3 pr-10 text-[#4d5f83] shadow-sm outline-none transition focus:border-[#8bb0ff] focus:ring-2 focus:ring-[#d7e6ff]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#7f96c0] transition hover:text-[#486fb8]"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#7f95bd]">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[#c5d8f8] text-[#3d6cbb] focus:ring-[#a6c4fb]"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-semibold text-[#8aa6d7] hover:underline">
                Forget Password
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#f9bf3b] py-3 font-bold text-[#343e43] shadow-md transition hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>

          </form>

          <p className="mt-14 text-center text-sm text-[#96a9ce]">
            Not a member yet?{" "}
            <Link to="/" className="font-semibold text-[#5892e6] hover:underline">
              Sign up
            </Link>
          </p>
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
          New student account? <Link to="/signup" className="font-semibold underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;