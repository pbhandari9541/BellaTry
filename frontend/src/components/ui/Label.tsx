import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Label component for form fields. Only uses semantic Tailwind classes from the color system.
 *
 * @param {React.LabelHTMLAttributes<HTMLLabelElement>} props
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block mb-1 font-medium text-primary-text', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label'; 