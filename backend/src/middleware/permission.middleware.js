export const checkPermission = (permName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    // Admin bypasses all checks or must explicitly have permission?
    // Usually Admin has all permissions, but checking explicitly in array is safe.
    // Let's check permissions.
    if (req.user.role === "Admin" || req.user.permissions.includes(permName)) {
      return next();
    }

    return res.status(403).json({ success: false, message: "Access Denied: You do not have permission to perform this action!" });
  };
};
