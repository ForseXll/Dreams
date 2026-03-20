import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addItemToCart,
  getCart,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  removeCartItem,
} from './api';

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
type CartResponse = Awaited<ReturnType<typeof getCart>>;
type CartItem = NonNullable<CartResponse> extends { cartItems?: (infer Item)[] } ? Item : any;
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
  refreshCart: () => Promise<CartResponse | null>;
  refreshSession: () => Promise<CurrentUser | null>;
  register: (input: RegisterInput) => Promise<unknown>;
  removeFromCart: (cartItemId: number | string) => Promise<unknown>;
  toggleCart: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getCartCount(cart: CartItem[]) {
  return cart.reduce((total, cartItem) => total + (cartItem.quantity || 0), 0);
}

function useAppStateValue(): AppContextValue {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const refreshCart = useCallback(async () => {
    if (!currentUser) {
      setCart([]);
      return null;
    }

    try {
      const cartResponse = await getCart();
      const nextCart = cartResponse?.cartItems || [];
      setCart(nextCart);
      return cartResponse;
    } catch (error) {
      if (typeof error === 'object' && error && 'status' in error && error.status === 401) {
        setCart([]);
        return null;
      }

      throw error;
    }
  }, [currentUser]);

  const refreshSession = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        setCurrentUser(null);
        setCart([]);
        return null;
      }

      setCurrentUser(user);
      return user;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'status' in error &&
        (error.status === 401 || error.status === 404)
      ) {
        setCurrentUser(null);
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
          await refreshCart();
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
  }, [refreshCart, refreshSession]);

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
    setCartOpen(true);
    return result;
  }, [refreshCart]);

  const removeFromCart = useCallback(async (cartItemId: number | string) => {
    const result = await removeCartItem(cartItemId);
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
