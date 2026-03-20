'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import ErrorMessage from './ErrorMessage';
import OrderItemStyles from './styles/OrderItemStyles';
import TimeText from './TimeText';
import type { Order, OrderItem } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { listOrders } from '../lib/api';

const UlStyle = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60%, 1fr));
    border: 2px solid black;
    justify-content: start;
    padding-inline-start: 0px;
    .img-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(10, 1fr));
    }
`;

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
      <div>
        You have {orders.length} Order{orders.length === 1 ? '' : 's'}!
      </div>
      <UlStyle>
        {orders.map((order) => (
          <OrderItemStyles key={order.id}>
            <Link href={{ pathname: '/order', query: { id: order.id } }}>
              <div>
                <div className="order-meta">
                  <p>{order.orderItems.reduce((total: number, item: OrderItem) => total + item.quantity, 0)}</p>
                  <p>{order.orderItems.length} Products</p>
                  <p>
                    <TimeText mode="relative" value={order.createdAt} />
                  </p>
                  <p>Total: {formatMoney(order.total)}</p>
                </div>
                <div className="images">
                  {order.orderItems.map((item: OrderItem) => (
                    <img className="img-list" src={item.image} alt={item.title} key={item.id} />
                  ))}
                </div>
              </div>
            </Link>
          </OrderItemStyles>
        ))}
      </UlStyle>
    </>
  );
}
