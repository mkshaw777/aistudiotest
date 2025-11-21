import React from 'react';
import { Expense } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatCurrency, formatDate } from '../lib/utils';
import { Badge } from './ui/badge';
import BillImageViewer from './BillImageViewer';

interface ExpenseListProps {
  expenses: Expense[];
}

const getStatusVariant = (status: 'pending' | 'approved' | 'rejected'): 'warning' | 'success' | 'destructive' => {
  switch (status) {
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'destructive';
  }
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  if (expenses.length === 0) {
    return <p className="text-sm text-center text-slate-500 py-4">No expenses submitted for this advance yet.</p>;
  }

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Submitted Expenses</h4>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Bill</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map(expense => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{expense.subCategory}</span>
                    {expense.remarks && <span className="text-xs text-slate-500">{expense.remarks}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(expense.totalAmount)}</TableCell>
                <TableCell>
                    <BillImageViewer billImage={expense.billImage} />
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(expense.status)}>{expense.status}</Badge>
                  {expense.status === 'rejected' && (
                     <p className="text-xs text-red-500 mt-1">{expense.rejectionNote}</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExpenseList;