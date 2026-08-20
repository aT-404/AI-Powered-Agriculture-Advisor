import React from 'react';
import { Loader2, Sprout } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  text = 'Loading parameters and backend data...',
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="relative flex items-center justify-center mb-4">
          <div className="p-4 bg-agri-100 rounded-full text-agri-600 animate-pulse">
            <Sprout className="w-10 h-10" />
          </div>
          <Loader2 className="absolute w-16 h-16 text-agri-500 animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-700">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="w-8 h-8 text-agri-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-gray-600">{text}</p>
    </div>
  );
};

export default Loading;
