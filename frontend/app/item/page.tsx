import PleaseSignIn from '../../components/PleaseSignIn';
import SingleItem from '../../components/SingleItem';

export default async function ItemPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <PleaseSignIn>{id ? <SingleItem id={id} /> : <p>Loading...</p>}</PleaseSignIn>;
}
