import styled from 'styled-components';

type ErrorLike = {
  message?: string;
  networkError?: {
    result?: {
      errors?: Array<{ message: string }>;
    };
  };
};

const ErrorStyles = styled.div`
  padding: 2rem;
  background: white;
  margin: 2rem 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-left: 5px solid black;
  p {
    margin: 0;
    font-weight: 100;
  }
  strong {
    margin-right: 1rem;
  }
`;

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
          <ErrorStyles key={index}>
            <p data-test="request-error">
              <strong>Shoot!</strong>
              {cleanMessage(networkError.message)}
            </p>
          </ErrorStyles>
        ))}
      </>
    );
  }

  return (
    <ErrorStyles>
      <p data-test="request-error">
        <strong>Shoot!</strong>
        {cleanMessage(error.message)}
      </p>
    </ErrorStyles>
  );
}
