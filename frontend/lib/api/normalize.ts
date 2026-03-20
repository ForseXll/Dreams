import type {
  ApiMessage,
  AuthResult,
  Cart,
  CartItem,
  CartMutationItem,
  CheckoutSession,
  CurrentUser,
  Item,
  ItemListResult,
  ItemSummary,
  Order,
  OrderItem,
  PermissionName,
  RawCartItem,
  RawCartResponse,
  RawCurrentUser,
  RawItem,
  RawListItemsResponse,
  RawOrder,
  RawOrderItem,
  RawSingleOrder,
  RawUserWithPermissions,
  UserWithPermissions,
} from './types';
import { PERMISSION_NAMES } from './types';

function normalizePermissionNames(permissions?: string[]): PermissionName[] {
  if (!permissions) {
    return [];
  }

  return permissions.filter((permission): permission is PermissionName =>
    PERMISSION_NAMES.includes(permission as PermissionName)
  );
}

export function normalizeCurrentUser(user?: RawCurrentUser): CurrentUser {
  return {
    email: user?.email ?? '',
    id: user?.id ?? 0,
    name: user?.name ?? '',
    permissions: normalizePermissionNames(user?.permissions),
  };
}

export function normalizeAuthResult(result?: { token?: string; user?: RawCurrentUser }): AuthResult {
  return {
    token: result?.token ?? '',
    user: result?.user ? normalizeCurrentUser(result.user) : null,
  };
}

export function normalizeApiMessage(result?: { message?: string } | null): ApiMessage {
  return {
    message: result?.message ?? '',
  };
}

export function normalizeItemSummary(item?: Partial<RawItem>): ItemSummary {
  return {
    description: item?.description ?? '',
    id: item?.id ?? 0,
    image: item?.image ?? '',
    price: item?.price ?? 0,
    title: item?.title ?? '',
  };
}

export function normalizeItem(item?: Partial<RawItem>): Item {
  const summary = normalizeItemSummary(item);

  return {
    ...summary,
    createdAt: item?.createdAt ?? '',
    largeImage: item?.largeImage ?? '',
    updatedAt: item?.updatedAt ?? '',
    userId: item?.userId ?? 0,
  };
}

export function normalizeItemList(result?: RawListItemsResponse | null): ItemListResult {
  return {
    items: (result?.items ?? []).map((item) => normalizeItem(item)),
    skip: result?.skip ?? 0,
    take: result?.take ?? 0,
    total: result?.total ?? 0,
  };
}

export function normalizeCartItem(cartItem?: RawCartItem): CartItem {
  return {
    id: cartItem?.id ?? 0,
    item: cartItem?.item ? normalizeItemSummary(cartItem.item) : null,
    itemId: cartItem?.itemId ?? 0,
    quantity: cartItem?.quantity ?? 0,
    userId: cartItem?.userId ?? 0,
  };
}

export function normalizeCart(result?: RawCartResponse | null): Cart {
  return {
    cartItems: (result?.cartItems ?? []).map((cartItem) => normalizeCartItem(cartItem)),
    itemCount: result?.itemCount ?? 0,
    total: result?.total ?? 0,
  };
}

export function normalizeCartMutationItem(item?: {
  id?: number;
  itemId?: number;
  quantity?: number;
  userId?: number;
} | null): CartMutationItem {
  return {
    id: item?.id ?? 0,
    itemId: item?.itemId ?? 0,
    quantity: item?.quantity ?? 0,
    userId: item?.userId ?? 0,
  };
}

export function normalizeCheckoutSession(result?: { sessionId?: string; url?: string } | null): CheckoutSession {
  return {
    sessionId: result?.sessionId ?? '',
    url: result?.url ?? '',
  };
}

export function normalizeOrderItem(item?: RawOrderItem): OrderItem {
  return {
    description: item?.description ?? '',
    id: item?.id ?? 0,
    image: item?.image ?? '',
    largeImage: item?.largeImage ?? '',
    orderId: item?.orderId ?? 0,
    price: item?.price ?? 0,
    quantity: item?.quantity ?? 0,
    title: item?.title ?? '',
    userId: item?.userId ?? 0,
  };
}

export function normalizeOrder(order?: RawOrder | RawSingleOrder | null): Order {
  return {
    charge: order?.charge ?? '',
    createdAt: order?.createdAt ?? '',
    id: order?.id ?? 0,
    orderItems: (order?.orderItems ?? []).map((item) => normalizeOrderItem(item)),
    total: order?.total ?? 0,
    updatedAt: order?.updatedAt ?? order?.createdAt ?? '',
    userId: order?.userId ?? 0,
  };
}

export function normalizeOrders(orders?: RawOrder[] | null): Order[] {
  return (orders ?? []).map((order) => normalizeOrder(order));
}

export function normalizeUserWithPermissions(user?: RawUserWithPermissions | null): UserWithPermissions {
  return {
    email: user?.email ?? '',
    id: user?.id ?? 0,
    name: user?.name ?? '',
    permissions: normalizePermissionNames(user?.permissions),
  };
}

export function normalizeUsers(users?: RawUserWithPermissions[] | null): UserWithPermissions[] {
  return (users ?? []).map((user) => normalizeUserWithPermissions(user));
}
