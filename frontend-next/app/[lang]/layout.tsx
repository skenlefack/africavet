import { Metadata } from 'next';
import { Header, Footer, BackToTop } from '@/components/layout';
import { getTranslation, isValidLanguage, supportedLanguages } from '@/lib/translations';
import { Language } from '@/lib/types';
import { notFound } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return supportedLanguages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    fr: 'AfricaVET | Le portail panafricain de la santé animale et de la médecine vétérinaire',
    en: 'AfricaVET | Pan-African Animal Health & Veterinary Medicine Portal',
  };

  const descriptions = {
    fr: "Actualités, analyses, opportunités et ressources sur la santé animale, le One Health, les zoonoses, l'élevage, la faune sauvage, la pêche et l'aquaculture en Afrique.",
    en: "News, analysis, opportunities and resources on animal health, One Health, zoonoses, livestock, wildlife, fisheries and aquaculture in Africa.",
  };

  const otherLang = lang === 'fr' ? 'en' : 'fr';

  return {
    title: titles[lang as Language] || titles.fr,
    description: descriptions[lang as Language] || descriptions.fr,
    alternates: {
      canonical: `https://www.africavet.com/${lang}`,
      languages: {
        'fr': 'https://www.africavet.com/fr',
        'en': 'https://www.africavet.com/en',
        'x-default': 'https://www.africavet.com/fr',
      },
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  // Validate language
  if (!isValidLanguage(lang)) {
    notFound();
  }

  const t = getTranslation(lang as Language);

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang as Language} t={t} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang as Language} t={t} />
      <BackToTop />
    </div>
  );
}
