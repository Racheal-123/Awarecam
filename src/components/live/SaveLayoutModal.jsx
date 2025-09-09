import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SaveLayoutModal({ isOpen, onClose, onSave }) {
  const [layoutName, setLayoutName] = useState('');

  const handleSave = () => {
    if (layoutName.trim()) {
      onSave(layoutName.trim());
      onClose();
    }
  };
  
  const handleOpenChange = (open) => {
      if (!open) {
          setLayoutName('');
          onClose();
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Current Layout</DialogTitle>
          <DialogDescription>
            Enter a name for your current grid and filter configuration. This will save the selected cameras and locations.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="layout-name" className="text-left">Layout Name</Label>
          <Input
            id="layout-name"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder="e.g., 'Warehouse Docking Bays'"
            className="mt-2"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!layoutName.trim()}>
            Save Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}