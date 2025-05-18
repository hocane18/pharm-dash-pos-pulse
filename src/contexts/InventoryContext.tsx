
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './SalesContext';

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    price: 5.99,
    category: 'Pain Relief',
    requiresPrescription: false,
    stock: 150,
    batchNumber: 'B20230501',
    expiryDate: '2025-05-01',
    imageUrl: 'https://placehold.co/200x150/3b82f6/ffffff?text=Paracetamol',
    description: 'Effective pain reliever and fever reducer',
    manufacturer: 'PharmaCorp'
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    price: 12.50,
    category: 'Antibiotics',
    requiresPrescription: true,
    stock: 75,
    batchNumber: 'B20230602',
    expiryDate: '2024-06-02',
    imageUrl: 'https://placehold.co/200x150/10b981/ffffff?text=Amoxicillin',
    description: 'Broad-spectrum antibiotic',
    manufacturer: 'MediPharm'
  },
  {
    id: '3',
    name: 'Ibuprofen 200mg',
    price: 6.75,
    category: 'Pain Relief',
    requiresPrescription: false,
    stock: 120,
    batchNumber: 'B20230703',
    expiryDate: '2025-07-03',
    imageUrl: 'https://placehold.co/200x150/6366f1/ffffff?text=Ibuprofen',
    description: 'Non-steroidal anti-inflammatory drug',
    manufacturer: 'HealthCare Inc'
  },
  {
    id: '4',
    name: 'Loratadine 10mg',
    price: 8.25,
    category: 'Allergy',
    requiresPrescription: false,
    stock: 90,
    batchNumber: 'B20230804',
    expiryDate: '2025-08-04',
    imageUrl: 'https://placehold.co/200x150/f59e0b/ffffff?text=Loratadine',
    description: 'Antihistamine for allergy relief',
    manufacturer: 'AllerCare'
  },
  {
    id: '5',
    name: 'Omeprazole 20mg',
    price: 10.99,
    category: 'Digestive',
    requiresPrescription: false,
    stock: 60,
    batchNumber: 'B20230905',
    expiryDate: '2025-09-05',
    imageUrl: 'https://placehold.co/200x150/ec4899/ffffff?text=Omeprazole',
    description: 'Proton pump inhibitor for acid reflux',
    manufacturer: 'DigestiCare'
  },
  {
    id: '6',
    name: 'Simvastatin 40mg',
    price: 15.50,
    category: 'Cardiovascular',
    requiresPrescription: true,
    stock: 45,
    batchNumber: 'B20231006',
    expiryDate: '2024-10-06',
    imageUrl: 'https://placehold.co/200x150/8b5cf6/ffffff?text=Simvastatin',
    description: 'Cholesterol-lowering medication',
    manufacturer: 'HeartHealth'
  },
  {
    id: '7',
    name: 'Cetirizine 10mg',
    price: 7.99,
    category: 'Allergy',
    requiresPrescription: false,
    stock: 85,
    batchNumber: 'B20231107',
    expiryDate: '2025-11-07',
    imageUrl: 'https://placehold.co/200x150/14b8a6/ffffff?text=Cetirizine',
    description: 'Second-generation antihistamine',
    manufacturer: 'AllerCare'
  },
  {
    id: '8',
    name: 'Metformin 500mg',
    price: 9.25,
    category: 'Diabetes',
    requiresPrescription: true,
    stock: 65,
    batchNumber: 'B20231208',
    expiryDate: '2024-12-08',
    imageUrl: 'https://placehold.co/200x150/f43f5e/ffffff?text=Metformin',
    description: 'Oral diabetes medication',
    manufacturer: 'DiabeCare'
  },
  {
    id: '9',
    name: 'Vitamin D3 1000IU',
    price: 11.25,
    category: 'Vitamins',
    requiresPrescription: false,
    stock: 100,
    batchNumber: 'B20240109',
    expiryDate: '2026-01-09',
    imageUrl: 'https://placehold.co/200x150/fbbf24/ffffff?text=Vitamin+D3',
    description: 'Supports bone health and immune function',
    manufacturer: 'VitaHealth'
  },
  {
    id: '10',
    name: 'Salbutamol Inhaler',
    price: 18.99,
    category: 'Respiratory',
    requiresPrescription: true,
    stock: 35,
    batchNumber: 'B20240210',
    expiryDate: '2025-02-10',
    imageUrl: 'https://placehold.co/200x150/4f46e5/ffffff?text=Salbutamol',
    description: 'Bronchodilator for asthma relief',
    manufacturer: 'RespiCare'
  }
];

interface InventoryContextProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  getProductById: (id: string) => Product | undefined;
  getLowStockProducts: (threshold?: number) => Product[];
  getNearExpiryProducts: (daysThreshold?: number) => Product[];
  categories: string[];
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

// Load products from local storage or use mock data
const loadProducts = (): Product[] => {
  const storedProducts = localStorage.getItem('pharmacy-products');
  if (storedProducts) {
    try {
      return JSON.parse(storedProducts);
    } catch (e) {
      console.error('Error parsing product data:', e);
      return mockProducts;
    }
  }
  return mockProducts;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  
  // Save products to local storage when they change
  useEffect(() => {
    localStorage.setItem('pharmacy-products', JSON.stringify(products));
  }, [products]);
  
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4()
    };
    
    setProducts(prev => [...prev, newProduct]);
    toast.success(`${newProduct.name} added to inventory`);
  };
  
  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    toast.success(`${product.name} updated`);
  };
  
  const deleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (product) {
      toast.success(`${product.name} removed from inventory`);
    }
  };
  
  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };
  
  const getLowStockProducts = (threshold = 50) => {
    return products.filter(p => p.stock <= threshold);
  };
  
  const getNearExpiryProducts = (daysThreshold = 90) => {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    return products.filter(p => {
      const expiryDate = new Date(p.expiryDate);
      return expiryDate <= thresholdDate;
    });
  };
  
  const categories = [...new Set(products.map(p => p.category))];
  
  return (
    <InventoryContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      getLowStockProducts,
      getNearExpiryProducts,
      categories
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextProps => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
