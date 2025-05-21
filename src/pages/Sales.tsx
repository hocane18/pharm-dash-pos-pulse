
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
import { ShoppingCart, Search, Plus, X, CreditCard, Banknote } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useSales, CartItem } from '@/contexts/SalesContext';
import { useCustomer } from '@/contexts/CustomerContext';

const Sales: React.FC = () => {
  const { products } = useInventory();
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartItem, 
    cartTotal, 
    cartSubtotal,
    cartTax,
    cartDiscount,
    selectedCustomer,
    setSelectedCustomer,
    completeSale
  } = useSales();
  const { customers, searchCustomers } = useCustomer();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('new-sale');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = searchCustomers(customerSearchQuery);

  const handleCompleteSale = () => {
    try {
      const receipt = completeSale(paymentMethod);
      // Could navigate to receipt view or show receipt in a modal
      setActiveTab('completed');
    } catch (error) {
      console.error("Error completing sale:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="new-sale">New Sale</TabsTrigger>
          <TabsTrigger value="completed">Completed Sales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new-sale" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Product Selection */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Search and add products to cart</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium">{product.name}</div>
                          </TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {product.stock > 10 ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {product.stock}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {product.stock}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => addToCart(product)}
                              disabled={product.stock <= 0}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Cart
                </CardTitle>
                <CardDescription>
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="mb-4 p-3 bg-muted rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedCustomer(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mb-4">
                    {showCustomerSearch ? (
                      <div className="space-y-2">
                        <Input
                          type="search"
                          placeholder="Search customers..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        />
                        <div className="h-[100px] overflow-auto border rounded-md">
                          {filteredCustomers.map(customer => (
                            <div 
                              key={customer.id} 
                              className="p-2 border-b hover:bg-muted cursor-pointer"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowCustomerSearch(false);
                                setCustomerSearchQuery('');
                              }}
                            >
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.phone}</p>
                            </div>
                          ))}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setShowCustomerSearch(false);
                            setCustomerSearchQuery('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowCustomerSearch(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Customer
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>${item.price.toFixed(2)} × {item.quantity}</span>
                          {item.discount > 0 && (
                            <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">
                              {item.discount}% off
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">${item.total.toFixed(2)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="w-full space-y-1 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-${cartDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>${cartTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center">
                        <Banknote className="mr-2 h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Card
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  className="w-full mt-2" 
                  size="lg" 
                  disabled={cart.length === 0}
                  onClick={handleCompleteSale}
                >
                  Complete Sale
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>View and manage your recent sales</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Cashier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {useSales().recentSales.slice(0, 10).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">{sale.id.substring(0, 8)}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                      <TableCell>{sale.customer ? sale.customer.name : 'Walk-in'}</TableCell>
                      <TableCell>{sale.items.length}</TableCell>
                      <TableCell>${sale.total.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{sale.paymentMethod}</TableCell>
                      <TableCell>{sale.cashierName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;
