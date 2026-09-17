import React from 'react';

interface TadbeerLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  showSubtitle?: boolean;
  onClick?: () => void;
}

export const TadbeerLogo: React.FC<TadbeerLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  showSubtitle = false,
  onClick,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const containerSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Creative TadbeerGo Emblem Logo Badge */}
      <div
        className={`${containerSize} relative rounded-2xl bg-white flex items-center justify-center p-1 shadow-xs border border-[#00A878]/30 shrink-0 overflow-hidden group hover:border-[#00A878] hover:shadow-sm transition-all`}
      >
        <img
          src="/tadbeergo-logo.png"
          alt="TadbeerGo Logo"
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-108"
          loading="eager"
        />
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black font-sans tracking-tight text-[#063F35]">
              Tadbeer<span className="text-[#00A878]">Go</span>
            </span>
          </div>
          {showSubtitle && (
            <div className="flex items-center gap-1 text-[11px] text-[#6F7D78] font-medium font-heading">
              <span>শায়খ মোখতার আহমাদ</span>
              <span>·</span>
              <span>স্কলার ও শিক্ষক</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TadbeerLogo;
