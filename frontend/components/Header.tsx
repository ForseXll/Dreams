'use client';

import Link from 'next/link';
import Cart from './Cart';
import Nav from './Nav';
import Search from './Search';
import styled from 'styled-components';

const Logo = styled.h1`
  font-size: 3rem;
  margin-left: 2rem;
  position: relative;
  color: blue;
  z-index: 2;

  a {
    display: inline-block;
    padding: 1rem;
    background: ${(props) => props.theme.teal};
    color: black;
    text-transform: uppercase;
  }

  @media (max-width: 1300px) {
    margin: 0;
    text-align: center;
  }
`;

const HeaderStyled = styled.header`
  .bar {
    border-bottom: 10px solid ${(props) => props.theme.grey};
    display: grid;
    grid-template-columns: auto 1fr;
    justify-content: space-between;
    align-items: stretch;

    @media (max-width: 1300px) {
      grid-template-columns: 1fr;
      justify-content: center;
    }
  }

  .sub-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    border-bottom: 1px solid ${(props) => props.theme.black};
  }
`;

export default function Header() {
  return (
    <HeaderStyled>
      <div className="bar">
        <Logo>
          <Link href="/">Dreams</Link>
        </Logo>
        <Nav />
      </div>
      <div className="sub-bar">
        <Search />
      </div>
      <Cart />
    </HeaderStyled>
  );
}
