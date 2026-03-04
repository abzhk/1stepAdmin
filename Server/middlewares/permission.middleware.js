export const canAccess = (module, action) => {
  return (req, res, next) => {
    const { permissions, role } = req.user;

    if (role === "Super Admin") return next();

    const allowed = permissions.some(
      (p) => p.module === module && p.actions.includes(action)
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    next();
  };
};
