import type { paths } from './generated/openapi';
import { apiClient } from './client';
import { normalizeApiMessage, normalizeAuthResult, normalizeCurrentUser } from './normalize';
import type { ApiMessage, AuthResult, CurrentUser } from './types';

type RegisterUserInput =
  paths['/auth/register']['post']['requestBody']['content']['application/json'];
type RegisterUserResponse =
  paths['/auth/register']['post']['responses'][200]['content']['application/json'];
type LoginUserInput = paths['/auth/login']['post']['requestBody']['content']['application/json'];
type LoginUserResponse = paths['/auth/login']['post']['responses'][200]['content']['application/json'];
type RequestPasswordResetInput =
  paths['/auth/request-reset']['post']['requestBody']['content']['application/json'];
type RequestPasswordResetResponse =
  paths['/auth/request-reset']['post']['responses'][200]['content']['application/json'];
type ResetPasswordInput =
  paths['/auth/reset-password']['post']['requestBody']['content']['application/json'];
type ResetPasswordResponse =
  paths['/auth/reset-password']['post']['responses'][200]['content']['application/json'];
type CurrentUserResponse = paths['/auth/me']['get']['responses'][200]['content']['application/json'];
type LogoutUserResponse = paths['/auth/logout']['post']['responses'][200]['content']['application/json'];

export function registerUser(input: RegisterUserInput) {
  return apiClient.post<RegisterUserResponse>('/auth/register', input).then((result) => normalizeAuthResult(result || undefined));
}

export function loginUser(input: LoginUserInput) {
  return apiClient.post<LoginUserResponse>('/auth/login', input).then((result) => normalizeAuthResult(result || undefined));
}

export function requestPasswordReset(input: RequestPasswordResetInput) {
  return apiClient
    .post<RequestPasswordResetResponse>('/auth/request-reset', input)
    .then((result) => normalizeApiMessage(result));
}

export function resetPassword(input: ResetPasswordInput) {
  return apiClient.post<ResetPasswordResponse>('/auth/reset-password', input).then((result) => normalizeApiMessage(result));
}

export function getCurrentUser() {
  return apiClient.get<CurrentUserResponse>('/auth/me').then((result) => normalizeCurrentUser(result || undefined));
}

export function logoutUser() {
  return apiClient.post<LogoutUserResponse>('/auth/logout').then((result) => normalizeApiMessage(result));
}

export type { ApiMessage, AuthResult, CurrentUser, CurrentUserResponse, LoginUserInput, RegisterUserInput };
