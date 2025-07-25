import * as React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { cn } from '@/lib/utils';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>, NextLinkProps {
  className?: string;
  children: React.ReactNode;
  underline?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive' | 'muted' | 'button';
}

const variantClasses = {
  primary: 'text-primary hover:text-primary-hover',
  secondary: 'text-secondary hover:text-secondary-hover',
  destructive: 'text-destructive hover:text-destructive-hover',
  muted: 'text-muted-foreground hover:text-foreground',
  button: 'inline-flex items-center justify-center rounded-md font-medium transition-colors bg-primary-brand text-primary-background px-6 py-3 hover:bg-primary-hover',
};

/**
 * Reusable Link component for navigation. Uses semantic Tailwind classes from the color system.
 * Supports Next.js routing and accessibility.
 *
 * @param variant - Visual style: 'primary' | 'secondary' | 'destructive' | 'muted' | 'button'. Defaults to 'primary'.
 *   - 'button' makes the link look like a primary button.
 * @param underline - Whether to underline the link. Defaults to false.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, underline = false, variant = 'primary', ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        className={cn(
          'focus:outline-none focus:underline transition-colors',
          variantClasses[variant],
          underline && 'underline',
          className
        )}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
Link.displayName = 'Link'; 