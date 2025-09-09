import React, { useState } from 'react';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';
import EventFeed from '@/components/video/EventFeed';

export default function VideoPlayerWithEvents({
  src,
  mode = 'playback',
  markers = [],
  events = [],
  cameraId,
  cameraName,
  eventId,
  onSnapshotTaken,
  onClipSaved,
  onEventSelected
}) {
  const [videoPlayer, setVideoPlayer] = useState(null);

  const handleEventClick = (event, videoTimestamp) => {
    // Seek video to the event timestamp
    if (videoPlayer && videoPlayer.playerRef?.current) {
      videoPlayer.playerRef.current.currentTime(videoTimestamp);
      videoPlayer.playerRef.current.play();
    }
    
    onEventSelected?.(event);
  };

  return (
    <div className="w-full">
      {/* Video Player */}
      <div className="aspect-video">
        <EnhancedVideoPlayer
          ref={setVideoPlayer}
          src={src}
          mode={mode}
          markers={markers}
          cameraId={cameraId}
          cameraName={cameraName}
          eventId={eventId}
          onSnapshotTaken={onSnapshotTaken}
          onClipSaved={onClipSaved}
        />
      </div>
      
      {/* Event Feed - Only show in playback mode */}
      {mode === 'playback' && (
        <EventFeed
          events={events}
          onEventClick={handleEventClick}
          currentVideoTime={videoPlayer?.playerRef?.current?.currentTime?.() || 0}
          videoDuration={videoPlayer?.playerRef?.current?.duration?.() || 0}
          isVisible={true}
        />
      )}
    </div>
  );
}