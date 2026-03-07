'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Shield, Heart, Leaf, Users, BookOpen, Award, Stethoscope, Globe } from 'lucide-react';
import { Language } from '@/lib/types';

interface AuthBackgroundProps {
  lang: Language;
  variant: 'login' | 'register';
}

const floatingElements = [
  { Icon: Shield, size: 24, color: 'text-emerald-400' },
  { Icon: Heart, size: 20, color: 'text-rose-400' },
  { Icon: Leaf, size: 22, color: 'text-green-400' },
  { Icon: Users, size: 26, color: 'text-blue-400' },
  { Icon: BookOpen, size: 20, color: 'text-amber-400' },
  { Icon: Award, size: 24, color: 'text-purple-400' },
  { Icon: Stethoscope, size: 22, color: 'text-cyan-400' },
  { Icon: Globe, size: 20, color: 'text-indigo-400' },
];

export function AuthBackground({ lang, variant }: AuthBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = {
    login: {
      fr: {
        badge: 'Plateforme Vétérinaire Africaine',
        title: 'Bon retour !',
        subtitle: 'Connectez-vous pour accéder à votre espace',
        features: [
          { icon: BookOpen, text: 'Accédez à vos formations' },
          { icon: Award, text: 'Suivez votre progression' },
          { icon: Users, text: 'Rejoignez la communauté' },
        ],
      },
      en: {
        badge: 'African Veterinary Platform',
        title: 'Welcome back!',
        subtitle: 'Sign in to access your dashboard',
        features: [
          { icon: BookOpen, text: 'Access your courses' },
          { icon: Award, text: 'Track your progress' },
          { icon: Users, text: 'Join the community' },
        ],
      },
    },
    register: {
      fr: {
        badge: 'Plateforme Vétérinaire Africaine',
        title: 'Rejoignez AfricaVet',
        subtitle: 'Créez votre compte gratuitement',
        features: [
          { icon: BookOpen, text: 'Formations certifiantes' },
          { icon: Shield, text: 'Accès sécurisé' },
          { icon: Globe, text: 'Communauté panafricaine' },
        ],
      },
      en: {
        badge: 'African Veterinary Platform',
        title: 'Join AfricaVet',
        subtitle: 'Create your free account',
        features: [
          { icon: BookOpen, text: 'Certified training' },
          { icon: Shield, text: 'Secure access' },
          { icon: Globe, text: 'Pan-African community' },
        ],
      },
    },
  };

  const t = content[variant][lang];
  const isLogin = variant === 'login';

  return (
    <div className="hidden lg:flex relative w-0 flex-1 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900" />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-50"
          style={{
            background: isLogin
              ? 'radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((el, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            style={{
              top: `${10 + (i * 11) % 80}%`,
              left: `${5 + (i * 13) % 90}%`,
              transitionDelay: `${i * 0.1}s`,
              animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <el.Icon size={el.size} className={el.color} strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>

      {/* Glowing orbs */}
      <div
        className={`absolute top-1/4 right-1/4 w-64 h-64 rounded-full transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: isLogin
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <div
        className={`absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
          animation: 'pulse 5s ease-in-out infinite reverse',
        }}
      />

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
        <div
          className={`text-center max-w-md transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Logo */}
          <div
            className={`relative w-24 h-24 mx-auto mb-8 transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <div
              className="absolute inset-0 rounded-2xl blur-2xl"
              style={{
                background: isLogin
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(59, 130, 246, 0.4))'
                  : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(34, 197, 94, 0.4))',
              }}
            />
            <div className="relative w-full h-full rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-2xl bg-white">
              <Image
                src="/favicon.png"
                alt="AfricaVet"
                fill
                className="object-contain p-2"
              />
            </div>
          </div>

          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-white/90">{t.badge}</span>
          </div>

          {/* Title */}
          <h2
            className={`text-4xl font-bold text-white mb-3 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {t.title}
          </h2>

          {/* Subtitle */}
          <p
            className={`text-lg text-white/70 mb-10 transition-all duration-700 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {t.subtitle}
          </p>

          {/* Features */}
          <div
            className={`space-y-4 transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {t.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isLogin ? 'bg-green-500/20' : 'bg-purple-500/20'
                  }`}
                >
                  <feature.icon
                    size={20}
                    className={isLogin ? 'text-green-400' : 'text-purple-400'}
                  />
                </div>
                <span className="text-white/80 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom decoration */}
          <div
            className={`flex items-center justify-center gap-3 mt-12 transition-all duration-700 delay-700 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
