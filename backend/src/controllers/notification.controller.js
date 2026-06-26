import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to format date string to match frontend expectations YYYY-MM-DD HH:mm:ss
const formatDateStr = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 19).replace("T", " ");
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" }
    });

    const formattedNotifications = notifications.map((n) => ({
      ...n,
      createdAt: formatDateStr(n.createdAt)
    }));

    return res.json({ success: true, notifications: formattedNotifications });
  } catch (error) {
    next(error);
  }
};

export const readAllNotifications = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true }
    });

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const readNotification = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Notification not found!" });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { type, message, iconType, color } = req.body;

    const newNotification = await prisma.notification.create({
      data: {
        type,
        message,
        iconType: iconType || "info",
        color: color || "bg-blue-100 text-blue-800"
      }
    });

    return res.json({
      success: true,
      notification: {
        ...newNotification,
        createdAt: formatDateStr(newNotification.createdAt)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.notification.delete({
      where: { id }
    });
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const clearNotifications = async (req, res, next) => {
  try {
    const { status } = req.query; // 'read', 'unread', or 'all'
    let whereClause = {};
    if (status === "read") {
      whereClause = { read: true };
    } else if (status === "unread") {
      whereClause = { read: false };
    }
    await prisma.notification.deleteMany({
      where: whereClause
    });
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
