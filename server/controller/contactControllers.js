const sendEmail = require("../utils/sendEmail");

const contact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // --- 1. Email to the USER (Acknowledgment) ---
    const userEmailData = {
      name: name,
      email: email, // Send to the user
      subject: "Query Received - Gita App",
      message: `Hi ${name},\n\nThanks for raising a query. I have received it and will contact you within 24-48 Hours.\n\nRegards,\nChhavi`
    };

    const userEmailRes = await sendEmail(userEmailData);

    // If sending to user failed, stop here and tell them
    if (!userEmailRes.ok) {
      console.error("Failed to send user email:", userEmailRes.error);
      return res.status(500).json({ success: false, message: "Could not send email. Please try again." });
    }

    // --- 2. Email to ADMIN (You/Chhavi) ---
    // This ensures you actually get the message content!
    const adminEmailData = {
      email: process.env.SMPT_EMAIL, // Your email from .env
      subject: `New Query from ${name}`,
      message: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    // We don't strictly need to wait for this or fail if this fails, 
    // but it's good practice to await it.
    await sendEmail(adminEmailData);

    // --- 3. Success Response ---
    return res.status(200).json({
      success: true,
      message: "Message sent successfully to both parties",
    });

  } catch (error) {
    console.error("Contact Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { contact };