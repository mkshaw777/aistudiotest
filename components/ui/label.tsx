import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

// Fix: Explicitly add `className`, `children`, and `htmlFor` to LabelProps.
interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  className?: string;
  children?: React.ReactNode;
  htmlFor?: string; // Add htmlFor here
}

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, children, htmlFor, ...props }, ref) => ( // Destructure htmlFor
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} htmlFor={htmlFor} {...props}> // Pass htmlFor
      {children}
    </LabelPrimitive.Root>
  ),
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };