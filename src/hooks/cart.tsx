import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const KEY_PRODUCTS_LOCAL = '@GoMarket:products';

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [save, setSave] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  /** Ao iniciar a tela vai carregar os produtos */
  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const localProducts = await AsyncStorage.getItem(KEY_PRODUCTS_LOCAL);
      if (localProducts) {
        setProducts(JSON.parse(localProducts));
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  const saveProducts = useCallback(async () => {
    await AsyncStorage.setItem(KEY_PRODUCTS_LOCAL, JSON.stringify(products));
  }, [products]);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      // TODO ADD A NEW ITEM TO THE CART
      const filteredItem = products.filter(item => item.id === product.id);
      if (filteredItem.length === 0) {
        setProducts(state => [...state, { ...product, quantity: 1 }]);
      } else {
        const newProduct = products.map(item => {
          if (item.id === product.id) {
            item.quantity += 1;
          }
          return item;
        });
        setProducts(newProduct);
      }

      await saveProducts();
    },
    [products, saveProducts],
  );

  const increment = useCallback(
    async (id: string) => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(state =>
        state.map(product => {
          if (product.id === id) {
            product.quantity += 1;
          }
          return product;
        }),
      );

      await saveProducts();
    },
    [setProducts, saveProducts],
  );

  const decrement = useCallback(
    async (id: string) => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const subProducts = products.map(product => {
        if (id === product.id) {
          if (product.quantity > 1) {
            product.quantity -= 1;
            return product;
          }
        }
        return product;
      });

      setProducts(subProducts);

      await saveProducts();
    },
    [products, saveProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
