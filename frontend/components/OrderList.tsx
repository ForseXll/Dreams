'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import TimeText from './TimeText';
import type { Order, OrderItem } from '../lib/api/types';
import {
  metaLabelClass,
  mutedSurfaceClass,
  panelClass,
  sectionDescriptionClass,
  sectionHeaderClass,
  sectionTitleClass,
  statCardClass,
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
    <section className="grid gap-6">
      <div className={sectionHeaderClass}>
        <div className="space-y-2">
          <h1 className={sectionTitleClass}>Orders</h1>
          <p className={sectionDescriptionClass}>
            Review completed purchases, recent activity, and the items attached to each order.
          </p>
        </div>
        <div className={`${statCardClass} lg:justify-self-end`}>
          <span className="font-semibold text-[var(--color-text)]">{orders.length}</span> total order{orders.length === 1 ? '' : 's'}
        </div>
      </div>

      <ul className="grid list-none gap-6 p-0">
        {orders.map((order) => (
          <li className={`${panelClass} list-none p-5 sm:p-6`} key={order.id}>
            <Link href={{ pathname: '/order', query: { id: order.id } }}>
              <div className="grid gap-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className={mutedSurfaceClass}>
                    <p className={metaLabelClass}>Items</p>
                    <p className="mt-2 mb-0 text-[1.7rem] font-semibold text-[var(--color-text)]">
                      {order.orderItems.reduce((total: number, item: OrderItem) => total + item.quantity, 0)}
                    </p>
                  </div>
                  <div className={mutedSurfaceClass}>
                    <p className={metaLabelClass}>Products</p>
                    <p className="mt-2 mb-0 text-[1.7rem] font-semibold text-[var(--color-text)]">
                      {order.orderItems.length}
                    </p>
                  </div>
                  <div className={mutedSurfaceClass}>
                    <p className={metaLabelClass}>Placed</p>
                    <p className="mt-2 mb-0 text-[1.5rem] font-semibold text-[var(--color-text)]">
                      <TimeText mode="relative" value={order.createdAt} />
                    </p>
                  </div>
                  <div className={mutedSurfaceClass}>
                    <p className={metaLabelClass}>Total</p>
                    <p className="mt-2 mb-0 text-[1.7rem] font-semibold text-[var(--color-text)]">
                      {formatMoney(order.total)}
                    </p>
                  </div>
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
                        <div className="flex h-full items-center justify-center bg-[var(--color-surface-alt)] text-[1.3rem] text-[var(--color-muted)]">
                          No image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
