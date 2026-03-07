'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, Facebook, Twitter, Linkedin, Youtube, ChevronDown,
  Newspaper, BookOpen, Search, Briefcase, Users,
  GraduationCap, FileText, Award, Building2, FlaskConical,
  Pill, Siren, School, Building, AlertTriangle, Calendar, MessageSquare, Bell,
  Menu, X, LogIn, UserPlus,
  Beef, Fish, Bird, HeartPulse, Stethoscope, TestTube2, LayoutGrid
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { UserMenu } from '@/components/auth';
import { cn } from '@/lib/utils';
import { useLoading } from '@/lib/LoadingContext';
import { getSettings, SiteSettings } from '@/lib/api';

interface HeaderProps {
  lang: Language;
  t: Translation;
}

interface PillarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

interface PillarNav {
  id: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  hoverBg: string;
  icon: React.ElementType;
  items: PillarItem[];
}

export function Header({ lang, t }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useLoading();
  const { user, isAuthenticated } = useAuth();

  // Auth translations
  const authT = {
    login: lang === 'fr' ? 'Connexion' : 'Login',
    register: lang === 'fr' ? "S'inscrire" : 'Sign up',
  };

  // Show ad banner on load, hide after 8 seconds, then repeat every 3 minutes
  useEffect(() => {
    // Hide banner after 8 seconds
    const hideTimer = setTimeout(() => {
      setShowPromoBanner(false);
    }, 8000);

    // Show banner again every 3 minutes (180000ms)
    const intervalTimer = setInterval(() => {
      setShowPromoBanner(true);
      // Hide after 8 seconds
      setTimeout(() => {
        setShowPromoBanner(false);
      }, 8000);
    }, 180000);

    return () => {
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await getSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }
    fetchSettings();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpenDropdown(null);
    setMobileMenuOpen(false);

    const currentFullPath = pathname + (window.location.search || '');
    if (href === currentFullPath) {
      router.refresh();
      return;
    }

    startLoading();
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  // Define the 5 pillars navigation
  const fivePillars: PillarNav[] = [
    {
      id: 'get-informed',
      label: t.nav.getInformed,
      description: t.fivePillars.getInformed.description,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-50',
      icon: Newspaper,
      items: [
        { id: 'news', label: t.fivePillars.getInformed.items.news, href: `/${lang}/news`, icon: Newspaper },
        { id: 'articles', label: t.fivePillars.getInformed.items.articles, href: `/${lang}/news?type=article`, icon: BookOpen },
        { id: 'analysis', label: t.fivePillars.getInformed.items.analysis, href: `/${lang}/news?type=analysis`, icon: Search },
        { id: 'zoonoses', label: t.fivePillars.getInformed.items.zoonoses, href: `/${lang}/zoonoses`, icon: AlertTriangle },
      ],
    },
    {
      id: 'get-trained',
      label: t.nav.getTrained,
      description: t.fivePillars.getTrained.description,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverBg: 'hover:bg-emerald-50',
      icon: GraduationCap,
      items: [
        { id: 'courses', label: t.fivePillars.getTrained.items.courses, href: `/${lang}/vet-elearning/courses`, icon: BookOpen },
        { id: 'paths', label: t.fivePillars.getTrained.items.learningPaths, href: `/${lang}/vet-elearning/paths`, icon: GraduationCap },
        { id: 'resources', label: t.fivePillars.getTrained.items.resources, href: `/${lang}/vet-elearning`, icon: FileText },
        { id: 'certificates', label: t.fivePillars.getTrained.items.certificates, href: `/${lang}/dashboard/certificates`, icon: Award },
      ],
    },
    {
      id: 'find',
      label: t.nav.find,
      description: t.fivePillars.find.description,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-50',
      icon: Search,
      items: [
        { id: 'clinics', label: t.fivePillars.find.items.clinics, href: `/${lang}/vet-link?category=vet-clinic`, icon: Building2 },
        { id: 'laboratories', label: t.fivePillars.find.items.laboratories, href: `/${lang}/vet-link?category=vet-lab`, icon: FlaskConical },
        { id: 'pharmacies', label: t.fivePillars.find.items.pharmacies, href: `/${lang}/vet-link?category=vet-pharmacy`, icon: Pill },
        { id: 'emergencies', label: t.fivePillars.find.items.emergencies, href: `/${lang}/vet-link?category=emergency`, icon: Siren },
        { id: 'schools', label: t.fivePillars.find.items.schools, href: `/${lang}/vet-link?category=vet-school`, icon: School },
        { id: 'officials', label: t.fivePillars.find.items.officials, href: `/${lang}/vet-link?category=vet-directorate`, icon: Building },
      ],
    },
    {
      id: 'opportunities',
      label: t.nav.opportunities,
      description: t.fivePillars.opportunities.description,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-50',
      icon: Briefcase,
      items: [
        { id: 'jobs', label: t.fivePillars.opportunities.items.jobs, href: `/${lang}/opportunities?type=job`, icon: Briefcase },
        { id: 'tenders', label: t.fivePillars.opportunities.items.tenders, href: `/${lang}/opportunities?type=tender`, icon: FileText },
        { id: 'markets', label: t.fivePillars.opportunities.items.markets, href: `/${lang}/opportunities?type=market`, icon: Building2 },
      ],
    },
    {
      id: 'coordinate',
      label: t.nav.coordinate,
      description: t.fivePillars.coordinate.description,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverBg: 'hover:bg-red-50',
      icon: Users,
      items: [
        { id: 'alerts', label: t.fivePillars.coordinate.items.alerts, href: `/${lang}/vet-alert`, icon: AlertTriangle },
        { id: 'report', label: t.fivePillars.coordinate.items.reportAlert, href: `/${lang}/vet-alert/submit`, icon: Bell },
        { id: 'events', label: t.fivePillars.coordinate.items.events, href: `/${lang}/news?type=event`, icon: Calendar },
        { id: 'community', label: t.fivePillars.coordinate.items.community, href: `/${lang}/contact`, icon: MessageSquare },
      ],
    },
  ];

  // Thématiques menu
  const thematiquesMenu = {
    id: 'thematiques',
    label: lang === 'fr' ? 'Thématiques' : 'Topics',
    description: lang === 'fr' ? 'Explorer par thématique' : 'Explore by topic',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    icon: LayoutGrid,
    items: [
      { id: 'elevage', label: lang === 'fr' ? 'Élevage' : 'Livestock', href: `/${lang}/news?category=elevage`, icon: Beef },
      { id: 'peches', label: lang === 'fr' ? 'Pêches' : 'Fisheries', href: `/${lang}/news?category=peches`, icon: Fish },
      { id: 'faune', label: lang === 'fr' ? 'Faune' : 'Wildlife', href: `/${lang}/news?category=faune`, icon: Bird },
      { id: 'one-health', label: 'One Health', href: `/${lang}/news?category=one-health`, icon: HeartPulse },
      { id: 'sante-animale', label: lang === 'fr' ? 'Santé animale' : 'Animal Health', href: `/${lang}/news?category=sante-animale`, icon: Stethoscope },
      { id: 'antibioresistance', label: lang === 'fr' ? 'Antibiorésistance' : 'Antimicrobial Resistance', href: `/${lang}/news?category=antibioresistance`, icon: TestTube2 },
    ],
  };

  return (
    <>
      {/* Top Bar - Glassmorphism */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: scrolled ? -50 : 0, opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-[#3463b5] to-[#6faf4c] py-2.5 px-4 md:px-[5%] hidden md:flex justify-between items-center text-sm text-white/90"
      >
        <div className="flex gap-8">
          <span className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail size={14} />
            {settings.contact_email || 'contact@africavet.com'}
          </span>
          <span className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone size={14} />
            {settings.site_phone || '+237 242 015 961'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Auth Buttons - Before Language Switcher */}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <a
                href={`/${lang}/auth/login`}
                onClick={(e) => handleNavClick(e, `/${lang}/auth/login`)}
                className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/90 hover:text-white rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                <LogIn size={14} className="group-hover:translate-x-0.5 transition-transform" />
                {authT.login}
              </a>
              <a
                href={`/${lang}/auth/register`}
                onClick={(e) => handleNavClick(e, `/${lang}/auth/register`)}
                className="group relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-av-green-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
              >
                {/* White background with shine effect */}
                <div className="absolute inset-0 bg-white group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-emerald-50 transition-all" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-av-green-200/50 to-transparent" />
                </div>
                <UserPlus size={14} className="relative z-10 group-hover:scale-110 transition-transform" />
                <span className="relative z-10">{authT.register}</span>
              </a>
            </div>
          )}

          {/* Separator */}
          {!isAuthenticated && (
            <div className="w-px h-5 bg-white/30" />
          )}

          {/* Language Switcher */}
          <div className="flex gap-1 bg-white/10 rounded-lg p-1">
            <a
              href="/fr"
              onClick={(e) => handleNavClick(e, '/fr')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                lang === 'fr'
                  ? 'bg-white text-av-green-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              FR
            </a>
            <a
              href="/en"
              onClick={(e) => handleNavClick(e, '/en')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                lang === 'en'
                  ? 'bg-white text-av-green-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              EN
            </a>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            {[
              { Icon: Facebook, url: settings.facebook_url },
              { Icon: Twitter, url: settings.twitter_url },
              { Icon: Linkedin, url: settings.linkedin_url },
              { Icon: Youtube, url: settings.youtube_url },
            ].filter(({ url }) => url && url.trim() !== '').map(({ Icon, url }, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors hover:scale-110 transform"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating Ad Banner - Appears then disappears */}
      <AnimatePresence>
        {showPromoBanner && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-24 right-4 md:right-8 z-[100]"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Close button */}
              <button
                onClick={() => setShowPromoBanner(false)}
                className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <X size={14} />
              </button>

              {/* Ad content placeholder - Large Banner 970x150 */}
              <div className="relative w-[970px] h-[150px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center gap-4">
                <div className="absolute top-2 left-3 px-2 py-0.5 bg-gray-200 rounded text-[10px] text-gray-500 uppercase tracking-wider">
                  {lang === 'fr' ? 'Publicité' : 'Ad'}
                </div>
                <svg
                  className="w-10 h-10 text-gray-300"
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
                <div className="text-center">
                  <span className="text-base font-medium text-gray-400">{lang === 'fr' ? 'Espace publicitaire' : 'Ad Space'}</span>
                  <span className="text-sm text-gray-300 ml-2">970 x 150</span>
                </div>
              </div>

              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 8, ease: 'linear' }}
                className="h-1 bg-gradient-to-r from-[#3463b5] to-[#6faf4c]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header - Modern gradient background */}
      <header
        className={cn(
          'transition-all duration-500 z-50',
          scrolled
            ? 'fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100'
            : 'relative bg-gradient-to-br from-slate-50 via-white to-blue-50'
        )}
      >
        {/* Decorative background elements */}
        {!scrolled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#3463b5]/5 rounded-full blur-3xl" />
            <div className="absolute -top-10 right-1/4 w-32 h-32 bg-[#6faf4c]/5 rounded-full blur-3xl" />
            <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-[#6faf4c]/10 to-transparent" />
          </div>
        )}

        <div className="relative max-w-[1600px] mx-auto px-4 md:px-[3%] py-2 flex items-center justify-between">
          {/* Logo - Clean, no card, increased size */}
          <a
            href={`/${lang}`}
            onClick={(e) => handleNavClick(e, `/${lang}`)}
            className="flex items-center cursor-pointer group -ml-2"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/images/africavet-logo.png"
                alt="AfricaVet"
                width={170}
                height={75}
                className="object-contain"
                priority
              />
            </motion.div>
          </a>

          {/* Desktop Navigation - Modern pill style */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center gap-0.5 bg-gray-100/80 backdrop-blur-sm rounded-full px-1 py-1">
              {/* Home link */}
              <a
                href={`/${lang}`}
                onClick={(e) => handleNavClick(e, `/${lang}`)}
                className="px-3 py-2 rounded-full font-bold text-sm transition-all cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm whitespace-nowrap"
              >
                {t.nav.home}
              </a>

              {/* About - moved after Home */}
              <a
                href={`/${lang}/about`}
                onClick={(e) => handleNavClick(e, `/${lang}/about`)}
                className="px-3 py-2 rounded-full font-bold text-sm transition-all cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm whitespace-nowrap"
              >
                {t.nav.about}
              </a>

              {/* Thématiques Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('thematiques')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={cn(
                    'px-3 py-2 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap',
                    'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm',
                    openDropdown === 'thematiques' && 'bg-white shadow-sm text-gray-900'
                  )}
                >
                  {thematiquesMenu.label}
                  <ChevronDown
                    size={12}
                    className={cn(
                      'transition-transform duration-300',
                      openDropdown === 'thematiques' && 'rotate-180'
                    )}
                  />
                </button>

                {/* Thématiques Dropdown Menu */}
                <AnimatePresence>
                  {openDropdown === 'thematiques' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 pt-3 z-50"
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[280px]">
                        {/* Header with gradient */}
                        <div className={cn('px-5 py-4 bg-gradient-to-r', thematiquesMenu.bgColor)}>
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2.5 rounded-xl bg-white shadow-sm', thematiquesMenu.color)}>
                              <thematiquesMenu.icon size={22} />
                            </div>
                            <div>
                              <h3 className={cn('font-bold text-base', thematiquesMenu.color)}>
                                {thematiquesMenu.label}
                              </h3>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {thematiquesMenu.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {thematiquesMenu.items.map((item, index) => (
                            <motion.a
                              key={item.id}
                              href={item.href}
                              onClick={(e) => handleNavClick(e, item.href)}
                              className={cn(
                                'flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600',
                                'hover:bg-gray-50 transition-all cursor-pointer group',
                                index !== thematiquesMenu.items.length - 1 && 'border-b border-gray-50'
                              )}
                              whileHover={{ x: 4 }}
                            >
                              <item.icon size={18} className={cn(thematiquesMenu.color, 'transition-transform group-hover:scale-110')} />
                              <span className="group-hover:text-gray-900">{item.label}</span>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 5 Pillars with Mega Menus */}
              {fivePillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(pillar.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={cn(
                      'px-3 py-2 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap',
                      'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm',
                      openDropdown === pillar.id && 'bg-white shadow-sm text-gray-900'
                    )}
                  >
                    {pillar.label}
                    <ChevronDown
                      size={12}
                      className={cn(
                        'transition-transform duration-300',
                        openDropdown === pillar.id && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Mega Menu Dropdown - Modern glassmorphism */}
                  <AnimatePresence>
                    {openDropdown === pillar.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 pt-3 z-50"
                      >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[300px]">
                          {/* Header with gradient */}
                          <div className={cn('px-5 py-4 bg-gradient-to-r', pillar.bgColor)}>
                            <div className="flex items-center gap-3">
                              <div className={cn('p-2.5 rounded-xl bg-white shadow-sm', pillar.color)}>
                                <pillar.icon size={22} />
                              </div>
                              <div>
                                <h3 className={cn('font-bold text-base', pillar.color)}>
                                  {pillar.label}
                                </h3>
                                <p className="text-xs text-gray-600 mt-0.5 max-w-[200px]">
                                  {pillar.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            {pillar.items.map((item, index) => (
                              <motion.a
                                key={item.id}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className={cn(
                                  'flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600',
                                  'hover:bg-gray-50 transition-all cursor-pointer group',
                                  index !== pillar.items.length - 1 && 'border-b border-gray-50'
                                )}
                                whileHover={{ x: 4 }}
                              >
                                <item.icon size={18} className={cn(pillar.color, 'transition-transform group-hover:scale-110')} />
                                <span className="group-hover:text-gray-900">{item.label}</span>
                              </motion.a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Interview */}
              <a
                href={`/${lang}/news?type=interview`}
                onClick={(e) => handleNavClick(e, `/${lang}/news?type=interview`)}
                className="px-3 py-2 rounded-full font-bold text-sm transition-all cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm whitespace-nowrap"
              >
                {lang === 'fr' ? 'Interview' : 'Interview'}
              </a>

              {/* Contact */}
              <a
                href={`/${lang}/contact`}
                onClick={(e) => handleNavClick(e, `/${lang}/contact`)}
                className="px-3 py-2 rounded-full font-bold text-sm transition-all cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm whitespace-nowrap"
              >
                {t.nav.contact}
              </a>
            </div>
          </nav>

          {/* Right Side - Social Icons, User Menu, Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Social Icons - Desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              {[
                { Icon: Facebook, url: settings.facebook_url || 'https://facebook.com', color: 'hover:text-blue-600' },
                { Icon: Twitter, url: settings.twitter_url || 'https://twitter.com', color: 'hover:text-sky-500' },
                { Icon: Linkedin, url: settings.linkedin_url || 'https://linkedin.com', color: 'hover:text-blue-700' },
                { Icon: Youtube, url: settings.youtube_url || 'https://youtube.com', color: 'hover:text-red-600' },
              ].map(({ Icon, url, color }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'p-2 rounded-full bg-gray-100 text-gray-500 transition-all hover:scale-110',
                    color
                  )}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            {/* User Menu - Only show when authenticated */}
            {isAuthenticated && <UserMenu lang={lang} />}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
                {/* Home */}
                <a
                  href={`/${lang}`}
                  onClick={(e) => handleNavClick(e, `/${lang}`)}
                  className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-[#3463b5]/10 hover:to-[#6faf4c]/10 transition-colors"
                >
                  {t.nav.home}
                </a>

                {/* About */}
                <a
                  href={`/${lang}/about`}
                  onClick={(e) => handleNavClick(e, `/${lang}/about`)}
                  className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {t.nav.about}
                </a>

                {/* Thématiques */}
                <div className="space-y-1">
                  <div className={cn('px-4 py-3 rounded-xl font-semibold', thematiquesMenu.bgColor, thematiquesMenu.color)}>
                    <div className="flex items-center gap-2">
                      <thematiquesMenu.icon size={18} />
                      {thematiquesMenu.label}
                    </div>
                  </div>
                  <div className="pl-4 space-y-1">
                    {thematiquesMenu.items.map((item) => (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <item.icon size={16} className={thematiquesMenu.color} />
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>

                {/* 5 Pillars */}
                {fivePillars.map((pillar) => (
                  <div key={pillar.id} className="space-y-1">
                    <div className={cn('px-4 py-3 rounded-xl font-semibold', pillar.bgColor, pillar.color)}>
                      <div className="flex items-center gap-2">
                        <pillar.icon size={18} />
                        {pillar.label}
                      </div>
                    </div>
                    <div className="pl-4 space-y-1">
                      {pillar.items.map((item) => (
                        <a
                          key={item.id}
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <item.icon size={16} className={pillar.color} />
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Interview */}
                <a
                  href={`/${lang}/news?type=interview`}
                  onClick={(e) => handleNavClick(e, `/${lang}/news?type=interview`)}
                  className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Interview
                </a>

                {/* Contact */}
                <a
                  href={`/${lang}/contact`}
                  onClick={(e) => handleNavClick(e, `/${lang}/contact`)}
                  className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {t.nav.contact}
                </a>

                {/* Mobile Auth Buttons */}
                {!isAuthenticated && (
                  <div className="flex gap-2 px-4 pt-4 border-t border-gray-100">
                    <a
                      href={`/${lang}/auth/login`}
                      onClick={(e) => handleNavClick(e, `/${lang}/auth/login`)}
                      className="flex-1 py-2.5 rounded-xl text-center text-sm font-semibold border-2 border-gray-200 text-gray-700 hover:border-[#3463b5] hover:text-[#3463b5] transition-all"
                    >
                      {authT.login}
                    </a>
                    <a
                      href={`/${lang}/auth/register`}
                      onClick={(e) => handleNavClick(e, `/${lang}/auth/register`)}
                      className="flex-1 py-2.5 rounded-xl text-center text-sm font-semibold bg-gradient-to-r from-[#3463b5] to-[#6faf4c] text-white hover:shadow-lg transition-all"
                    >
                      {authT.register}
                    </a>
                  </div>
                )}

                {/* Mobile Language Switcher */}
                <div className="flex gap-2 px-4 pt-4 border-t border-gray-100">
                  <a
                    href="/fr"
                    onClick={(e) => handleNavClick(e, '/fr')}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-center text-sm font-semibold transition-all',
                      lang === 'fr'
                        ? 'bg-gradient-to-r from-[#3463b5] to-[#6faf4c] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    Francais
                  </a>
                  <a
                    href="/en"
                    onClick={(e) => handleNavClick(e, '/en')}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-center text-sm font-semibold transition-all',
                      lang === 'en'
                        ? 'bg-gradient-to-r from-[#3463b5] to-[#6faf4c] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    English
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer when header is fixed */}
      {scrolled && <div className="h-[64px] md:h-[72px]" />}
    </>
  );
}
