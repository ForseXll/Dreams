import styled from 'styled-components';

const CheckOutButton = styled.button`
  background: ${props => props.theme.teal};
  color: black;
  font-weight: 600;
  border: 0;
  border-radius: 5px;
  text-transform: uppercase;
  font-size: 2rem;
  padding: 0.8rem 1.5rem;
  display: inline-block;
  transition: all 0.5s;
  cursor: pointer;
  &[disabled] {
    opacity: 0.5;
  }
  &:hover{
    transform: scale(1.1);
  }
`;

export default CheckOutButton;
