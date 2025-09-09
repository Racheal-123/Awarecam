import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const EventTimeline = ({ 
  events = [], 
  duration = 300, 
  currentTime = 0, 
  onEventClick, 
  onTimeChange, 
  selectedEventId,
  mode = 'live'
}) => {
  const eventMarkers = useMemo(() => {
    if (duration === 0) return [];
    
    return events.map((event, index) => {
      if (!event || typeof event.video_timestamp !== 'number') {
        return null;
      }
      const eventPosition = Math.min(98, Math.max(2, (event.video_timestamp / duration) * 100));
      return { ...event, position: eventPosition, key: `${event.id}-${index}` };
    }).filter(Boolean);
  }, [events, duration]);

  const handleTimelineClick = (e) => {
    if (!onTimeChange || mode === 'live') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    onTimeChange(newTime);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const severityColors = {
    critical: 'bg-red-500 border-red-600',
    high: 'bg-orange-500 border-orange-600',
    medium: 'bg-yellow-500 border-yellow-600',
    low: 'bg-blue-500 border-blue-600'
  };

  return (
    <div className="w-full h-8 relative">
      <div 
        className={`w-full h-2 bg-slate-700 rounded-full relative top-3 ${
          mode === 'dvr' && onTimeChange ? 'cursor-pointer' : ''
        }`}
        onClick={handleTimelineClick}
      >
        {mode === 'live' ? (
          <div className="absolute right-0 top-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        ) : (
          <div 
            className="absolute top-0 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 z-10"
            style={{ left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
          />
        )}
      </div>

      <div className="absolute inset-0">
        {eventMarkers.map((event) => {
          const isSelected = selectedEventId === event.id;
          const severityColor = severityColors[event.severity] || severityColors.low;

          return (
            <motion.div
              key={event.key}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
              style={{ left: `${event.position}%` }}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: isSelected ? 1.3 : 1, opacity: 1 }}
              whileHover={{ scale: 1.4 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className={`w-3 h-3 rounded-full cursor-pointer border-2 transition-all shadow-md ${
                  isSelected
                    ? 'bg-white border-blue-500 ring-2 ring-blue-300'
                    : `${severityColor} hover:scale-110`
                }`}
                onClick={(e) => handleEventClick(event, e)}
                title={`${event.description} (${Math.floor(event.video_timestamp / 60)}:${String(Math.round(event.video_timestamp) % 60).padStart(2, '0')})`}
              />
            </motion.div>
          );
        })}
      </div>
      
      <div className="absolute top-6 left-0 right-0 flex justify-between text-xs text-slate-400">
        <span>0:00</span>
        <span>{Math.floor(duration / 60)}:{String(Math.round(duration) % 60).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default EventTimeline;