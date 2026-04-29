import { useSelector } from "react-redux";

const PermissionGuard = ({ module, action, children, fallback = null }) => {
  const role = useSelector((state) => state.auth.user?.role);
  const permissions = useSelector((state) => state.auth.user?.permissions || []);

  if (role === "Super Admin") return children;

  const perm = permissions.find((p) => p.module === module);
  const hasAccess = perm && perm.actions.includes(action);

  return hasAccess ? children : fallback;
};

export default PermissionGuard;