'use client';

import { ReactNode } from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

// Animation Variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

// Animation types
type AnimationType = 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'scaleIn' | 'slideUp' | 'stagger' | 'none';

const animationVariants: Record<AnimationType, Variants> = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeIn,
  scaleIn,
  slideUp,
  stagger: staggerContainer,
  none: { hidden: {}, visible: {} },
};

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: AnimationType;
  className?: string;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';
}

export function AnimatedSection({
  children,
  animation = 'fadeInUp',
  className,
  delay = 0,
  threshold = 0.1,
  triggerOnce = true,
  as = 'div',
}: AnimatedSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });

  const variants = animationVariants[animation];

  // Modify variants to include delay
  const delayedVariants: Variants = {
    hidden: variants.hidden,
    visible: {
      ...variants.visible,
      transition: {
        ...(typeof variants.visible === 'object' && 'transition' in variants.visible
          ? variants.visible.transition
          : {}),
        delay,
      },
    },
  };

  const Component = motion[as];

  // If user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={delayedVariants}
      className={className}
    >
      {children}
    </Component>
  );
}

// Animated Item for use inside stagger containers
interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'span';
}

export function AnimatedItem({ children, className, as = 'div' }: AnimatedItemProps) {
  const Component = motion[as];

  return (
    <Component variants={staggerItem} className={className}>
      {children}
    </Component>
  );
}

// Parallax Section
interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number; // -1 to 1, where negative moves opposite to scroll
  direction?: 'vertical' | 'horizontal';
}

export function ParallaxSection({
  children,
  className,
  speed = 0.5,
  direction = 'vertical',
}: ParallaxSectionProps) {
  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  return (
    <motion.div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{
        transform: inView
          ? direction === 'vertical'
            ? `translateY(${speed * 50}px)`
            : `translateX(${speed * 50}px)`
          : 'none',
        transition: 'transform 0.3s ease-out',
      }}
    >
      {children}
    </motion.div>
  );
}

// Count Up Animation
interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ end, duration = 2, prefix = '', suffix = '', className }: CountUpProps) {
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
    >
      {inView && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {prefix}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {end}
          </motion.span>
          {suffix}
        </motion.span>
      )}
    </motion.span>
  );
}

// Reveal on Scroll
interface RevealProps {
  children: ReactNode;
  className?: string;
  width?: 'fit-content' | '100%';
}

export function Reveal({ children, className, width = 'fit-content' }: RevealProps) {
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)} style={{ width }}>
      <motion.div
        initial={{ opacity: 0, y: 75 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 75 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
      <motion.div
        className="absolute top-0 left-0 right-0 bottom-0 bg-av-green-500 z-20"
        initial={{ left: 0 }}
        animate={inView ? { left: '100%' } : { left: 0 }}
        transition={{ duration: 0.5, ease: 'easeIn' }}
      />
    </div>
  );
}

// Text Reveal Animation (character by character)
interface TextRevealProps {
  text: string;
  className?: string;
  charDelay?: number;
}

export function TextReveal({ text, className, charDelay = 0.03 }: TextRevealProps) {
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  const characters = text.split('');

  return (
    <motion.span ref={ref} className={className}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.3,
            delay: index * charDelay,
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
