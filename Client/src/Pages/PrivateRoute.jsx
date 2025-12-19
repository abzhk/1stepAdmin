import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/admin/verify-token", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        setAuthorized(false);
      }
    };

    verify();
  }, []);

  if (authorized === null) return null; 
  return authorized ? children : <Navigate to="/log" replace />;
};

export default PrivateRoute;
