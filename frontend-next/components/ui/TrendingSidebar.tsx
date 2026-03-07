'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Eye, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { AnimatedSection, staggerItem } from './AnimatedSection';

interface TrendingArticle {
  id: number | string;
  title: string;
  slug: string;
  views?: number;
  published_at?: string;
  category?: string;
  image?: string;
}

interface TrendingSidebarProps {
  articles: TrendingArticle[];
  lang: Language;
  title?: string;
  className?: string;
  showRanking?: boolean;
  maxItems?: number;
}

export function TrendingSidebar({
  articles,
  lang,
  title,
  className,
  showRanking = true,
  maxItems = 5,
}: TrendingSidebarProps) {
  const displayArticles = articles.slice(0, maxItems);

  return (
    <AnimatedSection
      animation="fadeInRight"
      className={cn('glass-card-solid', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-av-orange-100 rounded-lg">
          <TrendingUp className="w-5 h-5 text-av-orange-500" />
        </div>
        <h3 className="font-bold text-lg text-av-dark-900">
          {title || (lang === 'fr' ? 'Tendances' : 'Trending Now')}
        </h3>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {displayArticles.map((article, index) => (
          <motion.a
            key={article.id}
            href={`/${lang}/news/${article.slug}`}
            className="group flex gap-3 items-start"
            variants={staggerItem}
            whileHover={{ x: 4 }}
          >
            {/* Ranking Number */}
            {showRanking && (
              <span
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                  index === 0
                    ? 'bg-av-orange-500 text-white'
                    : index === 1
                      ? 'bg-av-orange-400 text-white'
                      : index === 2
                        ? 'bg-av-orange-300 text-av-dark-900'
                        : 'bg-gray-100 text-gray-500'
                )}
              >
                {index + 1}
              </span>
            )}

            {/* Article Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-av-dark-900 line-clamp-2 group-hover:text-av-green-600 transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                {article.views && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye size={12} />
                    {formatViews(article.views)}
                  </span>
                )}
                {article.published_at && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {formatTimeAgo(article.published_at, lang)}
                  </span>
                )}
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* View All Link */}
      <a
        href={`/${lang}/news`}
        className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100 text-sm font-medium text-av-green-600 hover:text-av-green-700 transition-colors group"
      >
        {lang === 'fr' ? 'Voir toutes les actualités' : 'View all news'}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </a>
    </AnimatedSection>
  );
}

// Compact Trending List (for smaller spaces)
interface CompactTrendingProps {
  articles: TrendingArticle[];
  lang: Language;
  className?: string;
}

export function CompactTrending({ articles, lang, className }: CompactTrendingProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {articles.slice(0, 4).map((article, index) => (
        <a
          key={article.id}
          href={`/${lang}/news/${article.slug}`}
          className="flex items-center gap-2 group"
        >
          <span className="text-lg font-bold text-av-orange-500">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-sm text-av-dark-800 line-clamp-1 group-hover:text-av-green-600 transition-colors">
            {article.title}
          </span>
        </a>
      ))}
    </div>
  );
}

// Trending with Images
interface TrendingWithImagesProps {
  articles: TrendingArticle[];
  lang: Language;
  className?: string;
}

export function TrendingWithImages({ articles, lang, className }: TrendingWithImagesProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {articles.slice(0, 4).map((article, index) => (
        <a
          key={article.id}
          href={`/${lang}/news/${article.slug}`}
          className="flex gap-3 group"
        >
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-av-green-500 to-av-green-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white/30">
                  {index + 1}
                </span>
              </div>
            )}
            {/* Ranking Badge */}
            <span
              className={cn(
                'absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                index === 0
                  ? 'bg-av-orange-500 text-white'
                  : 'bg-white/90 text-av-dark-700'
              )}
            >
              {index + 1}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 py-0.5">
            {article.category && (
              <span className="text-[10px] font-semibold text-av-green-600 uppercase tracking-wider">
                {article.category}
              </span>
            )}
            <h4 className="font-medium text-sm text-av-dark-900 line-clamp-2 mt-0.5 group-hover:text-av-green-600 transition-colors">
              {article.title}
            </h4>
            {article.published_at && (
              <span className="text-[11px] text-gray-500 mt-1 block">
                {formatTimeAgo(article.published_at, lang)}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

// Helper functions
function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

function formatTimeAgo(dateString: string, lang: Language): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return lang === 'fr' ? `Il y a ${diffMins} min` : `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return lang === 'fr' ? `Il y a ${diffHours}h` : `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return lang === 'fr' ? `Il y a ${diffDays}j` : `${diffDays}d ago`;
  }

  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}
