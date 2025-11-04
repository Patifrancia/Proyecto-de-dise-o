import React from "react";

export function Button({ children, onClick, variant = "default", size = "md", className = "" }) {
  const base =
    "rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    icon: "p-2",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
