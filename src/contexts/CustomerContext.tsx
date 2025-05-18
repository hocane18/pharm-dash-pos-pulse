
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from './SalesContext';

// Mock customer data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '555-123-4567',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown, USA'
  },
  {
    id: '2',
    name: 'Jane Doe',
    phone: '555-987-6543',
    email: 'jane.doe@example.com',
    address: '456 Oak Ave, Somewhere City, USA'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    phone: '555-234-5678',
    email: 'robert.johnson@example.com',
    address: '789 Elm St, Anycity, USA'
  },
  {
    id: '4',
    name: 'Emily Brown',
    phone: '555-345-6789',
    email: 'emily.brown@example.com',
    address: '101 Pine Dr, Downtown, USA'
  },
  {
    id: '5',
    name: 'Michael Wilson',
    phone: '555-456-7890',
    email: 'michael.wilson@example.com',
    address: '202 Maple Ln, Uptown, USA'
  }
];

interface CustomerContextProps {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
}

const CustomerContext = createContext<CustomerContextProps | undefined>(undefined);

// Load customers from local storage or use mock data
const loadCustomers = (): Customer[] => {
  const storedCustomers = localStorage.getItem('pharmacy-customers');
  if (storedCustomers) {
    try {
      return JSON.parse(storedCustomers);
    } catch (e) {
      console.error('Error parsing customer data:', e);
      return mockCustomers;
    }
  }
  return mockCustomers;
};

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);
  
  // Save customers to local storage when they change
  useEffect(() => {
    localStorage.setItem('pharmacy-customers', JSON.stringify(customers));
  }, [customers]);
  
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    // Check if customer with same phone number already exists
    const existingCustomer = customers.find(c => c.phone === customer.phone);
    if (existingCustomer) {
      toast.error('Customer with this phone number already exists');
      throw new Error('Customer with this phone number already exists');
    }
    
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4()
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    toast.success(`${newCustomer.name} added to customers`);
    return newCustomer;
  };
  
  const updateCustomer = (customer: Customer) => {
    // Check if another customer with same phone number exists
    const existingCustomer = customers.find(c => c.phone === customer.phone && c.id !== customer.id);
    if (existingCustomer) {
      toast.error('Another customer with this phone number already exists');
      throw new Error('Another customer with this phone number already exists');
    }
    
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    toast.success(`${customer.name}'s information updated`);
  };
  
  const deleteCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    if (customer) {
      toast.success(`${customer.name} removed from customers`);
    }
  };
  
  const getCustomerById = (id: string) => {
    return customers.find(c => c.id === id);
  };
  
  const searchCustomers = (query: string) => {
    if (!query) return customers;
    
    const lowercaseQuery = query.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowercaseQuery) ||
      customer.phone.includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(lowercaseQuery))
    );
  };
  
  return (
    <CustomerContext.Provider value={{
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomerById,
      searchCustomers
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextProps => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
