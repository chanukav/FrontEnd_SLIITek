import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { api } from "../../lib/api";

const SLIIT_EMAIL_RE = /^it\d+@my\.sliit\.lk$/i;
/** Letters only (Unicode letters + combining marks for Sinhala/Tamil/Latin); 2–50 chars; spaces, hyphen, apostrophe, period. No digits or symbols like *&%$#@. */
const NAME_RE = /^[\p{L}][\p{L}\p{M}\s'.-]{1,49}$/u;
const MAX_NAME_LEN = 50;
const PHONE_DIGIT_LEN = 10;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Strips anything that is not a letter (incl. combining marks) or allowed name punctuation; caps length. */
const sanitizeNameInput = (raw) =>
  String(raw).replace(/[^\p{L}\p{M}\s'.-]/gu, "").slice(0, MAX_NAME_LEN);

/** Digits only, max 10 — extra digits cannot be entered. */
const sanitizePhoneInput = (raw) => String(raw).replace(/\D/g, "").slice(0, PHONE_DIGIT_LEN);

const validatePassword = (pwd) => {
  if (!pwd || pwd.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(pwd)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(pwd)) return "Password must include an uppercase letter.";
  if (!/[0-9]/.test(pwd)) return "Password must include a number.";
  if (!/[^a-zA-Z0-9]/.test(pwd)) return "Password must include a special character.";
  return null;
};

const validatePhone = (raw) => {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length !== PHONE_DIGIT_LEN) {
    return "Phone number must be exactly 10 digits.";
  }
  return null;
};

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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const faculties = [
    "Computing",
    "Engineering",
    "Business",
    "Architecture",
    "Humanities & Sciences",
    "Medicine",
  ];

  const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const fieldErrors = useMemo(() => {
    const e = {};
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    if (touched.firstName && !fn) e.firstName = "First name is required.";
    else if (fn && !NAME_RE.test(fn)) {
      e.firstName =
        "Use 2–50 letters only (letters, spaces, hyphen, apostrophe, period). No numbers or symbols like *&%$#@.";
    }
    if (touched.lastName && !ln) e.lastName = "Last name is required.";
    else if (ln && !NAME_RE.test(ln)) {
      e.lastName =
        "Use 2–50 letters only (letters, spaces, hyphen, apostrophe, period). No numbers or symbols like *&%$#@.";
    }

    const em = formData.email.trim().toLowerCase();
    if (touched.email && !em) e.email = "Email is required.";
    else if (em && !SLIIT_EMAIL_RE.test(em)) {
      e.email = "Must be your SLIIT email: ITxxxx@my.sliit.lk";
    }

    if (touched.academicYear && !formData.academicYear) e.academicYear = "Select your academic year.";
    if (touched.faculty && !formData.faculty) e.faculty = "Select your faculty.";

    if (touched.phone) {
      const pe = validatePhone(formData.phone);
      if (pe) e.phone = pe;
    }

    if (touched.password) {
      const pw = validatePassword(formData.password);
      if (pw) e.password = pw;
    }
    if (touched.confirmPassword) {
      if (formData.confirmPassword !== formData.password) {
        e.confirmPassword = "Passwords do not match.";
      }
    }

    if (touched.sliitIdPhoto && !formData.sliitIdPhoto) {
      e.sliitIdPhoto = "SLIIT ID photo is required.";
    }

    return e;
  }, [formData, touched]);

  const validateAll = () => {
    const e = {};
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    if (!fn) e.firstName = "First name is required.";
    else if (!NAME_RE.test(fn)) {
      e.firstName =
        "Use 2–50 letters only (letters, spaces, hyphen, apostrophe, period). No numbers or symbols like *&%$#@.";
    }
    if (!ln) e.lastName = "Last name is required.";
    else if (!NAME_RE.test(ln)) {
      e.lastName =
        "Use 2–50 letters only (letters, spaces, hyphen, apostrophe, period). No numbers or symbols like *&%$#@.";
    }

    const em = formData.email.trim().toLowerCase();
    if (!em) e.email = "Email is required.";
    else if (!SLIIT_EMAIL_RE.test(em)) e.email = "Must be ITxxxx@my.sliit.lk";

    if (!formData.academicYear) e.academicYear = "Select academic year.";
    if (!formData.faculty) e.faculty = "Select faculty.";

    const pe = validatePhone(formData.phone);
    if (pe) e.phone = pe;

    const pw = validatePassword(formData.password);
    if (pw) e.password = pw;
    if (formData.confirmPassword !== formData.password) {
      e.confirmPassword = "Passwords do not match.";
    }

    if (!formData.sliitIdPhoto) e.sliitIdPhoto = "Upload your SLIIT ID photo.";

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "firstName" || name === "lastName") {
      setFormData((prev) => ({ ...prev, [name]: sanitizeNameInput(value) }));
      return;
    }
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: sanitizePhoneInput(value) }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, sliitIdPhoto: "Only image files are allowed." }));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrors((prev) => ({ ...prev, sliitIdPhoto: "Image must be 5MB or smaller." }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.sliitIdPhoto;
      return next;
    });

    setFormData((prev) => ({
      ...prev,
      sliitIdPhoto: file,
    }));

    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    setTouched((prev) => ({ ...prev, sliitIdPhoto: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      academicYear: true,
      faculty: true,
      phone: true,
      password: true,
      confirmPassword: true,
      sliitIdPhoto: true,
    });

    const validationErrors = validateAll();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("firstName", formData.firstName.trim());
      submitData.append("lastName", formData.lastName.trim());
      submitData.append("email", formData.email.trim().toLowerCase());
      submitData.append("academicYear", formData.academicYear);
      submitData.append("faculty", formData.faculty);
      submitData.append("password", formData.password);
      submitData.append("confirmPassword", formData.confirmPassword);
      submitData.append("phone", formData.phone.trim());
      submitData.append("sliitIdPhoto", formData.sliitIdPhoto);

      const { data } = await api.post("/auth/register", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const registeredEmail = data.user?.email || formData.email.trim().toLowerCase();
      toast.success(data.message || "Account created. Next, verify your email.");

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
      setErrors({});
      setTouched({});

      navigate("/verify-email", { state: { email: registeredEmail } });
    } catch (error) {
      console.error("ERROR:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-[#dbe6f6] bg-white px-4 py-3 text-[#4d5f83] shadow-sm outline-none transition focus:border-[#f9bf3b] focus:ring-2 focus:ring-[#f9bf3b]/40";
  const inputError = (name) =>
    (errors[name] || fieldErrors[name]) ? " border-red-400 focus:ring-red-200" : "";
  const selectClass =
    "w-full rounded-md border border-[#dbe6f6] bg-white px-4 py-3 text-[#4d5f83] shadow-sm outline-none transition focus:border-[#f9bf3b] focus:ring-2 focus:ring-[#f9bf3b]/40";
  const fileClass =
    "w-full rounded-md border border-dashed border-[#c8d9f5] bg-white px-4 py-3 text-[#4d5f83] file:mr-4 file:rounded-lg file:border-0 file:bg-[#f9bf3b] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#343e43] file:cursor-pointer outline-none transition focus:border-[#f9bf3b] focus:ring-2 focus:ring-[#f9bf3b]/40 md:col-span-2";

  const btnPrimary =
    "w-full rounded-md bg-[#f9bf3b] py-3 font-bold text-[#343e43] shadow-md transition hover:brightness-95 disabled:opacity-60 md:col-span-2";

  const mergeErr = (name) => errors[name] || fieldErrors[name];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c9cedc] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/60 bg-white/20 shadow-2xl backdrop-blur md:min-h-[640px] md:grid-cols-2">
        <div className="relative hidden overflow-hidden p-10 text-white md:flex md:flex-col md:justify-between">
          <img
            src="/Sliit.png"
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10">
            <>
              <style>
                {`
                  @keyframes modernFadeUp {
                    0% { opacity: 0; transform: translateY(30px) scale(0.98); filter: blur(6px); }
                    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                  }
                `}
              </style>
              <p
                className="mt-24 max-w-sm text-5xl font-extrabold leading-tight"
                style={{ animation: "modernFadeUp 1s ease-out forwards" }}
              >
                Join us today and experience a smarter way to manage your student life.
              </p>
            </>
          </div>
        </div>

        <div className="bg-[#f2f6ff] p-8 md:p-12">
          <h1 className="text-center text-4xl font-bold text-[#3d69b7]">Student Sign Up</h1>
          <p className="mt-2 text-center text-sm text-[#64748b]">
            SLIIT student email only · Strong password required
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 grid max-w-md gap-4 md:grid-cols-2"
            noValidate
          >
            <div>
              <input
                className={`${inputClass}${inputError("firstName")}`}
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur("firstName")}
                autoComplete="given-name"
                maxLength={MAX_NAME_LEN}
                spellCheck="false"
              />
              {mergeErr("firstName") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("firstName")}</p>
              )}
            </div>
            <div>
              <input
                className={`${inputClass}${inputError("lastName")}`}
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur("lastName")}
                autoComplete="family-name"
                maxLength={MAX_NAME_LEN}
                spellCheck="false"
              />
              {mergeErr("lastName") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("lastName")}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <input
                className={`${inputClass}${inputError("email")}`}
                type="email"
                name="email"
                placeholder="itxxxx@my.sliit.lk *"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                autoComplete="email"
              />
              {mergeErr("email") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("email")}</p>
              )}
            </div>

            <div>
              <select
                className={`${selectClass}${inputError("academicYear")}`}
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                onBlur={() => handleBlur("academicYear")}
              >
                <option value="">Academic Year *</option>
                {academicYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {mergeErr("academicYear") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("academicYear")}</p>
              )}
            </div>
            <div>
              <select
                className={`${selectClass}${inputError("faculty")}`}
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                onBlur={() => handleBlur("faculty")}
              >
                <option value="">Faculty *</option>
                {faculties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {mergeErr("faculty") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("faculty")}</p>
              )}
            </div>

            <div>
              <input
                className={`${inputClass}${inputError("phone")}`}
                type="tel"
                name="phone"
                placeholder="Phone — exactly 10 digits *"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur("phone")}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={PHONE_DIGIT_LEN}
                pattern="[0-9]{10}"
                title="10 digits only"
              />
              {mergeErr("phone") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("phone")}</p>
              )}
            </div>

            <div className="relative">
              <input
                className={`${inputClass} pr-12${inputError("password")}`}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password *"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {mergeErr("password") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("password")}</p>
              )}
            </div>

            <div className="relative md:col-span-2">
              <input
                className={`${inputClass} pr-12${inputError("confirmPassword")}`}
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {mergeErr("confirmPassword") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("confirmPassword")}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <input
                className={`${fileClass}${inputError("sliitIdPhoto")}`}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handlePhotoChange}
              />
              {mergeErr("sliitIdPhoto") && (
                <p className="mt-1 text-xs text-red-600">{mergeErr("sliitIdPhoto")}</p>
              )}
            </div>

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-44 w-full rounded-md object-cover md:col-span-2"
              />
            )}

            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#343e43] underline decoration-[#f9bf3b] decoration-2">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
