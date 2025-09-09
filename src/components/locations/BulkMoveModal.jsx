import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Move, 
  Camera, 
  Users, 
  Clipboard, 
  ArrowRight, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Camera as CameraEntity } from '@/api/entities';
import { Employee } from '@/api/entities';
import { Task } from '@/api/entities';

export default function BulkMoveModal({ locations, onClose, onComplete }) {
  const [activeTab, setActiveTab] = useState('cameras');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [targetLocation, setTargetLocation] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadItems(activeTab);
  }, [activeTab]);

  const loadItems = async (type) => {
    setLoading(true);
    setSelectedItems(new Set());
    
    try {
      let data = [];
      switch (type) {
        case 'cameras':
          data = await CameraEntity.list();
          break;
        case 'employees':
          data = await Employee.list();
          break;
        case 'tasks':
          data = await Task.list();
          break;
      }
      setItems(data);
    } catch (error) {
      console.error(`Failed to load ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleBulkMove = async () => {
    if (selectedItems.size === 0 || !targetLocation) {
      return;
    }

    setProcessing(true);
    try {
      const updates = Array.from(selectedItems).map(itemId => {
        switch (activeTab) {
          case 'cameras':
            return CameraEntity.update(itemId, { location_id: targetLocation });
          case 'employees':
            return Employee.update(itemId, { location_id: targetLocation });
          case 'tasks':
            return Task.update(itemId, { location_id: targetLocation });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(updates);
      onComplete();
    } catch (error) {
      console.error('Failed to move items:', error);
      alert('Failed to move some items. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getLocationName = (locationId) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const selectedItemsCount = selectedItems.size;
  const targetLocationName = locations.find(l => l.id === targetLocation)?.name;

  return (
    <Dialog open={true} onOpenChange={() => !processing && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="w-5 h-5 text-blue-600" />
            Bulk Move Resources
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cameras" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Cameras
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Clipboard className="w-4 h-4" />
                Tasks
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-6 min-h-0">
              <TabsContent value="cameras" className="h-full mt-0">
                <ItemsList
                  items={items}
                  type="cameras"
                  selectedItems={selectedItems}
                  onItemToggle={handleItemToggle}
                  onSelectAll={handleSelectAll}
                  getLocationName={getLocationName}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value="employees" className="h-full mt-0">
                <ItemsList
                  items={items}
                  type="employees"
                  selectedItems={selectedItems}
                  onItemToggle={handleItemToggle}
                  onSelectAll={handleSelectAll}
                  getLocationName={getLocationName}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value="tasks" className="h-full mt-0">
                <ItemsList
                  items={items}
                  type="tasks"
                  selectedItems={selectedItems}
                  onItemToggle={handleItemToggle}
                  onSelectAll={handleSelectAll}
                  getLocationName={getLocationName}
                  loading={loading}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Action Bar */}
        <div className="border-t pt-4 space-y-4">
          {selectedItemsCount > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600 text-white">
                  {selectedItemsCount} selected
                </Badge>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <Select value={targetLocation} onValueChange={setTargetLocation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleBulkMove}
                disabled={!targetLocation || processing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Move className="w-4 h-4 mr-2" />
                {processing ? 'Moving...' : `Move ${selectedItemsCount} items`}
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Items List Component
function ItemsList({ 
  items, 
  type, 
  selectedItems, 
  onItemToggle, 
  onSelectAll, 
  getLocationName, 
  loading 
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading {type}...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No {type} found</p>
        </div>
      </div>
    );
  }

  const isAllSelected = selectedItems.size === items.length;
  const isSomeSelected = selectedItems.size > 0 && selectedItems.size < items.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-slate-50">
        <Checkbox
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isSomeSelected;
          }}
          onCheckedChange={onSelectAll}
        />
        <span className="font-medium">
          Select {type} to move ({selectedItems.size} of {items.length} selected)
        </span>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2 p-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                selectedItems.has(item.id) 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Checkbox
                checked={selectedItems.has(item.id)}
                onCheckedChange={() => onItemToggle(item.id)}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-slate-900 truncate">
                    {item.name || item.title || `${type.slice(0, -1)} ${item.id}`}
                  </p>
                  {item.location_id && (
                    <Badge variant="outline" className="text-xs">
                      {getLocationName(item.location_id)}
                    </Badge>
                  )}
                </div>
                
                {type === 'cameras' && item.status && (
                  <p className="text-sm text-slate-500">Status: {item.status}</p>
                )}
                
                {type === 'employees' && item.department && (
                  <p className="text-sm text-slate-500">Department: {item.department}</p>
                )}
                
                {type === 'tasks' && item.status && (
                  <p className="text-sm text-slate-500">Status: {item.status}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}