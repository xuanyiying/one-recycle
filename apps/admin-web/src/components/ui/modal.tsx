import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  width = 520,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full rounded-lg bg-card text-card-foreground shadow-terminal border border-border/40 animate-in zoom-in-95 duration-200"
        style={{ maxWidth: width }}
      >
        {/* Terminal window chrome */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-muted/20 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <button
                onClick={() => onOpenChange(false)}
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                aria-label="Close"
              />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-3 font-mono text-sm text-muted-foreground">{title}</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-border/40 p-4 bg-muted/10 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
