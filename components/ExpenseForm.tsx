import React, { useState } from 'react';
import { Advance, Expense, ExpenseCategory } from '../types';
import { useAuth } from '../AuthContext';
import { createExpense } from '../lib/data';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { EXPENSE_CATEGORIES } from '../lib/constants';
import { compressImage, validateImageFile } from '../lib/imageUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ExpenseFormProps {
  advance: Advance;
  onExpenseAdded: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ advance, onExpenseAdded }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [subCategory, setSubCategory] = useState('');
  const [fare, setFare] = useState(0);
  const [parking, setParking] = useState(0);
  const [oil, setOil] = useState(0);
  const [breakfast, setBreakfast] = useState(0);
  const [others, setOthers] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [billImage, setBillImage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCategory('');
    setSubCategory('');
    setFare(0);
    setParking(0);
    setOil(0);
    setBreakfast(0);
    setOthers(0);
    setRemarks('');
    setBillImage(undefined);
    const fileInput = document.getElementById('bill-image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateImageFile(file)) return;
      try {
        const compressedBase64 = await compressImage(file);
        setBillImage(compressedBase64);
        toast.success("Bill image attached.");
      } catch (error) {
        toast.error("Failed to process image.");
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category) {
      toast.error('Please select a category.');
      return;
    }

    const totalAmount = fare + parking + oil + breakfast + others;
    if (totalAmount <= 0) {
      toast.error('Total amount must be greater than zero.');
      return;
    }
    if (totalAmount > advance.balanceToSettle) {
      toast.error(`Expense (${totalAmount}) exceeds remaining advance balance (${advance.balanceToSettle}).`);
      return;
    }

    setIsLoading(true);
    const newExpense: Omit<Expense, 'id'> = {
      staffId: user.id,
      staffName: user.name,
      advanceId: advance.id,
      category,
      subCategory,
      fare, parking, oil, breakfast, others,
      remarks,
      totalAmount,
      billImage,
      date: new Date().toISOString(),
      status: 'pending',
      submittedToAdmin: true,
      settlementStatus: 'pending',
    };

    try {
      await createExpense(newExpense);
      toast.success('Expense submitted for approval.');
      resetForm();
      onExpenseAdded();
    } catch (error) {
      toast.error('Failed to submit expense.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setCategory(value as ExpenseCategory)} value={category} required>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subCategory">Sub-Category / Details</Label>
              <Input id="subCategory" value={subCategory} onChange={e => setSubCategory(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div><Label>Fare</Label><Input type="number" value={fare} onChange={e => setFare(parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Parking</Label><Input type="number" value={parking} onChange={e => setParking(parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Oil</Label><Input type="number" value={oil} onChange={e => setOil(parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Breakfast</Label><Input type="number" value={breakfast} onChange={e => setBreakfast(parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Others</Label><Input type="number" value={others} onChange={e => setOthers(parseFloat(e.target.value) || 0)} /></div>
          </div>
          <div>
            <Label htmlFor="remarks">Remarks (Required if 'Others' &gt; 0)</Label>
            <Textarea id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} required={others > 0} />
          </div>
          <div>
            <Label htmlFor="bill-image-input">Attach Bill (Optional)</Label>
            <Input id="bill-image-input" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
             {billImage && <p className="text-xs text-green-600 mt-1">Image ready for upload.</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;