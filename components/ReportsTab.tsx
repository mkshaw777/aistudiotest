import React, { useState } from 'react';
import { downloadCSV } from '../lib/reportUtils';
import { TRANSPORT_COMPANIES } from '../lib/constants';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { DatePicker } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

type ReportType = 'expenses' | 'advances' | 'returns' | 'transport_payments' | 'collections' | 'users';

const ReportsTab: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [companyFilter, setCompanyFilter] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (reportType: ReportType) => {
    if ((reportType !== 'users') && (!startDate || !endDate)) {
        toast.error('Please select a start and end date for the report.');
        return;
    }
    setIsGenerating(true);
    await downloadCSV(reportType, startDate?.toISOString(), endDate?.toISOString(), companyFilter);
    setIsGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Reports</CardTitle>
        <CardDescription>
          Select a date range and report type to download data in CSV format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="grid gap-1.5 w-full">
                <Label>Start Date</Label>
                <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            <div className="grid gap-1.5 w-full">
                <Label>End Date</Label>
                <DatePicker value={endDate} onChange={setEndDate} />
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button onClick={() => handleDownload('expenses')} disabled={isGenerating}>Download Expenses Report</Button>
            <Button onClick={() => handleDownload('advances')} disabled={isGenerating}>Download Advances Report</Button>
            <Button onClick={() => handleDownload('returns')} disabled={isGenerating}>Download Returns Report</Button>
            <Button onClick={() => handleDownload('collections')} disabled={isGenerating}>Download Collections Report</Button>
            <Button onClick={() => handleDownload('users')} variant="secondary" disabled={isGenerating}>Download Users List</Button>
        </div>

        <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Transport Payments Report</h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="grid gap-1.5 w-full md:w-auto">
                    <Label>Filter by Company</Label>
                    <Select onValueChange={setCompanyFilter} defaultValue="All">
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Companies</SelectItem>
                            {TRANSPORT_COMPANIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => handleDownload('transport_payments')} className="w-full md:w-auto" disabled={isGenerating}>
                    Download Transport Report
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsTab;