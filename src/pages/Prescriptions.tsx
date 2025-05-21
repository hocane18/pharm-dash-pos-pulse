
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Search, Eye, Calendar, User } from 'lucide-react';
import { useSales, Receipt } from '@/contexts/SalesContext';

const Prescriptions: React.FC = () => {
  const { recentSales } = useSales();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // Filter prescriptions from sales
  const prescriptions = recentSales
    .filter(sale => sale.prescription)
    .map(sale => ({
      ...sale,
      prescriptionData: sale.prescription!
    }));

  // Apply filters
  let filteredPrescriptions = [...prescriptions];
  
  if (searchQuery) {
    filteredPrescriptions = filteredPrescriptions.filter(receipt =>
      receipt.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.prescriptionData.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.prescriptionData.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Prescription Records</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>View and manage prescription records</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterStatus || ''} onValueChange={(value) => setFilterStatus(value || null)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prescriptions..."
                  className="pl-8 w-[230px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No prescriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((receipt) => (
                  <TableRow key={receipt.prescriptionData.id}>
                    <TableCell className="font-mono text-xs">
                      {receipt.prescriptionData.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{new Date(receipt.date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{receipt.customer?.name || 'Walk-in Customer'}</span>
                      </div>
                    </TableCell>
                    <TableCell>Dr. {receipt.prescriptionData.doctor}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={receipt.prescriptionData.notes}>
                        {receipt.prescriptionData.notes}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                        Filled
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescription Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Prescriptions</span>
                <span className="font-medium">{prescriptions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Filled Today</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prescriptions.length > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dr. {prescriptions[0].prescriptionData.doctor}</span>
                    <Badge variant="outline">1 Prescription</Badge>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Common Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prescriptions.length > 0 ? (
                prescriptions.map((prescription, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm truncate max-w-[180px]">{
                      prescription.items.filter(item => item.requiresPrescription).map(item => item.name).join(', ')
                    }</span>
                    <Badge variant="outline">1 Prescription</Badge>
                  </div>
                )).slice(0, 3)
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prescriptions;
