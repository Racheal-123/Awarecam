import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const severityConfig = {
  critical: { color: 'bg-red-500', size: 'w-4 h-4' },
  high: { color: 'bg-orange-500', size: 'w-3 h-3' },
  medium: { color: 'bg-yellow-500', size: 'w-2.5 h-2.5' },
  low: { color: 'bg-blue-500', size: 'w-2 h-2' },
};

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if(h > 0) return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    return [m, s].map(v => v.toString().padStart(2, '0')).join(':');
}


export default function EventTimeline({ events = [], onEventClick, activeEventId, duration, currentTime, className = '' }) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [events]);

  const timeRange = useMemo(() => {
    if (!duration || duration === Infinity) {
        if (sortedEvents.length < 2) {
          const now = Date.now();
          return { start: now - 3600000, end: now }; // Default to last hour
        }
        const start = new Date(sortedEvents[0].created_date).getTime();
        const end = new Date(sortedEvents[sortedEvents.length - 1].created_date).getTime();
        const padding = (end - start) * 0.05 || 60000;
        return { start: start - padding, end: end + padding };
    }
    return { start: 0, end: duration };
  }, [sortedEvents, duration]);

  const getEventPosition = (event) => {
    const time = (duration && duration !== Infinity) 
      ? (new Date(event.created_date).getTime() % duration) // Simple mock for clip time
      : new Date(event.created_date).getTime();
    
    const { start, end } = timeRange;
    if (end === start) return 50;
    return ((time - start) / (end - start)) * 100;
  };
  
  const playheadPosition = duration > 0 && duration !== Infinity ? (currentTime / duration) * 100 : 100;

  if (sortedEvents.length === 0 && !duration) {
    return (
      <div className={`bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-slate-500 dark:text-slate-400">No recent events on timeline</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-100 dark:bg-slate-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Timeline</h3>
        <Badge variant="secondary">{formatTime(currentTime)} / {formatTime(duration)}</Badge>
      </div>
      
      <TooltipProvider>
        <div className="relative h-8" role="slider">
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          
          {/* Playhead */}
          <div className="absolute top-1/2 h-4 w-0.5 bg-red-500 -translate-y-1/2" style={{ left: `${playheadPosition}%` }} />

          {sortedEvents.map((event) => {
            const position = getEventPosition(event);
            const config = severityConfig[event.severity] || severityConfig.low;
            const isActive = event.id === activeEventId;
            
            return (
              <Tooltip key={event.id} delayDuration={100}>
                <TooltipTrigger asChild>
                  <motion.button
                    className={`absolute top-1/2 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 ${config.color} ${config.size} ${isActive ? 'ring-2 ring-blue-500' : 'hover:scale-125'}`}
                    style={{ left: `${position}%` }}
                    onClick={() => onEventClick?.(event)}
                    whileHover={{ scale: 1.5 }}
                    whileTap={{ scale: 1.2 }}
                    aria-label={`Event: ${event.event_type}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(event.created_date), 'HH:mm:ss')}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
        <span>{formatTime(timeRange.start)}</span>
        <span>{formatTime(timeRange.end)}</span>
      </div>
    </div>
  );
}