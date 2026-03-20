import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

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
`;

const Animation = styled.span`
    position: relative;
    .count {
        display: block;
        position: relative;
        transition: 0.5s;
        backface-visibility: hidden;
    }
    .count-enter {
        transform: rotateY(0.5turn);
    }
    .count-enter-active {
        transform: rotateY(0);
    }
    .count-exit {
        top: 0;
        position: absolute;
        transform: rotateY(0);
    }
    .count-exit-active {
        transform: rotateY(0.5turn);
    }
`;

export default function CartCount({ count }: { count: number }) {
  return (
    <Animation>
      <TransitionGroup>
        <CSSTransition
          unmountOnExit
          className="count"
          classNames="count"
          key={count}
          timeout={{ enter: 500, exit: 500 }}
        >
          {count === 0 ? <Circle /> : <Circle>{count}</Circle>}
        </CSSTransition>
      </TransitionGroup>
    </Animation>
  );
}
