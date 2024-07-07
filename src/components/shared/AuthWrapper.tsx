import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { userToken } from "../../shared/helpers";

interface AuthWrapperProps {
  children: React.ReactNode | React.ReactNode[];
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
}) => {
  const { search } = useLocation()
  const token = userToken()
  const redirectUrl = new URLSearchParams(search).get("redirect");
  if (token) {
    return <>{children}</>;
  } else {
    return <Navigate to={redirectUrl || "/login"} />
  }
};

export default AuthWrapper;
