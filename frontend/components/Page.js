import React, { Component } from 'react';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';
import Meta from './Meta';
import Header from './Header';

const theme = {
  grey: '#3E3B3B',
  red: '#EB1C1C',
  black: '#0C0303',
  pink: '#F011B6',
  yellow: '#F0E911',
  teal: '#43D3D8',
  maxWidth: '1000px',

}

const StyledPage = styled.div`
    background: white;
    color: black;
`;

const Inner = styled.div`
    max-width: ${props => props.theme.maxWidth};
    margin: 0 auto;
    padding: 2rem;
`;

injectGlobal`
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
    font-family: 'Sans-serif';
  }
  a {
    text-decoration: none;
    color: ${theme.black};
  }
  button {  font-family: 'Sans-serif'; }
`;


class Page extends Component
{
  render()
  {
    return (
      <ThemeProvider theme={theme}>
        <StyledPage>
          <Meta />
          <Header />
          <Inner>{this.props.children}</Inner>
        </StyledPage>
      </ThemeProvider>
    );
  }
}

export default Page;