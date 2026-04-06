import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FiMail, FiX } from "react-icons/fi";
import { api } from "../../lib/api";

const inputClass =
  "w-full rounded-md border border-[#dbe6f6] bg-white px-4 py-3 text-[#4d5f83] shadow-sm outline-none transition focus:border-[#f9bf3b] focus:ring-2 focus:ring-[#f9bf3b]/40";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromSignup = location.state?.email?.trim()?.toLowerCase() || "";

  const [email, setEmail] = useState(emailFromSignup);
  const [modalOpen, setModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (emailFromSignup) setEmail(emailFromSignup);
  }, [emailFromSignup]);

  const handleContinue = async (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em) {
      toast.error("Enter the email you used to register.");
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post("/auth/verify-email/send", { email: em });
      if (data.devOtp) {
        toast.message("Your verification code", {
          description: `${data.devOtp} — SMTP not configured; add EMAIL_USER and EMAIL_PASS to BackEnd/.env for real email.`,
        });
      } else {
        toast.success(data.message || "Check your inbox for the code.");
      }
      setModalOpen(true);
      setOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send the code.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyInModal = async (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    const code = otp.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    try {
      const { data } = await api.post("/auth/verify-email/confirm", {
        email: em,
        otp: code,
      });
      toast.success(data.message || "Email verified");
      setModalOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "That code is not valid.");
    } finally {
      setVerifying(false);
    }
  };

  const btnPrimary =
    "w-full rounded-md bg-[#f9bf3b] py-3 font-bold text-[#343e43] shadow-md transition hover:brightness-95 disabled:opacity-60";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c9cedc] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/60 bg-white/20 shadow-2xl backdrop-blur md:min-h-[520px] md:grid-cols-2">
        <div className="relative hidden overflow-hidden p-10 text-white md:flex md:flex-col md:justify-between">
          <img
            src="/Sliit.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 mt-24 max-w-sm">
            <p className="text-4xl font-extrabold leading-tight">
              Almost there — confirm your email to unlock your account.
            </p>
          </div>
        </div>

        <div className="bg-[#f2f6ff] p-8 md:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#3d69b7]/10 text-[#3d69b7]">
              <FiMail className="h-7 w-7" />
            </div>
            <h1 className="text-center text-3xl font-bold text-[#3d69b7]">Verify your email</h1>
            <p className="mt-2 text-center text-sm text-[#64748b]">
              We will send a one-time code to the address you used on sign up. Enter it in the
              window that opens next.
            </p>

            <form onSubmit={handleContinue} className="mt-10 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#6f84ad]">Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="itxxxx@my.sliit.lk"
                  autoComplete="email"
                  required
                />
              </div>
              <button type="submit" disabled={sending} className={btnPrimary}>
                {sending ? "Sending…" : "Continue"}
              </button>
            </form>

            <p className="mt-10 text-center text-sm text-[#64748b]">
              Wrong account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[#343e43] underline decoration-[#f9bf3b] decoration-2"
              >
                Sign up again
              </Link>
              {" · "}
              <Link to="/login" className="font-semibold text-[#3d69b7] hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-white/60 bg-white p-8 shadow-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 text-[#64748b] transition hover:bg-[#f1f5f9]"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>
            <h2 id="verify-title" className="text-xl font-bold text-[#3d69b7]">
              Enter verification code
            </h2>
            <p className="mt-2 text-sm text-[#64748b]">
              Open the email we sent to <span className="font-medium text-[#4d5f83]">{email}</span>{" "}
              and type the 6-digit code below.
            </p>
            <form onSubmit={handleVerifyInModal} className="mt-6 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={`${inputClass} text-center text-2xl font-semibold tracking-[0.35em]`}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              <button type="submit" disabled={verifying} className={btnPrimary}>
                {verifying ? "Checking…" : "Verify email"}
              </button>
            </form>
            <button
              type="button"
              className="mt-4 w-full text-sm font-semibold text-[#3d69b7] hover:underline"
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Change email on previous step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
