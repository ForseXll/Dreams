'use client';

import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Item } from '../lib/api/types';
import { listItems } from '../lib/api';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

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
    <SearchStyles>
      <div ref={containerRef}>
        <input
          type="search"
          placeholder="Search for Item"
          id="search"
          className={loading ? 'loading' : ''}
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
          <DropDown>
            {items.map((item, index) => (
              <DropDownItem
                key={item.id}
                highlighted={index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(item);
                }}
              >
                <img width="50" src={item.image} alt={item.title} />
                {item.title}
              </DropDownItem>
            ))}
            {!items.length && !loading ? <DropDownItem>Nothing Found for "{inputValue}"</DropDownItem> : null}
          </DropDown>
        ) : null}
      </div>
    </SearchStyles>
  );
}
