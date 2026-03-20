import type { paths } from './generated/openapi';
import { apiClient } from './client';

type ListOrdersResponse = paths['/api/orders']['get']['responses'][200]['content']['application/json'];
type GetOrderResponse = paths['/api/orders/{id}']['get']['responses'][200]['content']['application/json'];
type CreateOrderInput = paths['/api/orders']['post']['requestBody']['content']['application/json'];
type CreateOrderResponse = paths['/api/orders']['post']['responses'][200]['content']['application/json'];
type CreateCheckoutSessionResponse =
  paths['/api/orders/create-checkout-session']['post']['responses'][200]['content']['application/json'];

export function listOrders() {
  return apiClient.get<ListOrdersResponse>('/api/orders');
}

export function getOrder(id: string | number) {
  return apiClient.get<GetOrderResponse>(`/api/orders/${id}`);
}

export function createOrder(input: CreateOrderInput) {
  return apiClient.post<CreateOrderResponse>('/api/orders', input);
}

export function createCheckoutSession() {
  return apiClient.post<CreateCheckoutSessionResponse>('/api/orders/create-checkout-session');
}
