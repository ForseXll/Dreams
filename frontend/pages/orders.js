import PleaseSignIn from '../components/PleaseSignIn';
import OrdersList from '../components/OrderList';
const Order = props => (
    <div>
        <PleaseSignIn>
            <OrdersList />
        </PleaseSignIn>
    </div>
)
export default Order;