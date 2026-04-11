'use client';

import debounce from 'lodash.debounce';
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

  const runSearch = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        if (!searchTerm) {
          setItems([]);
          setHighlightedIndex(-1);
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const response = await listItems({ search: searchTerm, take: 5 });
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

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="search"
          placeholder="Search for Item"
          id="search"
          className={`w-full border-0 bg-transparent px-6 py-4 text-[1.6rem] outline-none placeholder:text-[var(--color-muted)] ${loading ? 'animate-pulse' : ''}`}
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
          <div className="absolute left-0 top-full z-[2] w-full rounded-b-[10px] border border-[var(--color-border)] bg-white shadow-[0_10px_30px_rgba(27,24,22,0.08)]">
            {items.map((item, index) => (
              <div
                className={`flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 text-[1.4rem] transition-colors last:border-b-0 ${index === highlightedIndex ? 'bg-[var(--color-surface-alt)] pl-6' : 'bg-white'}`}
                key={item.id}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(item);
                }}
              >
                <img className="h-12 w-12 object-cover" src={item.image} alt={item.title} width="50" />
                {item.title}
              </div>
            ))}
            {!items.length && !loading ? (
              <div className="px-4 py-3 text-[1.4rem] text-[var(--color-muted)]">Nothing Found for "{inputValue}"</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
