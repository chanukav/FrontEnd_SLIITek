import React, { useEffect, useState } from "react";
import {
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (raw) => {
  const s = String(raw).trim().toLowerCase();
  if (!s) return "Email is required.";
  if (!EMAIL_RE.test(s)) return "Enter a valid email address.";
  return null;
};

const validatePassword = (pwd) => {
  if (!pwd || pwd.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(pwd)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(pwd)) return "Password must include an uppercase letter.";
  if (!/[0-9]/.test(pwd)) return "Password must include a number.";
  if (!/[^a-zA-Z0-9]/.test(pwd)) return "Password must include a special character.";
  return null;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;

    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && step >= 2) {
      setCanResend(true);
    }

    return () => clearInterval(timer);
  }, [countdown, step]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const ee = validateEmail(email);
    if (ee) {
      setError(ee);
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const em = email.trim().toLowerCase();
      const res = await api.post("/auth/forgot-password/send-otp", {
        email: em,
      });

      setMessage(res.data.message || "Check your email for the code.");
      if (res.data.devOtp) {
        toast.message("Development: reset code", {
          description: `${res.data.devOtp} — configure EMAIL_USER and EMAIL_PASS on the server to receive codes by email.`,
        });
      } else {
        toast.success(res.data.message || "We sent a code to your inbox.");
      }
      setStep(2);
      setCountdown(120);
      setCanResend(false);
      setResetToken("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send code";
      const detail = err.response?.data?.error;
      setError(msg);
      toast.error(msg, detail ? { description: String(detail).slice(0, 200) } : undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.replace(/\D/g, "").trim();
    if (code.length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const em = email.trim().toLowerCase();
      const res = await api.post("/auth/forgot-password/verify-otp", {
        email: em,
        otp: code,
      });

      const token = res.data.resetToken;
      if (!token) {
        throw new Error("Missing reset token from server");
      }
      setResetToken(token);
      setMessage(res.data.message || "OTP verified successfully");
      toast.success("Code accepted — choose a new password");
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const pwErr = validatePassword(newPassword);
    if (pwErr) {
      setError(pwErr);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!resetToken) {
      setError("Session expired. Verify your code again.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password/reset-password", {
        resetToken,
        newPassword,
      });

      toast.success(res.data.message || "Password updated");
      setStep(1);
      setEmail("");
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setCountdown(0);
      setCanResend(false);
      setMessage("");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const em = email.trim().toLowerCase();
      const res = await api.post("/auth/forgot-password/send-otp", {
        email: em,
      });

      setMessage(res.data.message || "Code resent");
      if (res.data.devOtp) {
        toast.message("Development: new code", {
          description: String(res.data.devOtp),
        });
      } else {
        toast.success("A new code was sent to your email.");
      }
      setCountdown(120);
      setCanResend(false);
      setResetToken("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend code";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const btnPrimary =
    "w-full rounded-2xl bg-[#f9bf3b] py-4 font-bold text-[#343e43] shadow-lg transition hover:brightness-95 disabled:opacity-70";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#c9cedc] px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-white/40 bg-white/90 p-10 shadow-2xl backdrop-blur-xl md:p-12">
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#343e43]"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3d69b7] to-slate-800 shadow-lg">
              <ShieldCheck className="text-white" size={28} />
            </div>

            <h1 className="text-3xl font-bold leading-tight text-slate-800">
              Forgot your password?
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter the email address on your account. We will send a one-time code to that inbox.
              After you confirm the code, you can set a new password.
            </p>
          </div>

          <div className="mb-6 flex gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full transition ${
                  step >= n ? "bg-[#f9bf3b]" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {message && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="your.address@example.com"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-11 pr-4 outline-none transition focus:border-[#3d69b7] focus:ring-4 focus:ring-[#3d69b7]/15"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? "Sending code…" : "Send code to email"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Code from your email
                </label>
                <div className="relative">
                  <ShieldCheck
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="6-digit code"
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-11 pr-4 tracking-[0.2em] outline-none transition focus:border-[#3d69b7] focus:ring-4 focus:ring-[#3d69b7]/15"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Sent to <span className="font-medium text-slate-700">{email.trim().toLowerCase()}</span>
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Resend available in</span>
                <span className="text-lg font-bold text-[#3d69b7]">
                  {formatTime(countdown)}
                </span>
              </div>

              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? "Verifying…" : "Continue"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className={`w-full rounded-2xl border py-3 font-medium transition ${
                  canResend
                    ? "border-[#f9bf3b] bg-[#f9bf3b]/10 text-[#343e43] hover:bg-[#f9bf3b]/20"
                    : "cursor-not-allowed border-slate-200 text-slate-400"
                }`}
              >
                {canResend ? "Resend email code" : "Wait for the timer to resend"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Strong password (8+ chars, mixed case, number, symbol)"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-11 pr-12 outline-none transition focus:border-[#3d69b7] focus:ring-4 focus:ring-[#3d69b7]/15"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-11 pr-12 outline-none transition focus:border-[#3d69b7] focus:ring-4 focus:ring-[#3d69b7]/15"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? "Saving…" : "Update password & go to login"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
