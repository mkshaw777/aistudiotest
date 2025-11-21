import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { createAdvance, getAllUsers } from '../lib/data';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const AdminAdvanceForm: React.FC = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user: adminUser } = useAuth();

  useEffect(() => {
    const loadStaff = async () => {
        const users = await getAllUsers();
        setStaffList(users.filter(u => u.role === 'staff'));
    };
    loadStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !amount || !purpose || !adminUser) {
      toast.error('Please fill all fields.');
      return;
    }

    const selectedStaff = staffList.find(s => s.id === selectedStaffId);
    if (!selectedStaff) {
      toast.error('Selected staff not found.');
      return;
    }
    
    setIsLoading(true);
    try {
      await createAdvance({
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        amount: Number(amount),
        purpose,
        issuedBy: adminUser.id,
      });
      toast.success(`Advance of ${amount} issued to ${selectedStaff.name}.`);
      setSelectedStaffId('');
      setAmount('');
      setPurpose('');
      window.dispatchEvent(new CustomEvent('data-changed'));
    } catch (error) {
      toast.error('Failed to issue advance.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-mk-blue-primary border-2">
      <CardHeader>
        <CardTitle>Issue New Advance</CardTitle>
        <CardDescription>Create and assign a new cash advance to a staff member.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="grid gap-1.5 md:col-span-1">
            <Label htmlFor="staff">Staff Member</Label>
            <Select onValueChange={setSelectedStaffId} value={selectedStaffId} disabled={isLoading}>
              <SelectTrigger id="staff">
                <SelectValue placeholder="Select Staff" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 md:col-span-1">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              required
              min="1"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
             <Label htmlFor="purpose">Purpose</Label>
             <Textarea
              id="purpose"
              placeholder="e.g., For outstation travel to Delhi"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              disabled={isLoading}
              className="min-h-[40px]"
             />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full md:col-start-4">
            {isLoading ? 'Issuing...' : 'Issue Advance'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminAdvanceForm;