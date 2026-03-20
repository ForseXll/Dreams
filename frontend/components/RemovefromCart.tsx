'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useAppState } from '../lib/appState';

interface RemoveFromCartProps {
  id: number | string;
}

const Button = styled.button`
    font-size: 3rem;
    background: none;
    border: 0;
    &:hover {
        color: pink;
        cursor: pointer;
    }
`;

export default function RemoveFromCart({ id }: RemoveFromCartProps) {
  const app = useAppState();
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    setLoading(true);

    try {
      await app.removeFromCart(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button title="Delete Item" onClick={remove} disabled={loading}>
      X
    </Button>
  );
}
