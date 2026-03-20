import Reset from '../../components/Reset';

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tokenValue = params.token || params.resetToken;
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue;

  return token ? <Reset resetToken={token} /> : <p>Loading...</p>;
}
