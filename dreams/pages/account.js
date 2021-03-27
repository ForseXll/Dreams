import Account from '../components/Account';

const account = props => (
    <div>
        <Account id={props.query.id} />
    </div>
);

export default account;