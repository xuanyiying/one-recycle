'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked ?? checked ?? false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
    };

    return (
      <label className={cn('relative inline-flex cursor-pointer', className)}>
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          className="sr-only peer"
          {...props}
        />
        <div className="w-10 h-5 bg-muted rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background transition-colors duration-200 peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
          <div className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full shadow-sm transition-transform duration-200",
            isChecked && "translate-x-5"
          )} />
        </div>
      </label>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
