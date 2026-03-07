'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { getImageUrl } from '@/lib/utils';
import { AnimatedSection, AnimatedItem, staggerContainer } from '@/components/ui/AnimatedSection';

interface NewsPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  author_name?: string;
  published_at?: string;
  category_name?: string;
  reading_time?: number;
}

interface NewsGridProps {
  posts: NewsPost[];
  lang: Language;
  t: Translation;
  title?: string;
  showMoreLink?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function NewsGrid({
  posts,
  lang,
  t,
  title,
  showMoreLink = true,
  columns = 3,
  className,
}: NewsGridProps) {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <AnimatedSection animation="fadeInUp" className={cn('py-12 px-4 md:px-[5%]', className)}>
      <div className="container mx-auto">
        {/* Section Header */}
        {title && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="section-title-bar" />
              <h2 className="section-title">{title}</h2>
            </div>
            {showMoreLink && (
              <a
                href={`/${lang}/news`}
                className="flex items-center gap-2 text-av-green-600 hover:text-av-green-700 font-medium transition-colors group"
              >
                {lang === 'fr' ? 'Voir tout' : 'View all'}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </a>
            )}
          </div>
        )}

        {/* Grid */}
        <motion.div
          className={cn('grid grid-cols-1 gap-6', columnClasses[columns])}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} lang={lang} />
          ))}
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

// Individual News Card
interface NewsCardProps {
  post: NewsPost;
  lang: Language;
  variant?: 'default' | 'horizontal' | 'featured';
}

export function NewsCard({ post, lang, variant = 'default' }: NewsCardProps) {
  if (variant === 'horizontal') {
    return (
      <AnimatedItem>
        <motion.a
          href={`/${lang}/news/${post.slug}`}
          className="glass-card-solid flex gap-4 overflow-hidden group"
          whileHover={{ y: -4 }}
        >
          {/* Thumbnail */}
          <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
            {post.featured_image ? (
              <Image
                src={getImageUrl(post.featured_image)}
                alt={post.title}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-av-green-500 to-av-green-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 py-1">
            {post.category_name && (
              <span className="text-xs font-semibold text-av-green-600 uppercase tracking-wider">
                {post.category_name}
              </span>
            )}
            <h3 className="font-semibold text-av-dark-900 line-clamp-2 mt-1 group-hover:text-av-green-600 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {post.published_at && (
                <span>{formatDate(post.published_at, lang)}</span>
              )}
            </div>
          </div>
        </motion.a>
      </AnimatedItem>
    );
  }

  if (variant === 'featured') {
    return (
      <AnimatedItem>
        <motion.a
          href={`/${lang}/news/${post.slug}`}
          className="block relative h-[400px] rounded-2xl overflow-hidden group"
          whileHover={{ y: -4 }}
        >
          {/* Background Image */}
          {post.featured_image ? (
            <Image
              src={getImageUrl(post.featured_image)}
              alt={post.title}
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-av-green-600 to-av-green-800" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {post.category_name && (
              <span className="inline-block w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-av-green-500 text-white mb-3">
                {post.category_name}
              </span>
            )}
            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-av-green-300 transition-colors">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-white/80 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-white/70 text-sm">
              {post.author_name && (
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {post.author_name}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(post.published_at, lang)}
                </span>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-av-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.a>
      </AnimatedItem>
    );
  }

  // Default card
  return (
    <AnimatedItem>
      <motion.a
        href={`/${lang}/news/${post.slug}`}
        className="glass-card-solid overflow-hidden group block"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {post.featured_image ? (
            <Image
              src={getImageUrl(post.featured_image)}
              alt={post.title}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-av-green-500 to-av-green-600 flex items-center justify-center">
              <span className="text-6xl text-white/20 font-bold">AV</span>
            </div>
          )}

          {/* Category Badge */}
          {post.category_name && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-av-green-500 text-white shadow-lg">
              {post.category_name}
            </span>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-av-dark-900 line-clamp-2 mb-2 group-hover:text-av-green-600 transition-colors">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(post.published_at, lang)}
                </span>
              )}
              {post.reading_time && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {post.reading_time} min
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-av-green-600 font-medium group-hover:gap-2 transition-all">
              {lang === 'fr' ? 'Lire' : 'Read'}
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </motion.a>
    </AnimatedItem>
  );
}

// Compact News List
interface CompactNewsListProps {
  posts: NewsPost[];
  lang: Language;
  title?: string;
  className?: string;
}

export function CompactNewsList({ posts, lang, title, className }: CompactNewsListProps) {
  return (
    <div className={cn('glass-card-solid', className)}>
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="section-title-bar" />
          <h3 className="font-bold text-lg text-av-dark-900">{title}</h3>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <a
            key={post.id}
            href={`/${lang}/news/${post.slug}`}
            className="flex gap-3 group"
          >
            {post.featured_image && (
              <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={getImageUrl(post.featured_image)}
                  alt={post.title}
                  fill
                  className="object-cover object-top transition-transform group-hover:scale-110"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-av-dark-900 line-clamp-2 group-hover:text-av-green-600 transition-colors">
                {post.title}
              </h4>
              {post.published_at && (
                <span className="text-xs text-gray-500 mt-1 block">
                  {formatDate(post.published_at, lang)}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// Helper function
function formatDate(dateString: string, lang: Language): string {
  return new Date(dateString).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );
}
