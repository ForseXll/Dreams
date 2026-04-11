'use client';

import Link from 'next/link';
import Cart from './Cart';
import Nav from './Nav';
import Search from './Search';

export default function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-stretch border-b border-[var(--color-border)] lg:grid-cols-[auto_1fr]">
        <h1 className="z-[2] mx-0 text-center text-[2.8rem] font-bold tracking-[-0.03em] lg:ml-8 lg:text-left">
          <Link href="/">Dreams</Link>
        </h1>
        <Nav />
      </div>
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 border-b border-[var(--color-border)]">
        <Search />
      </div>
      <Cart />
    </header>
  );
}
