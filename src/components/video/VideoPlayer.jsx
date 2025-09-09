import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function VideoPlayer({ camera, events, onEventSelect, activeEvent, playerCurrentTime, setPlayerCurrentTime }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const videoSrc = camera?.video_url || camera?.rtsp_url || '';
    setIsLoading(true);
    setError(null);

    videoElement.src = videoSrc;
    videoElement.load();
    
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Autoplay started
        }).catch(e => {
            console.warn("Autoplay was prevented:", e);
            videoElement.muted = true;
            videoElement.play().catch(e2 => console.error("Muted autoplay also failed:", e2));
        });
    }

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(videoElement.duration);
    };

    const handleError = () => {
      setError('Error loading video. The format may not be supported.');
      setIsLoading(false);
    };
    
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('error', handleError);
    };
  }, [camera?.video_url, camera?.rtsp_url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setPlayerCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [setPlayerCurrentTime]);

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - playerCurrentTime) > 1) {
      videoRef.current.currentTime = playerCurrentTime;
    }
  }, [playerCurrentTime]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-lg mb-2">Video Unavailable</p>
          <p className="text-sm opacity-75">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-white text-sm">{formatTime(playerCurrentTime)}</span>
            <div className="flex-1 h-1 bg-white/30 rounded-full relative cursor-pointer"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const percent = (e.clientX - rect.left) / rect.width;
                   const newTime = percent * duration;
                   if (videoRef.current) {
                     videoRef.current.currentTime = newTime;
                     setPlayerCurrentTime(newTime);
                   }
                 }}>
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: duration ? `${(playerCurrentTime / duration) * 100}%` : '0%' }}
              />
              {events && events.map((event) => {
                const eventTime = event.video_timestamp || 0;
                const position = duration ? (eventTime / duration) * 100 : 0;
                return (
                  <button
                    key={event.id}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
                    style={{ left: `${position}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayerCurrentTime(eventTime);
                      onEventSelect?.(event);
                    }}
                    title={`${event.event_type} - ${format(new Date(event.created_date), 'HH:mm:ss')}`}
                  />
                );
              })}
            </div>
            <span className="text-white text-sm">{formatTime(duration)}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {activeEvent && (
        <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-red-500">{activeEvent.severity}</Badge>
            <span className="text-sm font-medium">{activeEvent.event_type.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-sm opacity-90">{activeEvent.description}</p>
          <p className="text-xs opacity-75 mt-1">
            {format(new Date(activeEvent.created_date), 'MMM d, yyyy HH:mm:ss')}
          </p>
        </div>
      )}
    </div>
  );
}