'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import TimeText from './TimeText';
import type { OrderItem, SingleOrder } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import {
  cardVariants,
  typographyClasses,
  cn,
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
    <motion.section
      className="mx-auto grid max-w-[1000px] gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-2">
          <h1 className={typographyClasses.h1}>Order Summary</h1>
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            Review billing details, order timing, and each purchased item in one place.
          </p>
        </div>
        <motion.div
          className={cn(cardVariants({ variant: 'default', size: 'sm' }), 'lg:justify-self-end')}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
            Order
          </p>
          <p className={cn('m-0 mt-1 font-semibold', typographyClasses.body)}>
            #{order.id}
          </p>
        </motion.div>
      </div>

      <div className={cn(cardVariants({ variant: 'default' }), 'p-5 sm:p-6')}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Charge', value: order.charge },
            { label: 'Date', value: <TimeText mode="absolute" value={order.createdAt} /> },
            { label: 'Total', value: formatMoney(order.total) },
            { label: 'Items', value: String(order.orderItems.length) },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
                {stat.label}
              </p>
              <p className={cn('m-0 mt-2 font-semibold', stat.label === 'Total' ? typographyClasses.h4 : typographyClasses.body)}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-6">
          {order.orderItems.map((item: OrderItem, index: number) => (
            <motion.div
              className="grid items-center gap-5 border-t border-[var(--color-border)] pt-6 md:grid-cols-[220px_1fr]"
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
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
                  <div className="flex h-full items-center justify-center bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086-2.654.442-4.572-4.572L3.414 15" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h2 className={cn('m-0', typographyClasses.h3)}>{item.title}</h2>
                <p className={cn('m-0', typographyClasses.body, typographyClasses.muted)}>
                  {item.description}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { label: 'Quantity', value: String(item.quantity) },
                    { label: 'Each', value: formatMoney(item.price) },
                    { label: 'Subtotal', value: formatMoney(item.price * item.quantity) },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-[var(--color-surface-alt)] px-3 py-3">
                      <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
                        {stat.label}
                      </p>
                      <p className={cn('m-0 mt-1 font-semibold', typographyClasses.body)}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}