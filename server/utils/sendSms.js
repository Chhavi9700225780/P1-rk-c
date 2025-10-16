// server/utils/sendSms.js
// simple wrapper for Twilio SMS send
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_FROM_NUMBER || "";

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

async function sendSms(to, message) {
  if (!client) {
    console.warn("Twilio not configured - SMS not sent (stub).");
    return { ok: false, info: "twilio-not-configured" };
  }

  try {
    const res = await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    });
    return { ok: true, sid: res.sid };
  } catch (err) {
    console.error("sendSms error:", err);
    return { ok: false, error: err.message || err };
  }
}

module.exports = { sendSms };
