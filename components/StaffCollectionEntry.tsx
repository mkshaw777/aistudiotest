import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { createCollection, getCollections } from '../lib/data';
import { Collection } from '../types';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { Separator } from './ui/separator';

const StaffCollectionEntry: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number | ''>('');
  const [source, setSource] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [myCollections, setMyCollections] = useState<Collection[]>([]);

  const fetchMyCollections = async () => {
    if(user) {
        const allCollections = await getCollections();
        const collections = allCollections.filter(c => c.staffId === user.id);
        setMyCollections(collections.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  useEffect(() => {
    fetchMyCollections();
    window.addEventListener('data-changed', fetchMyCollections);
    return () => window.removeEventListener('data-changed', fetchMyCollections);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !source) {
      toast.error('Please fill all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await createCollection({
        staffId: user.id,
        staffName: user.name,
        amount: Number(amount),
        source,
        details,
        date: new Date().toISOString(),
      });
      toast.success('Collection logged successfully.');
      setAmount('');
      setSource('');
      setDetails('');
      fetchMyCollections(); // Refresh list
    } catch (error) {
      toast.error('Failed to log collection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-mk-blue-primary border-2">
        <CardHeader>
          <CardTitle>Log New Collection</CardTitle>
          <CardDescription>Enter the details of the cash or payment collected.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="collection-amount">Amount (INR)</Label>
                    <Input id="collection-amount" type="number" value={amount} onChange={e => setAmount(e.target.value ? parseFloat(e.target.value) : '')} required />
                </div>
                <div>
                    <Label htmlFor="collection-source">Source (Customer/Company)</Label>
                    <Input id="collection-source" value={source} onChange={e => setSource(e.target.value)} required />
                </div>
            </div>
            <div>
              <Label htmlFor="collection-details">Details</Label>
              <Textarea id="collection-details" value={details} onChange={e => setDetails(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging...' : 'Log Collection'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h3 className="text-xl font-bold mb-4">My Recent Collections</h3>
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myCollections.length > 0 ? myCollections.map(col => (
                            <TableRow key={col.id}>
                                <TableCell>{formatDateTime(col.date)}</TableCell>
                                <TableCell>{col.source}</TableCell>
                                <TableCell>{col.details}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(col.amount)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No collections logged yet.</TableCell>
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

export default StaffCollectionEntry;