'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { getImageUrl } from '@/lib/utils';

interface FeaturedPost {
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

interface HeroMagazineProps {
  lang: Language;
  t: Translation;
  posts: FeaturedPost[];
  className?: string;
}

export function HeroMagazine({ lang, t, posts, className }: HeroMagazineProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const featuredPosts = posts.slice(0, 5);

  // Ensure proper hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset index when posts change
  useEffect(() => {
    setActiveIndex(0);
    setIsAutoPlaying(true);
  }, [posts]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredPosts.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredPosts.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredPosts.length]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % featuredPosts.length);
  };

  if (featuredPosts.length === 0) {
    return null;
  }

  const currentPost = featuredPosts[activeIndex];

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Main Hero Area */}
      <div className="relative h-[400px] md:h-[450px] lg:h-[500px]">
        {/* Background Images with Ken Burns Effect */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            {currentPost.featured_image ? (
              <Image
                src={getImageUrl(currentPost.featured_image)}
                alt={currentPost.title}
                fill
                className="object-cover object-top animate-ken-burns"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-av-green-600 via-av-green-700 to-av-dark-800" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-[5%] pb-12 md:pb-16">
            <div className="max-w-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPost.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Category Badge */}
                  {currentPost.category_name && (
                    <motion.span
                      className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-av-green-500 text-white mb-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentPost.category_name}
                    </motion.span>
                  )}

                  {/* Title */}
                  <motion.h1
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight text-shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {currentPost.title}
                  </motion.h1>

                  {/* Excerpt */}
                  {currentPost.excerpt && (
                    <motion.p
                      className="text-lg text-white/80 mb-6 line-clamp-2 max-w-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentPost.excerpt}
                    </motion.p>
                  )}

                  {/* Meta Info */}
                  <motion.div
                    className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentPost.author_name && (
                      <span className="flex items-center gap-2">
                        <User size={14} />
                        {currentPost.author_name}
                      </span>
                    )}
                    {currentPost.published_at && (
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(currentPost.published_at).toLocaleDateString(
                          lang === 'fr' ? 'fr-FR' : 'en-US',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )}
                      </span>
                    )}
                    {currentPost.reading_time && (
                      <span className="flex items-center gap-2">
                        <Clock size={14} />
                        {currentPost.reading_time} min {lang === 'fr' ? 'de lecture' : 'read'}
                      </span>
                    )}
                  </motion.div>

                  {/* CTA Button */}
                  <motion.a
                    href={`/${lang}/news/${currentPost.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-av-dark-900 font-semibold transition-all duration-300 hover:bg-av-green-500 hover:text-white group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {lang === 'fr' ? 'Lire l\'article' : 'Read article'}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </motion.a>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {featuredPosts.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Thumbnail Navigation */}
        {featuredPosts.length > 1 && (
          <div className="absolute bottom-4 right-4 md:right-[5%] flex gap-2">
            {featuredPosts.map((post, index) => (
              <button
                key={post.id}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveIndex(index);
                }}
                className={cn(
                  'relative w-16 h-10 md:w-20 md:h-12 rounded-lg overflow-hidden transition-all duration-300',
                  index === activeIndex
                    ? 'ring-2 ring-av-green-500 ring-offset-2 ring-offset-black/50 scale-110'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                {post.featured_image ? (
                  <Image
                    src={getImageUrl(post.featured_image)}
                    alt={post.title}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-av-green-600" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Progress Indicator */}
        {featuredPosts.length > 1 && isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-av-green-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 6, ease: 'linear' }}
              key={activeIndex}
            />
          </div>
        )}
      </div>

      {/* Secondary Stories Row */}
      <div className="bg-av-dark-900 py-4 px-4 md:px-[5%]">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide">
            {posts.slice(5, 10).map((post, index) => (
              <motion.a
                key={post.id}
                href={`/${lang}/news/${post.slug}`}
                className="flex-shrink-0 flex items-center gap-3 bg-white/5 rounded-lg p-3 min-w-[280px] hover:bg-white/10 transition-colors group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  {post.featured_image ? (
                    <Image
                      src={getImageUrl(post.featured_image)}
                      alt={post.title}
                      fill
                      className="object-cover object-top transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-av-green-600/30" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-av-green-400 transition-colors">
                    {post.title}
                  </h3>
                  {post.published_at && (
                    <p className="text-xs text-white/50 mt-1">
                      {new Date(post.published_at).toLocaleDateString(
                        lang === 'fr' ? 'fr-FR' : 'en-US',
                        { day: 'numeric', month: 'short' }
                      )}
                    </p>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
