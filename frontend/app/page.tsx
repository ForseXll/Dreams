import Items from '../components/Items';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Number(rawPage || 1);

  return <Items page={Number.isNaN(page) ? 1 : page} />;
}
