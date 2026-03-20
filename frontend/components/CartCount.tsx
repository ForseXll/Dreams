import styled, { keyframes } from 'styled-components';

const popIn = keyframes`
  from {
    opacity: 0;
    transform: rotateY(0.5turn) scale(0.9);
  }

  to {
    opacity: 1;
    transform: rotateY(0turn) scale(1);
  }
`;

const Circle = styled.div`
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
  animation: ${popIn} 0.35s ease;
`;

export default function CartCount({ count }: { count: number }) {
  return <Circle key={count}>{count === 0 ? '' : count}</Circle>;
}
