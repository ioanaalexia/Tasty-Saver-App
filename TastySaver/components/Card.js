import React from "react";

export const Card = ({ children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">{children}</div>
  );
};

export const CardContent = ({ children }) => {
  return <div className="mt-2">{children}</div>;
};

export const CardHeader = ({ children }) => {
  return <h3 className="text-xl font-bold">{children}</h3>;
};
