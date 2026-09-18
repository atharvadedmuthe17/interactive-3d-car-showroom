import React from 'react';

const InteriorButton = ({ isActive, onClick }) => (
  <button 
    onClick={onClick}
    className="px-6 py-2 border border-black rounded-full text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all pointer-events-auto"
  >
    {isActive ? 'View Exterior' : 'View Interior'}
  </button>
);

export default InteriorButton;
