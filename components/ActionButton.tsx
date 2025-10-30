
import React from 'react';

interface ActionButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ElementType;
}

const ActionButton: React.FC<ActionButtonProps> = ({ text, onClick, disabled, icon: Icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-3 text-xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 rounded-full px-10 py-5 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
    >
      <Icon className="w-6 h-6" />
      <span>{text}</span>
    </button>
  );
};

export default ActionButton;
