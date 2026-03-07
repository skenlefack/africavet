'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';

interface NewsletterBoxProps {
  lang: Language;
  variant?: 'default' | 'compact' | 'glass' | 'dark';
  className?: string;
  title?: string;
  description?: string;
}

export function NewsletterBox({
  lang,
  variant = 'default',
  className,
  title,
  description,
}: NewsletterBoxProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const defaultTitle = lang === 'fr' ? 'Newsletter AfricaVet' : 'AfricaVet Newsletter';
  const defaultDescription = lang === 'fr'
    ? 'Recevez les dernières actualités vétérinaires directement dans votre boîte mail.'
    : 'Get the latest veterinary news delivered directly to your inbox.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setErrorMessage(lang === 'fr' ? 'Veuillez entrer votre email' : 'Please enter your email');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        throw new Error('Subscription failed');
      }
    } catch {
      setStatus('error');
      setErrorMessage(lang === 'fr' ? 'Une erreur est survenue' : 'An error occurred');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const variantStyles = {
    default: 'bg-gradient-to-br from-av-green-500 to-av-green-600 text-white',
    compact: 'bg-white border border-gray-200 shadow-lg',
    glass: 'glass-card',
    dark: 'bg-gradient-to-br from-av-dark-800 to-av-dark-900 text-white',
  };

  const inputStyles = {
    default: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50',
    compact: 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-av-green-500',
    glass: 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40',
    dark: 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40',
  };

  const buttonStyles = {
    default: 'bg-white text-av-green-600 hover:bg-gray-100',
    compact: 'bg-av-green-500 text-white hover:bg-av-green-600',
    glass: 'bg-white/20 text-white hover:bg-white/30 border border-white/30',
    dark: 'bg-av-green-500 text-white hover:bg-av-green-600',
  };

  return (
    <motion.div
      className={cn(
        'rounded-2xl p-6 relative overflow-hidden',
        variantStyles[variant],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      {(variant === 'default' || variant === 'dark') && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className={cn(
              'p-2 rounded-lg',
              variant === 'compact' ? 'bg-av-green-100' : 'bg-white/20'
            )}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Mail className={cn(
              'w-5 h-5',
              variant === 'compact' ? 'text-av-green-600' : 'text-white'
            )} />
          </motion.div>
          <h3 className={cn(
            'font-bold text-lg',
            variant === 'compact' ? 'text-av-dark-900' : 'text-white'
          )}>
            {title || defaultTitle}
          </h3>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className={cn(
              'w-4 h-4',
              variant === 'compact' ? 'text-av-orange-500' : 'text-yellow-300'
            )} />
          </motion.div>
        </div>

        <p className={cn(
          'text-sm mb-4',
          variant === 'compact' ? 'text-gray-600' : 'text-white/90'
        )}>
          {description || defaultDescription}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={lang === 'fr' ? 'Votre email...' : 'Your email...'}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl border transition-all duration-300 outline-none',
                inputStyles[variant],
                status === 'error' && 'border-red-400'
              )}
              disabled={status === 'loading' || status === 'success'}
            />
            <motion.button
              type="submit"
              className={cn(
                'px-4 py-3 rounded-xl font-semibold transition-all duration-300',
                'flex items-center justify-center min-w-[48px]',
                buttonStyles[variant],
                (status === 'loading' || status === 'success') && 'opacity-70 cursor-not-allowed'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={status === 'loading' || status === 'success'}
            >
              <AnimatePresence mode="wait">
                {status === 'loading' ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
                  />
                ) : status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-sm mt-3 text-green-300"
              >
                <CheckCircle className="w-4 h-4" />
                {lang === 'fr' ? 'Merci pour votre inscription !' : 'Thanks for subscribing!'}
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-sm mt-3 text-red-300"
              >
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        {/* Privacy note */}
        <p className={cn(
          'text-xs mt-3',
          variant === 'compact' ? 'text-gray-400' : 'text-white/60'
        )}>
          {lang === 'fr'
            ? 'Nous respectons votre vie privée. Désabonnement à tout moment.'
            : 'We respect your privacy. Unsubscribe at any time.'}
        </p>
      </div>
    </motion.div>
  );
}

// Minimal inline newsletter (for footer etc.)
interface InlineNewsletterProps {
  lang: Language;
  className?: string;
}

export function InlineNewsletter({ lang, className }: InlineNewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={lang === 'fr' ? 'Votre email' : 'Your email'}
        className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:bg-white/20"
        disabled={status !== 'idle'}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-av-green-500 text-white text-sm font-medium hover:bg-av-green-600 transition-colors disabled:opacity-50"
        disabled={status !== 'idle'}
      >
        {status === 'success' ? '✓' : status === 'loading' ? '...' : lang === 'fr' ? 'Envoyer' : 'Subscribe'}
      </button>
    </form>
  );
}
