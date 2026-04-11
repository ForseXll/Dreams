import Reset from '../../components/Reset';
import StateMessage from '../../components/StateMessage';

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tokenValue = params.token || params.resetToken;
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue;

  return token ? (
    <Reset resetToken={token} />
  ) : (
    <StateMessage
      title="Waiting for reset token"
      description="Open the reset link from your email to load the password reset form."
      tone="muted"
    />
  );
}
