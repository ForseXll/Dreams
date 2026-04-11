'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import TimeText from './TimeText';
import type { Order, OrderItem } from '../lib/api/types';
import { panelClass } from '../lib/ui';
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
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="mb-5 text-[1.6rem]">
        You have {orders.length} Order{orders.length === 1 ? '' : 's'}!
      </div>
      <ul className="grid list-none gap-6 p-0">
        {orders.map((order) => (
          <li className={`${panelClass} list-none p-6`} key={order.id}>
            <Link href={{ pathname: '/order', query: { id: order.id } }}>
              <div>
                <div className="grid gap-3 text-center sm:grid-cols-4">
                  <p className="m-0 bg-[var(--color-surface-alt)] px-3 py-3">
                    {order.orderItems.reduce((total: number, item: OrderItem) => total + item.quantity, 0)}
                  </p>
                  <p className="m-0 bg-[var(--color-surface-alt)] px-3 py-3">{order.orderItems.length} Products</p>
                  <p className="m-0 bg-[var(--color-surface-alt)] px-3 py-3">
                    <TimeText mode="relative" value={order.createdAt} />
                  </p>
                  <p className="m-0 bg-[var(--color-surface-alt)] px-3 py-3">Total: {formatMoney(order.total)}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
                  {order.orderItems.map((item: OrderItem) => (
                    <img className="h-[200px] w-full rounded-lg object-cover" src={item.image} alt={item.title} key={item.id} />
                  ))}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
