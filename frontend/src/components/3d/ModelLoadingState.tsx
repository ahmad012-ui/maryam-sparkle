import React from 'react';
import { BrandLogoMark } from '../BrandLogoMark';

interface ModelLoadingStateProps {
  progress?: number;
  productName?: string;
}

export const ModelLoadingState: React.FC<ModelLoadingStateProps> = ({
  progress,
  productName,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#fdfaf5]/90 backdrop-blur-xs p-6 select-none transition-opacity duration-300">
      {/* Brand Diamond Emblem Spinner */}
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 text-[#2d5a61] animate-[spin_4s_linear_infinite]">
          <BrandLogoMark strokeWidth={1.5} innerStrokeWidth={1} dotRadius={3} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#d4b982] animate-ping" />
        </div>
      </div>

      <p className="font-serif text-[#2d5a61] text-sm tracking-wide font-medium">
        Loading 3D view...
      </p>

      {productName && (
        <p className="text-[11px] text-[#777777] mt-1 max-w-[200px] truncate text-center">
          {productName}
        </p>
      )}

      {typeof progress === 'number' && progress > 0 && progress < 100 && (
        <div className="w-36 h-1 bg-[#e0d8c8] rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#2d5a61] transition-all duration-200"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
      )}
    </div>
  );
};
