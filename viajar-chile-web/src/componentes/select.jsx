import React from "react";

export function Select({ value, onValueChange, children }) {
  return <div className="relative">{children}</div>;
}

export function SelectTrigger({ children, className = "" }) {
  return (
    <div
      className={`flex justify-between items-center border rounded-lg px-3 py-2 bg-white text-gray-800 cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }) {
  return <span className="text-gray-500">{placeholder}</span>;
}

export function SelectContent({ children }) {
  return <div className="mt-1 border rounded-lg bg-white shadow">{children}</div>;
}

export function SelectItem({ value, children, onClick }) {
  return (
    <div
      onClick={() => onClick && onClick(value)}
      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
    >
      {children}
    </div>
  );
}
