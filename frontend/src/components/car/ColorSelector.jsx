import React from 'react';

const ColorSelector = ({ colors, activeColor, onChange }) => {
  if (!colors) return null;

  return (
    <div className="flex flex-col gap-3 pointer-events-auto">
      <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Exterior Finish</span>
      <div className="flex gap-4">
        {colors.map((color) => (
          <button
            key={color.hex}
            onClick={() => onChange(color.hex)}
            className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${
              activeColor === color.hex ? 'border-black scale-110 shadow-lg' : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector; // 🔴 This fixes 'export default' error
