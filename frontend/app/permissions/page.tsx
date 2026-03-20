import Permissions from '../../components/Permissions';
import PleaseSignIn from '../../components/PleaseSignIn';

export default function PermissionsPage() {
  return (
    <PleaseSignIn>
      <Permissions />
    </PleaseSignIn>
  );
}
