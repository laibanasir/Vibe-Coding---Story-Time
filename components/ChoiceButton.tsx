
import React from 'react';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto flex-1 text-lg font-bold text-white bg-gradient-to-r from-pink-400 to-orange-300 rounded-xl px-8 py-4 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {text}
    </button>
  );
};

export default ChoiceButton;
