import type { paths } from './generated/openapi';
import { apiClient } from './client';
import { normalizeApiMessage, normalizeCart, normalizeCartMutationItem } from './normalize';
import type { ApiMessage, Cart, CartMutationItem } from './types';

type GetCartResponse = paths['/api/cart']['get']['responses'][200]['content']['application/json'];
type AddItemToCartInput = paths['/api/cart']['post']['requestBody']['content']['application/json'];
type AddItemToCartResponse = paths['/api/cart']['post']['responses'][200]['content']['application/json'];
type UpdateCartItemInput = paths['/api/cart/{id}']['put']['requestBody']['content']['application/json'];
type UpdateCartItemResponse = paths['/api/cart/{id}']['put']['responses'][200]['content']['application/json'];
type RemoveCartItemResponse = paths['/api/cart/{id}']['delete']['responses'][200]['content']['application/json'];
type ClearCartResponse = paths['/api/cart']['delete']['responses'][200]['content']['application/json'];

export function getCart() {
  return apiClient.get<GetCartResponse>('/api/cart').then((result) => normalizeCart(result));
}

export function addItemToCart(input: AddItemToCartInput) {
  return apiClient.post<AddItemToCartResponse>('/api/cart', input).then((result) => normalizeCartMutationItem(result));
}

export function updateCartItem(id: string | number, input: UpdateCartItemInput) {
  return apiClient.put<UpdateCartItemResponse>(`/api/cart/${id}`, input).then((result) => normalizeCartMutationItem(result));
}

export function removeCartItem(id: string | number) {
  return apiClient.delete<RemoveCartItemResponse>(`/api/cart/${id}`).then((result) => normalizeApiMessage(result));
}

export function clearCart() {
  return apiClient.delete<ClearCartResponse>('/api/cart').then((result) => normalizeApiMessage(result));
}

export type { ApiMessage, Cart, CartMutationItem };
