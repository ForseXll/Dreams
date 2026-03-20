'use client';

import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import OrderStyles from './styles/OrderStyles';
import TimeText from './TimeText';
import type { OrderItem, SingleOrder } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { getOrder } from '../lib/api';

interface OrderProps {
  id: number | string;
}

export default function Order({ id }: OrderProps) {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<SingleOrder | null>(null);

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await getOrder(id);

        if (active) {
          setOrder(response);
        }
      } catch (nextError) {
        if (active) {
          setError(nextError as Error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <OrderStyles>
      <p>Order Id: {id}</p>
      <p>
        <span>Charge</span>
        <span>{order.charge}</span>
      </p>
      <p>
        <span>Date</span>
        <TimeText mode="absolute" value={order.createdAt} />
      </p>
      <p>
        <span>Total</span>
        <span>{formatMoney(order.total)}</span>
      </p>
      <p>
        <span>Item Count</span>
        <span>{order.orderItems.length}</span>
      </p>
      {order.orderItems.map((item: OrderItem) => (
        <div className="order-item" key={item.id}>
          <img src={item.image} alt={item.title} />
          <div className="item-details">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Each: {formatMoney(item.price)}</p>
            <p>SubTotal: {formatMoney(item.price * item.quantity)}</p>
          </div>
        </div>
      ))}
    </OrderStyles>
  );
}
