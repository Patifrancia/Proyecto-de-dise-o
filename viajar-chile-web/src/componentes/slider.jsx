import React from "react";

export function Slider({ value, min, max, step, onValueChange, className = "" }) {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={`w-full accent-emerald-600 ${className}`}
    />
  );
}
