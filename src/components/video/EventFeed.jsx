import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const getSeverityClass = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    default:
      return 'bg-blue-500';
  }
};

export default function EventFeed({ events, onEventClick }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-slate-500 bg-slate-50 rounded-b-lg">
        No recent events for this camera.
      </div>
    );
  }

  return (
    <ScrollArea className="h-48 bg-white rounded-b-lg p-3 border-t">
      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 text-xs cursor-pointer"
            onClick={() => onEventClick(event)}
          >
            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${getSeverityClass(event.severity)}`} />
            <div className="flex-1">
              <p className="font-medium text-slate-800">{event.event_type.replace(/_/g, ' ')}</p>
              <p className="text-slate-600 truncate">{event.description}</p>
              <p className="text-slate-400 mt-0.5" title={format(new Date(event.created_date), 'PPpp')}>
                {formatDistanceToNow(new Date(event.created_date), { addSuffix: true })}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">{event.severity}</Badge>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}