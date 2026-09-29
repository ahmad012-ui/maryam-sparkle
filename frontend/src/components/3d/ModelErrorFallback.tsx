import React from 'react';
import { Image, AlertCircle, RefreshCw } from 'lucide-react';

interface ModelErrorFallbackProps {
  poster: string;
  productName: string;
  errorMessage?: string;
  onRetry?: () => void;
  onSwitchToPhotos?: () => void;
}

export const ModelErrorFallback: React.FC<ModelErrorFallbackProps> = ({
  poster,
  productName,
  errorMessage = '3D model is currently unavailable.',
  onRetry,
  onSwitchToPhotos,
}) => {
  return (
    <div className="relative w-full h-full bg-[#fdfaf5] flex flex-col items-center justify-center overflow-hidden rounded-2xl select-none">
      {/* Background Poster Image */}
      {poster && (
        <img
          src={poster}
          alt={productName}
          className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity"
        />
      )}

      {/* Gentle Soft Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

      {/* Graceful Fallback Message Card */}
      <div className="relative z-10 mx-4 max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-4 text-center border border-[#e0d8c8] shadow-lg">
        <div className="w-8 h-8 rounded-full bg-[#d4b982]/20 text-[#2d5a61] flex items-center justify-center mx-auto mb-2">
          <AlertCircle className="w-4 h-4 text-[#2d5a61]" />
        </div>

        <p className="font-serif text-[#333333] text-sm font-medium">
          3D View Notice
        </p>
        <p className="text-[11px] text-[#666666] mt-1 leading-relaxed">
          {errorMessage} Displaying handcrafted studio photography.
        </p>

        <div className="flex items-center justify-center gap-2 mt-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#2d5a61] border border-[#2d5a61]/30 hover:bg-[#2d5a61]/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}

          {onSwitchToPhotos && (
            <button
              type="button"
              onClick={onSwitchToPhotos}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2d5a61] text-white hover:bg-[#1e3c41] transition-colors shadow-xs cursor-pointer"
            >
              <Image className="w-3 h-3" />
              <span>View Photos</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
