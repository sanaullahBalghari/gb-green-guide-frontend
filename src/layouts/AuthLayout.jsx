import { Navigate, useLocation } from "react-router-dom";
import protectedRoutes from "../config/protectedRoutes.js";
import { useAuth } from "../context/AuthContext";

const AuthLayout = ({ children }) => {
  const location = useLocation();
  const { token, user } = useAuth();

  // ✅ Prefix match instead of exact
  const isProtected = protectedRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  if (isProtected && (!token || !user)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthLayout;
