export const verifyPermission =
  (module, action) =>
  (req, res, next) => {
    if (!req.user) {
      return next(errorHandler(401, "User not authenticated"));
    }

    if (req.user.isSuperAdmin) return next();

  
    const effectivePermissions =
      req.user.permissionsOverride &&
      req.user.permissionsOverride.length > 0
        ? req.user.permissionsOverride  
        : req.user.permissions;         

    const permission = effectivePermissions?.find(
      (p) => p.module === module
    );

    if (!permission || !permission.actions.includes(action)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };