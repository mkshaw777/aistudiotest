import React, { useState, useEffect, useMemo } from 'react';
import { getCollections, getAllUsers } from '../lib/data';
import { Collection, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const AdminCollectionManagement: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [filterStaff, setFilterStaff] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const allCollections = await getCollections();
    setCollections(allCollections.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    const allUsers = await getAllUsers();
    setStaffList(allUsers.filter(u => u.role === 'staff'));
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('data-changed', fetchData);
    return () => window.removeEventListener('data-changed', fetchData);
  }, []);

  const filteredCollections = useMemo(() => {
    return collections
      .filter(col => filterStaff === 'all' || col.staffId === filterStaff)
      .filter(col => 
        col.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [collections, filterStaff, searchTerm]);

  const totalCollected = useMemo(() => {
    return filteredCollections.reduce((sum, col) => sum + col.amount, 0);
  }, [filteredCollections]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Collections</CardTitle>
        <CardDescription>View and filter all financial collections logged by staff.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input 
            placeholder="Search by staff, source, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select onValueChange={setFilterStaff} value={filterStaff}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffList.map(staff => (
                <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.length > 0 ? filteredCollections.map(col => (
                <TableRow key={col.id}>
                  <TableCell>{col.staffName}</TableCell>
                  <TableCell>{formatDateTime(col.date)}</TableCell>
                  <TableCell>{col.source}</TableCell>
                  <TableCell>{col.details}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(col.amount)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No collections found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="text-right mt-4 font-bold text-lg">
            Total Displayed: {formatCurrency(totalCollected)}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCollectionManagement;