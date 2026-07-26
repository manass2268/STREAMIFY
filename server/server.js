const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
// 🔥 NAYA UPDATE: Yahan getApps ko import kiya hai
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔥 Root Route (Ye Vercel ki 500 Crash error ko fix karega)
app.get("/", (req, res) => res.send("Streamify API is Live! 🚀"));

// 🔥 Firebase Admin Setup with Error Handling & Vercel Fix
try {
  let serviceAccount;
  if (process.env.FIREBASE_CREDENTIALS) {
    // Vercel par ENV se credentials lega
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  } else {
    // Local testing ke liye file se padhega
    serviceAccount = require("./serviceAccountKey.json");
  }

  // 🔥 NAYA UPDATE: Check karega ki Firebase pehle se initialize toh nahi hai
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("[Success]: Firebase Admin Initialized");
  } else {
    console.log("[Info]: Firebase Admin already initialized");
  }
} catch (error) {
  console.error(
    "[CRITICAL ERROR]: Firebase JSON Parse Failed. Check Environment Variables!",
    error.message,
  );
}

// 🔥 Brevo SMTP Transporter Setup
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 1. Welcome Email Route
app.post("/api/send-welcome-email", async (req, res) => {
  const { name, email } = req.body;
  try {
    const mailOptions = {
      from: `"Streamify Support" <support.mstech4407@gmail.com>`,
      to: email,
      subject: "Welcome to Streamify! 🎬",
      html: `
        <div style="background-color: #09090E; color: #ffffff; padding: 30px; font-family: sans-serif; border-radius: 12px;">
          <h2 style="color: #a855f7;">Welcome to Streamify, ${name}! 🎉</h2>
          <p style="color: #9ca3af; font-size: 14px;">We are thrilled to have you on board. Your account has been successfully created and linked with Google.</p>
          <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">If you have any questions, reach out to us directly at support.mstech.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`[Success]: Welcome email sent to ${email}`);
    res
      .status(200)
      .json({ success: true, message: "Welcome email sent successfully!" });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// 2. Password Reset Email Route
app.post("/api/send-reset-email", async (req, res) => {
  const { email } = req.body;
  try {
    const actionCodeSettings = {
      url: "https://streamify-app-ms.vercel.app/login?mode=resetPassword",
      handleCodeInApp: false,
    };

    // Firebase reset link generation
    const resetLink = await getAuth().generatePasswordResetLink(
      email,
      actionCodeSettings,
    );

    const mailOptions = {
      from: `"Streamify Support" <support.mstech4407@gmail.com>`,
      to: email,
      subject: "Reset your Streamify Password 🔐",
      html: `
        <div style="background-color: #09090E; color: #ffffff; padding: 30px; font-family: sans-serif; border-radius: 12px; text-align: center;">
          <h2 style="color: #a855f7; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 30px;">We received a request to reset your password for your Streamify account. Click the button below to create a new one.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #a855f7, #3b82f6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);">Set New Password</a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Success]: Reset email sent to ${email}`);
    res.status(200).json({ success: true, message: "Reset email sent!" });
  } catch (error) {
    console.error("Error generating reset link:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔥 VERCEL FIX
module.exports = app;
