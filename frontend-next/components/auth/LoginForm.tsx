'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, MailCheck, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Language } from '@/lib/types';

interface LoginFormProps {
  lang: Language;
  redirectTo?: string;
}

const translations = {
  fr: {
    title: 'Connexion',
    subtitle: 'Accédez à votre espace AfricaVet',
    email: 'Adresse email',
    emailPlaceholder: 'votre@email.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    login: 'Se connecter',
    loggingIn: 'Connexion en cours...',
    noAccount: "Nouveau sur AfricaVet ?",
    register: "Créer un compte",
    or: 'ou',
    verification: {
      title: 'Email non vérifié',
      message: 'Veuillez vérifier votre email avant de vous connecter.',
      resend: 'Renvoyer l\'email de vérification',
      resending: 'Envoi en cours...',
      resent: 'Email envoyé ! Vérifiez votre boîte de réception.',
    },
    errors: {
      email: 'Veuillez entrer un email valide',
      password: 'Le mot de passe est requis',
      invalidCredentials: 'Email ou mot de passe incorrect',
      accountDeactivated: 'Ce compte a été désactivé',
      serverError: 'Erreur de connexion au serveur',
    },
  },
  en: {
    title: 'Sign in',
    subtitle: 'Access your AfricaVet dashboard',
    email: 'Email address',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    login: 'Sign in',
    loggingIn: 'Signing in...',
    noAccount: "New to AfricaVet?",
    register: 'Create account',
    or: 'or',
    verification: {
      title: 'Email not verified',
      message: 'Please verify your email before logging in.',
      resend: 'Resend verification email',
      resending: 'Sending...',
      resent: 'Email sent! Check your inbox.',
    },
    errors: {
      email: 'Please enter a valid email',
      password: 'Password is required',
      invalidCredentials: 'Invalid email or password',
      accountDeactivated: 'This account has been deactivated',
      serverError: 'Server connection error',
    },
  },
};

export function LoginForm({ lang, redirectTo }: LoginFormProps) {
  const t = translations[lang];
  const router = useRouter();
  const { login, resendVerification } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.email;
    }
    if (!formData.password) {
      newErrors.password = t.errors.password;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setRequiresVerification(false);
    setResendSuccess(false);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        const destination = redirectTo || `/${lang}/dashboard`;
        router.push(destination);
      } else {
        if (result.requiresVerification) {
          setRequiresVerification(true);
          setVerificationEmail(result.email || formData.email);
        } else {
          const message = result.message?.toLowerCase() || '';
          if (message.includes('invalid') || message.includes('credentials') || message.includes('incorrect')) {
            setServerError(t.errors.invalidCredentials);
          } else if (message.includes('deactivated') || message.includes('not active')) {
            setServerError(t.errors.accountDeactivated);
          } else {
            setServerError(result.message || t.errors.invalidCredentials);
          }
        }
      }
    } catch (error) {
      setServerError(t.errors.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      const result = await resendVerification(verificationEmail, lang);
      if (result.success) {
        setResendSuccess(true);
      }
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo for mobile */}
      <div className="flex justify-center mb-8 lg:hidden">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-green-500/20">
          <Image
            src="/favicon.png"
            alt="AfricaVet"
            fill
            className="object-contain p-1 bg-white"
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold mb-4">
          <Sparkles size={14} />
          AfricaVet
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t.title}</h1>
        <p className="text-slate-500">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Server Error */}
        {serverError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            {serverError}
          </div>
        )}

        {/* Verification Required */}
        {requiresVerification && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-amber-800 font-semibold mb-1">{t.verification.title}</h3>
                <p className="text-amber-700 text-sm mb-3">{t.verification.message}</p>
                {resendSuccess ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <MailCheck className="w-4 h-4" />
                    {t.verification.resent}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="flex items-center gap-2 text-amber-700 hover:text-amber-800 text-sm font-medium disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? t.verification.resending : t.verification.resend}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t.email}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t.emailPlaceholder}
              className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-0 focus:border-green-500 transition-all ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {t.password}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t.passwordPlaceholder}
              className={`block w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-0 focus:border-green-500 transition-all ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="w-4 h-4 text-green-600 bg-slate-100 border-slate-300 rounded focus:ring-green-500 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-600">{t.rememberMe}</span>
          </label>
          <Link
            href={`/${lang}/auth/forgot-password`}
            className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            {t.forgotPassword}
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 focus:ring-4 focus:ring-green-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.loggingIn}
            </>
          ) : (
            <>
              {t.login}
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-400">{t.or}</span>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-slate-600 mb-3">{t.noAccount}</p>
          <Link
            href={`/${lang}/auth/register`}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-green-500 hover:text-green-600 transition-all"
          >
            {t.register}
            <ArrowRight size={16} />
          </Link>
        </div>
      </form>
    </div>
  );
}
