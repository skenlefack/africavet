'use client';

import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';

type AdSize = 'leaderboard' | 'medium-rectangle' | 'wide-skyscraper' | 'large-rectangle' | 'half-page' | 'mobile-banner';

interface AdBannerProps {
  size: AdSize;
  slot?: string; // Ad slot identifier for actual ad networks
  className?: string;
  lang?: Language;
  fallbackContent?: React.ReactNode;
}

const adSizes: Record<AdSize, { width: number; height: number; label: string }> = {
  'leaderboard': { width: 728, height: 90, label: 'Leaderboard (728x90)' },
  'medium-rectangle': { width: 300, height: 250, label: 'Medium Rectangle (300x250)' },
  'wide-skyscraper': { width: 160, height: 600, label: 'Wide Skyscraper (160x600)' },
  'large-rectangle': { width: 336, height: 280, label: 'Large Rectangle (336x280)' },
  'half-page': { width: 300, height: 600, label: 'Half Page (300x600)' },
  'mobile-banner': { width: 320, height: 50, label: 'Mobile Banner (320x50)' },
};

export function AdBanner({
  size,
  slot,
  className,
  lang = 'fr',
  fallbackContent,
}: AdBannerProps) {
  const { width, height, label } = adSizes[size];

  return (
    <div
      className={cn(
        'ad-container relative mx-auto',
        className
      )}
      style={{
        width: '100%',
        maxWidth: `${width}px`,
        height: `${height}px`,
      }}
      data-ad-slot={slot}
      data-ad-size={size}
    >
      {fallbackContent || (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <svg
            className="w-8 h-8 mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span className="text-xs font-medium">{label}</span>
          <span className="text-[10px] opacity-60 mt-1">
            {lang === 'fr' ? 'Espace publicitaire' : 'Advertisement'}
          </span>
        </div>
      )}
    </div>
  );
}

// Sticky Sidebar Ad
interface StickyAdProps {
  size?: 'medium-rectangle' | 'half-page' | 'wide-skyscraper';
  slot?: string;
  className?: string;
  lang?: Language;
  topOffset?: number;
}

export function StickyAd({
  size = 'medium-rectangle',
  slot,
  className,
  lang = 'fr',
  topOffset = 100,
}: StickyAdProps) {
  return (
    <div
      className={cn('sticky', className)}
      style={{ top: `${topOffset}px` }}
    >
      <AdBanner size={size} slot={slot} lang={lang} />
    </div>
  );
}

// Ad Section with Label
interface AdSectionProps {
  size: AdSize;
  slot?: string;
  className?: string;
  lang?: Language;
  showLabel?: boolean;
}

export function AdSection({
  size,
  slot,
  className,
  lang = 'fr',
  showLabel = true,
}: AdSectionProps) {
  return (
    <div className={cn('py-4', className)}>
      {showLabel && (
        <p className="text-center text-xs text-gray-400 mb-2 uppercase tracking-wider">
          {lang === 'fr' ? 'Publicité' : 'Advertisement'}
        </p>
      )}
      <AdBanner size={size} slot={slot} lang={lang} />
    </div>
  );
}

// Top Banner Ad (Full width)
interface TopBannerAdProps {
  slot?: string;
  className?: string;
  lang?: Language;
}

export function TopBannerAd({ slot, className, lang = 'fr' }: TopBannerAdProps) {
  return (
    <div
      className={cn(
        'w-full bg-gray-50 py-2 flex justify-center',
        className
      )}
    >
      <AdBanner size="leaderboard" slot={slot} lang={lang} />
    </div>
  );
}

// Native Ad Card (Looks like content)
interface NativeAdCardProps {
  title: string;
  description: string;
  image?: string;
  sponsor: string;
  href: string;
  className?: string;
  lang?: Language;
}

export function NativeAdCard({
  title,
  description,
  image,
  sponsor,
  href,
  className,
  lang = 'fr',
}: NativeAdCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={cn(
        'block glass-card-solid overflow-hidden group',
        'border-2 border-dashed border-transparent',
        'hover:border-gray-200',
        className
      )}
    >
      {image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
            {lang === 'fr' ? 'Sponsorisé' : 'Sponsored'}
          </span>
        </div>
      )}
      <div className="p-4">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
          {sponsor}
        </p>
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-av-green-600 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </a>
  );
}

// In-feed Ad placeholder
interface InFeedAdProps {
  className?: string;
  lang?: Language;
}

export function InFeedAd({ className, lang = 'fr' }: InFeedAdProps) {
  return (
    <div
      className={cn(
        'bg-gray-50 border border-gray-200 rounded-xl p-4',
        'flex items-center justify-center min-h-[200px]',
        className
      )}
    >
      <div className="text-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {lang === 'fr' ? 'Contenu sponsorisé' : 'Sponsored content'}
        </span>
        <div className="mt-2 text-gray-300">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
