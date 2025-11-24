import { useUser } from "@/contexts/user";
import React from "react";
import { useNavigate } from "react-router-dom";

function RouteProtection({
  children,
  redirect,
  predicate = (token) => !token
}: { children: React.ReactNode, redirect?: string, predicate?: (token?: string | null) => boolean }) {
  const navigate = useNavigate();
  const { token } = useUser();

  React.useEffect(() => {
    if (predicate(token))
      navigate(redirect || "/login");
  }, [token]);

  return children;
}

export default RouteProtection;
