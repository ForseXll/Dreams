type ErrorLike = {
  message?: string;
  networkError?: {
    result?: {
      errors?: Array<{ message: string }>;
    };
  };
};

function cleanMessage(message: string) {
  return message.replace('GraphQL error: ', '');
}

export default function ErrorMessage({ error }: { error?: ErrorLike }) {
  if (!error || !error.message) {
    return null;
  }

  const networkErrors = error.networkError?.result?.errors;

  if (networkErrors && networkErrors.length) {
    return (
      <>
        {networkErrors.map((networkError, index) => (
          <div
            className="my-4 border border-black/5 border-l-[5px] border-l-[var(--color-text)] bg-white p-5"
            key={index}
          >
            <p className="m-0 font-normal" data-test="request-error">
              <strong className="mr-4">Shoot!</strong>
              {cleanMessage(networkError.message)}
            </p>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="my-4 border border-black/5 border-l-[5px] border-l-[var(--color-text)] bg-white p-5">
      <p className="m-0 font-normal" data-test="request-error">
        <strong className="mr-4">Shoot!</strong>
        {cleanMessage(error.message)}
      </p>
    </div>
  );
}
