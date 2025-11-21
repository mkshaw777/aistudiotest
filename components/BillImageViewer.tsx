import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { FileImage } from 'lucide-react';

interface BillImageViewerProps {
  billImage?: string;
}

const BillImageViewer: React.FC<BillImageViewerProps> = ({ billImage }) => {
  if (!billImage) {
    return <span className="text-xs text-slate-400">No Bill</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileImage className="h-4 w-4 mr-2" />
          View Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bill Image</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <img
            src={billImage}
            alt="Bill"
            className="max-w-full max-h-[80vh] object-contain mx-auto rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillImageViewer;
