'use client';

import { OpportunityAccessProvider } from '@/components/opportunities/OpportunityAccessGate';
import { Language } from '@/lib/types';
import { useParams } from 'next/navigation';

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const lang = (params.lang || 'fr') as Language;

  return (
    <OpportunityAccessProvider lang={lang}>
      {children}
    </OpportunityAccessProvider>
  );
}
