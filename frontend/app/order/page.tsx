import Order from '../../components/Order';
import PleaseSignIn from '../../components/PleaseSignIn';
import StateMessage from '../../components/StateMessage';

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;

  return (
    <PleaseSignIn>
      {id || sessionId ? (
        <Order id={id} sessionId={sessionId} />
      ) : (
        <StateMessage
          title="Waiting for order details"
          description="This page needs an order id or checkout session id before it can load the order summary."
          tone="muted"
        />
      )}
    </PleaseSignIn>
  );
}
