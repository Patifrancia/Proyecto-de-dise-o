import React from "react";

export function Switch({ checked, onCheckedChange, id }) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
    />
  );
}
