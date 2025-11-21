import React, { useState } from 'react';
import { Advance, Return } from '../types';
import { useAuth } from '../AuthContext';
import { createReturn } from '../lib/data';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ReturnFormProps {
  advance: Advance;
  onReturnAdded: () => void;
}

const ReturnForm: React.FC<ReturnFormProps> = ({ advance, onReturnAdded }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) {
      toast.error('Please enter an amount to return.');
      return;
    }

    if (amount <= 0) {
      toast.error('Return amount must be positive.');
      return;
    }
    
    if (amount > advance.balanceToSettle) {
      toast.error(`Return amount cannot exceed the balance of ${advance.balanceToSettle}.`);
      return;
    }

    setIsLoading(true);
    const newReturn: Omit<Return, 'id'> = {
      staffId: user.id,
      staffName: user.name,
      advanceId: advance.id,
      amount: Number(amount),
      note,
      date: new Date().toISOString(),
      status: 'pending',
    };

    try {
      await createReturn(newReturn);
      toast.success('Return submitted for approval.');
      setAmount('');
      setNote('');
      onReturnAdded();
    } catch (error) {
      toast.error('Failed to submit return.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Cash</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="return-amount">Amount</Label>
            <Input
              id="return-amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              required
              min="0.01"
              step="0.01"
              max={advance.balanceToSettle}
            />
          </div>
          <div>
            <Label htmlFor="return-note">Note (Optional)</Label>
            <Textarea id="return-note" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Return'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReturnForm;