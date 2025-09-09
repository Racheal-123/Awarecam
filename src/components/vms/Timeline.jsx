
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

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

export default function Timeline({ currentTime, duration, events, mode, canSeek, onSeek }) {
  const timelineRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  // Removed: const [thumbnails, setThumbnails] = useState([]); // Thumbnails state and generation logic removed as per outline

  // Removed: useEffect for thumbnail generation as per outline
  // useEffect(() => {
  //   if (mode === 'playback' && duration > 0) {
  //     const thumbs = [];
  //     const interval = Math.max(10, duration / 20); // Every 10-20 seconds
  //     for (let i = 0; i <= duration; i += interval) {
  //       thumbs.push({
  //         time: i,
  //         src: `https://picsum.photos/seed/${Math.floor(i)}/160/90`
  //       });
  //     }
  //     setThumbnails(thumbs);
  //   } else {
  //     setThumbnails([]);
  //   }
  // }, [duration, mode]);

  const handleSeek = useCallback((e) => {
    if (!canSeek || !timelineRef.current || !onSeek || duration <= 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
  }, [canSeek, onSeek, duration]);

  const handleMouseDown = useCallback((e) => {
    if (!canSeek || !timelineRef.current) return;
    
    setIsDragging(true);
    handleSeek(e);
  }, [canSeek, handleSeek]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !canSeek) return;
    handleSeek(e);
  }, [isDragging, canSeek, handleSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="p-4 space-y-3">
      {/* Time display */}
      <div className="flex justify-between items-center text-sm text-slate-600">
        <span>{formatTime(currentTime)}</span>
        <Badge variant={mode === 'live' ? 'destructive' : 'secondary'} className="text-xs">
          {mode === 'live' ? 'LIVE' : 'PLAYBACK'}
        </Badge>
        <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
      </div>

      {/* Timeline container */}
      <div className="relative pt-8"> {/* Added pt-8 as per outline */}
        {/* Thumbnails section removed as per outline */}

        {/* Timeline track */}
        <div
          ref={timelineRef}
          className={`relative h-2 bg-slate-200 rounded-full overflow-hidden ${
            canSeek && mode === 'playback' ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Progress bar */}
          <div
            className={`h-full transition-all duration-100 ${
              mode === 'live' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Current time indicator */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-100 ${
              mode === 'live' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ left: `calc(${progressPercentage}% - 8px)` }}
          />

          {/* Event markers */}
          {events.map((event) => {
            if (duration <= 0) return null;
            const position = (event.ts / duration) * 100;
            
            return (
              <div
                key={event.id}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white cursor-pointer shadow-sm hover:scale-125 transition-transform group"
                style={{
                  left: `calc(${position}% - 6px)`,
                  backgroundColor: EVENT_COLORS[event.type] || '#6b7280'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSeek) onSeek(event.ts);
                }}
                title={`${event.label} at ${formatTime(event.ts)}`}
              >
                {/* Event tooltip with thumbnail on hover - Updated as per outline */}
                <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 bg-black/90 text-white p-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-40">
                  <img 
                    src={`https://picsum.photos/seed/${event.id}/160/90`} 
                    alt={event.label}
                    className="rounded-md w-full h-auto aspect-video object-cover"
                  />
                  <div className="font-medium text-xs mt-1 px-1">{event.label}</div>
                  <div className="text-slate-300 text-xs px-1">{formatTime(event.ts)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live mode indicator */}
      {mode === 'live' && (
        <div className="text-center text-sm text-slate-500">
          Timeline interaction is disabled in Live mode
        </div>
      )}
    </div>
  );
}
