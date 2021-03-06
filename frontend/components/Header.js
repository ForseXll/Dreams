import Nav from './Nav';
import Link from 'next/link';
import styled from 'styled-components';
import Router from 'next/router';
import NProgress from 'nprogress';
import Cart from './Cart';
import Search from './Search';

Router.onRouteChangeStart = () =>
{
    NProgress.start();
}
Router.onRouteChangeComplete = () =>
{
    NProgress.done();
}
Router.onRouteChangeError = () =>
{
    NProgress.done();
}

const Logo = styled.h1`
    font-size: 3rem;
    margin-left: 2rem;
    position:relative;
    color: blue;
    z-index: 2;
    /* transform: skew(-7deg); */
    a {
        padding: 1rem 1rem;
        background: ${props => props.theme.teal};
        color: black;
        text-transform: uppercase;
        text-decoration: none;
    }
    @media (max-width: 1300px) {
        margin: 0;
        text-align: center;
    }
`;

const HeaderStyled = styled.header`
    .bar {
    border-bottom: 10px solid ${props => props.theme.grey};
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
    border-bottom: 1px solid ${props => props.theme.black};
  }
`;

const Header = () => (
    <HeaderStyled>
        <div className="bar">
            <Logo>
                <Link href="/">
                    <a>Dreams</a>
                </Link>
            </Logo>
            <Nav />
        </div>
        <div className="sub-bar">
            <Search />
        </div>
        <Cart />
    </HeaderStyled>
)

export default Header;