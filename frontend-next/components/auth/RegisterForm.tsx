'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, User, Loader2, MailCheck, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Language } from '@/lib/types';

interface RegisterFormProps {
  lang: Language;
}

const translations = {
  fr: {
    title: 'Créer un compte',
    subtitle: 'Rejoignez la communauté AfricaVet',
    username: "Nom d'utilisateur",
    usernamePlaceholder: 'johndoe',
    email: 'Adresse email',
    emailPlaceholder: 'votre@email.com',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Jean',
    lastName: 'Nom',
    lastNamePlaceholder: 'Dupont',
    password: 'Mot de passe',
    passwordPlaceholder: 'Créez un mot de passe sécurisé',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
    termsAccept: "J'accepte les",
    termsLink: "conditions d'utilisation",
    andThe: 'et la',
    privacyLink: 'politique de confidentialité',
    register: "Créer mon compte",
    registering: 'Création en cours...',
    hasAccount: 'Vous avez déjà un compte ?',
    login: 'Se connecter',
    or: 'ou',
    passwordStrength: {
      weak: 'Faible',
      medium: 'Moyen',
      strong: 'Fort',
    },
    verification: {
      title: 'Vérifiez votre email',
      message: 'Un email de vérification a été envoyé à',
      instruction: 'Cliquez sur le lien dans l\'email pour activer votre compte.',
      checkSpam: 'Vérifiez vos spams si vous ne le trouvez pas.',
      backToLogin: 'Se connecter',
    },
    errors: {
      username: "Nom d'utilisateur requis (3 caractères min.)",
      email: 'Veuillez entrer un email valide',
      firstName: 'Le prénom est requis',
      lastName: 'Le nom est requis',
      password: 'Minimum 8 caractères requis',
      confirmPassword: 'Les mots de passe ne correspondent pas',
      terms: 'Veuillez accepter les conditions',
      serverError: 'Erreur de connexion au serveur',
    },
  },
  en: {
    title: 'Create account',
    subtitle: 'Join the AfricaVet community',
    username: 'Username',
    usernamePlaceholder: 'johndoe',
    email: 'Email address',
    emailPlaceholder: 'your@email.com',
    firstName: 'First name',
    firstNamePlaceholder: 'John',
    lastName: 'Last name',
    lastNamePlaceholder: 'Doe',
    password: 'Password',
    passwordPlaceholder: 'Create a secure password',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Confirm your password',
    termsAccept: 'I agree to the',
    termsLink: 'terms of service',
    andThe: 'and the',
    privacyLink: 'privacy policy',
    register: 'Create my account',
    registering: 'Creating account...',
    hasAccount: 'Already have an account?',
    login: 'Sign in',
    or: 'or',
    passwordStrength: {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
    },
    verification: {
      title: 'Check your email',
      message: 'A verification email has been sent to',
      instruction: 'Click the link in the email to activate your account.',
      checkSpam: 'Check your spam folder if you can\'t find it.',
      backToLogin: 'Sign in',
    },
    errors: {
      username: 'Username required (min. 3 characters)',
      email: 'Please enter a valid email',
      firstName: 'First name is required',
      lastName: 'Last name is required',
      password: 'Minimum 8 characters required',
      confirmPassword: 'Passwords do not match',
      terms: 'Please accept the terms',
      serverError: 'Server connection error',
    },
  },
};

function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return { level: 1, label: 'weak' };
  if (strength <= 3) return { level: 2, label: 'medium' };
  return { level: 3, label: 'strong' };
}

export function RegisterForm({ lang }: RegisterFormProps) {
  const t = translations[lang];
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = t.errors.username;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.email;
    }
    if (!formData.firstName) {
      newErrors.firstName = t.errors.firstName;
    }
    if (!formData.lastName) {
      newErrors.lastName = t.errors.lastName;
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = t.errors.password;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.confirmPassword;
    }
    if (!formData.acceptTerms) {
      newErrors.terms = t.errors.terms;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        lang: lang,
      });

      if (result.success) {
        if (result.requiresVerification) {
          setRegistrationSuccess(true);
        } else {
          router.push(`/${lang}/dashboard`);
        }
      } else {
        setServerError(result.message || t.errors.serverError);
      }
    } catch (error) {
      setServerError(t.errors.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <MailCheck className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-3">{t.verification.title}</h1>
        <p className="text-slate-600 mb-2">{t.verification.message}</p>
        <p className="text-green-600 font-semibold text-lg mb-4">{formData.email}</p>
        <p className="text-slate-600 mb-2">{t.verification.instruction}</p>
        <p className="text-sm text-slate-500 mb-8">{t.verification.checkSpam}</p>

        <Link
          href={`/${lang}/auth/login`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all"
        >
          {t.verification.backToLogin}
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo for mobile */}
      <div className="flex justify-center mb-6 lg:hidden">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-blue-500/20">
          <Image
            src="/favicon.png"
            alt="AfricaVet"
            fill
            className="object-contain p-1 bg-white"
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-4">
          <Sparkles size={14} />
          AfricaVet
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t.title}</h1>
        <p className="text-slate-500">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Server Error */}
        {serverError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {serverError}
          </div>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label htmlFor="username" className="block text-sm font-medium text-slate-700">
            {t.username}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder={t.usernamePlaceholder}
              className={`block w-full pl-12 pr-4 py-3 bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-0 focus:border-blue-500 transition-all ${
                errors.username ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t.email}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t.emailPlaceholder}
              className={`block w-full pl-12 pr-4 py-3 bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-0 focus:border-blue-500 transition-all ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
              {t.firstName}
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder={t.firstNamePlaceholder}
              className={`block w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-0 focus:border-blue-500 transition-all ${
                errors.firstName ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
              {t.lastName}
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder={t.lastNamePlaceholder}
              className={`block w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-0 focus:border-blue-500 transition-all ${
                errors.lastName ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {t.password}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t.passwordPlaceholder}
              className={`block w-full pl-12 pr-12 py-3 bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-0 focus:border-blue-500 transition-all ${
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
          {/* Password strength indicator */}
          {formData.password && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength.level >= level
                        ? level === 1
                          ? 'bg-red-500'
                          : level === 2
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span
                className={`text-xs font-medium ${
                  passwordStrength.level === 1
                    ? 'text-red-500'
                    : passwordStrength.level === 2
                    ? 'text-amber-500'
                    : 'text-green-500'
                }`}
              >
                {t.passwordStrength[passwordStrength.label as keyof typeof t.passwordStrength]}
              </span>
            </div>
          )}
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            {t.confirmPassword}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder={t.confirmPasswordPlaceholder}
              className={`block w-full pl-12 pr-12 py-3 bg-slate-50 border-2 rounded-xl focus:bg-white focus:ring-0 focus:border-blue-500 transition-all ${
                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              )}
            </button>
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="absolute inset-y-0 right-12 flex items-center">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        {/* Terms */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="w-5 h-5 mt-0.5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-600 leading-tight">
              {t.termsAccept}{' '}
              <Link href={`/${lang}/terms`} className="text-blue-600 hover:underline font-medium">
                {t.termsLink}
              </Link>{' '}
              {t.andThe}{' '}
              <Link href={`/${lang}/privacy`} className="text-blue-600 hover:underline font-medium">
                {t.privacyLink}
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.registering}
            </>
          ) : (
            <>
              {t.register}
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

        {/* Login Link */}
        <div className="text-center">
          <p className="text-slate-600 mb-3">{t.hasAccount}</p>
          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            {t.login}
            <ArrowRight size={16} />
          </Link>
        </div>
      </form>
    </div>
  );
}
