import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const EVENT_COLORS = {
  person: '#3b82f6',
  ppe: '#f59e0b', 
  intrusion: '#ef4444',
  object: '#8b5cf6',
  vehicle: '#10b981',
  motion: '#6b7280'
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function EventsPane({ events, onSelect }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Events</h3>
        <p className="text-sm text-slate-500">{events.length} detected</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => onSelect(event)}
              className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: EVENT_COLORS[event.type] || '#6b7280' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {event.label}
                </p>
                <p className="text-xs text-slate-500">
                  {formatTime(event.ts)}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-slate-200 text-slate-700 text-xs"
              >
                {event.type}
              </Badge>
            </div>
          ))}
          
          {events.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <p>No events detected</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}