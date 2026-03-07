'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MagazineLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'narrow' | 'normal' | 'wide';
  className?: string;
  mainClassName?: string;
  sidebarClassName?: string;
  stickyOffset?: number;
}

const sidebarWidths = {
  narrow: 'lg:w-64',
  normal: 'lg:w-80',
  wide: 'lg:w-96',
};

export function MagazineLayout({
  children,
  sidebar,
  sidebarPosition = 'right',
  sidebarWidth = 'normal',
  className,
  mainClassName,
  sidebarClassName,
  stickyOffset = 100,
}: MagazineLayoutProps) {
  return (
    <div className={cn('py-8 px-4 md:px-[5%]', className)}>
      <div className="container mx-auto">
        <div className={cn(
          'flex flex-col lg:flex-row gap-8',
          sidebarPosition === 'left' && 'lg:flex-row-reverse'
        )}>
          {/* Main Content */}
          <main className={cn('flex-1 min-w-0', mainClassName)}>
            {children}
          </main>

          {/* Sidebar */}
          {sidebar && (
            <aside className={cn(
              'flex-shrink-0',
              sidebarWidths[sidebarWidth],
              sidebarClassName
            )}>
              <div
                className="sticky space-y-6"
                style={{ top: `${stickyOffset}px` }}
              >
                {sidebar}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

// Section Divider
interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <hr className={cn(
      'border-t border-gray-200 my-8',
      className
    )} />
  );
}

// Magazine Section with title
interface MagazineSectionProps {
  title?: string;
  titleIcon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function MagazineSection({
  title,
  titleIcon,
  action,
  children,
  className,
  noPadding = false,
}: MagazineSectionProps) {
  return (
    <section className={cn(!noPadding && 'mb-10', className)}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="section-title-bar" />
            {titleIcon && (
              <span className="text-av-green-600">{titleIcon}</span>
            )}
            <h2 className="section-title">{title}</h2>
          </div>
          {action && (
            <div>{action}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// Two Column Section
interface TwoColumnSectionProps {
  left: ReactNode;
  right: ReactNode;
  ratio?: '1:1' | '2:1' | '1:2' | '3:1' | '1:3' | '7:5' | '5:7';
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const ratioClasses = {
  '1:1': 'lg:grid-cols-2',
  '2:1': 'lg:grid-cols-3 [&>*:first-child]:lg:col-span-2',
  '1:2': 'lg:grid-cols-3 [&>*:last-child]:lg:col-span-2',
  '3:1': 'lg:grid-cols-4 [&>*:first-child]:lg:col-span-3',
  '1:3': 'lg:grid-cols-4 [&>*:last-child]:lg:col-span-3',
  '7:5': 'lg:grid-cols-12 [&>*:first-child]:lg:col-span-7 [&>*:last-child]:lg:col-span-5',
  '5:7': 'lg:grid-cols-12 [&>*:first-child]:lg:col-span-5 [&>*:last-child]:lg:col-span-7',
};

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

export function TwoColumnSection({
  left,
  right,
  ratio = '1:1',
  className,
  gap = 'md',
}: TwoColumnSectionProps) {
  return (
    <div className={cn(
      'grid grid-cols-1',
      ratioClasses[ratio],
      gapClasses[gap],
      className
    )}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

// Full Width Banner Section
interface FullWidthBannerProps {
  children: ReactNode;
  className?: string;
  bgColor?: string;
}

export function FullWidthBanner({
  children,
  className,
  bgColor = 'bg-oh-background',
}: FullWidthBannerProps) {
  return (
    <div className={cn(
      'w-full -mx-4 md:-mx-[5%] px-4 md:px-[5%] py-8',
      bgColor,
      className
    )}>
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
}

// Card Grid
interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export function CardGrid({
  children,
  columns = 3,
  className,
  gap = 'md',
}: CardGridProps) {
  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Horizontal Scroll Container
interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  return (
    <div className={cn(
      'flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth',
      className
    )}>
      {children}
    </div>
  );
}

// Content Box (for editor notes, quotes, etc.)
interface ContentBoxProps {
  children: ReactNode;
  variant?: 'default' | 'highlight' | 'quote' | 'warning';
  className?: string;
}

const contentBoxVariants = {
  default: 'bg-gray-50 border-gray-200',
  highlight: 'bg-av-green-50 border-av-green-200',
  quote: 'bg-av-blue-50 border-l-4 border-av-blue-500',
  warning: 'bg-amber-50 border-l-4 border-amber-500',
};

export function ContentBox({
  children,
  variant = 'default',
  className,
}: ContentBoxProps) {
  return (
    <div className={cn(
      'rounded-xl p-4 border',
      contentBoxVariants[variant],
      className
    )}>
      {children}
    </div>
  );
}
