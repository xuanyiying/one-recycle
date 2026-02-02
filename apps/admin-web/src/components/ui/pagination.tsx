import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  total: number;
  pageSize: number;
  current: number;
  onChange: (page: number) => void;
}

export function Pagination({ total, pageSize, current, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize) || 0;

  const getVisiblePages = () => {
    if (totalPages <= 0) return [];
    const delta = 1;
    const pages: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  if (isNaN(totalPages) || totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background transition-all duration-150 hover:bg-muted hover:border-primary/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 text-muted-foreground">...</span>
          ) : (
            <button
              onClick={() => onChange(page as number)}
              className={cn(
                'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border transition-all duration-150',
                current === page
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border/40 bg-background hover:bg-muted hover:border-primary/50'
              )}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <span className="px-2 text-muted-foreground text-xs">
        / {totalPages}
      </span>

      <button
        onClick={() => onChange(Math.min(totalPages, current + 1))}
        disabled={current === totalPages}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background transition-all duration-150 hover:bg-muted hover:border-primary/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
