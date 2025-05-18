
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  requiresPrescription: boolean;
  stock: number;
  batchNumber: string;
  expiryDate: string;
  imageUrl?: string;
  description?: string;
  manufacturer?: string;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Receipt {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customer: Customer | null;
  cashierName: string;
  cashierId: string;
  prescription?: {
    id: string;
    doctor: string;
    notes: string;
    imageUrl?: string;
  };
}

interface SalesContextProps {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number, discount?: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartSubtotal: number;
  cartTax: number;
  cartDiscount: number;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  completeSale: (paymentMethod: string, prescription?: { doctor: string; notes: string; imageUrl?: string }) => Receipt;
  recentSales: Receipt[];
}

const SalesContext = createContext<SalesContextProps | undefined>(undefined);

// Load mock sales from local storage or use default
const loadSales = (): Receipt[] => {
  const storedSales = localStorage.getItem('pharmacy-sales');
  if (storedSales) {
    try {
      return JSON.parse(storedSales);
    } catch (e) {
      console.error('Error parsing sales data:', e);
      return [];
    }
  }
  return [];
};

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [recentSales, setRecentSales] = useState<Receipt[]>(loadSales);
  const { user } = useAuth();
  
  // Save sales to local storage when they change
  useEffect(() => {
    localStorage.setItem('pharmacy-sales', JSON.stringify(recentSales));
  }, [recentSales]);

  const addToCart = (product: Product, quantity = 1) => {
    // Check if item is already in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        toast.error(`Only ${product.stock} units available in stock`);
        return;
      }
      
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: newQuantity,
        total: (product.price * newQuantity) * (1 - (updatedCart[existingItemIndex].discount / 100))
      };
      
      setCart(updatedCart);
      toast.success(`Updated ${product.name} quantity to ${newQuantity}`);
    } else {
      // Add new item
      if (quantity > product.stock) {
        toast.error(`Only ${product.stock} units available in stock`);
        return;
      }
      
      const newItem: CartItem = {
        ...product,
        quantity,
        discount: 0,
        total: product.price * quantity
      };
      
      setCart([...cart, newItem]);
      toast.success(`Added ${product.name} to cart`);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.info('Item removed from cart');
  };

  const updateCartItem = (productId: string, quantity: number, discount = 0) => {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex >= 0) {
      const updatedCart = [...cart];
      const product = updatedCart[itemIndex];
      
      if (quantity > product.stock) {
        toast.error(`Only ${product.stock} units available in stock`);
        return;
      }
      
      updatedCart[itemIndex] = {
        ...product,
        quantity,
        discount,
        total: (product.price * quantity) * (1 - (discount / 100))
      };
      
      setCart(updatedCart);
    }
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartDiscount = cart.reduce((sum, item) => sum + ((item.price * item.quantity) * (item.discount / 100)), 0);
  const cartTax = (cartSubtotal - cartDiscount) * 0.1; // 10% tax
  const cartTotal = cartSubtotal - cartDiscount + cartTax;

  const completeSale = (paymentMethod: string, prescription?: { doctor: string; notes: string; imageUrl?: string }): Receipt => {
    if (!user) {
      throw new Error('User must be logged in to complete a sale');
    }
    
    if (cart.length === 0) {
      throw new Error('Cannot complete sale with empty cart');
    }
    
    const receipt: Receipt = {
      id: uuidv4(),
      date: new Date().toISOString(),
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      tax: cartTax,
      total: cartTotal,
      paymentMethod,
      customer: selectedCustomer,
      cashierName: user.name,
      cashierId: user.id,
      prescription: prescription ? { 
        id: uuidv4(), 
        ...prescription 
      } : undefined
    };
    
    // Add to recent sales
    setRecentSales(prev => [receipt, ...prev]);
    
    // Clear the cart
    clearCart();
    
    toast.success('Sale completed successfully');
    return receipt;
  };

  return (
    <SalesContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      cartTotal,
      cartSubtotal,
      cartTax,
      cartDiscount,
      selectedCustomer,
      setSelectedCustomer,
      completeSale,
      recentSales
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = (): SalesContextProps => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
