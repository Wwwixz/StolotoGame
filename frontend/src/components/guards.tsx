import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "../role";

export function RequireRole() {
  const { role } = useRole();
  if (role === null) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { role } = useRole();
  if (role !== "admin") return <Navigate to="/lobby" replace />;
  return <Outlet />;
}
