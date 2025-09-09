import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function CallbackLogViewer({ isOpen, onClose, logEntry }) {
  const [showPayload, setShowPayload] = useState(false);

  if (!logEntry) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800';
      case 'starting': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Latest Stream Callback
          </DialogTitle>
          <DialogDescription>
            Most recent callback received from the stream provider
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(logEntry.created_date), 'MMM d, yyyy HH:mm:ss')}</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor(logEntry.status)}>
              {logEntry.status}
            </Badge>
          </div>

          {/* Stream ID */}
          {logEntry.stream_id && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Stream ID:</span>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                {logEntry.stream_id}
              </code>
            </div>
          )}

          {/* Payload Toggle */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowPayload(!showPayload)}
              className="flex items-center gap-2 p-0 h-auto font-medium text-slate-700 hover:text-slate-900"
            >
              {showPayload ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              View Complete Payload
            </Button>

            {showPayload && (
              <div className="mt-3">
                <ScrollArea className="h-64 w-full rounded-md border bg-slate-900 text-slate-100 p-4">
                  <pre className="text-xs">
                    <code>{JSON.stringify(logEntry.payload, null, 2)}</code>
                  </pre>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}