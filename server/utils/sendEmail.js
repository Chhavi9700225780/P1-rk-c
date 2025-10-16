// server/utils/sendEmail.js
/**
 * sendEmail(data)
 * data: {
 *   subject: string,
 *   email: string,      // recipient email (required)
 *   message: string,    // plain text body
 *   name?: string       // optional sender name or context
 * }
 *
 * Returns: { ok: true, info } on success or { ok: false, error } on failure
 *
 * Note: For Gmail SMTP use an App Password (recommended) and set in .env:
 *   SMPT_EMAIL=your-email@gmail.com
 *   PASSWORD=your-app-password
 *
 * The function uses async/await and does not throw — it returns status object.
 */

const nodeMailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(data = {}) {
  const { subject = "No subject", email, message = "", name = "" } = data || {};

  if (!email) {
    const err = "sendEmail: recipient email (data.email) is required";
    console.warn(err);
    return { ok: false, error: err };
  }

  // Create transporter (recreate on each call to pick up env changes).
  // For Gmail, secure: true and port 465 is typical with app passwords.
  const transporter = nodeMailer.createTransport({
    secure: true,
    port: 465,
    service: "gmail",
    auth: {
      user: process.env.SMPT_EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: "no-reply@example.com",
    to: email,
    subject,
    text: `${message}`,
    html: `<p>${message}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // info contains provider response (messageId, accepted, etc.)
    return { ok: true, info };
  } catch (error) {
    console.error("sendEmail error:", error && (error.message || error));
    return { ok: false, error: error && (error.message || error) };
  }
}

module.exports = sendEmail;
