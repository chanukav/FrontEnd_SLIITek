import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Building2,
  ImagePlus,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { api } from "../../lib/api";

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    academicYear: "",
    faculty: "",
    password: "",
    confirmPassword: "",
    phone: "",
    sliitIdPhoto: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const faculties = [
    "Computing",
    "Engineering",
    "Business",
    "Architecture",
    "Humanities & Sciences",
    "Medicine",
  ];

  const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      sliitIdPhoto: file,
    }));

    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!formData.sliitIdPhoto) {
      alert("Please upload your SLIIT ID photo");
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("academicYear", formData.academicYear);
      submitData.append("faculty", formData.faculty);
      submitData.append("password", formData.password);
      submitData.append("confirmPassword", formData.confirmPassword);
      submitData.append("phone", formData.phone);
      submitData.append("sliitIdPhoto", formData.sliitIdPhoto);

      const { data } = await api.post(
        "/auth/register",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(data.message || "Registration successful");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        academicYear: "",
        faculty: "",
        password: "",
        confirmPassword: "",
        phone: "",
        sliitIdPhoto: null,
      });
      setPreviewUrl(null);

      navigate("/login");
    } catch (error) {
      console.error("ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* background glow */}
      <div className="absolute inset-0">
        <div className="absolute left-[-90px] top-[-90px] h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="relative hidden min-h-[820px] overflow-hidden lg:flex">
            {/* image */}
            <img
              src="/assets/Sliit.png"
              alt="Signup Cover"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-violet-950/55 to-cyan-950/45" />
            <div className="absolute inset-0 bg-black/20" />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-12">
              <div className="max-w-xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md">
                  <Sparkles size={16} className="text-cyan-300" />
                  Student Registration
                </p>

                <h1 className="text-5xl font-extrabold leading-tight xl:text-6xl">
                  Create your
                  <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
                    SLIIT account
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
                  Join with a modern student signup experience. Upload your
                  SLIIT ID photo, preview it instantly, and complete
                  registration with a clean premium interface.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <FeatureCard
                    icon={<ShieldCheck className="h-5 w-5 text-cyan-300" />}
                    title="Secure registration"
                    text="Protected onboarding flow for verified student access."
                  />
                  <FeatureCard
                    icon={<BadgeCheck className="h-5 w-5 text-fuchsia-300" />}
                    title="Fast verification"
                    text="Preview your SLIIT ID before submission."
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md shadow-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-white/15 p-3">
                    <ImagePlus className="h-6 w-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Smart upload experience
                    </h3>
                    <p className="text-sm text-white/70">
                      ID upload, instant preview, modern glassmorphism design
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="h-24 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm" />
                  <div className="h-24 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm" />
                  <div className="h-24 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold sm:text-4xl">Sign Up</h2>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Fill in your details to create your student account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  icon={<User size={18} />}
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <InputField
                  icon={<User size={18} />}
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <InputField
                icon={<Mail size={18} />}
                type="email"
                name="email"
                placeholder="IT12345@my.sliit.lk"
                value={formData.email}
                onChange={handleChange}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  icon={<GraduationCap size={18} />}
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  options={academicYears}
                  placeholder="Current Academic Year"
                />
                <SelectField
                  icon={<Building2 size={18} />}
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  options={faculties}
                  placeholder="Faculty"
                />
              </div>

              <InputField
                icon={<Phone size={18} />}
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  icon={<Lock size={18} />}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  show={showPassword}
                  setShow={setShowPassword}
                />
                <PasswordField
                  icon={<Lock size={18} />}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                />
              </div>

              <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/50 p-4 sm:p-5">
                <label className="mb-3 block text-sm font-medium text-slate-200">
                  Upload SLIIT ID Photo
                </label>

                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <label className="group flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 text-center transition hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="mb-4 rounded-2xl bg-cyan-500/10 p-4 ring-1 ring-cyan-400/20 transition group-hover:scale-105">
                      <ImagePlus className="h-8 w-8 text-cyan-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Click to upload ID photo
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-slate-400">
                      PNG, JPG, or JPEG. Your uploaded image will appear in the
                      preview card instantly.
                    </p>
                  </label>

                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-600/20 via-violet-600/10 to-cyan-500/20 p-[1px]">
                    <div className="flex h-full min-h-[230px] flex-col rounded-3xl bg-slate-950/90 p-4">
                      <p className="mb-3 text-sm font-medium text-slate-300">
                        SLIIT ID Preview
                      </p>

                      <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                        {previewUrl ? (
                          <div className="relative w-full overflow-hidden rounded-2xl">
                            <img
                              src={previewUrl}
                              alt="SLIIT ID Preview"
                              className="h-48 w-full rounded-2xl object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <p className="text-xs text-white/80">
                                Uploaded successfully
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="mx-auto mb-3 w-fit rounded-full bg-white/5 p-4">
                              <ImagePlus className="h-8 w-8 text-slate-500" />
                            </div>
                            <p className="text-sm text-slate-400">
                              No photo uploaded yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 px-5 py-3.5 font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Registering..." : "Register"}
              </button>

              <p className="text-center text-sm text-slate-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-white/70">{text}</p>
    </div>
  );
}

function InputField({ icon, ...props }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3.5 transition focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/10">
      <span className="text-slate-400">{icon}</span>
      <input
        {...props}
        className="w-full bg-transparent text-white placeholder:text-slate-400 focus:outline-none"
      />
    </div>
  );
}

function SelectField({ icon, name, value, onChange, options, placeholder }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3.5 transition focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/10">
      <span className="text-slate-400">{icon}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-white focus:outline-none"
      >
        <option value="" className="bg-slate-900 text-slate-400">
          {placeholder}
        </option>
        {options.map((item) => (
          <option key={item} value={item} className="bg-slate-900 text-white">
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

function PasswordField({
  icon,
  name,
  placeholder,
  value,
  onChange,
  show,
  setShow,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3.5 transition focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/10">
      <span className="text-slate-400">{icon}</span>
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-white placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-slate-400 transition hover:text-white"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}