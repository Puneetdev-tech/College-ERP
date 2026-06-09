import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const otpStore = new Map(); // Store OTPs: email -> { otp, expiresAt }

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive"
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password!" });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ success: false, message: "Your account is inactive. Contact Admin!" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "rjit_erp_secret_key_2026",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status,
        photo: user.photo || "",
        phone: user.phone || ""
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Verify user exists
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive"
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User with this email does not exist!" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL

    otpStore.set(email.toLowerCase(), { otp, expiresAt });

    return res.json({
      success: true,
      otp,
      message: "OTP generated"
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const stored = otpStore.get(email.toLowerCase());

    if (!stored || stored.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const emailKey = email.toLowerCase();
    const stored = otpStore.get(emailKey);

    if (!stored || stored.expiresAt < Date.now() || stored.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: emailKey },
      data: { password: hashedPassword }
    });

    // Clear OTP
    otpStore.delete(emailKey);

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};
