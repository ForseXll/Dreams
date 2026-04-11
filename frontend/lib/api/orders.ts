import type { paths } from './generated/openapi';
import { apiClient } from './client';
import { normalizeCheckoutSession, normalizeOrder, normalizeOrders } from './normalize';
import type { CheckoutSession, Order, SingleOrder } from './types';

type ListOrdersResponse = paths['/api/orders']['get']['responses'][200]['content']['application/json'];
type GetOrderResponse = paths['/api/orders/{id}']['get']['responses'][200]['content']['application/json'];
type CreateOrderInput = paths['/api/orders']['post']['requestBody']['content']['application/json'];
type CreateOrderResponse = paths['/api/orders']['post']['responses'][200]['content']['application/json'];
type CreateCheckoutSessionResponse =
  paths['/api/orders/create-checkout-session']['post']['responses'][200]['content']['application/json'];
type CompleteCheckoutSessionInput =
  paths['/api/orders/checkout/complete']['post']['requestBody']['content']['application/json'];
type CompleteCheckoutSessionResponse =
  paths['/api/orders/checkout/complete']['post']['responses'][200]['content']['application/json'];

export function listOrders() {
  return apiClient.get<ListOrdersResponse>('/api/orders').then((result) => normalizeOrders(result));
}

export function getOrder(id: string | number) {
  return apiClient.get<GetOrderResponse>(`/api/orders/${id}`).then((result) => normalizeOrder(result));
}

export function createOrder(input: CreateOrderInput) {
  return apiClient.post<CreateOrderResponse>('/api/orders', input).then((result) => normalizeOrder(result));
}

export function createCheckoutSession() {
  return apiClient
    .post<CreateCheckoutSessionResponse>('/api/orders/create-checkout-session')
    .then((result) => normalizeCheckoutSession(result));
}

export function completeCheckoutSession(input: CompleteCheckoutSessionInput) {
  return apiClient
    .post<CompleteCheckoutSessionResponse>('/api/orders/checkout/complete', input)
    .then((result) => normalizeOrder(result));
}

export type { CheckoutSession, Order, SingleOrder };
