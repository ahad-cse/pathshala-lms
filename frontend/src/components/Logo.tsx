'use client';

import React, { useId } from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showWordmark?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function LogoIcon({ size = 36 }: { size?: number }) {
  const reactId = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id={`psBrandGrad-${reactId}`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A3D" />
          <stop offset="60%" stopColor="#F2662A" />
          <stop offset="100%" stopColor="#D9480F" />
        </linearGradient>
        <linearGradient id={`pageGradLeft-${reactId}`} x1="8" y1="12" x2="20" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF0E6" />
        </linearGradient>
        <linearGradient id={`pageGradRight-${reactId}`} x1="20" y1="12" x2="32" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFE4D6" />
        </linearGradient>
        <linearGradient id={`goldCapGrad-${reactId}`} x1="12" y1="6" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="40%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id={`psEmblemShadow-${reactId}`} x="0" y="2" width="40" height="40" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#F2662A" floodOpacity="0.38" />
        </filter>
      </defs>

      {/* Radiant Brand Squircle Base */}
      <rect width="40" height="40" rx="10" fill={`url(#psBrandGrad-${reactId})`} filter={`url(#psEmblemShadow-${reactId})`} />

      {/* Subtle Gloss Border Highlight */}
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="#FFFFFF" strokeOpacity="0.25" fill="none" />

      {/* Creative Motif: Open Knowledge Book + Graduation Mortarboard + Enlightenment Star */}
      <g transform="translate(0, 1)">
        {/* Open Book - Left Wing / Page of Knowledge */}
        <path
          d="M20 31 C16.5 28.5 12.5 27 7.5 27.5 C6.7 27.6 6 26.9 6 26.1 V14.5 C6 13.7 6.7 13 7.5 13.1 C12 13.6 16.5 15.5 20 18.5 Z"
          fill={`url(#pageGradLeft-${reactId})`}
        />
        <path
          d="M9.5 16 C13 16.5 16.5 18 19 20"
          stroke="#F2662A"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />

        {/* Open Book - Right Wing / Page of Skill Growth */}
        <path
          d="M20 31 C23.5 28.5 27.5 27 32.5 27.5 C33.3 27.6 34 26.9 34 26.1 V14.5 C34 13.7 33.3 13 32.5 13.1 C28 13.6 23.5 15.5 20 18.5 Z"
          fill={`url(#pageGradRight-${reactId})`}
        />
        <path
          d="M30.5 16 C27 16.5 23.5 18 21 20"
          stroke="#C2410C"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />

        {/* Center Spine Beam */}
        <path
          d="M19.25 32 C19.75 31.7 20.25 31.7 20.75 32 V19 C20.25 18.7 19.75 18.7 19.25 19 Z"
          fill="#FFFFFF"
          opacity="0.95"
        />

        {/* Graduation Mortarboard / Ascending Mastery Diamond */}
        <path
          d="M20 7.5 L28 11.5 L20 15.5 L12 11.5 Z"
          fill={`url(#goldCapGrad-${reactId})`}
        />
        <path
          d="M14.5 13 L20 15.5 L25.5 13 L24 14.5 C21.5 16 18.5 16 16 14.5 Z"
          fill="#B45309"
          opacity="0.6"
        />

        {/* Golden 4-Point Learning Star (Zenith of Enlightenment) */}
        <path
          d="M20 3.8 L21 6.5 L23.5 7.2 L21 7.9 L20 10.5 L19 7.9 L16.5 7.2 L19 6.5 Z"
          fill="#FFFFFF"
        />
        <circle cx="20" cy="7.2" r="0.8" fill="#FFE55C" />
      </g>
    </svg>
  );
}

export default function Logo({
  size = 'md',
  showWordmark = true,
  showBadge = true,
  badgeText = 'LMS',
  href,
  onClick,
  className = '',
  style,
}: LogoProps) {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 28
      : size === 'md'
      ? 36
      : size === 'lg'
      ? 44
      : 56;

  const wordmarkFontSize =
    typeof size === 'number'
      ? Math.max(14, Math.round(size * 0.5))
      : size === 'sm'
      ? '15px'
      : size === 'md'
      ? '18px'
      : size === 'lg'
      ? '22px'
      : '26px';

  const badgeFontSize =
    typeof size === 'number'
      ? `${Math.max(8, Math.round(size * 0.24))}px`
      : size === 'sm'
      ? '8px'
      : size === 'md'
      ? '9px'
      : size === 'lg'
      ? '10px'
      : '11px';

  const content = (
    <div
      className={`brand-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : size === 'lg' || size === 'xl' ? '12px' : '10px',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <LogoIcon size={pixelSize} />

      {showWordmark && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: wordmarkFontSize,
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-display)',
              lineHeight: 1,
            }}
          >
            PathShala
          </span>

          {showBadge && (
            <span
              style={{
                fontSize: badgeFontSize,
                fontWeight: 700,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-soft)',
                padding: '1px 5.5px',
                borderRadius: '99px',
                border: '1px solid rgba(242, 102, 42, 0.2)',
                lineHeight: 1.15,
                letterSpacing: '0.05em',
                transform: 'translateY(-1px)',
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        title="PathShala Home"
        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
