import React, { useState, useEffect } from 'react';
import { Expense, Return } from '../types';
import { getExpenses, getReturns, approveExpense, rejectExpense, approveReturn } from '../lib/data';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import BillImageViewer from './BillImageViewer';

const AdminReturnList: React.FC = () => {
  const { user } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [pendingReturns, setPendingReturns] = useState<Return[]>([]);
  const [rejectionNote, setRejectionNote] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  const fetchData = async () => {
    const allExpenses = await getExpenses();
    setPendingExpenses(allExpenses.filter(e => e.status === 'pending'));
    
    const allReturns = await getReturns();
    setPendingReturns(allReturns.filter(r => r.status === 'pending'));
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('data-changed', fetchData);
    return () => window.removeEventListener('data-changed', fetchData);
  }, []);

  const handleApproveExpense = async (expenseId: string) => {
    if (user) {
      await approveExpense(expenseId, user.id);
      fetchData();
    }
  };

  const handleRejectExpense = async () => {
    if (user && selectedExpenseId && rejectionNote) {
      await rejectExpense(selectedExpenseId, user.id, rejectionNote);
      fetchData();
      setSelectedExpenseId(null);
      setRejectionNote('');
    } else {
        toast.error('Rejection note cannot be empty.');
    }
  };
  
  const handleApproveReturn = async (returnId: string) => {
    if (user) {
        await approveReturn(returnId, user.id);
        fetchData();
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Pending Expense Approvals</CardTitle>
          <CardDescription>Review and approve or reject expenses submitted by staff.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingExpenses.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No pending expenses.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Bill</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingExpenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.staffName}</TableCell>
                    <TableCell>{formatDateTime(exp.date)}</TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(exp.totalAmount)}</TableCell>
                    <TableCell><BillImageViewer billImage={exp.billImage} /></TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button size="icon" variant="outline" className="text-green-600" onClick={() => handleApproveExpense(exp.id)}><Check className="h-4 w-4" /></Button>
                      <Dialog onOpenChange={(open) => !open && setSelectedExpenseId(null)}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="destructive" onClick={() => setSelectedExpenseId(exp.id)}><X className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Expense</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Label htmlFor="rejection-note">Reason for Rejection</Label>
                                <Input id="rejection-note" value={rejectionNote} onChange={(e) => setRejectionNote(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button variant="destructive" onClick={handleRejectExpense}>Confirm Rejection</Button>
                            </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Return Approvals</CardTitle>
           <CardDescription>Approve cash returns from staff to settle their advances.</CardDescription>
        </CardHeader>
        <CardContent>
            {pendingReturns.length === 0 ? (
                 <p className="text-slate-500 text-center py-4">No pending returns.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingReturns.map(ret => (
                            <TableRow key={ret.id}>
                                <TableCell>{ret.staffName}</TableCell>
                                <TableCell>{formatDateTime(ret.date)}</TableCell>
                                <TableCell>{ret.note}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(ret.amount)}</TableCell>
                                <TableCell className="text-center">
                                    <Button size="sm" onClick={() => handleApproveReturn(ret.id)}>
                                        <Check className="h-4 w-4 mr-2" /> Approve
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReturnList;