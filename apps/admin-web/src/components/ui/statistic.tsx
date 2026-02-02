import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface StatisticProps {
  title: string;
  value: string | number | undefined;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  precision?: number;
  valueStyle?: React.CSSProperties;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function Statistic({
  title,
  value,
  prefix,
  suffix,
  className,
  precision,
  valueStyle,
  trend,
}: StatisticProps) {
  const displayValue = React.useMemo(() => {
    if (value === undefined || value === null) return '0.00';
    if (typeof precision === 'number' && !isNaN(Number(value))) {
      return Number(value).toFixed(precision);
    }
    return value;
  }, [value, precision]);

  return (
    <div className={cn('space-y-1', className)}>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <span className="text-syntax-comment">{"// "}</span>
        {title}
      </p>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-muted-foreground">{prefix}</span>}
        <span
          className="font-mono text-2xl font-bold text-syntax-number"
          style={valueStyle}
        >
          {displayValue}
        </span>
        {suffix && (
          <span className="font-mono text-sm text-muted-foreground">{suffix}</span>
        )}
      </div>
      {trend && (
        <p
          className={cn(
            'font-mono text-xs',
            trend.isPositive ? 'text-success' : 'text-error'
          )}
        >
          {trend.isPositive ? '+' : ''}{trend.value}%
        </p>
      )}
    </div>
  );
}
