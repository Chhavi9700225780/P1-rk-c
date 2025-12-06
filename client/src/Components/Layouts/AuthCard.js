import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../utils/api";

/* ---------- Styles (unchanged) ---------- */
const Card = styled.div`
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #D5D9D9;
  box-shadow: 0 6px 14px rgba(16,24,40,0.06);
  padding: 22px 20px;
  box-sizing: border-box;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  color: #111;
`;

const Help = styled.p`
  margin: 0 0 12px;
  color: #333;
  font-size: 14px;
  line-height: 1.3;
`;

const Field = styled.div`
  margin-bottom: 12px;
  width: 100%;
`;

const Input = styled.input`
  width:100%;
  padding:12px 14px;
  border-radius:6px;
  border: ${props => (props.hasError ? "1px solid #ff4d4f" : "1px solid #888C8C")};
  font-size:14px;
  box-sizing: border-box;
  outline: none;
  &:focus {
    border-color: ${props => (props.hasError ? "#ff4d4f" : "#cfcfcf")};
    box-shadow: ${props => (props.hasError ? "0 0 0 3px rgba(255,77,79,0.06)" : "0 0 0 3px rgba(243,176,23,0.06)")};
  }
`;

const PrimaryButton = styled.button`
  background: #f3b017;
  color: #111;
  border-radius: 24px;
  padding: 10px 18px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  width: 100%;
  box-shadow: 0 1px 0 rgba(0,0,0,0.02);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Row = styled.div`
  display:flex;
  gap:8px;
  margin-top:8px;
  justify-content:flex-start;
`;

const Small = styled.div`
  font-size: 13px;
  color: #666;
  margin-top: 10px;
  text-align:left;
`;

const ErrorText = styled.div`
  margin-top: 6px;
  font-size: 13px;
  color: #ff4d4f;
