'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Calendar, ArrowRight, Beef, Fish, TreePine, Heart, Pill, Shield, Mic, Play, Eye, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { getImageUrl } from '@/lib/utils';

interface NewsPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
  category_name?: string;
  category_slug?: string;
  type?: string;
  view_count?: number;
  comments_count?: number;
}

interface CategoryConfig {
  id: string;
  slug: string;
  label: { fr: string; en: string };
  icon: React.ElementType;
  color: string;
  bgColor: string;
  gradient: string;
}

const categories: CategoryConfig[] = [
  {
    id: 'elevage',
    slug: 'elevage',
    label: { fr: 'Élevage', en: 'Livestock' },
    icon: Beef,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'peches',
    slug: 'peches',
    label: { fr: 'Pêches', en: 'Fisheries' },
    icon: Fish,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'faune',
    slug: 'faune',
    label: { fr: 'Faune', en: 'Wildlife' },
    icon: TreePine,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    id: 'one-health',
    slug: 'one-health',
    label: { fr: 'One Health', en: 'One Health' },
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    id: 'sante-animale',
    slug: 'sante-animale',
    label: { fr: 'Santé animale', en: 'Animal Health' },
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    id: 'antibioresistance',
    slug: 'antibioresistance',
    label: { fr: 'Antibiorésistance', en: 'AMR' },
    icon: Pill,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    gradient: 'from-red-500 to-rose-500',
  },
];

interface CategorizedNewsProps {
  posts: NewsPost[];
  lang: Language;
  className?: string;
}

export function CategorizedNews({ posts, lang, className }: CategorizedNewsProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  const activeCategoryConfig = categories.find((c) => c.id === activeCategory)!;

  // Filter posts by active category
  const filteredPosts = posts.filter(
    (post) => post.category_slug === activeCategory
  ).slice(0, 3);

  // Get latest interview posts
  const interviewPosts = posts.filter(
    (post) => post.type === 'interview'
  ).slice(0, 3);

  // If no posts for this category, show placeholder
  const displayPosts = filteredPosts.length > 0 ? filteredPosts : [];

  return (
    <section className={cn('py-12 px-4 md:px-[5%]', className)}>
      <div className="container mx-auto">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - col-8 - Thematic Tabs and News */}
          <div className="lg:col-span-8">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all duration-300',
                      isActive
                        ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                        : `${category.bgColor} ${category.color} hover:shadow-md`
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={18} />
                    {category.label[lang]}
                  </motion.button>
                );
              })}
            </div>

            {/* News Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {displayPosts.length > 0 ? (
                  displayPosts.map((post, index) => (
                    <motion.a
                      key={post.id}
                      href={`/${lang}/news/${post.slug}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                      whileHover={{ y: -5 }}
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        {post.featured_image ? (
                          <Image
                            src={getImageUrl(post.featured_image)}
                            alt={post.title}
                            fill
                            className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className={cn(
                            'w-full h-full bg-gradient-to-br flex items-center justify-center',
                            activeCategoryConfig.gradient
                          )}>
                            <activeCategoryConfig.icon size={40} className="text-white/30" />
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className={cn(
                          'absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r',
                          activeCategoryConfig.gradient
                        )}>
                          {activeCategoryConfig.label[lang]}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#3463b5] group-hover:to-[#6faf4c] transition-all duration-300">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-gray-600 text-base line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {post.published_at && (
                              <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {new Date(post.published_at).toLocaleDateString(
                                  lang === 'fr' ? 'fr-FR' : 'en-US',
                                  { day: 'numeric', month: 'short' }
                                )}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Eye size={14} />
                              {post.view_count || 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MessageCircle size={14} />
                              {post.comments_count || 0}
                            </span>
                          </div>
                          <span className={cn(
                            'flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2',
                            activeCategoryConfig.color
                          )}>
                            {lang === 'fr' ? 'Lire' : 'Read'}
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </motion.a>
                  ))
                ) : (
                  // Placeholder cards when no posts
                  [...Array(3)].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                    >
                      <div className={cn(
                        'h-44 bg-gradient-to-br flex items-center justify-center',
                        activeCategoryConfig.gradient
                      )}>
                        <activeCategoryConfig.icon size={40} className="text-white/30" />
                      </div>
                      <div className="p-4">
                        <div className="h-5 bg-gray-100 rounded-lg mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                        <div className="pt-3 mt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400 text-center">
                            {lang === 'fr' ? 'Aucun article' : 'No articles'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>

            {/* View All Button */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <a
                href={`/${lang}/news?category=${activeCategory}`}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r',
                  activeCategoryConfig.gradient
                )}
              >
                {lang === 'fr' ? 'Voir tous les articles' : 'View all articles'}
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>

          {/* Right Column - col-4 - Interview Card */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#375083] to-[#6faf4c] rounded-3xl p-6 text-white shadow-2xl sticky top-24"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Mic size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {lang === 'fr' ? 'Dernière Interview' : 'Latest Interview'}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {lang === 'fr' ? 'Rencontres & échanges' : 'Meetings & discussions'}
                  </p>
                </div>
              </div>

              {/* Interview List */}
              <div className="space-y-4">
                {interviewPosts.length > 0 ? (
                  interviewPosts.map((interview, index) => (
                    <motion.a
                      key={interview.id}
                      href={`/${lang}/news/${interview.slug}`}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group block bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          {interview.featured_image ? (
                            <Image
                              src={getImageUrl(interview.featured_image)}
                              alt={interview.title}
                              fill
                              className="object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/20 flex items-center justify-center">
                              <Mic size={20} className="text-white/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={20} className="text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-yellow-300 transition-colors">
                            {interview.title}
                          </h4>
                          {interview.published_at && (
                            <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(interview.published_at).toLocaleDateString(
                                lang === 'fr' ? 'fr-FR' : 'en-US',
                                { day: 'numeric', month: 'short' }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.a>
                  ))
                ) : (
                  // Placeholder when no interviews
                  [...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center">
                          <Mic size={20} className="text-white/30" />
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-white/20 rounded mb-2 animate-pulse" />
                          <div className="h-3 bg-white/20 rounded w-2/3 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View All Interviews */}
              <a
                href={`/${lang}/news?type=interview`}
                className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-[#375083] font-bold text-sm hover:bg-[#6faf4c] hover:text-white transition-all duration-300"
              >
                {lang === 'fr' ? 'Toutes les interviews' : 'All interviews'}
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
