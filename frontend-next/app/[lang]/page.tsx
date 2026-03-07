import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { getTranslation, isValidLanguage } from '@/lib/translations';
import {
  getFeaturedPosts, getHomepageSections, HomepageSection,
  getRecentOpportunities, getRecentVetAlerts, getPosts
} from '@/lib/api';
import { notFound } from 'next/navigation';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Legacy sections (still used)
import {
  FivePillarsSection,
  PartnersCarouselSection,
} from '@/components/sections';

// New Magazine sections
import { HeroMagazine } from '@/components/sections/HeroMagazine';
import { NewsGrid } from '@/components/sections/NewsGrid';
import { CategorizedNews } from '@/components/sections/CategorizedNews';
import { LatestByRubric } from '@/components/sections/LatestByRubric';
import { QuickLinksSection } from '@/components/sections/QuickLinksSection';
import { OpportunitiesCarousel } from '@/components/sections/OpportunitiesCarousel';
import { AlertsSection } from '@/components/sections/AlertsSection';

// UI Components
import {
  TopBannerAd, AdSection, StickyAd,
  BreakingNewsTicker,
  TrendingSidebar,
  NewsletterBox,
  AnimatedSection,
} from '@/components/ui';

// Layout components
import {
  MagazineLayout,
  MagazineSection,
  TwoColumnSection,
} from '@/components/layout';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'AfricaVet - Plateforme Veterinaire Africaine',
    en: 'AfricaVet - African Veterinary Platform',
  };

  const descriptions = {
    fr: "Plateforme d'information veterinaire africaine. Actualites, formations, annuaire, opportunites et alertes sanitaires.",
    en: "African veterinary information platform. News, training, directory, opportunities and health alerts.",
  };

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
  };
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = getTranslation(lang as Language);

  // Fetch all data in parallel
  const [
    postsResponse,
    sectionsResponse,
    opportunitiesResponse,
    alertsResponse,
    recentPostsResponse,
    allCategoryPostsResponse,
  ] = await Promise.all([
    getFeaturedPosts(15),
    getHomepageSections(lang),
    getRecentOpportunities(8),
    getRecentVetAlerts(6),
    getPosts({ status: 'published', limit: 6, sort: 'view_count', order: 'DESC' }),
    getPosts({ status: 'published', limit: 50, sort: 'published_at', order: 'DESC' }),
  ]);

  const posts = postsResponse.success ? postsResponse.data : [];
  const sections = sectionsResponse.success ? sectionsResponse.data : [];
  const opportunities = opportunitiesResponse.success ? opportunitiesResponse.data : [];
  const alerts = alertsResponse.success ? alertsResponse.data : [];
  const trendingPosts = recentPostsResponse.success ? recentPostsResponse.data : [];
  const allCategoryPosts = allCategoryPostsResponse.success ? allCategoryPostsResponse.data : [];

  // Helper to get section content by key
  const getSection = (key: string): HomepageSection | undefined =>
    sections.find(s => s.section_key === key);

  // Mock breaking news from recent posts
  const breakingNews = posts.slice(0, 5).map(post => ({
    id: post.id,
    title: post.title,
    href: `/${lang}/news/${post.slug}`,
    type: 'news' as const,
  }));

  // Add alert to breaking news if critical
  const criticalAlerts = alerts.filter(a => a.priority === 'critical');
  if (criticalAlerts.length > 0) {
    breakingNews.unshift({
      id: criticalAlerts[0].id,
      title: criticalAlerts[0].title,
      href: `/${lang}/vet-alert/${criticalAlerts[0].id}`,
      type: 'alert' as const,
    });
  }

  return (
    <>
      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <BreakingNewsTicker
          items={breakingNews}
          lang={lang as Language}
          speed="normal"
        />
      )}

      {/* Hero Magazine Section */}
      <HeroMagazine
        lang={lang as Language}
        t={t}
        posts={posts}
      />

      {/* Main Content with Sidebar */}
      <MagazineLayout
        sidebar={
          <>
            {/* Ad Space */}
            <StickyAd size="medium-rectangle" lang={lang as Language} topOffset={100} />

            {/* Trending Articles */}
            {trendingPosts.length > 0 && (
              <TrendingSidebar
                articles={trendingPosts.map(p => ({
                  id: p.id,
                  title: p.title,
                  slug: p.slug,
                  views: p.views_count,
                  published_at: p.published_at,
                  category: p.category_name,
                  image: p.featured_image,
                }))}
                lang={lang as Language}
              />
            )}

            {/* Newsletter Box */}
            <NewsletterBox
              lang={lang as Language}
              variant="default"
            />

            {/* Another Ad */}
            <AdSection size="medium-rectangle" lang={lang as Language} showLabel={false} />
          </>
        }
        sidebarWidth="normal"
        className="bg-oh-background"
      >
        {/* Latest News by Rubric - 4 Cards */}
        <LatestByRubric
          posts={allCategoryPosts.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            featured_image: p.featured_image,
            published_at: p.published_at,
            category_name: p.category_name,
            category_slug: p.category_slug,
            type: p.type,
            view_count: p.view_count,
            comments_count: p.comments_count,
          }))}
          lang={lang as Language}
        />
      </MagazineLayout>

      {/* Categorized News Section */}
      <CategorizedNews
        posts={allCategoryPosts.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          featured_image: p.featured_image,
          published_at: p.published_at,
          category_name: p.category_name,
          category_slug: p.category_slug,
          type: p.type,
          view_count: p.view_count,
          comments_count: p.comments_count,
        }))}
        lang={lang as Language}
        className="bg-gradient-to-b from-white to-gray-50"
      />

      {/* 5 Pillars Section */}
      <AnimatedSection animation="fadeInUp">
        <FivePillarsSection lang={lang as Language} t={t} />
      </AnimatedSection>

      {/* VET E-Learning Preview Section */}
      <AnimatedSection
        animation="fadeInUp"
        className="py-16 px-4 md:px-[5%] bg-gradient-to-br from-emerald-50 to-teal-50"
      >
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-600 text-sm font-semibold mb-4">
              VET E-LEARNING
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-av-dark-900 mb-4">
              {lang === 'fr' ? 'Formez-vous en ligne' : 'Learn Online'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {lang === 'fr'
                ? 'Accédez à des cours et formations vétérinaires de qualité, certifiés par des experts.'
                : 'Access quality veterinary courses and training, certified by experts.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Courses Card */}
            <a
              href={`/${lang}/vet-elearning/courses`}
              className="glass-card-solid group text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-av-dark-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {lang === 'fr' ? 'Cours' : 'Courses'}
              </h3>
              <p className="text-sm text-gray-600">
                {lang === 'fr' ? '+50 cours disponibles' : '+50 courses available'}
              </p>
            </a>

            {/* Learning Paths Card */}
            <a
              href={`/${lang}/vet-elearning/paths`}
              className="glass-card-solid group text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-av-dark-900 mb-2 group-hover:text-blue-600 transition-colors">
                {lang === 'fr' ? 'Parcours' : 'Learning Paths'}
              </h3>
              <p className="text-sm text-gray-600">
                {lang === 'fr' ? 'Programmes complets' : 'Complete programs'}
              </p>
            </a>

            {/* Certificates Card */}
            <a
              href={`/${lang}/dashboard/certificates`}
              className="glass-card-solid group text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-av-dark-900 mb-2 group-hover:text-amber-600 transition-colors">
                {lang === 'fr' ? 'Certificats' : 'Certificates'}
              </h3>
              <p className="text-sm text-gray-600">
                {lang === 'fr' ? 'Certifications reconnues' : 'Recognized certifications'}
              </p>
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* VET Link Quick Search */}
      <QuickLinksSection lang={lang as Language} t={t} />

      {/* Opportunities Carousel */}
      {opportunities.length > 0 && (
        <OpportunitiesCarousel
          opportunities={opportunities.map(o => ({
            id: o.id,
            title: o.title,
            slug: o.slug,
            opportunity_type: o.opportunity_type,
            organization_name: o.organization_name,
            country: o.country,
            region: o.region,
            deadline: o.deadline,
            salary_range: o.salary_range,
            budget_estimate: o.budget_estimate,
            is_featured: o.is_featured,
            job_type: o.job_type,
          }))}
          lang={lang as Language}
          t={t}
        />
      )}

      {/* VET Alert Section */}
      {alerts.length > 0 && (
        <AlertsSection
          alerts={alerts.map(a => ({
            id: a.id,
            code: a.code,
            title: a.title,
            alert_type: a.alert_type,
            country: a.country,
            region: a.region,
            disease_name: a.disease_name,
            species: a.species,
            priority: a.priority,
            status: a.status,
            created_at: a.created_at,
            affected_count: a.affected_count,
          }))}
          lang={lang as Language}
          t={t}
          className="bg-gray-50"
        />
      )}

      {/* Partners Carousel */}
      <AnimatedSection animation="fadeInUp">
        <PartnersCarouselSection lang={lang as Language} t={t} content={getSection('partners')?.content} />
      </AnimatedSection>
    </>
  );
}
