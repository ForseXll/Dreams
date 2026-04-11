'use client';

import debounce from 'lodash.debounce';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Item } from '../lib/api/types';
import { listItems } from '../lib/api';

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
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[1.25rem] text-[var(--color-muted)] sm:text-[1.4rem]">
          Search
        </span>
        <input
          type="search"
          placeholder="Search items"
          id="search"
          className={`h-11 w-full rounded-lg border border-[var(--color-border)] bg-white pr-4 pl-18 text-[1.4rem] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-text)] sm:h-12 sm:pl-20 sm:text-[1.5rem] ${loading ? 'animate-pulse' : ''}`}
          value={inputValue}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            const nextValue = event.target.value;
            setInputValue(nextValue);
            runSearch(nextValue);
          }}
        />
        {isOpen ? (
          <div className="absolute left-0 top-[calc(100%+0.8rem)] z-[2] w-full overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-white shadow-[0_10px_30px_rgba(27,24,22,0.08)]" role="listbox">
            {!trimmedValue && !loading ? (
              <div className="px-4 py-3 text-[1.3rem] text-[var(--color-muted)] sm:text-[1.4rem]">
                Start typing to search the catalog.
              </div>
            ) : null}
            {loading ? (
              <div className="px-4 py-3 text-[1.3rem] text-[var(--color-muted)] sm:text-[1.4rem]">
                Searching items...
              </div>
            ) : null}
            {items.map((item, index) => (
              <div
                className={`flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 text-[1.3rem] transition-colors last:border-b-0 sm:text-[1.4rem] ${index === highlightedIndex ? 'bg-[var(--color-surface-alt)] pl-5 sm:pl-6' : 'bg-white'}`}
                key={item.id}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(item);
                }}
              >
                {item.image ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12">
                    <Image
                      className="object-cover"
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-alt)] text-[1.1rem] text-[var(--color-muted)] sm:h-12 sm:w-12">
                    N/A
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate font-semibold text-[var(--color-text)]">{item.title}</div>
                </div>
              </div>
            ))}
            {trimmedValue && !items.length && !loading ? (
              <div className="px-4 py-3 text-[1.3rem] text-[var(--color-muted)] sm:text-[1.4rem]">
                No items match &quot;{trimmedValue}&quot;.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
