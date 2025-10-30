
import React from 'react';

interface StoryCardProps {
  text: string;
}

const StoryCard: React.FC<StoryCardProps> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-2xl border border-white transition-all duration-500 ease-in-out transform animate-fade-in">
      <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed text-center"
         dangerouslySetInnerHTML={{ __html: text.replace(/(\[.*?\])/g, '<span class="text-purple-500 font-semibold">$1</span>') }}>
      </p>
    </div>
  );
};

export default StoryCard;
