import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { RegisterForm, AuthBackground } from '@/components/auth';

interface RegisterPageProps {
  params: Promise<{ lang: Language }>;
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'fr' ? 'Inscription | AfricaVet' : 'Sign Up | AfricaVet',
    description: lang === 'fr'
      ? 'Créez votre compte AfricaVet gratuitement'
      : 'Create your free AfricaVet account',
  };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Animated Background */}
      <AuthBackground lang={lang} variant="register" />

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white relative overflow-y-auto">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative mx-auto w-full max-w-md py-8">
          <RegisterForm lang={lang} />
        </div>
      </div>
    </div>
  );
}
