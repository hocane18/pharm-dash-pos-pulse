
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useSales } from '@/contexts/SalesContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ShoppingCart, Package, AlertTriangle, Coins, User, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { products, getLowStockProducts, getNearExpiryProducts, categories } = useInventory();
  const { recentSales } = useSales();

  const lowStockProducts = getLowStockProducts(20);
  const expiringProducts = getNearExpiryProducts(30);

  // Calculate statistics
  const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = recentSales.length;
  
  // Sales by category data
  const salesByCategory = categories.map(category => {
    const categoryProducts = products.filter(product => product.category === category);
    const categoryProductIds = categoryProducts.map(product => product.id);
    
    let totalSold = 0;
    let revenue = 0;
    
    recentSales.forEach(sale => {
      sale.items.forEach(item => {
        if (categoryProductIds.includes(item.id)) {
          totalSold += item.quantity;
          revenue += item.total;
        }
      });
    });
    
    return {
      name: category,
      sales: totalSold,
      revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Top selling products
  const topProducts = products.map(product => {
    let totalSold = 0;
    recentSales.forEach(sale => {
      const saleItem = sale.items.find(item => item.id === product.id);
      if (saleItem) {
        totalSold += saleItem.quantity;
      }
    });
    return { ...product, totalSold };
  }).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);

  // Recent sales chart data
  const last7Days = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySales = last7Days.map(date => {
    const dayRevenue = recentSales
      .filter(sale => sale.date.split('T')[0] === date)
      .reduce((sum, sale) => sum + sale.total, 0);
    
    return {
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayRevenue,
    };
  });

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Stock distribution data
  const stockDistribution = categories.map((category, index) => {
    const categoryStock = products
      .filter(product => product.category === category)
      .reduce((sum, product) => sum + product.stock, 0);
    
    return {
      name: category,
      value: categoryStock,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 animate-fade-in">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h2>
        <p className="text-muted-foreground">
          Here's an overview of your pharmacy's performance
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-full p-2 bg-primary/10 text-primary">
                <Coins size={20} className="animate-[bounce_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Today</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
              <div className="rounded-full p-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <ShoppingCart size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
              <div className="rounded-full p-2 bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                <Package size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiringProducts.length}</p>
              </div>
              <div className="rounded-full p-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                <AlertTriangle size={20} className="animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent sales chart */}
        <Card className="col-span-1 animate-fade-in" style={{animationDelay: '0.1s'}}>
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
            <CardDescription>Daily revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock distribution */}
        <Card className="col-span-1 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle>Stock Distribution</CardTitle>
            <CardDescription>Inventory by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  animationDuration={1000}
                  animationBegin={200}
                >
                  {stockDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} units`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Top selling products */}
        <Card className="animate-fade-in" style={{animationDelay: '0.3s'}}>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Based on units sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center hover:bg-accent/20 p-2 rounded-md transition-colors cursor-pointer" style={{animationDelay: `${0.1 * index}s`}}>
                  <div className="mr-4 h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    <Package size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="ml-2 text-right">
                    <p className="text-sm font-medium">{product.totalSold} units</p>
                    <p className="text-xs text-muted-foreground">${(product.price * product.totalSold).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent sales */}
        <Card className="animate-fade-in" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.slice(0, 5).map((sale, index) => (
                <div key={sale.id} className="flex items-center hover:bg-accent/20 p-2 rounded-md transition-colors cursor-pointer" style={{animationDelay: `${0.1 * index}s`}}>
                  <div className="mr-4 h-10 w-10 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    {sale.customer ? (
                      <User size={20} className="text-blue-600 dark:text-blue-300" />
                    ) : (
                      <Clock size={20} className="text-blue-600 dark:text-blue-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {sale.customer ? sale.customer.name : 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-2 text-right">
                    <p className="text-sm font-medium">${sale.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{sale.items.length} items</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-fade-in" style={{animationDelay: '0.5s'}}>
        {/* Low stock alerts */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-amber-50 border-b border-amber-100 dark:bg-amber-900/20 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center">
                <AlertTriangle className="mr-2" size={18} />
                Low Stock Alerts
              </CardTitle>
              <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-200 px-2 py-1 text-xs font-medium">
                {lowStockProducts.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockProducts.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {lowStockProducts.slice(0, 5).map((product, index) => (
                  <li key={product.id} className="px-6 py-4 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors cursor-pointer" style={{animationDelay: `${0.1 * index}s`}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                      </div>
                      <div className="ml-2 text-right">
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-200 px-2 py-1 rounded-md text-xs font-medium">
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No low stock items
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring soon alerts */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-red-50 border-b border-red-100 dark:bg-red-900/20 dark:border-red-700/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-800 dark:text-red-300 flex items-center">
                <Clock className="mr-2" size={18} />
                Expiring Soon
              </CardTitle>
              <span className="rounded-full bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200 px-2 py-1 text-xs font-medium">
                {expiringProducts.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expiringProducts.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {expiringProducts.slice(0, 5).map((product, index) => (
                  <li key={product.id} className="px-6 py-4 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors cursor-pointer" style={{animationDelay: `${0.1 * index}s`}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Batch: {product.batchNumber}</p>
                      </div>
                      <div className="ml-2 text-right">
                        <span className="bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200 px-2 py-1 rounded-md text-xs font-medium">
                          Expires: {new Date(product.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No products expiring soon
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
