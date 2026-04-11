'use client';

import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import TimeText from './TimeText';
import type { OrderItem, SingleOrder } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { panelClass } from '../lib/ui';
import { completeCheckoutSession, getOrder } from '../lib/api';
import { useAppState } from '../lib/appState';

interface OrderProps {
  id?: number | string;
  sessionId?: string;
}

export default function Order({ id, sessionId }: OrderProps) {
  const app = useAppState();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<SingleOrder | null>(null);

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = sessionId
          ? await completeCheckoutSession({ sessionId })
          : id
            ? await getOrder(id)
            : null;

        if (active && response) {
          setOrder(response);
          await app.refreshCart().catch(() => null);
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
  }, [app, id, sessionId]);

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
    <div className={`${panelClass} mx-auto max-w-[1000px] border-t-4 border-t-[var(--color-danger)] p-6`}>
      <div className="grid border-b border-[var(--color-border)] py-3 md:grid-cols-[140px_1fr]">
        <span className="font-bold md:text-right md:pr-4">Order Id</span>
        <span>{order.id}</span>
      </div>
      <div className="grid border-b border-[var(--color-border)] py-3 md:grid-cols-[140px_1fr]">
        <span className="font-bold md:text-right md:pr-4">Charge</span>
        <span>{order.charge}</span>
      </div>
      <div className="grid border-b border-[var(--color-border)] py-3 md:grid-cols-[140px_1fr]">
        <span className="font-bold md:text-right md:pr-4">Date</span>
        <TimeText mode="absolute" value={order.createdAt} />
      </div>
      <div className="grid border-b border-[var(--color-border)] py-3 md:grid-cols-[140px_1fr]">
        <span className="font-bold md:text-right md:pr-4">Total</span>
        <span>{formatMoney(order.total)}</span>
      </div>
      <div className="grid border-b border-[var(--color-border)] py-3 md:grid-cols-[140px_1fr]">
        <span className="font-bold md:text-right md:pr-4">Item Count</span>
        <span>{order.orderItems.length}</span>
      </div>
      {order.orderItems.map((item: OrderItem) => (
        <div className="my-6 grid items-center gap-6 border-b border-[var(--color-border)] pb-6 md:grid-cols-[300px_1fr]" key={item.id}>
          <img className="h-full w-full rounded-lg object-cover" src={item.image} alt={item.title} />
          <div className="item-details">
            <h2 className="m-0 text-[2.4rem] font-bold tracking-[-0.03em]">{item.title}</h2>
            <p className="mb-3 mt-3 text-[1.5rem] leading-[1.6] text-[var(--color-muted)]">{item.description}</p>
            <p className="m-0">Quantity: {item.quantity}</p>
            <p className="m-0">Each: {formatMoney(item.price)}</p>
            <p className="m-0">SubTotal: {formatMoney(item.price * item.quantity)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
