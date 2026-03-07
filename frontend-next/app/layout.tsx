import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

// Nunito - Police arrondie et moderne
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AfricaVet | Plateforme Panafricaine de Médecine Vétérinaire',
    template: '%s | AfricaVet',
  },
  description:
    "AfricaVet - Plateforme panafricaine d'information sur la médecine vétérinaire. Formation, annuaire vétérinaire, alertes sanitaires et opportunités professionnelles.",
  keywords: [
    'AfricaVet',
    'Médecine vétérinaire',
    'Veterinary medicine',
    'Afrique',
    'Africa',
    'VET E-Learning',
    'VET LINK',
    'VET Alert',
    'Formation vétérinaire',
    'Annuaire vétérinaire',
    'Zoonoses',
    'Santé animale',
    'Animal health',
  ],
  authors: [{ name: 'AfricaVet' }],
  creator: 'AfricaVet',
  openGraph: {
    type: 'website',
    locale: 'fr_CM',
    alternateLocale: 'en_CM',
    url: 'https://africavet.com',
    siteName: 'AfricaVet',
    title: 'AfricaVet | Plateforme Panafricaine de Médecine Vétérinaire',
    description:
      "AfricaVet - Plateforme panafricaine d'information sur la médecine vétérinaire.",
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AfricaVet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AfricaVet',
    description: 'Plateforme panafricaine de médecine vétérinaire',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={nunito.variable}>
      <body className="min-h-screen bg-oh-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
