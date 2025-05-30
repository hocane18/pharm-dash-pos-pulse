
import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  BarChart, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  Bell,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './ThemeToggle';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        isActive && "bg-primary text-white hover:bg-primary/90 hover:text-white"
      )}
      onClick={onClick}
    >
      <span className="text-xl">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <Badge variant="destructive" className="ml-auto animate-pulse">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar for desktop */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "bg-sidebar text-sidebar-foreground border-sidebar-border"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">Rx</span>
            </div>
            <span className="text-xl font-bold">PharmaPOS</span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-sidebar-accent lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 animate-fade-in">
          <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
          
          {hasPermission('sales', 'view') && (
            <NavItem to="/sales" icon={<ShoppingCart size={20} />} label="Sales" />
          )}
          
          {hasPermission('inventory', 'view') && (
            <NavItem to="/inventory" icon={<Package size={20} />} label="Inventory" badge={3} />
          )}
          
          {hasPermission('customers', 'view') && (
            <NavItem to="/customers" icon={<Users size={20} />} label="Customers" />
          )}
          
          {hasPermission('prescriptions', 'view') && (
            <NavItem to="/prescriptions" icon={<FileText size={20} />} label="Prescriptions" />
          )}
          
          {hasPermission('reports', 'view') && (
            <NavItem to="/reports" icon={<BarChart size={20} />} label="Reports" />
          )}
          
          {hasPermission('settings', 'view') && (
            <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
          )}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              title="Logout"
              className="hover:bg-sidebar-accent"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-background border-b h-16 flex items-center px-4 lg:px-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-muted/80 mr-4 hidden lg:block transition-transform duration-200 hover:scale-105"
          >
            <Menu size={20} />
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md hover:bg-muted/80 mr-4 lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/80 transition-transform duration-200 hover:scale-105">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 animate-scale-in">
                <div className="px-4 py-2 font-medium">Notifications</div>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-auto">
                  <div className="px-4 py-3 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">Stock Alert</p>
                      <span className="text-xs text-muted-foreground">2h ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Paracetamol 500mg is low in stock</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">Expiry Alert</p>
                      <span className="text-xs text-muted-foreground">1d ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">3 products are expiring in 30 days</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-muted/80">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline-flex items-center">
                    <span className="mr-1">{user?.name}</span>
                    <ChevronDown size={16} />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-scale-in">
                <div className="flex items-center justify-start p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={closeMobileMenu} />
            <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background shadow-lg">
              <div className="flex items-center justify-between h-16 px-4 border-b">
                <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                  <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">Rx</span>
                  </div>
                  <span className="text-xl font-bold">PharmaPOS</span>
                </Link>
                <button 
                  onClick={closeMobileMenu}
                  className="p-2 rounded-md hover:bg-muted/80"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                <NavItem to="/" icon={<Home size={20} />} label="Dashboard" onClick={closeMobileMenu} />
                
                {hasPermission('sales', 'view') && (
                  <NavItem to="/sales" icon={<ShoppingCart size={20} />} label="Sales" onClick={closeMobileMenu} />
                )}
                
                {hasPermission('inventory', 'view') && (
                  <NavItem to="/inventory" icon={<Package size={20} />} label="Inventory" onClick={closeMobileMenu} badge={3} />
                )}
                
                {hasPermission('customers', 'view') && (
                  <NavItem to="/customers" icon={<Users size={20} />} label="Customers" onClick={closeMobileMenu} />
                )}
                
                {hasPermission('prescriptions', 'view') && (
                  <NavItem to="/prescriptions" icon={<FileText size={20} />} label="Prescriptions" onClick={closeMobileMenu} />
                )}
                
                {hasPermission('reports', 'view') && (
                  <NavItem to="/reports" icon={<BarChart size={20} />} label="Reports" onClick={closeMobileMenu} />
                )}
                
                {hasPermission('settings', 'view') && (
                  <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" onClick={closeMobileMenu} />
                )}
              </nav>
              <div className="absolute bottom-0 w-full border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      closeMobileMenu();
                      logout();
                    }}
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
