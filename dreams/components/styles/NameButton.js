import styled from 'styled-components';

const NameButton = styled.h3`
  background: ${props => props.theme.teal};
  color: white;
  display: inline-block;
  padding: 4px 6px;
  margin: 0;
  font-size: 4rem;
  border-radius: 5px;
`;

export default NameButton;
