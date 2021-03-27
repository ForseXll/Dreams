import styled from 'styled-components';

const PriceTag = styled.span`
  background: ${props => props.theme.teal};
  transform: rotate(3deg);
  color: black;
  font-weight: 800;
  padding: 5px;
  line-height: 1;
  font-size: 3rem;
  display: inline-block;
  position: absolute;
  top: -3px;
  right: -3px;
  border-radius: 10px;
`;

export default PriceTag;
