import React from "react";
import { Navigate } from "react-router-dom";
import { userToken } from "../../shared/helpers";

interface AuthWrapperProps {
  children: React.ReactNode | React.ReactNode[];
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
}) => {
  const token = userToken()
  if (token) {
    return <>{children}</>;
  } else {
     return <Navigate to={"/login"}/>
  }
};

export default AuthWrapper;
