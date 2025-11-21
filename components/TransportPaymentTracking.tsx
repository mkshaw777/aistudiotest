import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { createTransportPayment, getTransportPayments } from '../lib/data';
import { TransportPayment, TransportCompany } from '../types';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TRANSPORT_COMPANIES } from '../lib/constants';

const TransportPaymentTracking: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<TransportPayment[]>([]);

  // Form state
  const [company, setCompany] = useState<TransportCompany | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter state
  const [companyFilter, setCompanyFilter] = useState('All');

  const fetchData = async () => {
    const allPayments = await getTransportPayments();
    setPayments(allPayments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('data-changed', fetchData);
    return () => window.removeEventListener('data-changed', fetchData);
  }, []);

  const displayedPayments = useMemo(() => {
    let filteredPayments = payments;

    if (user?.role !== 'admin') {
      filteredPayments = filteredPayments.filter(p => p.staffId === user?.id);
    }

    if (companyFilter !== 'All') {
      filteredPayments = filteredPayments.filter(p => p.company === companyFilter);
    }
    
    return filteredPayments;
  }, [payments, user, companyFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company || !amount) {
      toast.error('Please fill all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await createTransportPayment({
        staffId: user.id,
        staffName: user.name,
        company,
        amount: Number(amount),
        details,
        date: new Date().toISOString(),
      });
      toast.success('Transport payment logged successfully.');
      setCompany('');
      setAmount('');
      setDetails('');
      fetchData();
    } catch (error) {
      toast.error('Failed to log payment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-mk-blue-primary border-2">
        <CardHeader>
          <CardTitle>Log Transport Payment</CardTitle>
          <CardDescription>Record a payment made to a transport service.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Transport Company</Label>
                <Select onValueChange={(v) => setCompany(v as TransportCompany)} value={company} required>
                  <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                  <SelectContent>
                    {TRANSPORT_COMPANIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (INR)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value ? parseFloat(e.target.value) : '')} required />
              </div>
            </div>
            <div>
              <Label>Payment Details</Label>
              <Textarea value={details} onChange={e => setDetails(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging...' : 'Log Payment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h3 className="text-xl font-bold">{user?.role === 'admin' ? 'All' : 'My'} Transport Payments</h3>
            <Select onValueChange={setCompanyFilter} value={companyFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Companies</SelectItem>
                    {TRANSPORT_COMPANIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {user?.role === 'admin' && <TableHead>Staff</TableHead>}
                            <TableHead>Date</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedPayments.length > 0 ? displayedPayments.map(p => (
                            <TableRow key={p.id}>
                                {user?.role === 'admin' && <TableCell>{p.staffName}</TableCell>}
                                <TableCell>{formatDateTime(p.date)}</TableCell>
                                <TableCell>{p.company}</TableCell>
                                <TableCell>{p.details}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(p.amount)}</TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={user?.role === 'admin' ? 5 : 4} className="text-center h-24">No payments found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransportPaymentTracking;