import { Query } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';
import SignIn from './SignIn';
import SignUp from './SignUp';

const PleaseSignIn = props =>
    (
        <Query query={CURRENT_USER_QUERY}>
            {({ data, loading }) =>
            {
                if (loading) return <p>loading..</p>
                if (!data.me)
                {
                    return (
                        <div>
                            <h3>Please Sign In before continuing.</h3>
                            <SignIn />
                            <h3>Or Sign Up if you don't have an account!</h3>
                            <SignUp />
                        </div>
                    );
                }
                return props.children;
            }}
        </Query >
    )

export default PleaseSignIn;