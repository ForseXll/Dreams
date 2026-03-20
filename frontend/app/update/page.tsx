import PleaseSignIn from '../../components/PleaseSignIn';
import UpdateItem from '../../components/UpdateItem';

export default async function UpdatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <PleaseSignIn>{id ? <UpdateItem id={id} /> : <p>Loading...</p>}</PleaseSignIn>;
}
