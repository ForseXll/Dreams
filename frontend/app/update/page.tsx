import PleaseSignIn from '../../components/PleaseSignIn';
import StateMessage from '../../components/StateMessage';
import UpdateItem from '../../components/UpdateItem';

export default async function UpdatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <PleaseSignIn>
      {id ? (
        <UpdateItem id={id} />
      ) : (
        <StateMessage
          title="Waiting for item details"
          description="This page needs an item id before it can load the edit form."
          tone="muted"
        />
      )}
    </PleaseSignIn>
  );
}
