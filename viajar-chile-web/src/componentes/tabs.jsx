import React from "react";

export function Tabs({ value, onValueChange, children }) {
  return <div>{children}</div>;
}

export function TabsList({ children, className = "" }) {
  return <div className={`flex border-b ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children, onClick, className = "" }) {
  return (
    <button
      onClick={() => onClick && onClick(value)}
      className={`flex-1 py-2 text-sm font-medium hover:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
}
