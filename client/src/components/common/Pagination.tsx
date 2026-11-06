import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-xl text-stone-600 hover:bg-forest-50 hover:text-forest-700 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-stone-200"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, idx) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="px-2.5 py-1 text-xs text-stone-400 select-none"
            >
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page as number)}
            aria-current={isCurrent ? 'page' : undefined}
            className={`
              min-w-[36px] h-9 px-2 text-xs font-semibold rounded-xl transition-all duration-150
              ${isCurrent
                ? 'bg-forest-600 text-white shadow-sm ring-1 ring-forest-600'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
              }
            `}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-xl text-stone-600 hover:bg-forest-50 hover:text-forest-700 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-stone-200"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

