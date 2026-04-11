'use client';

import debounce from 'lodash.debounce';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Item } from '../lib/api/types';
import { listItems } from '../lib/api';
import { cardVariants, inputVariants, cn } from '../lib/ui';

export default function Search() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const trimmedValue = inputValue.trim();

  const runSearch = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        const nextTerm = searchTerm.trim();

        if (!nextTerm) {
          setItems([]);
          setHighlightedIndex(-1);
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const response = await listItems({ search: nextTerm, take: 5 });
          setItems(response.items);
          setHighlightedIndex(response.items.length ? 0 : -1);
          setIsOpen(true);
        } finally {
          setLoading(false);
        }
      }, 350),
    []
  );

  useEffect(() => {
    return () => runSearch.cancel();
  }, [runSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: Item) => {
    setIsOpen(false);
    setInputValue(item.title);
    router.push(`/item?id=${item.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (!isOpen || !items.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % items.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => (current <= 0 ? items.length - 1 : current - 1));
    }

    if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      handleSelect(items[highlightedIndex]);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[720px]" ref={containerRef}>
      <div className="relative">
        {/* Search Icon */}
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[var(--color-text-muted)]">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        
        <input
          type="search"
          placeholder="Search items..."
          id="search"
          className={cn(
            inputVariants({ size: "lg" }),
            "w-full pl-12 pr-4 transition-all duration-300",
            isOpen && "ring-2 ring-[var(--color-accent)]"
          )}
          value={inputValue}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            const nextValue = event.target.value;
            setInputValue(nextValue);
            runSearch(nextValue);
          }}
        />

        {/* Loading Indicator */}
        <AnimatePresence>
          {loading && (
            <motion.span
              className="absolute top-1/2 right-4 -translate-y-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <svg 
                className="animate-spin h-5 w-5 text-[var(--color-accent)]"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Dropdown Results */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={cn(
                cardVariants({ variant: "elevated" }),
                "absolute left-0 top-[calc(100%+0.8rem)] z-50 w-full p-0"
              )}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="listbox"
            >
              {/* Empty State */}
              {!trimmedValue && !loading && (
                <div className="px-4 py-3 text-[var(--color-text-muted)]">
                  Start typing to search the catalog.
                </div>
              )}
              
              {/* Loading State */}
              {loading && (
                <div className="px-4 py-3 text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-2">
                    <svg 
                      className="animate-spin h-4 w-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching items...
                  </div>
                </div>
              )}

              {/* Results */}
              {items.map((item, index) => (
                <motion.div
                  className={cn(
                    "flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0 cursor-pointer transition-colors",
                    index === highlightedIndex 
                      ? "bg-[var(--color-surface-alt)]" 
                      : "bg-[var(--color-surface-elevated)]"
                  )}
                  key={item.id}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(item);
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {/* Item Image */}
                  {item.image ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        className="object-cover"
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Item Title */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[var(--color-text)]">{item.title}</div>
                    {item.description && (
                      <div className="truncate text-sm text-[var(--color-text-muted)]">
                        {item.description.slice(0, 50)}...
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* No Results */}
              {trimmedValue && !items.length && !loading && (
                <div className="px-4 py-3 text-[var(--color-text-muted)]">
                  No items match &quot;{trimmedValue}&quot;.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
