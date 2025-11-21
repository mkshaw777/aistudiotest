import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border border-slate-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300',
  {
    variants: {
      variant: { // Correctly nested 'variant' group
        default:
          'border-transparent bg-slate-900 text-slate-50 shadow hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80',
        secondary:
          'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80',
        destructive:
          'border-transparent bg-mk-error text-slate-50 shadow hover:bg-mk-error/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80',
        outline: 'text-slate-950 dark:text-slate-50',
        success: 'border-transparent bg-mk-success text-white shadow hover:bg-mk-success/80',
        warning: 'border-transparent bg-mk-orange-accent text-white shadow hover:bg-mk-orange-accent/80',
        info: 'border-transparent bg-mk-blue-primary text-white shadow hover:bg-mk-blue-primary/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// FIX: Refactored BadgeProps to a type alias using an intersection (&)
// This robustly combines HTML attributes with CVA variants, solving the typing issue for `className`.
export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
