import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PermissionRoute = ({ module, action, children }) => {
  const role = useSelector((state) => state.auth.user?.role);
  const permissions = useSelector((state) => state.auth.user?.permissions || []);

  if (role === "Super Admin") return children;

  const perm = permissions.find((p) => p.module === module);

  if (!perm || !perm.actions.includes(action)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PermissionRoute;