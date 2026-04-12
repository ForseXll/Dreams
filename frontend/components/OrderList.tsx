'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import TimeText from './TimeText';
import type { Order, OrderItem } from '../lib/api/types';
import {
  cardVariants,
  typographyClasses,
  cn,
} from '../lib/ui';
import formatMoney from '../lib/formatMoney';
import { listOrders } from '../lib/api';

export default function OrderList() {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await listOrders();

        if (active) {
          setOrders(response);
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

    fetchOrders();

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (loading) {
    return (
      <StateMessage
        title="Loading orders"
        description="Gathering your order history and recently completed checkouts."
        tone="muted"
      />
    );
  }

  if (!orders.length) {
    return (
      <StateMessage
        title="No orders yet"
        description="Once you complete a checkout, your order history will show up here."
        tone="muted"
      />
    );
  }

  return (
    <motion.section
      className="grid gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-2">
          <h1 className={typographyClasses.h1}>Orders</h1>
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            Review completed purchases, recent activity, and the items attached to each order.
          </p>
        </div>
        <motion.div
          className={cn(cardVariants({ variant: 'default', size: 'sm' }), 'lg:justify-self-end')}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
            Total orders
          </p>
          <p className={cn('m-0 mt-1 font-semibold', typographyClasses.body)}>
            {orders.length} order{orders.length === 1 ? '' : 's'}
          </p>
        </motion.div>
      </div>

      <ul className="grid list-none gap-6 p-0">
        {orders.map((order, orderIndex) => (
          <motion.li
            className={cn(cardVariants({ variant: 'interactive' }), 'list-none p-5 sm:p-6')}
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: orderIndex * 0.05 }}
          >
            <Link href={{ pathname: '/order', query: { id: order.id } }}>
              <div className="grid gap-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: 'Items',
                      value: String(order.orderItems.reduce((total: number, item: OrderItem) => total + item.quantity, 0)),
                    },
                    {
                      label: 'Products',
                      value: String(order.orderItems.length),
                    },
                    {
                      label: 'Placed',
                      value: <TimeText mode="relative" value={order.createdAt} />,
                    },
                    {
                      label: 'Total',
                      value: formatMoney(order.total),
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-2">
                      <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
                        {stat.label}
                      </p>
                      <p className={cn('m-0 mt-1 font-semibold', typographyClasses.body)}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
                  {order.orderItems.map((item: OrderItem) => (
                    <div className="relative h-[200px] w-full overflow-hidden rounded-lg" key={item.id}>
                      {item.image ? (
                        <Image
                          className="object-cover"
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 200px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086-2.654.442-4.572-4.572L3.414 15" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}