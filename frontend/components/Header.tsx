'use client';

import Link from 'next/link';
import Cart from './Cart';
import Nav from './Nav';
import Search from './Search';

export default function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col px-4 sm:px-6">
        <div className="grid items-center gap-4 border-b border-[var(--color-border)] py-4 lg:grid-cols-[auto_1fr] lg:py-5">
          <h1 className="m-0 text-center text-[2.4rem] font-bold tracking-[-0.03em] sm:text-[2.8rem] lg:text-left">
            <Link className="inline-flex items-center" href="/">Dreams</Link>
          </h1>
          <Nav />
        </div>
        <div className="py-4 lg:py-5">
          <Search />
        </div>
      </div>
      <Cart />
    </header>
  );
}
