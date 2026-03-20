import type { paths } from './generated/openapi';
import { apiClient } from './client';
import { normalizeUserWithPermissions, normalizeUsers } from './normalize';
import type { UserWithPermissions } from './types';

type ListUsersResponse = paths['/api/users']['get']['responses'][200]['content']['application/json'];
type UpdateUserPermissionsInput =
  paths['/api/users/{id}/permissions']['put']['requestBody']['content']['application/json'];
type UpdateUserPermissionsResponse =
  paths['/api/users/{id}/permissions']['put']['responses'][200]['content']['application/json'];

export function listUsers() {
  return apiClient.get<ListUsersResponse>('/api/users').then((result) => normalizeUsers(result));
}

export function updateUserPermissions(id: string | number, input: UpdateUserPermissionsInput) {
  return apiClient
    .put<UpdateUserPermissionsResponse>(`/api/users/${id}/permissions`, input)
    .then((result) => normalizeUserWithPermissions(result));
}

export type { UserWithPermissions };
