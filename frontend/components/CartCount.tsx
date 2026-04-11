export default function CartCount({ count }: { count: number }) {
  return count === 0 ? null : (
    <span
      className="ml-3 inline-flex min-w-7 items-center justify-center rounded-full bg-[var(--color-danger)] px-2 py-1 text-[1.2rem] font-medium leading-none text-white [font-variant-numeric:tabular-nums]"
      key={count}
    >
      {count}
    </span>
  );
}
