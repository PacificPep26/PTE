import React from 'react';
import { clsx } from 'clsx';
import { BookOpen } from 'lucide-react';

interface BrandLogoProps {
  theme?: 'light' | 'dark' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export function BrandLogo({
  theme = 'light',
  size = 'md',
  showSubtitle = false,
  className,
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-11 h-11 text-base rounded-2xl',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const isDark = theme === 'dark';
  const isYellow = theme === 'yellow';

  return (
    <div className={clsx('inline-flex items-center gap-2.5 select-none', className)}>
      {/* Icon Emblem */}
      <div
        className={clsx(
          'flex items-center justify-center font-black tracking-tighter shadow-sm flex-shrink-0 transition-transform hover:scale-105',
          iconSizes[size],
          isYellow
            ? 'bg-black text-amber-400'
            : 'bg-gradient-to-br from-amber-400 via-amber-400 to-amber-500 text-gray-950 shadow-amber-400/20'
        )}
      >
        <span className="font-display font-black tracking-tight">PTE</span>
      </div>

      {/* Brand Text */}
      <div className="leading-none flex flex-col justify-center">
        <div
          className={clsx(
            'font-display font-black tracking-tight flex items-center gap-1',
            textSizes[size],
            isDark ? 'text-white' : 'text-gray-900'
          )}
        >
          <span>PTE</span>
          <span className={clsx(isDark ? 'text-amber-400' : 'text-amber-500')}>Study</span>
        </div>
        {showSubtitle && (
          <span
            className={clsx(
              'text-[10px] font-bold tracking-wider uppercase mt-0.5',
              isDark ? 'text-amber-300/80' : 'text-gray-400'
            )}
          >
            AI Learning Platform
          </span>
        )}
      </div>
    </div>
  );
}
