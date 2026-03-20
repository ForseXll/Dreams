import Order from '../../components/Order';
import PleaseSignIn from '../../components/PleaseSignIn';

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <PleaseSignIn>{id ? <Order id={id} /> : <p>Loading...</p>}</PleaseSignIn>;
}
