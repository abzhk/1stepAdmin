import React from "react";

const Backdrop = ({ children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      {children}
    </div>
  );
};

export default Backdrop;