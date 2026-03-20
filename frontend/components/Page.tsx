'use client';

import type { ReactNode } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Header from './Header';

const theme = {
  black: '#0c0303',
  bs: '0 12px 32px rgba(12, 3, 3, 0.15)',
  grey: '#3e3b3b',
  lightgrey: '#d8d8d8',
  maxWidth: '1000px',
  offWhite: '#ededed',
  pink: '#f011b6',
  red: '#eb1c1c',
  teal: '#43d3d8',
  yellow: '#f0e911',
};

const GlobalStyles = createGlobalStyle`
  html {
    box-sizing: border-box;
    font-size: 10px;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body {
    padding: 0;
    margin: 0;
    font-size: 1.5rem;
    line-height: 2;
    font-family: 'Trebuchet MS', sans-serif;
    background: linear-gradient(180deg, #fbf8ef 0%, #ffffff 100%);
    color: ${theme.black};
  }

  a {
    text-decoration: none;
    color: ${theme.black};
  }

  button {
    font-family: inherit;
  }
`;

const StyledPage = styled.div`
  min-height: 100vh;
  color: black;
`;

const Inner = styled.div`
  max-width: ${(props) => props.theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
`;

interface PageProps {
  children: ReactNode;
}

export default function Page({ children }: PageProps) {
  return (
    <ThemeProvider theme={theme}>
      <StyledPage>
        <GlobalStyles />
        <Header />
        <Inner>{children}</Inner>
      </StyledPage>
    </ThemeProvider>
  );
}
