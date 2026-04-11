import PleaseSignIn from '../../components/PleaseSignIn';
import SingleItem from '../../components/SingleItem';
import StateMessage from '../../components/StateMessage';

export default async function ItemPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <PleaseSignIn>
      {id ? (
        <SingleItem id={id} />
      ) : (
        <StateMessage
          title="Waiting for item details"
          description="This page needs an item id before it can render the product view."
          tone="muted"
        />
      )}
    </PleaseSignIn>
  );
}
