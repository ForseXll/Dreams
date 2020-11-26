import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const Circle = styled.div`
    background-color: red;
    color: white;
    border-radius: 50%;
    padding: 0.5 rem;
    line-height: 2rem;
    min-width: 3rem;
    margin-left:1 rem;
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
        position:absolute;
        transform: rotateY(0);
    }
    .count-exit-active {
        transform: rotateY(0.5turn);
    }
`;

const CartCount = (props) => (
    <Animation>
        <TransitionGroup>
            <CSSTransition
                unmountOnExit
                className="count"
                classNames="count"
                key={props.count}
                timeout={{ enter: 500, exit: 500 }}
            >
                {props.count == 0 ? <Circle></Circle> :
                    <Circle>{props.count}</Circle>
                }
            </CSSTransition>
        </TransitionGroup>
    </Animation>
)

export default CartCount;