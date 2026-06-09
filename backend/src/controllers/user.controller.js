import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" }
    });

    // Omit passwords
    const sanitizedUsers = users.map((u) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    return res.json({ success: true, users: sanitizedUsers });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status, permissions, phone, photo } = req.body;

    const emailKey = email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: emailKey }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: emailKey,
        password: hashedPassword,
        role,
        status: status || "Active",
        permissions: permissions || [],
        phone: phone || "",
        photo: photo || ""
      }
    });

    const { password: _, ...sanitized } = user;
    return res.json({ success: true, user: sanitized });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, email, password, role, status, permissions, phone, photo } = req.body;

    // Permissions check: "Users" permission or editing own profile
    if (!req.user.permissions.includes("Users") && req.user.role !== "Admin" && req.user.id !== id) {
      return res.status(403).json({ success: false, message: "Access Denied: You cannot edit other user profiles!" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      const emailKey = email.toLowerCase();
      if (emailKey !== existingUser.email) {
        const duplicate = await prisma.user.findUnique({ where: { email: emailKey } });
        if (duplicate) {
          return res.status(400).json({ success: false, message: "Email is already registered!" });
        }
      }
      updateData.email = emailKey;
    }
    if (password !== undefined && password !== "") {
      // If a password update is requested, verify current password if updating own profile
      if (req.user.id === id) {
        const { currentPassword } = req.body;
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: "Current password is required to change password!" });
        }
        const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: "Current password incorrect!" });
        }
      }
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (phone !== undefined) updateData.phone = phone || "";
    if (photo !== undefined) updateData.photo = photo || "";

    const updated = await prisma.user.update({
      where: { id },
      data: updateData
    });

    const { password: _, ...sanitized } = updated;
    return res.json({ success: true, user: sanitized });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    await prisma.user.delete({
      where: { id }
    });

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getApprovalSequence = async (req, res, next) => {
  try {
    const steps = await prisma.approvalSequence.findMany({
      orderBy: { position: "asc" }
    });

    const sequence = [];
    for (const step of steps) {
      const user = await prisma.user.findUnique({
        where: { id: step.userId }
      });
      if (user) {
        sequence.push({
          userId: user.id,
          name: user.name,
          role: user.role,
          position: step.position
        });
      }
    }

    return res.json({ success: true, sequence });
  } catch (error) {
    next(error);
  }
};

export const updateApprovalSequence = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    // Delete existing approval sequence
    await prisma.approvalSequence.deleteMany();

    // Create new sequence
    const data = userIds.map((userId, index) => ({
      userId,
      position: index + 1
    }));

    await prisma.approvalSequence.createMany({
      data
    });

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
