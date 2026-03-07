'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Radio, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';

interface NewsItem {
  id: number | string;
  title: string;
  href?: string;
  type?: 'alert' | 'news' | 'event';
  isLive?: boolean;
}

interface BreakingNewsTickerProps {
  items: NewsItem[];
  lang: Language;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

const speedClasses = {
  slow: 'animate-[ticker_45s_linear_infinite]',
  normal: 'animate-[ticker_30s_linear_infinite]',
  fast: 'animate-[ticker_15s_linear_infinite]',
};

export function BreakingNewsTicker({
  items,
  lang,
  speed = 'normal',
  className,
}: BreakingNewsTickerProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <div
      className={cn(
        'relative bg-gradient-to-r from-av-dark-900 via-av-dark-800 to-av-dark-900',
        'border-y border-av-dark-700/50',
        'overflow-hidden',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Live Indicator */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center bg-gradient-to-r from-av-dark-900 via-av-dark-900 to-transparent pr-8 pl-4">
        <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">
            {lang === 'fr' ? 'Direct' : 'Live'}
          </span>
        </div>
      </div>

      {/* Ticker Content */}
      <div className="flex items-center h-10 overflow-hidden">
        <div
          className={cn(
            'flex items-center whitespace-nowrap pl-32',
            speedClasses[speed],
            isHovered && 'pause-animation'
          )}
          style={{
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        >
          {duplicatedItems.map((item, index) => (
            <TickerItem key={`${item.id}-${index}`} item={item} lang={lang} />
          ))}
        </div>
      </div>

      {/* Gradient fade on right */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-av-dark-900 to-transparent z-10 pointer-events-none" />
    </div>
  );
}

// Individual ticker item
function TickerItem({ item, lang }: { item: NewsItem; lang: Language }) {
  const getTypeIcon = () => {
    switch (item.type) {
      case 'alert':
        return <AlertCircle size={14} className="text-red-400" />;
      case 'event':
        return <Radio size={14} className="text-av-blue-400" />;
      default:
        return <ChevronRight size={14} className="text-av-green-400" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'alert':
        return 'text-red-400';
      case 'event':
        return 'text-av-blue-400';
      default:
        return 'text-av-green-400';
    }
  };

  const content = (
    <span className="flex items-center gap-3 mx-8 text-sm">
      {getTypeIcon()}
      <span className={cn('font-medium', getTypeColor())}>
        {item.type === 'alert'
          ? lang === 'fr' ? 'ALERTE:' : 'ALERT:'
          : item.type === 'event'
            ? lang === 'fr' ? 'ÉVÉNEMENT:' : 'EVENT:'
            : ''}
      </span>
      <span className="text-white/90">{item.title}</span>
      {item.isLive && (
        <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
          </span>
          LIVE
        </span>
      )}
      <span className="text-av-dark-500">|</span>
    </span>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className="hover:text-av-green-400 transition-colors duration-200"
      >
        {content}
      </a>
    );
  }

  return content;
}

// Compact Breaking News Banner
interface CompactTickerProps {
  headline: string;
  subheadline?: string;
  href?: string;
  lang: Language;
  className?: string;
}

export function CompactTicker({
  headline,
  subheadline,
  href,
  lang,
  className,
}: CompactTickerProps) {
  const content = (
    <div
      className={cn(
        'flex items-center justify-between',
        'bg-gradient-to-r from-red-600 to-red-500',
        'text-white py-2 px-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {lang === 'fr' ? 'Flash Info' : 'Breaking'}
        </span>
        <span className="font-semibold text-sm">{headline}</span>
        {subheadline && (
          <span className="text-white/80 text-sm hidden md:inline">
            - {subheadline}
          </span>
        )}
      </div>
      {href && (
        <motion.span
          className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {lang === 'fr' ? 'En savoir plus' : 'Learn more'} →
        </motion.span>
      )}
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
