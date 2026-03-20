import OrderList from '../../components/OrderList';
import PleaseSignIn from '../../components/PleaseSignIn';

export default function OrdersPage() {
  return (
    <PleaseSignIn>
      <OrderList />
    </PleaseSignIn>
  );
}
