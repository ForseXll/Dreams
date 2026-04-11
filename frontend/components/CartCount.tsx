export default function CartCount({ count }: { count: number }) {
  return count === 0 ? null : (
    <span
      className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--color-danger)] px-1.5 py-1 text-[1.1rem] font-medium leading-none text-white [font-variant-numeric:tabular-nums]"
      key={count}
    >
      {count}
    </span>
  );
}
