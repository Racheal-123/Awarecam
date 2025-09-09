
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Camera as CameraIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraListItem = ({ camera, isSelected, onSelect, disabled }) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`flex items-center p-3 rounded-lg transition-colors ${
      isSelected ? 'bg-blue-100' : 'hover:bg-slate-100'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    onClick={() => !disabled && onSelect(camera.id)}
  >
    <Checkbox 
      checked={isSelected} 
      onCheckedChange={() => !disabled && onSelect(camera.id)} 
      className="mr-4"
      disabled={disabled}
    />
    <div className="w-12 h-12 bg-slate-200 rounded-md mr-4 flex-shrink-0 flex items-center justify-center">
      <CameraIcon className="w-6 h-6 text-slate-500" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-slate-800">{camera.name}</p>
      <p className="text-sm text-slate-500">{camera.locationName || camera.location}</p>
    </div>
  </motion.div>
);


export default function AddCameraModal({
  isOpen,
  onClose,
  onAdd,
  availableCameras = [],
  maxSlots,
  isLoading
}) {
  const [selectedCameraIds, setSelectedCameraIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCameras = useMemo(() => {
    if (!availableCameras) return [];
    return availableCameras.filter(cam =>
      (cam.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (cam.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (cam.locationName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [availableCameras, searchTerm]);

  const handleSelect = (id) => {
    setSelectedCameraIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (maxSlots === undefined || newSet.size < maxSlots) {
            newSet.add(id);
        }
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    onAdd(Array.from(selectedCameraIds));
    onClose();
  };
  
  const canSelectMore = maxSlots === undefined || selectedCameraIds.size < maxSlots;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Cameras to Grid</DialogTitle>
          <DialogDescription>
            {maxSlots !== undefined 
              ? `Select from your available cameras. You can add up to ${maxSlots} more.`
              : 'Select cameras to add to the grid.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 my-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search available cameras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-72 border rounded-lg p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : (
              <AnimatePresence>
                {filteredCameras.length > 0 ? (
                  <div className="space-y-1">
                  {filteredCameras.map(cam => (
                    <CameraListItem 
                      key={cam.id} 
                      camera={cam} 
                      isSelected={selectedCameraIds.has(cam.id)} 
                      onSelect={handleSelect}
                      disabled={!selectedCameraIds.has(cam.id) && !canSelectMore}
                    />
                  ))}
                  </div>
                ) : (
                  <p className="p-8 text-center text-slate-500">No available cameras found.</p>
                )}
              </AnimatePresence>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          {maxSlots !== undefined && (
            <span className="text-sm text-slate-500 mr-auto">
              {selectedCameraIds.size} / {maxSlots} selected
            </span>
          )}
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddSelected} disabled={selectedCameraIds.size === 0}>
            Add {selectedCameraIds.size > 0 ? selectedCameraIds.size : ''} Camera{selectedCameraIds.size !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
