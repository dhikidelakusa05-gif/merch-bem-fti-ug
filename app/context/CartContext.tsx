'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  stock: number;
  isPreOrder: boolean;
  category: string;
  imageUrl: string | null;
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  removeFromCart: (productId: number, size: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'merch_bem_fti_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Abaikan jika storage kosong
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Abaikan error quota
    }
  }, [items, hydrated]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === newItem.productId && i.size === newItem.size
      );
      if (idx > -1) {
        const updated = [...prev];
        const maxAllowed = newItem.isPreOrder ? 50 : newItem.stock;
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(maxAllowed, updated[idx].quantity + newItem.quantity),
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number, size: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus digunakan di dalam CartProvider');
  return ctx;
}