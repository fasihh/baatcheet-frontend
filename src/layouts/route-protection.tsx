import { useUser } from "@/contexts/user";
import React from "react";
import { useNavigate } from "react-router-dom";

function RouteProtection({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { token } = useUser();

  React.useEffect(() => {
    if (!token)
      navigate("/login");
  }, [token]);

  return children;
}

export default RouteProtection;
