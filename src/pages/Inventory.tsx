
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Search, AlertTriangle, Clock } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { format } from 'date-fns';

const Inventory: React.FC = () => {
  const { 
    products, 
    categories, 
    getLowStockProducts, 
    getNearExpiryProducts 
  } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const lowStockProducts = getLowStockProducts();
  const expiringProducts = getNearExpiryProducts();
  
  let displayedProducts = products;
  
  if (activeTab === 'low-stock') {
    displayedProducts = lowStockProducts;
  } else if (activeTab === 'expiring') {
    displayedProducts = expiringProducts;
  }
  
  // Apply filters
  if (categoryFilter) {
    displayedProducts = displayedProducts.filter(product => product.category === categoryFilter);
  }
  
  if (searchQuery) {
    displayedProducts = displayedProducts.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Format to YYYY-MM-DD
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  // Calculate days until expiry
  const daysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <CardTitle>Products</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={categoryFilter || ''} onValueChange={(value) => setCategoryFilter(value || null)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <CardDescription>Total {displayedProducts.length} products</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="low-stock">
                  Low Stock 
                  {lowStockProducts.length > 0 && (
                    <Badge className="ml-2 bg-red-500">{lowStockProducts.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="expiring">
                  Expiring
                  {expiringProducts.length > 0 && (
                    <Badge className="ml-2 bg-amber-500">{expiringProducts.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedProducts.map((product) => {
                      const daysLeft = daysUntilExpiry(product.expiryDate);
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.manufacturer}</div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {product.stock <= 50 ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                {product.stock}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                {product.stock}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{formatDate(product.expiryDate)}</div>
                            {daysLeft <= 90 && (
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-amber-500" />
                                {daysLeft} days left
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {product.requiresPrescription ? (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">
                                Prescription
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                OTC
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="outline" size="sm">Details</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex items-start">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800">Low Stock Alert</h3>
                    <p className="mt-1 text-sm text-red-700">
                      {lowStockProducts.length} products are running low on stock
                    </p>
                    <Button variant="link" className="mt-1 p-0 h-auto text-red-800">
                      View all
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                <div className="flex items-start">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-800">Expiry Alert</h3>
                    <p className="mt-1 text-sm text-amber-700">
                      {expiringProducts.length} products are expiring soon
                    </p>
                    <Button variant="link" className="mt-1 p-0 h-auto text-amber-800">
                      View all
                    </Button>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Category Distribution</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    {categories.map(category => {
                      const count = products.filter(p => p.category === category).length;
                      const percentage = Math.round((count / products.length) * 100);
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span>{count}</span>
                          </div>
                          <div className="bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;
