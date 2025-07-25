import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Textarea component for multi-line input. Only uses semantic Tailwind classes from the color system.
 *
 * @param {React.TextareaHTMLAttributes<HTMLTextAreaElement>} props
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea'; 