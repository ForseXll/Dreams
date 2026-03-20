import type { paths } from './generated/openapi';
import { apiClient } from './client';

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
  return apiClient.post<RegisterUserResponse>('/auth/register', input);
}

export function loginUser(input: LoginUserInput) {
  return apiClient.post<LoginUserResponse>('/auth/login', input);
}

export function requestPasswordReset(input: RequestPasswordResetInput) {
  return apiClient.post<RequestPasswordResetResponse>('/auth/request-reset', input);
}

export function resetPassword(input: ResetPasswordInput) {
  return apiClient.post<ResetPasswordResponse>('/auth/reset-password', input);
}

export function getCurrentUser() {
  return apiClient.get<CurrentUserResponse>('/auth/me');
}

export function logoutUser() {
  return apiClient.post<LogoutUserResponse>('/auth/logout');
}

export type { CurrentUserResponse, LoginUserInput, RegisterUserInput };
