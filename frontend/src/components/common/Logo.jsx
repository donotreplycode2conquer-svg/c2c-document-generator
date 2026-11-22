import React from 'react';

/**
 * Code2Conquer Brand Logo
 * Matches the official design from company documents:
 * - Rounded dark navy icon with cyan/blue </> code brackets
 * - "Code2Conquer" typography (Navy with electric blue '2')
 * - "LEARN • BUILD • CONQUER" tagline
 */
export const Logo = ({ size = 'md', className = '', customLogo = null, variant = 'dark' }) => {
  if (customLogo) {
    return (
      <img
        src={customLogo}
        alt="Code2Conquer Logo"
        className={`object-contain ${size === 'sm' ? 'h-8' : size === 'lg' ? 'h-16' : 'h-12'} ${className}`}
      />
    );
  }

  const sizes = {
    sm: {
      iconBox: 'w-7 h-7 rounded-lg',
      iconSvg: 'w-4 h-4',
      title: 'text-base',
      tagline: 'text-[7px] tracking-[0.20em]'
    },
    md: {
      iconBox: 'w-9 h-9 rounded-xl',
      iconSvg: 'w-5 h-5',
      title: 'text-xl',
      tagline: 'text-[8.5px] tracking-[0.22em]'
    },
    lg: {
      iconBox: 'w-11 h-11 rounded-2xl',
      iconSvg: 'w-6 h-6',
      title: 'text-2xl',
      tagline: 'text-[10px] tracking-[0.25em]'
    }
  };

  const s = sizes[size] || sizes.md;
  const isLight = variant === 'light';

  return (
    <div className={`flex flex-col items-center select-none text-center pt-1.5 pb-1.5 px-2 ${className}`}>
      {/* Top Code Icon Badge with extra margin so top is never clipped */}
      <div
        className={`${s.iconBox} flex items-center justify-center shadow-sm mb-1.5 shrink-0 ${
          isLight
            ? 'bg-white text-navy-950 border border-slate-200'
            : 'bg-[#0B192C] text-[#38BDF8] border border-slate-700/60 shadow-md'
        }`}
        style={{ boxSizing: 'border-box' }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={s.iconSvg}
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      <div
        className={`${s.title} font-black tracking-tight leading-snug py-0.5 ${
          isLight ? 'text-white' : 'text-[#0B192C]'
        }`}
      >
        <span>Code</span>
        <span className="text-[#2563EB]">2</span>
        <span>Conquer</span>
      </div>

      {/* Official Tagline with proper line-height so bottom is never clipped */}
      <div
        className={`${s.tagline} font-bold uppercase leading-normal mt-0.5 ${
          isLight ? 'text-slate-300' : 'text-slate-500'
        }`}
      >
        LEARN • BUILD • CONQUER
      </div>
    </div>
  );
};

export default Logo;
