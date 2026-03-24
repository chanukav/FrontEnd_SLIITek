import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-[#c9cedc] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl border border-[#343e43]/20">
        <h1 className="text-3xl font-bold text-[#343e43] text-center">Student Sign Up</h1>
        <p className="mt-2 text-center text-[#343e43]/80">
          User account only (email format: ITxxxx@my.sliit.lk)
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="input-theme" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input className="input-theme" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input className="input-theme md:col-span-2" type="email" name="email" placeholder="it85757874@my.sliit.lk" value={formData.email} onChange={handleChange} autoComplete="username" required />
          <select className="input-theme" name="academicYear" value={formData.academicYear} onChange={handleChange} required>
            <option value="">Academic Year</option>
            {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="input-theme" name="faculty" value={formData.faculty} onChange={handleChange} required>
            <option value="">Faculty</option>
            {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <input className="input-theme" type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} autoComplete="tel" required />
          <input className="input-theme" type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} autoComplete="new-password" required />
          <input className="input-theme md:col-span-2" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
          <input className="input-theme md:col-span-2" type="file" accept="image/*" onChange={handlePhotoChange} required />

          {previewUrl && (
            <img src={previewUrl} alt="SLIIT ID Preview" className="md:col-span-2 h-44 w-full rounded-xl object-cover border border-[#343e43]/20" />
          )}

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="rounded-xl border border-[#343e43]/30 py-2 text-[#343e43]"
          >
            Toggle Password
          </button>
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="rounded-xl border border-[#343e43]/30 py-2 text-[#343e43]"
          >
            Toggle Confirm
          </button>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full rounded-xl bg-[#f9bf3b] py-3 font-semibold text-[#343e43] hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#343e43]">
          Already have an account? <Link to="/login" className="font-semibold underline">Login</Link>
        </p>
      </div>
    </div>
  );
}