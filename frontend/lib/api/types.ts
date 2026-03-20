import type { paths } from './generated/openapi';

type NonNull<T> = Exclude<T, null | undefined>;
type ArrayElement<T> = T extends (infer U)[] ? U : never;

export const PERMISSION_NAMES = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
] as const;

export type PermissionName = (typeof PERMISSION_NAMES)[number];

export type RegisterUserResponse =
  paths['/auth/register']['post']['responses'][200]['content']['application/json'];
export type LoginUserResponse = paths['/auth/login']['post']['responses'][200]['content']['application/json'];
export type RawCurrentUser = NonNull<
  paths['/auth/me']['get']['responses'][200]['content']['application/json']
>;

export interface CurrentUser {
  email: string;
  id: number;
  name: string;
  permissions: PermissionName[];
}

export interface AuthResult {
  token: string;
  user: CurrentUser | null;
}

export interface ApiMessage {
  message: string;
}

export type RawListItemsResponse = paths['/api/items']['get']['responses'][200]['content']['application/json'];
export type RawItem = NonNull<ArrayElement<NonNull<RawListItemsResponse['items']>>>;

export interface ItemSummary {
  description: string;
  id: number;
  image: string;
  price: number;
  title: string;
}

export interface Item extends ItemSummary {
  createdAt: string;
  largeImage: string;
  updatedAt: string;
  userId: number;
}

export interface ItemListResult {
  items: Item[];
  skip: number;
  take: number;
  total: number;
}

export type RawCartResponse = paths['/api/cart']['get']['responses'][200]['content']['application/json'];
export type RawCartItem = NonNull<ArrayElement<NonNull<RawCartResponse['cartItems']>>>;

export interface CartItem {
  id: number;
  item: ItemSummary | null;
  itemId: number;
  quantity: number;
  userId: number;
}

export interface Cart {
  cartItems: CartItem[];
  itemCount: number;
  total: number;
}

export interface CartMutationItem {
  id: number;
  itemId: number;
  quantity: number;
  userId: number;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export type RawListOrdersResponse = paths['/api/orders']['get']['responses'][200]['content']['application/json'];
export type RawOrder = NonNull<ArrayElement<NonNull<RawListOrdersResponse>>>;
export type RawOrderItem = NonNull<ArrayElement<NonNull<RawOrder['orderItems']>>>;
export type RawSingleOrder = NonNull<
  paths['/api/orders/{id}']['get']['responses'][200]['content']['application/json']
>;

export interface OrderItem {
  description: string;
  id: number;
  image: string;
  largeImage: string;
  orderId: number;
  price: number;
  quantity: number;
  title: string;
  userId: number;
}

export interface Order {
  charge: string;
  createdAt: string;
  id: number;
  orderItems: OrderItem[];
  total: number;
  updatedAt: string;
  userId: number;
}

export type SingleOrder = Order;

export type RawListUsersResponse = paths['/api/users']['get']['responses'][200]['content']['application/json'];
export type RawUserWithPermissions = NonNull<ArrayElement<NonNull<RawListUsersResponse>>>;

export interface UserWithPermissions {
  email: string;
  id: number;
  name: string;
  permissions: PermissionName[];
}
