import React, { useState, useEffect } from 'react';

interface PriceRangeFilterProps {
  catalogMin: number;
  catalogMax: number;
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
  idPrefix?: string;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  catalogMin,
  catalogMax,
  minPrice,
  maxPrice,
  onChange,
  idPrefix = 'price'
}) => {
  // Local input string states to allow natural typing/clearing
  const [minInput, setMinInput] = useState(minPrice.toString());
  const [maxInput, setMaxInput] = useState(maxPrice.toString());

  // Slider bounds dynamically expand if user inputs outside catalog boundaries
  const sliderMin = Math.min(catalogMin, minPrice);
  const sliderMax = Math.max(catalogMax, maxPrice);
  const rangeSpan = Math.max(sliderMax - sliderMin, 1);

  // Sync inputs whenever props change (e.g. on reset or slider drag)
  useEffect(() => {
    setMinInput(minPrice.toString());
  }, [minPrice]);

  useEffect(() => {
    setMaxInput(maxPrice.toString());
  }, [maxPrice]);

  // Calculate percentage positions for the active range bar
  const minPercent = Math.max(0, Math.min(100, ((minPrice - sliderMin) / rangeSpan) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((maxPrice - sliderMin) / rangeSpan) * 100));

  // Handle slider drags
  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const clampedMin = Math.min(val, maxPrice);
    onChange(clampedMin, maxPrice);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const clampedMax = Math.max(val, minPrice);
    onChange(minPrice, clampedMax);
  };

  // Handle manual input typing
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setMinInput(raw);
    if (raw !== '') {
      const num = parseInt(raw, 10);
      if (!isNaN(num)) {
        const validatedMin = Math.max(0, Math.min(num, maxPrice));
        onChange(validatedMin, maxPrice);
      }
    }
  };

  const handleMinInputBlur = () => {
    if (minInput === '') {
      setMinInput(catalogMin.toString());
      onChange(catalogMin, maxPrice);
    } else {
      const num = parseInt(minInput, 10);
      if (isNaN(num) || num < 0) {
        setMinInput(catalogMin.toString());
        onChange(catalogMin, maxPrice);
      } else if (num > maxPrice) {
        setMinInput(maxPrice.toString());
        onChange(maxPrice, maxPrice);
      } else {
        setMinInput(num.toString());
        onChange(num, maxPrice);
      }
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setMaxInput(raw);
    if (raw !== '') {
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num >= minPrice) {
        onChange(minPrice, num);
      }
    }
  };

  const handleMaxInputBlur = () => {
    if (maxInput === '') {
      setMaxInput(catalogMax.toString());
      onChange(minPrice, catalogMax);
    } else {
      const num = parseInt(maxInput, 10);
      if (isNaN(num) || num <= 0) {
        setMaxInput(catalogMax.toString());
        onChange(minPrice, catalogMax);
      } else if (num < minPrice) {
        setMaxInput(minPrice.toString());
        onChange(minPrice, minPrice);
      } else {
        setMaxInput(num.toString());
        onChange(minPrice, num);
      }
    }
  };

  const step = Math.max(10, Math.round(rangeSpan / 100));

  return (
    <div className="space-y-3.5">
      {/* Current Range Badge */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#666666] font-medium">Selected Range:</span>
        <span className="font-semibold text-[#2d5a61] bg-[#efe8dc] px-2 py-0.5 rounded-md">
          PKR {minPrice.toLocaleString()} – PKR {maxPrice.toLocaleString()}
        </span>
      </div>

      {/* Dual Slider Track */}
      <div className="relative w-full h-7 flex items-center select-none pt-1">
        {/* Background Track */}
        <div className="absolute w-full h-2 bg-[#e0d8c8] rounded-full" />

        {/* Selected Range Highlight */}
        <div
          className="absolute h-2 bg-[#2d5a61] rounded-full pointer-events-none transition-all duration-75"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`
          }}
        />

        {/* Min Handle */}
        <input
          id={`${idPrefix}-slider-min`}
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={step}
          value={minPrice}
          onChange={handleMinSlider}
          aria-label="Minimum price"
          className={`absolute w-full appearance-none bg-transparent pointer-events-none cursor-pointer
            ${minPrice > sliderMax - rangeSpan * 0.1 ? 'z-30' : 'z-20'}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-4.5
            [&::-webkit-slider-thumb]:h-4.5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#2d5a61]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:hover:scale-115
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-4.5
            [&::-moz-range-thumb]:h-4.5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#2d5a61]
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:shadow-md`}
        />

        {/* Max Handle */}
        <input
          id={`${idPrefix}-slider-max`}
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={step}
          value={maxPrice}
          onChange={handleMaxSlider}
          aria-label="Maximum price"
          className="absolute w-full appearance-none bg-transparent pointer-events-none cursor-pointer z-20
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-4.5
            [&::-webkit-slider-thumb]:h-4.5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#2d5a61]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:hover:scale-115
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-4.5
            [&::-moz-range-thumb]:h-4.5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#2d5a61]
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:shadow-md"
        />
      </div>

      {/* Manual Editable Inputs */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div>
          <label htmlFor={`${idPrefix}-input-min`} className="block text-[11px] font-medium text-[#666666] mb-1">
            Min Price
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#888888]">
              PKR
            </span>
            <input
              id={`${idPrefix}-input-min`}
              type="text"
              inputMode="numeric"
              value={minInput}
              onChange={handleMinInputChange}
              onBlur={handleMinInputBlur}
              className="w-full bg-[#fdfaf5] border border-[#e0d8c8] rounded-xl pl-10 pr-2.5 py-1.5 text-xs font-semibold text-[#333333] focus:outline-none focus:border-[#2d5a61] focus:ring-1 focus:ring-[#2d5a61]"
              placeholder={catalogMin.toString()}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-input-max`} className="block text-[11px] font-medium text-[#666666] mb-1">
            Max Price
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#888888]">
              PKR
            </span>
            <input
              id={`${idPrefix}-input-max`}
              type="text"
              inputMode="numeric"
              value={maxInput}
              onChange={handleMaxInputChange}
              onBlur={handleMaxInputBlur}
              className="w-full bg-[#fdfaf5] border border-[#e0d8c8] rounded-xl pl-10 pr-2.5 py-1.5 text-xs font-semibold text-[#333333] focus:outline-none focus:border-[#2d5a61] focus:ring-1 focus:ring-[#2d5a61]"
              placeholder={catalogMax.toString()}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Catalog Range Info */}
      <div className="flex items-center justify-between text-[10.5px] text-[#777777] px-0.5">
        <span>Catalog Min: PKR {catalogMin.toLocaleString()}</span>
        <span>Catalog Max: PKR {catalogMax.toLocaleString()}</span>
      </div>
    </div>
  );
};
