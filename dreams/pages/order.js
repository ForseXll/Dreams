import PleaseSignIn from '../components/PleaseSignIn';
import Orders from '../components/Order';
const Order = props => (
    <div>
        <PleaseSignIn>
            <Orders id={props.query.id} />
        </PleaseSignIn>
    </div>
)
export default Order;