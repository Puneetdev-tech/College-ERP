import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to format the settings row into frontend-compatible format
const formatSettings = (s) => {
  if (!s) return null;
  return {
    id: s.id,
    lowStockThreshold: s.lowStockThreshold,
    theme: "light",
    collegeName: s.collegeName,
    collegeLogo: s.collegeLogo,
    collegeAddress: s.collegeAddress,
    collegePhone: s.collegePhone,
    collegeEmail: s.collegeEmail,
    collegeWebsite: s.collegeWebsite,
    collegeInfo: {
      name: s.collegeName,
      logo: s.collegeLogo,
      address: s.collegeAddress,
      phone: s.collegePhone,
      email: s.collegeEmail,
      website: s.collegeWebsite
    }
  };
};

export const getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 1 }
    });

    // If settings row doesn't exist, create it with defaults
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 1,
          lowStockThreshold: 10,
          collegeName: "Rustamji Institute of Technology",
          collegeLogo: "/rjit_logo.png",
          collegeAddress: "123 Campus Lane, Okhla, New Delhi",
          collegePhone: "+91 11 2690 7400",
          collegeEmail: "info@rjit.edu.in",
          collegeWebsite: "www.rjit.edu.in"
        }
      });
    }

    return res.json({ success: true, settings: formatSettings(settings) });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { lowStockThreshold, collegeInfo } = req.body;

    const updateData = {};
    if (lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = Number(lowStockThreshold);
    }

    if (collegeInfo) {
      if (collegeInfo.name !== undefined) updateData.collegeName = collegeInfo.name;
      if (collegeInfo.logo !== undefined) updateData.collegeLogo = collegeInfo.logo;
      if (collegeInfo.address !== undefined) updateData.collegeAddress = collegeInfo.address;
      if (collegeInfo.phone !== undefined) updateData.collegePhone = collegeInfo.phone;
      if (collegeInfo.email !== undefined) updateData.collegeEmail = collegeInfo.email;
      if (collegeInfo.website !== undefined) updateData.collegeWebsite = collegeInfo.website;
    }

    const settings = await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 10,
        collegeName: (collegeInfo && collegeInfo.name) || "Rustamji Institute of Technology",
        collegeLogo: (collegeInfo && collegeInfo.logo) || "/rjit_logo.png",
        collegeAddress: (collegeInfo && collegeInfo.address) || "",
        collegePhone: (collegeInfo && collegeInfo.phone) || "",
        collegeEmail: (collegeInfo && collegeInfo.email) || "",
        collegeWebsite: (collegeInfo && collegeInfo.website) || ""
      }
    });

    return res.json({ success: true, settings: formatSettings(settings) });
  } catch (error) {
    next(error);
  }
};
