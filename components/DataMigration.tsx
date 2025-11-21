import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { batchImportData } from '../lib/data';
import { toast } from 'sonner';

const DataMigration: React.FC = () => {
  const [jsonData, setJsonData] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!jsonData) {
      toast.error("Please paste your JSON data.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonData);
      
      // Basic validation
      const hasData = parsed.users || parsed.advances || parsed.expenses || parsed.returns || parsed.transport_payments || parsed.collections;
      if (!hasData) {
         toast.error("Invalid JSON format. Could not find expected data keys (users, expenses, etc).");
         return;
      }

      setIsImporting(true);
      const count = await batchImportData(parsed);
      toast.success(`Successfully migrated ${count} records to Firebase!`);
      setJsonData('');
      // Trigger refresh if needed
      window.dispatchEvent(new CustomEvent('data-changed'));
    } catch (e: any) {
      console.error(e);
      toast.error(`Migration failed: ${e.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border-amber-400 border-2">
      <CardHeader>
        <CardTitle>Database Migration Tool</CardTitle>
        <CardDescription>
            Since I cannot receive files directly, please use this tool to migrate your Supabase data.
            <br/>
            1. Export your data from Supabase as a JSON file/object.
            <br/>
            2. Copy the JSON text (containing keys like "users", "expenses", "advances").
            <br/>
            3. Paste the text into the box below.
            <br/>
            4. Click "Start Migration".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
            className="min-h-[300px] font-mono text-xs" 
            placeholder='Example format: { "users": [...], "expenses": [...] }'
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
        />
        <Button onClick={handleImport} disabled={isImporting} className="w-full">
            {isImporting ? "Migrating Data..." : "Start Migration"}
        </Button>
        <p className="text-xs text-slate-500">
            Note: This will create new records in your Firebase database using the data you provide. 
            Large datasets are handled in chunks automatically.
        </p>
      </CardContent>
    </Card>
  );
};

export default DataMigration;