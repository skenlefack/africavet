'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, MapPin, BookOpen, Eye, Calendar, ArrowLeft, Loader2, Briefcase } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Language } from '@/lib/types';
import { getImageUrl } from '@/lib/api';

export default function AuthorProfilePage() {
  const params = useParams();
  const lang = (params.lang as Language) || 'fr';
  const username = params.username as string;

  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    back: lang === 'fr' ? 'Retour' : 'Back',
    articles: lang === 'fr' ? 'Articles publiés' : 'Published Articles',
    noArticles: lang === 'fr' ? 'Aucun article publié' : 'No published articles',
    notFound: lang === 'fr' ? 'Auteur introuvable' : 'Author not found',
    views: lang === 'fr' ? 'vues' : 'views',
  };

  useEffect(() => {
    fetchAuthor();
  }, [username]);

  const fetchAuthor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/authors/${username}`);
      const data = await res.json();
      if (data.success) setAuthor(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <User size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">{t.notFound}</p>
        <Link href={`/${lang}/news`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <ArrowLeft size={16} /> {t.back}
        </Link>
      </div>
    );
  }

  const displayName = [author.first_name, author.last_name].filter(Boolean).join(' ') || author.username;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-8 px-4 md:px-[5%]">
      <div className="container mx-auto max-w-4xl">
        {/* Back */}
        <Link href={`/${lang}/news`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft size={16} /> {t.back}
        </Link>

        {/* Author Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-6">
            {author.avatar ? (
              <Image src={getImageUrl(author.avatar)} alt={displayName} width={96} height={96}
                className="rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{displayName.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {author.profession && (
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <Briefcase size={14} /> {author.profession}
                  {author.specialization && ` — ${author.specialization}`}
                </p>
              )}
              {(author.city || author.country) && (
                <p className="text-gray-400 flex items-center gap-1 mt-1 text-sm">
                  <MapPin size={14} /> {[author.city, author.country].filter(Boolean).join(', ')}
                </p>
              )}
              {author.bio && (
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">{author.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <BookOpen size={14} /> {author.post_count} {t.articles.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-500" />
            {t.articles} ({author.post_count})
          </h2>

          {!author.posts || author.posts.length === 0 ? (
            <p className="text-gray-400 text-sm">{t.noArticles}</p>
          ) : (
            <div className="space-y-3">
              {author.posts.map((post: any) => {
                const title = lang === 'en' && post.title_en ? post.title_en : (post.title_fr || post.title || '');
                return (
                  <Link key={post.id} href={`/${lang}/news/${post.slug}`}
                    className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    {post.featured_image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={getImageUrl(post.featured_image)} alt={title} width={64} height={64}
                          className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={20} className="text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm">{title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {post.published_at ? formatDate(post.published_at, lang) : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={11} /> {post.view_count || 0} {t.views}
                        </span>
                        {post.type && post.type !== 'post' && (
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{post.type}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
