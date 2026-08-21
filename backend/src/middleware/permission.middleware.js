/**
 * checkPermission(permName)
 *   Grants access if the user is Admin OR has the named permission in their array.
 *
 * requireRole(...roles)
 *   Grants access only if the user's role exactly matches one of the supplied roles.
 *   Admin is NOT implicitly included — pass "Admin" explicitly if you want it allowed.
 */

export const checkPermission = (permName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user context found." });
    }

    if (req.user.role === "Admin" || req.user.permissions.includes(permName)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access Denied: You do not have the '${permName}' permission to perform this action.`
    });
  };
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user context found." });
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access Denied: This action requires one of the following roles: ${roles.join(", ")}.`
    });
  };
};
