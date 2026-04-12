import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addItemToCart,
  getCart,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  removeCartItem,
  updateCartItem,
} from './api';
import type { Cart, CartItem, CurrentUser } from './api/types';

type LoginInput = Parameters<typeof loginUser>[0];
type RegisterInput = Parameters<typeof registerUser>[0];

interface AppContextValue {
  addToCart: (itemId: number | string) => Promise<unknown>;
  bootstrapping: boolean;
  cart: CartItem[];
  cartCount: number;
  cartOpen: boolean;
  closeCart: () => void;
  currentUser: CurrentUser | null;
  login: (input: LoginInput) => Promise<unknown>;
  logout: () => Promise<void>;
  refreshCart: () => Promise<Cart | null>;
  refreshSession: () => Promise<CurrentUser | null>;
  register: (input: RegisterInput) => Promise<unknown>;
  removeFromCart: (cartItemId: number | string) => Promise<unknown>;
  toggleCart: () => void;
  updateCartItemQuantity: (cartItemId: number | string, quantity: number) => Promise<unknown>;
}

const AppContext = createContext<AppContextValue | null>(null);

function getCartCount(cart: CartItem[]) {
  return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
}

function samePermissions(left: CurrentUser['permissions'], right: CurrentUser['permissions']) {
  return left.length === right.length && left.every((permission, index) => permission === right[index]);
}

function sameUser(left: CurrentUser | null, right: CurrentUser | null) {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.id === right.id &&
    left.email === right.email &&
    left.name === right.name &&
    samePermissions(left.permissions, right.permissions)
  );
}

function useAppStateValue(): AppContextValue {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  function mergeCartItems(prev: CartItem[], next: CartItem[]): CartItem[] {
    const nextById = new Map(next.map(item => [item.id, item]));
    const result: CartItem[] = [];
    for (const item of prev) {
      const updated = nextById.get(item.id);
      if (updated) {
        result.push(updated);
        nextById.delete(item.id);
      }
    }
    for (const item of nextById.values()) {
      result.push(item);
    }
    return result;
  }

  const loadCart = useCallback(async (user: CurrentUser | null) => {
    if (!user?.id) {
      setCart([]);
      return null;
    }

    try {
      const cartResponse = await getCart();
      const nextCart = cartResponse.cartItems;
      setCart((prev) => mergeCartItems(prev, nextCart));
      return cartResponse;
    } catch (error) {
      if (typeof error === 'object' && error && 'status' in error && error.status === 401) {
        setCart([]);
        return null;
      }

      throw error;
    }
  }, []);

  const refreshCart = useCallback(async () => loadCart(currentUser), [currentUser, loadCart]);

  const refreshSession = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser((previousUser) => (sameUser(previousUser, user) ? previousUser : user));
      return user;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'status' in error &&
        (error.status === 401 || error.status === 404)
      ) {
        setCurrentUser((previousUser) => (previousUser ? null : previousUser));
        setCart([]);
        return null;
      }

      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const user = await refreshSession();

        if (active && user) {
          await loadCart(user);
        }
      } finally {
        if (active) {
          setBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [loadCart, refreshSession]);

  useEffect(() => {
    if (!bootstrapping && currentUser) {
      refreshCart().catch(() => null);
    }
  }, [bootstrapping, currentUser, refreshCart]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await loginUser(input);
    await refreshSession();
    await refreshCart();
    return result;
  }, [refreshCart, refreshSession]);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await registerUser(input);
    await refreshSession();
    await refreshCart();
    return result;
  }, [refreshCart, refreshSession]);

  const logout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
    setCart([]);
    setCartOpen(false);
  }, []);

  const addToCart = useCallback(async (itemId: number | string) => {
    const result = await addItemToCart({ itemId: Number(itemId), quantity: 1 });
    await refreshCart();
    return result;
  }, [refreshCart]);

  const removeFromCart = useCallback(async (cartItemId: number | string) => {
    const result = await removeCartItem(cartItemId);
    await refreshCart();
    return result;
  }, [refreshCart]);

  const updateCartItemQuantity = useCallback(async (cartItemId: number | string, quantity: number) => {
    if (quantity < 1) {
      const result = await removeCartItem(cartItemId);
      await refreshCart();
      return result;
    }
    const result = await updateCartItem(cartItemId, { quantity });
    await refreshCart();
    return result;
  }, [refreshCart]);

  const toggleCart = useCallback(() => {
    setCartOpen((open) => !open);
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
  }, []);

  return useMemo(
    () => ({
      addToCart,
      bootstrapping,
      cart,
      cartCount: getCartCount(cart),
      cartOpen,
      closeCart,
      currentUser,
      login,
      logout,
      refreshCart,
      refreshSession,
      register,
      removeFromCart,
      toggleCart,
      updateCartItemQuantity,
    }),
    [
      addToCart,
      bootstrapping,
      cart,
      cartOpen,
      closeCart,
      currentUser,
      login,
      logout,
      refreshCart,
      refreshSession,
      register,
      removeFromCart,
      toggleCart,
      updateCartItemQuantity,
    ]
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const value = useAppStateValue();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppProvider');
  }

  return context;
}

export { AppContext };
