import React from 'react';

const InteriorButton = ({ isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full py-4 border border-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all pointer-events-auto"
    >
      {isActive ? 'View Exterior' : 'View Interior'}
    </button>
  );
};

export default InteriorButton;
