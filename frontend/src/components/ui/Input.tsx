import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Input component for text, email, password, etc. Only uses semantic Tailwind classes from the color system.
 *
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input'; 