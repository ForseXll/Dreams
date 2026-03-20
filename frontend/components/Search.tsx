'use client';

import Downshift from 'downshift';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { listItems } from '../lib/api';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

export default function Search() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        if (!searchTerm) {
          setItems([]);
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const response = await listItems({ search: searchTerm, take: 5 });
          setItems(response?.items || []);
        } finally {
          setLoading(false);
        }
      }, 350),
    []
  );

  useEffect(() => {
    return () => runSearch.cancel();
  }, [runSearch]);

  return (
    <SearchStyles>
      <Downshift
        itemToString={(item) => (item === null ? '' : item.title)}
        onChange={(item) => {
          if (item) {
            router.push(`/item?id=${item.id}`);
          }
        }}
      >
        {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
          <div>
            <input
              {...getInputProps({
                type: 'search',
                placeholder: 'Search for Item',
                id: 'search',
                className: loading ? 'loading' : '',
                onChange: (event) => {
                  runSearch((event.target as HTMLInputElement).value);
                },
              })}
            />
            {isOpen ? (
              <DropDown>
                {items.map((item, index) => (
                  <DropDownItem
                    {...getItemProps({ item })}
                    key={item.id}
                    highlighted={index === highlightedIndex}
                  >
                    <img width="50" src={item.image} alt={item.title} />
                    {item.title}
                  </DropDownItem>
                ))}
                {!items.length && !loading ? (
                  <DropDownItem>Nothing Found for "{inputValue}"</DropDownItem>
                ) : null}
              </DropDown>
            ) : null}
          </div>
        )}
      </Downshift>
    </SearchStyles>
  );
}
