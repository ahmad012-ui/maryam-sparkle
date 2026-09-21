import React from 'react';

interface BrandLogoMarkProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  innerStrokeWidth?: number;
  dotRadius?: number;
}

/**
 * Maryam Sparkle Canonical Brand Logo Mark (Vertical-Square / Diamond Emblem)
 *
 * Used authoritatively for both the Custom Cursor and Full-Screen Loader:
 * "Same mark. Different moments."
 */
export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  className = 'w-full h-full text-[#2d5a61]',
  size,
  strokeWidth = 1.6,
  innerStrokeWidth = 1.1,
  dotRadius = 3.5,
}) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      {/* Outer Vertical-Square / Diamond */}
      <path
        d="M20 2L38 20L20 38L2 20L20 2Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Inner Concentric Diamond */}
      <path
        d="M20 8L32 20L20 32L8 20L20 8Z"
        stroke="currentColor"
        strokeWidth={innerStrokeWidth}
        strokeLinejoin="round"
      />
      {/* Center Artisanal Core */}
      <circle cx="20" cy="20" r={dotRadius} fill="currentColor" />
    </svg>
  );
};
