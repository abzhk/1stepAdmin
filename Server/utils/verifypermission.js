export const verifyPermissions = (requiredPermissions = []) => {
  return (req, res, next) => {
    const hasPermission = requiredPermissions.every((p) =>
      req.user.permissions?.includes(p)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }
    next();
  };
};
