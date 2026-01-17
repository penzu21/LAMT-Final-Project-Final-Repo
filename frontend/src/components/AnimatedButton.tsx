import React from 'react';

interface Props {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  active?: boolean;
}

export const AnimatedButton: React.FC<Props> = ({ children, onClick, variant = 'primary', active }) => {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
  const styleClass = variant === 'primary'
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-gray-200 text-gray-800 hover:bg-gray-300";
  const activeClass = active ? "ring-2 ring-blue-500" : "";
  
  return (
    <button className={`${baseClass} ${styleClass} ${activeClass}`} onClick={onClick}>
      {children}
    </button>
  );
};
