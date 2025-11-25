import { useUser } from "@/contexts/user";
import React from "react";
import { Navigate } from "react-router-dom";

function RouteProtection({
  children,
  redirect,
  predicate = (token) => !token
}: { children: React.ReactNode, redirect?: string, predicate?: (token?: string | null) => boolean }) {
  const { token } = useUser();

  if (predicate(token))
    return <Navigate to={redirect || "/login"} />;

  return children;
}

export default RouteProtection;
