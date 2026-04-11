'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import TimeText from './TimeText';
import type { OrderItem, SingleOrder } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import {
  metaLabelClass,
  mutedSurfaceClass,
  panelClass,
  sectionDescriptionClass,
  sectionHeaderClass,
  sectionTitleClass,
  statCardClass,
} from '../lib/ui';
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
    return (
      <StateMessage
        title="Loading order"
        description="Pulling the order details, purchased items, and payment summary."
        tone="muted"
      />
    );
  }

  if (!order) {
    return (
      <StateMessage
        title="Order not found"
        description="This order could not be found, or it may not be available for the current account."
        tone="danger"
      />
    );
  }

  return (
    <section className="mx-auto grid max-w-[1000px] gap-6">
      <div className={sectionHeaderClass}>
        <div className="space-y-2">
          <h1 className={sectionTitleClass}>Order Summary</h1>
          <p className={sectionDescriptionClass}>
            Review billing details, order timing, and each purchased item in one place.
          </p>
        </div>
        <div className={`${statCardClass} lg:justify-self-end`}>
          Order <span className="font-semibold text-[var(--color-text)]">#{order.id}</span>
        </div>
      </div>

      <div className={`${panelClass} p-5 sm:p-6`}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className={mutedSurfaceClass}>
            <p className={metaLabelClass}>Charge</p>
            <p className="mt-2 mb-0 break-all text-[1.45rem] font-semibold">{order.charge}</p>
          </div>
          <div className={mutedSurfaceClass}>
            <p className={metaLabelClass}>Date</p>
            <p className="mt-2 mb-0 text-[1.45rem] font-semibold"><TimeText mode="absolute" value={order.createdAt} /></p>
          </div>
          <div className={mutedSurfaceClass}>
            <p className={metaLabelClass}>Total</p>
            <p className="mt-2 mb-0 text-[1.8rem] font-semibold">{formatMoney(order.total)}</p>
          </div>
          <div className={mutedSurfaceClass}>
            <p className={metaLabelClass}>Items</p>
            <p className="mt-2 mb-0 text-[1.8rem] font-semibold">{order.orderItems.length}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          {order.orderItems.map((item: OrderItem) => (
            <div className="grid items-center gap-5 border-t border-[var(--color-border)] pt-6 md:grid-cols-[220px_1fr]" key={item.id}>
              <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
                {item.image ? (
                  <Image
                    className="object-cover"
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 220px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[var(--color-surface-alt)] text-[1.3rem] text-[var(--color-muted)]">
                    No image
                  </div>
                )}
              </div>
              <div className="item-details">
                <h2 className="m-0 text-[2.2rem] font-bold tracking-[-0.03em]">{item.title}</h2>
                <p className="mb-3 mt-3 text-[1.5rem] leading-[1.6] text-[var(--color-muted)]">{item.description}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-[var(--color-surface-alt)] px-3 py-3">
                    <p className={metaLabelClass}>Quantity</p>
                    <p className="mt-1 mb-0 text-[1.45rem] font-semibold text-[var(--color-text)]">{item.quantity}</p>
                  </div>
                  <div className="rounded-lg bg-[var(--color-surface-alt)] px-3 py-3">
                    <p className={metaLabelClass}>Each</p>
                    <p className="mt-1 mb-0 text-[1.45rem] font-semibold text-[var(--color-text)]">{formatMoney(item.price)}</p>
                  </div>
                  <div className="rounded-lg bg-[var(--color-surface-alt)] px-3 py-3">
                    <p className={metaLabelClass}>Subtotal</p>
                    <p className="mt-1 mb-0 text-[1.45rem] font-semibold text-[var(--color-text)]">
                      {formatMoney(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
