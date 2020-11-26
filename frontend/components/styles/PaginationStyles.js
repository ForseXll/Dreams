import styled from 'styled-components';

const PaginationStyles = styled.div`
  text-align: center;
  display: inline-grid;
  grid-template-columns: repeat(4, auto);
  align-items: stretch;
  justify-content: center;
  align-content: center;
  margin: 2rem 0;
  font-weight: 900;
  font-size: 18px;
  border: 1px solid ${props => props.theme.lightgrey};
  border-radius: 10px;
  & > * {
    margin: 0;
    padding: 15px 30px;
    /* border-right: 1px solid ${props => props.theme.lightgrey}; */
    /* border-left: 1px solid ${props => props.theme.lightgrey}; */
    &:last-child {
      border-right: 0;
    }
  }
  a[aria-disabled='true'] {
    color: grey;
    pointer-events: none;
  }
  a:hover{
    background-color: #F6E2C5;
    border-radius: 10px;
  }
`;

export default PaginationStyles;
