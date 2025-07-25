/**
 * Reusable Card component for displaying news, sentiment, or info blocks.
 * - Supports title, icon, children, footer, and variant (default, positive, negative, warning, accent).
 * - Uses only semantic color classes from the project color system.
 */
import React from 'react';

export type CardVariant = 'default' | 'positive' | 'negative' | 'warning' | 'accent';

export type CardProps = {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: CardVariant;
};

const variantBg: Record<CardVariant, string> = {
  default: 'bg-card-background',
  positive: 'bg-positive text-white',
  negative: 'bg-negative text-white',
  warning: 'bg-warning text-primary-text',
  accent: 'bg-accent text-white',
};

export const Card: React.FC<CardProps> = ({
  title,
  icon,
  children,
  footer,
  className = '',
  variant = 'default',
}) => (
  <div className={`border border-border rounded-lg p-4 ${variantBg[variant]} ${className}`}>
    {(icon || title) && (
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-xl">{icon}</span>}
        {title && <h3 className="text-primary-text font-semibold text-lg">{title}</h3>}
      </div>
    )}
    <div className="text-foreground mb-2">{children}</div>
    {footer && <div className="mt-2 text-muted-foreground text-sm">{footer}</div>}
  </div>
);

export default Card; 