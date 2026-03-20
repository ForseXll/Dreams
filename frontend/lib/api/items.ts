import type { paths } from './generated/openapi';
import { apiClient } from './client';
import { normalizeApiMessage, normalizeItem, normalizeItemList } from './normalize';
import type { ApiMessage, Item, ItemListResult } from './types';

type ListItemsQuery = paths['/api/items']['get']['parameters']['query'];
type ListItemsResponse = paths['/api/items']['get']['responses'][200]['content']['application/json'];
type GetItemResponse = paths['/api/items/{id}']['get']['responses'][200]['content']['application/json'];
type CreateItemInput = paths['/api/items']['post']['requestBody']['content']['application/json'];
type CreateItemResponse = paths['/api/items']['post']['responses'][200]['content']['application/json'];
type UpdateItemInput = paths['/api/items/{id}']['put']['requestBody']['content']['application/json'];
type UpdateItemResponse = paths['/api/items/{id}']['put']['responses'][200]['content']['application/json'];
type DeleteItemResponse = paths['/api/items/{id}']['delete']['responses'][200]['content']['application/json'];

export function listItems(query?: ListItemsQuery) {
  return apiClient.get<ListItemsResponse>('/api/items', { query }).then((result) => normalizeItemList(result));
}

export function getItem(id: string | number) {
  return apiClient.get<GetItemResponse>(`/api/items/${id}`).then((result) => normalizeItem(result || undefined));
}

export function createItem(input: CreateItemInput) {
  return apiClient.post<CreateItemResponse>('/api/items', input).then((result) => normalizeItem(result || undefined));
}

export function updateItem(id: string | number, input: UpdateItemInput) {
  return apiClient.put<UpdateItemResponse>(`/api/items/${id}`, input).then((result) => normalizeItem(result || undefined));
}

export function deleteItem(id: string | number) {
  return apiClient.delete<DeleteItemResponse>(`/api/items/${id}`).then((result) => normalizeApiMessage(result));
}

export type { ApiMessage, Item, ItemListResult };
