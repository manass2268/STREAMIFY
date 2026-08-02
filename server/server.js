const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
require("dotenv").config();

const app = express();

// =================================================================
// 🔥 1. BULLETPROOF VERCEL CORS MIDDLEWARE 🔥
// =================================================================
app.use((req, res, next) => {
  // Fixes Vercel Preflight & OPTIONS drop issues
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://streamify-app-ms.vercel.app",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Fallback CORS
app.use(
  cors({
    origin: "https://streamify-app-ms.vercel.app",
    credentials: true,
  }),
);

// 🔥 Root Route (Vercel serverless checks)
app.get("/", (req, res) => res.status(200).send("Streamify API is Live! 🚀"));

// =================================================================
// 🔥 2. WATCH PARTY ROOM STORAGE & API ROUTES (Merged)
// =================================================================
const rooms = new Map(); // Simple in-memory room store

app.post("/api/rooms", (req, res) => {
  try {
    const { roomId, hostId } = req.body;
    if (!roomId) {
      return res
        .status(400)
        .json({ success: false, message: "Room ID is required" });
    }
    rooms.set(roomId, { hostId, createdAt: Date.now() });
    console.log(
      `[API Room Created]: ${roomId} by host ${hostId || "Anonymous"}`,
    );
    return res
      .status(200)
      .json({
        success: true,
        roomId,
        message: "Room provisioned successfully",
      });
  } catch (error) {
    console.error("[API Error creating room]:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/rooms/:roomId", (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    if (!room) {
      return res
        .status(404)
        .json({
          success: false,
          message: "This meeting link is invalid or has expired.",
        });
    }
    return res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("[API Error validating room]:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// =================================================================
// 🔥 3. FIREBASE ADMIN SETUP (Vercel & Local Compatibility)
// =================================================================
try {
  let serviceAccount;
  if (process.env.FIREBASE_CREDENTIALS) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  } else {
    serviceAccount = require("./serviceAccountKey.json");
  }

  // Prevents "Default app already exists" crash on Vercel redeploys
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
    "[CRITICAL ERROR]: Firebase Admin Init Failed. Check Environment Variables!",
    error.message,
  );
}

// =================================================================
// 🔥 4. BREVO SMTP SETUP & VERIFICATION
// =================================================================
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.warn(
      "[SMTP Warning]: Mail Server offline or credentials invalid ->",
      error.message,
    );
  } else {
    console.log("[Success]: Brevo SMTP Server Ready for Delivery");
  }
});

// =================================================================
// 5. WELCOME EMAIL ROUTE
// =================================================================
app.post("/api/send-welcome-email", async (req, res) => {
  const { name, email } = req.body;

  // Input safety check
  if (!email || !email.includes("@")) {
    return res
      .status(400)
      .json({ success: false, message: "Valid email is required" });
  }

  try {
    const mailOptions = {
      from: `"Streamify Support" <support.mstech4407@gmail.com>`,
      to: email,
      subject: "Welcome to Streamify! 🎬",
      html: `
        <div style="background-color: #09090E; color: #ffffff; padding: 30px; font-family: sans-serif; border-radius: 12px;">
          <h2 style="color: #a855f7;">Welcome to Streamify, ${name || "Streamer"}! 🎉</h2>
          <p style="color: #9ca3af; font-size: 14px;">We are thrilled to have you on board. Your account has been successfully created and linked.</p>
          <hr style="border: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">If you have any questions, reach out to us directly at support.mstech.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Success]: Welcome email sent to ${email}`);

    return res
      .status(200)
      .json({ success: true, message: "Welcome email sent successfully!" });
  } catch (error) {
    console.error("[Error]: Welcome email delivery failed ->", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to deliver email" });
  }
});

// =================================================================
// 6. PASSWORD RESET EMAIL ROUTE
// =================================================================
app.post("/api/send-reset-email", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res
      .status(400)
      .json({ success: false, message: "Valid email is required" });
  }

  try {
    const actionCodeSettings = {
      url: "https://streamify-app-ms.vercel.app/login?mode=resetPassword",
      handleCodeInApp: false,
    };

    // Generate Firebase secure reset link
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

    return res
      .status(200)
      .json({ success: true, message: "Reset email sent successfully!" });
  } catch (error) {
    console.error("[Error]: Generating reset link failed ->", error.message);

    // Check if the user does not exist in Firebase Auth
    if (error.code === "auth/user-not-found") {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email" });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
});

// 🔥 VERCEL SERVERLESS EXPORT
module.exports = app;
