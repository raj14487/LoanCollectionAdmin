import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isCashier = user?.role === "CASHIER";

  useEffect(() => {
    if (!isAuthenticated || isCashier) {
      navigate("/");
    }
  }, [isAuthenticated, isCashier, navigate]);

  if (!isAuthenticated || isCashier) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
