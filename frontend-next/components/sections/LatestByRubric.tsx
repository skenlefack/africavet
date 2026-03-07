'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, ArrowRight, Newspaper, BookOpen, BarChart3, AlertTriangle, Eye, MessageCircle } from 'lucide-react';
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

interface RubricConfig {
  id: string;
  type: string;
  label: { fr: string; en: string };
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
}

const rubrics: RubricConfig[] = [
  {
    id: 'actualites',
    type: 'category', // Filter by category_slug
    label: { fr: 'Actualités', en: 'News' },
    icon: Newspaper,
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500',
  },
  {
    id: 'articles',
    type: 'article',
    label: { fr: 'Articles', en: 'Articles' },
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500',
  },
  {
    id: 'analyses',
    type: 'analysis',
    label: { fr: 'Analyses', en: 'Analysis' },
    icon: BarChart3,
    gradient: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-500',
  },
  {
    id: 'zoonoses',
    type: 'category', // Filter by category_slug
    label: { fr: 'Zoonoses', en: 'Zoonoses' },
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-red-600',
    iconBg: 'bg-orange-500',
  },
];

interface LatestByRubricProps {
  posts: NewsPost[];
  lang: Language;
  className?: string;
}

export function LatestByRubric({ posts, lang, className }: LatestByRubricProps) {
  // Group posts by type/category
  const getPostsForRubric = (rubric: RubricConfig) => {
    // Filter by category_slug for actualites and zoonoses
    if (rubric.type === 'category') {
      return posts.filter(p => p.category_slug === rubric.id).slice(0, 3);
    }
    // Filter by post type for articles and analyses
    return posts.filter(p => p.type === rubric.type).slice(0, 3);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 4 Rubric Cards - Vertical Stack */}
      <div className="flex flex-col gap-4">
        {rubrics.map((rubric, rubricIndex) => {
          const Icon = rubric.icon;
          const rubricPosts = getPostsForRubric(rubric);

          return (
            <motion.div
              key={rubric.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: rubricIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Card Header - Compact */}
              <div className={cn('px-4 py-2.5 bg-gradient-to-r text-white', rubric.gradient)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <h3 className="font-bold text-base">{rubric.label[lang]}</h3>
                  </div>
                  <a
                    href={`/${lang}/news?type=${rubric.type}`}
                    className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                  >
                    {lang === 'fr' ? 'Tout voir' : 'View all'}
                    <ArrowRight size={10} />
                  </a>
                </div>
              </div>

              {/* Posts Grid - 3 columns */}
              <div className="p-3">
                {rubricPosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {rubricPosts.map((post, postIndex) => (
                      <motion.a
                        key={post.id}
                        href={`/${lang}/news/${post.slug}`}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: rubricIndex * 0.05 + postIndex * 0.03 }}
                        className="group bg-gray-50 rounded-lg overflow-hidden hover:bg-white hover:shadow-md transition-all duration-300"
                      >
                        {/* Image */}
                        <div className="relative h-32 overflow-hidden">
                          {post.featured_image ? (
                            <Image
                              src={getImageUrl(post.featured_image)}
                              alt={post.title}
                              fill
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className={cn('w-full h-full flex items-center justify-center bg-gradient-to-br', rubric.gradient)}>
                              <Icon size={24} className="text-white/50" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          <h4 className="font-bold text-base text-gray-900 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#3463b5] group-hover:to-[#6faf4c] transition-all duration-300">
                            {post.title}
                          </h4>
                          {post.excerpt && (
                            <p className="text-gray-500 text-sm line-clamp-2 mt-1.5">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2.5 text-xs text-gray-400">
                              {post.published_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(post.published_at).toLocaleDateString(
                                    lang === 'fr' ? 'fr-FR' : 'en-US',
                                    { day: 'numeric', month: 'short' }
                                  )}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {post.view_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={12} />
                                {post.comments_count || 0}
                              </span>
                            </div>
                            <span className={cn('flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-1.5', rubric.iconBg.replace('bg-', 'text-'))}>
                              {lang === 'fr' ? 'Lire' : 'Read'}
                              <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Icon size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">
                      {lang === 'fr' ? 'Aucun article disponible' : 'No articles available'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
