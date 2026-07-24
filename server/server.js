const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Nodemailer Transporter Setup (support.mstech configuration)
const transporter = nodemailer.createTransport({
  service: "gmail", // ya tumhara jo bhi mail provider ho
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/send-welcome-email", async (req, res) => {
  const { name, email } = req.body;

  try {
    const mailOptions = {
      from: `"Streamify Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Streamify! 🎬",
      html: `
        <div style="background-color: #09090E; color: #ffffff; padding: 30px; font-family: sans-serif; border-radius: 12px;">
          <h2 style="color: #a855f7;">Welcome to Streamify, ${name}! 🎉</h2>
          <p style="color: #9ca3af; font-size: 14px;">We are thrilled to have you on board. Your account has been successfully created and linked with Google.</p>
          <p style="color: #9ca3af; font-size: 14px;">Start watching movies, TV shows, and streaming together with your friends anywhere!</p>
          <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">If you have any questions, reach out to us directly at support.mstech.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Success]: Welcome email successfully sent to ${email}`);
    res
      .status(200)
      .json({ success: true, message: "Welcome email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
