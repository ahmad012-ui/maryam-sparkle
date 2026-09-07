import React from 'react';
import { Heart, Sliders, Package, Globe } from 'lucide-react';

interface ValuePropsProps {
  onCustomizationClick: () => void;
  onShippingClick: () => void;
}

export const ValueProps: React.FC<ValuePropsProps> = ({
  onCustomizationClick,
  onShippingClick,
}) => {
  return (
    <section className="max-w-5xl mx-auto px-6 md:px-8 pb-14 border-b border-[#e0d8c8]/60">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
        {/* Value 1: Handmade */}
        <div className="flex flex-col items-center group cursor-default">
          <div className="mb-3 text-[#2d5a61] p-3 rounded-full bg-[#fdfaf5] border border-[#e0d8c8]/50 shadow-xs transition-transform group-hover:scale-110">
            <Heart className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-[#333333] mb-0.5 text-sm tracking-wide">Handmade</h3>
          <p className="text-xs text-[#666666]">with love</p>
        </div>

        {/* Value 2: Customization */}
        <button
          onClick={onCustomizationClick}
          className="flex flex-col items-center group cursor-pointer text-center focus:outline-none"
        >
          <div className="mb-3 text-[#2d5a61] p-3 rounded-full bg-[#fdfaf5] border border-[#e0d8c8]/50 shadow-xs transition-transform group-hover:scale-110 group-hover:bg-[#2d5a61] group-hover:text-white">
            <Sliders className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-[#333333] group-hover:text-[#2d5a61] mb-0.5 text-sm tracking-wide transition-colors">
            Customization
          </h3>
          <p className="text-xs text-[#666666]">Available</p>
        </button>

        {/* Value 3: Secure Packaging */}
        <div className="flex flex-col items-center group cursor-default">
          <div className="mb-3 text-[#2d5a61] p-3 rounded-full bg-[#fdfaf5] border border-[#e0d8c8]/50 shadow-xs transition-transform group-hover:scale-110">
            <Package className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-[#333333] mb-0.5 text-sm tracking-wide">Secure Packaging</h3>
          <p className="text-xs text-[#666666]">Signature Gift Box</p>
        </div>

        {/* Value 4: Worldwide */}
        <button
          onClick={onShippingClick}
          className="flex flex-col items-center group cursor-pointer text-center focus:outline-none"
        >
          <div className="mb-3 text-[#2d5a61] p-3 rounded-full bg-[#fdfaf5] border border-[#e0d8c8]/50 shadow-xs transition-transform group-hover:scale-110 group-hover:bg-[#2d5a61] group-hover:text-white">
            <Globe className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-[#333333] group-hover:text-[#2d5a61] mb-0.5 text-sm tracking-wide transition-colors">
            Worldwide
          </h3>
          <p className="text-xs text-[#666666]">Shipping</p>
        </button>
      </div>
    </section>
  );
};
