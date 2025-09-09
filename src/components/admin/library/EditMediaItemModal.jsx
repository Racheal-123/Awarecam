import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

export default function EditMediaItemModal({ item, onSave, onClose }) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [labels, setLabels] = useState(item.labels || []);
  const [currentLabel, setCurrentLabel] = useState('');

  const handleSave = () => {
    onSave({ ...item, title, description, labels });
  };

  const handleAddLabel = () => {
    if (currentLabel && !labels.includes(currentLabel)) {
      setLabels([...labels, currentLabel]);
      setCurrentLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Media Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="labels" className="text-right pt-2">Labels</Label>
            <div className="col-span-3">
              <div className="flex gap-2">
                <Input
                  id="labels"
                  value={currentLabel}
                  onChange={(e) => setCurrentLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                  placeholder="Add a label..."
                />
                <Button type="button" size="icon" onClick={handleAddLabel}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map(label => (
                  <Badge key={label} variant="secondary">
                    {label}
                    <button onClick={() => handleRemoveLabel(label)} className="ml-1 rounded-full hover:bg-black/10 p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}