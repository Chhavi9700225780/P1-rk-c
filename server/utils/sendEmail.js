// server/utils/sendEmail.js
const nodeMailer = require("nodemailer");
require("dotenv").config();

// OPTIMIZATION: Create the transporter OUTSIDE the function.
// This prevents creating a new login connection for every single email (which Google hates).
const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com", // Explicit host is safer than service: 'gmail'
  port: 465, // 465 (SSL) is fine. If it hangs, switch to 587 (TLS).
  secure: true, 
  auth: {
    user: process.env.SMPT_EMAIL, // Note: You have a typo in your .env (SMPT vs SMTP). I kept it to match your env.
    pass: process.env.PASSWORD,
  },
});

async function sendEmail(data = {}) {
  const { subject = "No subject", email, message = "", name = "" } = data || {};

  if (!email) {
    return { ok: false, error: "Recipient email is required" };
  }

  const mailOptions = {
    // FIX: Use your actual email or a formatted name
    from: `Gita App <${process.env.SMPT_EMAIL}>`, 
    to: email,
    subject,
    text: message,
    html: `<div style="font-family: sans-serif; padding: 20px;">
            <h3>Hello ${name || 'User'},</h3>
            <p>${message.replace(/\n/g, "<br>")}</p>
            <hr />
            <p style="font-size: 12px; color: #666;">Sent via Gita App</p>
           </div>`,
  };

  try {
    // SAFEFGUARD: Race the email against a 10-second timer
    // This prevents the "Infinite Loading Spinner" on the frontend
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Email server timed out (10s)")), 10000)
      )
    ]);

    return { ok: true, info };
  } catch (error) {
    console.error("sendEmail error:", error.message);
    return { ok: false, error: error.message };
  }
}

module.exports = sendEmail;