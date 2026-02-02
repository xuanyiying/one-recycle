import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border border-border/40",
        destructive: "bg-destructive/10 text-destructive border border-destructive/20",
        outline: "text-foreground border border-border/60",
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        info: "bg-info/10 text-info border border-info/20",
        // Syntax highlighting variants
        keyword: "bg-syntax-keyword/10 text-syntax-keyword border border-syntax-keyword/20",
        number: "bg-syntax-number/10 text-syntax-number border border-syntax-number/20",
        string: "bg-syntax-string/10 text-syntax-string border border-syntax-string/20",
        comment: "bg-muted text-syntax-comment border border-border/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
