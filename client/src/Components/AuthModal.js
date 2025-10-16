// src/components/AuthModal.jsx
import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";

const Card = styled.div`
  width: 420px;
  max-width: calc(100vw - 40px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  padding: 22px;
  font-family: inherit;
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(6,6,7,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.25rem;
  text-align: center;
`;

const Row = styled.div`
  display:flex;
  gap:8px;
  margin-top:8px;
`;

const Input = styled.input`
  width:100%;
  padding:10px 12px;
  border-radius:8px;
  border:1px solid #e6e6e6;
  font-size:1rem;
`;

const Button = styled.button`
  background: #f59e0b;
  color: #111;
  border-radius: 8px;
  padding: 10px 14px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Small = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 10px;
  text-align:center;
`;

export default function AuthModal({ open, onClose, onVerified }) {
  const { fetchMe } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");          // <-- new name field
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devOtpShown, setDevOtpShown] = useState(null);

  if (!open) return null;

  const sendOtp = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    // optional: require name if you want
    // if (!name || name.trim().length < 2) { toast.error("Please enter your name"); return; }

    try {
      setSending(true);
      // include name in payload so backend can create/update user if it supports it
      const res = await axios.post("/auth/send-otp", { email, name }, { withCredentials: true });
      if (res.data && res.data.ok) {
        setOtpId(res.data.otpId || "");
        setDevOtpShown(res.data.otp || null);
        toast.success("OTP sent — check your email (or dev response)");
        setStep(1);
      } else {
        toast.error(res.data?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("sendOtp err", err);
      toast.error("Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Enter OTP");
      return;
    }
    try {
      setVerifying(true);
      // include name, otpId, otp so backend can attach displayName if implemented
      const payload = { otp, otpId, name, email };
      const res = await axios.post("/auth/verify-otp", payload, { withCredentials: true });
      if (res.data && res.data.ok) {
        // refresh client-side user state from /auth/me
        await fetchMe();
        const me = res.data.user || null;
        onVerified(me);
      } else {
        toast.error(res.data?.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("verifyOtp err", err);
      toast.error("Invalid OTP or server error");
    } finally {
      setVerifying(false);
    }
  };

  const close = () => {
    // reset
    setStep(0);
    setName("");
    setEmail("");
    setOtp("");
    setOtpId("");
    setDevOtpShown(null);
    onClose && onClose();
  };

  return (
    <Backdrop onClick={close}>
      <Card onClick={(e) => e.stopPropagation()}>
        <Title>Sign in or create account </Title>

        {step === 0 && (
          <>
            <Small>Enter your name and email and we’ll send a one-time code.</Small>

            <div style={{ marginTop: 12 }}>
              <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name (optional)" />
            </div>

            <div style={{ marginTop: 12 }}>
              <Input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="your@email.com" />
            </div>

            <Row style={{ marginTop: 14 }}>
              <Button onClick={sendOtp} disabled={sending}>{sending ? "Sending..." : "Send OTP"}</Button>
              <Button onClick={close} style={{ background: "#eee", color:"#111" }}>Cancel</Button>
            </Row>
          </>
        )}

        {step === 1 && (
          <>
            <Small>Enter the code you received by email.</Small>
            <div style={{ marginTop: 12 }}>
              <Input value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="6-digit code" />
            </div>

            <Row style={{ marginTop: 14 }}>
              <Button onClick={verifyOtp} disabled={verifying}>{verifying ? "Verifying..." : "Verify"}</Button>
              <Button onClick={() => { setStep(0); setOtp(""); }} style={{ background: "#eee", color:"#111" }}>Back</Button>
            </Row>

            {devOtpShown && (
              <Small style={{ marginTop: 12 }}><strong>Dev OTP:</strong> {devOtpShown}</Small>
            )}
            <Small style={{ marginTop: 8 }}>
              Didn’t get it? Try again or check spam. You can resend from the previous step.
            </Small>
          </>
        )}

      </Card>
    </Backdrop>
  );
}
