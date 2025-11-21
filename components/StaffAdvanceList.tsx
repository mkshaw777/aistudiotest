import React, { useState, useEffect, useMemo } from 'react';
import { Advance, Expense } from '../types';
import { getAdvances, getExpenses } from '../lib/data';
import { useAuth } from '../AuthContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ReturnForm from './ReturnForm';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const StaffAdvanceList: React.FC = () => {
  const { user } = useAuth();
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); 

  const fetchData = async () => {
    if (user) {
      const allAdvances = await getAdvances();
      allAdvances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const userAdvances = user.role === 'admin' ? allAdvances : allAdvances.filter(a => a.staffId === user.id);
      setAdvances(userAdvances);
      
      const allExpenses = await getExpenses();
      setExpenses(allExpenses);
    }
  };

  useEffect(() => {
    fetchData();
    const handleDataChange = () => {
        fetchData();
        setRefreshKey(prev => prev + 1); 
    };
    window.addEventListener('data-changed', handleDataChange);
    return () => window.removeEventListener('data-changed', handleDataChange);
  }, [user]);

  const { activeAdvances, settledAdvances } = useMemo(() => {
    const active = advances.filter(a => a.status === 'active');
    const settled = advances.filter(a => a.status === 'settled');
    return { activeAdvances: active, settledAdvances: settled };
  }, [advances]);

  const getExpensesForAdvance = (advanceId: string) => {
    return expenses
        .filter(e => e.advanceId === advanceId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Advances</CardTitle>
          <CardDescription>
            {user.role === 'admin'
              ? 'Manage all ongoing staff advances. Click to expand and manage expenses.'
              : 'Your active cash advances. Click to add expenses or return funds.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAdvances.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No active advances.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {activeAdvances.map(advance => (
                <AccordionItem value={advance.id} key={advance.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="text-left">
                        {user.role === 'admin' && <p className="font-bold">{advance.staffName}</p>}
                        <p className="text-sm">{advance.purpose}</p>
                        <p className="text-xs text-slate-500">Issued: {formatDate(advance.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(advance.amount)}</p>
                        <p className="text-sm">Balance: <span className="font-medium text-green-600">{formatCurrency(advance.balanceToSettle)}</span></p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-2 bg-slate-50 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ExpenseForm key={`exp-${advance.id}-${refreshKey}`} advance={advance} onExpenseAdded={fetchData} />
                        <ReturnForm key={`ret-${advance.id}-${refreshKey}`} advance={advance} onReturnAdded={fetchData} />
                      </div>
                      <Separator />
                      <ExpenseList expenses={getExpensesForAdvance(advance.id)} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {settledAdvances.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Settled Advances</CardTitle>
                  <CardDescription>Recently settled and closed advances.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {user.role === 'admin' && <TableHead>Staff</TableHead>}
                                <TableHead>Purpose</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Settled On</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {settledAdvances.slice(0, 10).map(advance => (
                            <TableRow key={advance.id}>
                                {user.role === 'admin' && <TableCell className="font-medium">{advance.staffName}</TableCell>}
                                <TableCell>{advance.purpose}</TableCell>
                                <TableCell>{formatCurrency(advance.amount)}</TableCell>
                                <TableCell>{formatDate(advance.settlementDate)}</TableCell>
                                <TableCell><Badge variant="success">Settled</Badge></TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
          </Card>
      )}
    </div>
  );
};

export default StaffAdvanceList;