`;

const Spinner = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <circle cx="25" cy="25" r="20" stroke="#111" strokeOpacity="0.15" strokeWidth="4" />
    <path d="M45 25a20 20 0 0 0-20-20" stroke="#111" strokeWidth="4" strokeLinecap="round" />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </svg>
);

/* ---------- Helper functions ---------- */
function formatSeconds(sec) {
  if (sec <= 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

/* ---------- Component ---------- */
const AuthCard = ({ onVerified }) => {
  const { fetchMe } = useAuth();
  const navigate = useNavigate();

  // form state
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // errors
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  // otp flow
  const [otpId, setOtpId] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // timers
  const DEFAULT_OTP_TTL_SECONDS = 10 * 60;
  const RESEND_COOLDOWN_SECONDS = 10;
  const [ttlSeconds, setTtlSeconds] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const canResend = useMemo(() => resendCooldown <= 0, [resendCooldown]);

  // ✅ FIXED: Standard ESLint-compliant timer logic
  useEffect(() => {
    let interval = null;
    if (ttlSeconds > 0) {
      interval = setInterval(() => {
        setTtlSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ttlSeconds]);

  // ✅ FIXED: Standard ESLint-compliant timer logic
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const startTimers = useCallback((ttl = DEFAULT_OTP_TTL_SECONDS) => {
    setTtlSeconds(ttl);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, [DEFAULT_OTP_TTL_SECONDS]);

  const isEmailValid = useMemo(() => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isOtpValid = useMemo(() => {
    return /^\d{6}$/.test(otp);
  }, [otp]);

  const handleSendOtp = useCallback(async () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!isEmailValid) {
      setEmailError("Enter a valid email address");
      return;
    }

    setEmailError("");
    try {
      setSending(true);
      const res = await api.post("/auth/send-otp", { email, name });

      if (res.data && res.data.ok) {
        setOtpId(res.data.otpId || "");
        const ttlFromServer = res.data.otpTtlSeconds || res.data.otpTTLSeconds || res.data.ttlSeconds || null;
        const ttl = typeof ttlFromServer === "number" ? ttlFromServer : DEFAULT_OTP_TTL_SECONDS;
        startTimers(ttl);

        setStep(1);
        toast.success("OTP sent — check your email");
      } else {
        toast.error(res.data?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("send-otp error", err);
      toast.error(err?.response?.data?.message || "Failed to send OTP — server error");
    } finally {
      setSending(false);
    }
  }, [email, name, isEmailValid, DEFAULT_OTP_TTL_SECONDS, startTimers]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp) {
      setOtpError("Enter the OTP");
      return;
    }
    if (!isOtpValid) {
      setOtpError("OTP must be a 6-digit code");
      return;
    }

    setOtpError("");
    try {
      setVerifying(true);
      const res = await api.post("/auth/verify-otp", { otp, otpId, name, email });

      if (res.data && res.data.ok) {
        try {
          await fetchMe();
        } catch (e) { /* ignore */ }

        toast.success("Verified. Logged in.");
        if (onVerified) onVerified(res.data.user || null);
        navigate("/profile");
      } else {
        const serverMsg = res.data?.message || "Invalid OTP";
        setOtpError(serverMsg);
      }
    } catch (err) {
      console.error("verify-otp error", err);
      const serverMsg = err?.response?.data?.message;
      if (serverMsg) {
        setOtpError(serverMsg);
      } else {
        toast.error("OTP verification failed");
      }
    } finally {
      setVerifying(false);
    }
  }, [otp, isOtpValid, otpId, name, email, fetchMe, onVerified, navigate]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    setOtp("");
    setOtpError("");
    try {
      setSending(true);
      const res = await api.post("/auth/send-otp", { email, name });
      if (res.data && res.data.ok) {
        setOtpId(res.data.otpId || "");
        const ttlFromServer = res.data.otpTtlSeconds || res.data.otpTTLSeconds || res.data.ttlSeconds || null;
        const ttl = typeof ttlFromServer === "number" ? ttlFromServer : DEFAULT_OTP_TTL_SECONDS;
        startTimers(ttl);
        toast.success("OTP resent");
      } else {
        toast.error(res.data?.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("resend error", err);
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setSending(false);
    }
  }, [canResend, email, name, DEFAULT_OTP_TTL_SECONDS, startTimers]);

  const timerDisplay = useMemo(() => formatSeconds(ttlSeconds), [ttlSeconds]);

  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };
  const onOtpChange = (e) => {
    setOtp(e.target.value);
    if (otpError) setOtpError("");
  };

  return (
    <>
      <img
        src={"/images/logo3.png"}
        alt="logo"
        width={120}
        height={120}
        className="mb-5"
      />
      <Card role="dialog" aria-labelledby="auth-title">
        <Title id="auth-title">Sign in or create account</Title>

        {step === 0 && (
          <>
            <Help>Enter your name and email and we’ll send a one-time code.</Help>

            <Field>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                autoComplete="name"
                aria-label="Your name (optional)"
              />
            </Field>

            <Field>
              <Input
                value={email}
                onChange={onEmailChange}
                placeholder="you@email.com"
                type="email"
                autoComplete="email"
                hasError={!!emailError}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && <ErrorText id="email-error">{emailError}</ErrorText>}
            </Field>

            <PrimaryButton
              onClick={handleSendOtp}
              disabled={sending || !isEmailValid}
              aria-disabled={sending || !isEmailValid}
            >
              {sending ? (
                <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <Spinner size={18} /> Sending...
                </div>
              ) : (
                "Send OTP"
              )}
            </PrimaryButton>
          </>
        )}

        {step === 1 && (
          <>
            <Help>Enter the code you received by email.</Help>

            <Field>
              <Input
                value={otp}
                onChange={onOtpChange}
                placeholder="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                hasError={!!otpError}
                aria-invalid={!!otpError}
                aria-describedby={otpError ? "otp-error" : undefined}
              />
              {otpError && <ErrorText id="otp-error">{otpError}</ErrorText>}
            </Field>

            <PrimaryButton
              onClick={handleVerifyOtp}
              disabled={verifying || !isOtpValid}
              aria-disabled={verifying || !isOtpValid}
            >
              {verifying ? (
                <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <Spinner size={18} /> Verifying...
                </div>
              ) : (
                "Verify"
              )}
            </PrimaryButton>

            <Row style={{ marginTop: 12, alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "#333" }}>
                Expires in <strong style={{ marginLeft: 6 }}>{timerDisplay}</strong>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setStep(0); setOtp(""); setOtpError(""); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#333", padding: 8 }}
                >
                  Back
                </button>

                <button
                  onClick={handleResend}
                  disabled={!canResend || sending}
                  aria-disabled={!canResend || sending}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.04)",
                    background: (!canResend || sending) ? "#fff8e6" : "#f3b017",
                    color: (!canResend || sending) ? "#9a6b00" : "#111",
                    cursor: (!canResend || sending) ? "not-allowed" : "pointer",
                    boxShadow: (!canResend || sending) ? "none" : "0 6px 18px rgba(243,176,23,0.14)",
                    minWidth: 120,
                    height: 40,
                    paddingLeft: 10,
                    paddingRight: 14,
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: "1",
                    transition: "transform .12s ease, box-shadow .12s ease",
                  }}
                  onMouseDown={(e) => { if (!(!canResend || sending)) e.currentTarget.style.transform = "translateY(1px)"; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = "none"; }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: (!canResend || sending) ? "#fff6dc" : "#ffd47a",
                      boxShadow: (!canResend || sending) ? "none" : "inset 0 -2px 0 rgba(0,0,0,0.03)",
                      flexShrink: 0,
                    }}
                  >
                    {sending ? (
                      <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 50 50"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ animation: "spin 1s linear infinite" }}
                        >
                          <circle cx="25" cy="25" r="20" stroke="#111" strokeOpacity="0.15" strokeWidth="4" fill="none" />
                          <path d="M45 25a20 20 0 0 0-20-20" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : (
                      <span style={{ fontSize: 16, lineHeight: 1, fontWeight: 800, marginTop:12, transform: "translateY(-1px)" }}>↻</span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>
                    <span style={{ fontWeight: 800, marginTop:12 }}>
                      {sending ? "Sending..." : (canResend ? "Resend" : `Resend in ${formatSeconds(resendCooldown)}`)}
                    </span>
                  </div>
                </button>
              </div>
            </Row>
            <Small style={{ marginTop: 8 }}>
              Didn’t get it? Check spam or click Resend.
            </Small>
          </>
        )}
      </Card>
    </>
  );
};

export default memo(AuthCard);