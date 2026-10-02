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
          collegeAddress: "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh Pincode: 475005",
          collegePhone: "+91-(07524)-274320",
          collegeEmail: "rjit_bsft@yahoo.com",
          collegeWebsite: "www.rjit.ac.in"
        }
      });
    } else if (
      !settings.collegePhone ||
      settings.collegePhone.includes("2690 7400") ||
      !settings.collegeAddress ||
      settings.collegeAddress.includes("Okhla") ||
      !settings.collegeAddress.includes("475005") ||
      settings.collegeEmail === "info@rjit.edu.in"
    ) {
      // Migrate legacy placeholder data to official institution details
      settings = await prisma.systemSettings.update({
        where: { id: 1 },
        data: {
          collegeAddress: "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh Pincode: 475005",
          collegePhone: "+91-(07524)-274320",
          collegeEmail: "rjit_bsft@yahoo.com",
          collegeWebsite: "www.rjit.ac.in"
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
