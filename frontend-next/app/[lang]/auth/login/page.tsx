import { Metadata } from 'next';
import { Language } from '@/lib/types';
import { LoginForm, AuthBackground } from '@/components/auth';

interface LoginPageProps {
  params: Promise<{ lang: Language }>;
  searchParams: Promise<{ redirect?: string }>;
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'fr' ? 'Connexion | AfricaVet' : 'Login | AfricaVet',
    description: lang === 'fr'
      ? 'Connectez-vous à votre compte AfricaVet'
      : 'Sign in to your AfricaVet account',
  };
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { lang } = await params;
  const { redirect } = await searchParams;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Animated Background */}
      <AuthBackground lang={lang} variant="login" />

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white relative">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative mx-auto w-full max-w-md py-12">
          <LoginForm lang={lang} redirectTo={redirect} />
        </div>
      </div>
    </div>
  );
}
