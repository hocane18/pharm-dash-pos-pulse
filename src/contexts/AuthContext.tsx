
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define user roles
export type UserRole = 'admin' | 'cashier' | 'pharmacist';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Define mock users for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'admin@pharmacy.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as UserRole,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=admin',
  },
  {
    id: '2',
    email: 'cashier@pharmacy.com',
    password: 'cashier123',
    name: 'Cashier User',
    role: 'cashier' as UserRole,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=cashier',
  },
  {
    id: '3',
    email: 'pharmacist@pharmacy.com',
    password: 'pharmacist123',
    name: 'Pharmacist User',
    role: 'pharmacist' as UserRole,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=pharmacist',
  },
];

// Define permission structure
export interface Permissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissions {
  inventory: Permissions;
  sales: Permissions;
  customers: Permissions;
  prescriptions: Permissions;
  reports: Permissions;
  settings: Permissions;
}

// Define initial role permissions
const defaultRolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    inventory: { view: true, create: true, edit: true, delete: true },
    sales: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    prescriptions: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
  },
  cashier: {
    inventory: { view: true, create: false, edit: false, delete: false },
    sales: { view: true, create: true, edit: false, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    prescriptions: { view: true, create: true, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  pharmacist: {
    inventory: { view: true, create: true, edit: true, delete: false },
    sales: { view: true, create: true, edit: false, delete: false },
    customers: { view: true, create: false, edit: false, delete: false },
    prescriptions: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
};

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (module: keyof RolePermissions, action: keyof Permissions) => boolean;
  updatePermissions: (role: UserRole, module: keyof RolePermissions, permissions: Permissions) => void;
  rolePermissions: Record<UserRole, RolePermissions>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, RolePermissions>>(defaultRolePermissions);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pharmacy-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('pharmacy-user');
      }
    }
    
    // Load saved permissions if available
    const storedPermissions = localStorage.getItem('pharmacy-permissions');
    if (storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);
        setRolePermissions(parsedPermissions);
      } catch (error) {
        console.error('Error parsing stored permissions:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      // Create user object without password
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('pharmacy-user', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${foundUser.name}!`);
      setIsLoading(false);
      return true;
    } else {
      setIsLoading(false);
      toast.error('Invalid email or password');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pharmacy-user');
    toast.success('Logged out successfully');
  };

  const hasPermission = (module: keyof RolePermissions, action: keyof Permissions): boolean => {
    if (!user) return false;
    const userPermissions = rolePermissions[user.role];
    return userPermissions ? userPermissions[module][action] : false;
  };

  const updatePermissions = (role: UserRole, module: keyof RolePermissions, permissions: Permissions) => {
    setRolePermissions(prev => {
      const updated = {
        ...prev,
        [role]: {
          ...prev[role],
          [module]: permissions
        }
      };
      
      // Save to localStorage
      localStorage.setItem('pharmacy-permissions', JSON.stringify(updated));
      
      return updated;
    });
    
    toast.success(`Permissions updated for ${role} role`);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      hasPermission, 
      updatePermissions,
      rolePermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
