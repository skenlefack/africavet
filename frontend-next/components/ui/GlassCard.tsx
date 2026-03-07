'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type GlassVariant = 'default' | 'light' | 'dark' | 'solid' | 'gradient';
type GlassSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: GlassVariant;
  size?: GlassSize;
  hover?: boolean;
  glow?: boolean;
  glowColor?: 'green' | 'blue' | 'orange';
  noPadding?: boolean;
  className?: string;
}

const variantClasses: Record<GlassVariant, string> = {
  default: 'backdrop-blur-xl bg-white/10 border border-white/20 shadow-glass',
  light: 'backdrop-blur-lg bg-white/70 border border-white/50 shadow-glass',
  dark: 'backdrop-blur-xl bg-black/20 border border-white/10 shadow-glass',
  solid: 'bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg',
  gradient: 'backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 shadow-glass',
};

const sizeClasses: Record<GlassSize, string> = {
  sm: 'rounded-lg p-3',
  md: 'rounded-xl p-4',
  lg: 'rounded-2xl p-6',
  xl: 'rounded-3xl p-8',
};

const hoverClasses: Record<GlassVariant, string> = {
  default: 'hover:bg-white/20 hover:shadow-glass-lg hover:-translate-y-1',
  light: 'hover:bg-white/80 hover:shadow-glass-lg hover:-translate-y-1',
  dark: 'hover:bg-black/30 hover:shadow-glass-lg hover:-translate-y-1',
  solid: 'hover:shadow-xl hover:-translate-y-1',
  gradient: 'hover:from-white/30 hover:to-white/10 hover:shadow-glass-lg hover:-translate-y-1',
};

const glowClasses = {
  green: 'hover:shadow-neon-green',
  blue: 'hover:shadow-neon-blue',
  orange: 'hover:shadow-neon-orange',
};

export function GlassCard({
  children,
  variant = 'default',
  size = 'md',
  hover = true,
  glow = false,
  glowColor = 'green',
  noPadding = false,
  className,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'transition-all duration-500',
        variantClasses[variant],
        noPadding ? sizeClasses[size].split(' ')[0] : sizeClasses[size],
        hover && hoverClasses[variant],
        glow && glowClasses[glowColor],
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

// Glass Card Header
interface GlassCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardHeader({ children, className }: GlassCardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

// Glass Card Title
interface GlassCardTitleProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function GlassCardTitle({ children, className, gradient = false }: GlassCardTitleProps) {
  return (
    <h3 className={cn(
      'text-xl font-bold',
      gradient ? 'text-gradient' : 'text-white',
      className
    )}>
      {children}
    </h3>
  );
}

// Glass Card Content
interface GlassCardContentProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardContent({ children, className }: GlassCardContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

// Glass Card Footer
interface GlassCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardFooter({ children, className }: GlassCardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-white/10', className)}>
      {children}
    </div>
  );
}

// Glass Card Image
interface GlassCardImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  kenBurns?: boolean;
}

export function GlassCardImage({ src, alt, className, overlay = true, kenBurns = false }: GlassCardImageProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover object-top transition-transform duration-700',
          kenBurns && 'animate-ken-burns',
          'group-hover:scale-110'
        )}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      )}
    </div>
  );
}

// Featured Glass Card (larger, with image)
interface FeaturedGlassCardProps {
  title: string;
  description?: string;
  image?: string;
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'orange' | 'red';
  href?: string;
  onClick?: () => void;
  className?: string;
}

const badgeColors = {
  green: 'bg-av-green-500',
  blue: 'bg-av-blue-500',
  orange: 'bg-av-orange-500',
  red: 'bg-red-500',
};

export function FeaturedGlassCard({
  title,
  description,
  image,
  badge,
  badgeColor = 'green',
  href,
  onClick,
  className,
}: FeaturedGlassCardProps) {
  const content = (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-2xl cursor-pointer',
        'transition-all duration-500 hover:-translate-y-2 hover:shadow-glass-xl',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col justify-end min-h-[300px]">
        {badge && (
          <span className={cn(
            'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-3 w-fit',
            badgeColors[badgeColor]
          )}>
            {badge}
          </span>
        )}
        <h3 className="text-2xl font-bold text-white mb-2 text-shadow-lg line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-white/80 text-sm line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Glass overlay on hover */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
