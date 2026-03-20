'use client';

import NProgress from 'nprogress';
import { useRouter } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import type { CartItem } from '../lib/api/types';
import calcTotalPrice from '../lib/calcTotalPrice';
import { createOrder } from '../lib/api';
import { useAppState } from '../lib/appState';

interface StripeToken {
  id: string;
}

interface StripeCheckoutProps {
  amount: number;
  children?: ReactNode;
  currency: string;
  description: string;
  email?: string;
  image?: string;
  name: string;
  stripeKey: string;
  token: (token: StripeToken) => void | Promise<void>;
}

const StripeCheckoutButton = StripeCheckout as unknown as ComponentType<StripeCheckoutProps>;

function totalItems(cart: CartItem[]) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

interface TakeMyMoneyProps {
  children?: ReactNode;
}

export default function TakeMyMoney({ children }: TakeMyMoneyProps) {
  const app = useAppState();
  const router = useRouter();

  const onToken = async (response: StripeToken) => {
    NProgress.start();

    try {
      const order = await createOrder({ stripeToken: response.id });
      await app.refreshCart();
      router.push(`/order?id=${order.id}`);
      router.refresh();
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      NProgress.done();
    }
  };

  if (!app.currentUser) {
    return null;
  }

  return (
    <StripeCheckoutButton
      amount={calcTotalPrice(app.cart)}
      name="Dreams"
      description={`Order of ${totalItems(app.cart)} Items.`}
      image={app.cart.length && app.cart[0].item ? app.cart[0].item.image : undefined}
      stripeKey="pk_test_51HmPRXBA8QidMi7fNja8Od2CZ4PhhksbnGQcL2D1sQkMI4n830vJB5Xk1GKPZCIUCWgTALDSh1XNdPUhvaZgQIcI00dvEzN1Ky"
      currency="USD"
      email={app.currentUser.email}
      token={onToken}
    >
      {children}
    </StripeCheckoutButton>
  );
}
