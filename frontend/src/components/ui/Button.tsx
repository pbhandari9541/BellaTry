import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

/**
 * Reusable Button component. Only uses semantic Tailwind classes from the color system.
 *
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  fullWidth?: boolean;
  isLoading?: boolean;
  asChild?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-primary-brand text-primary-background hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  destructive: 'bg-destructive text-white hover:bg-destructive-hover',
  outline: 'border border-border bg-background text-foreground hover:bg-muted',
  ghost: 'bg-transparent hover:bg-muted text-foreground',
  link: 'underline text-primary hover:text-primary-hover bg-transparent',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, isLoading, asChild = false, size = 'md', children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button'; 