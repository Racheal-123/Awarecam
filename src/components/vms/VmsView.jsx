
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw, Video } from 'lucide-react';

import VideoPlayer from '@/components/vms/VideoPlayer';
import EventsPane from '@/components/vms/EventsPane';
import Timeline from '@/components/vms/Timeline';
import ControlsBar from '@/components/vms/ControlsBar';

export default function VmsView({ camera, liveSrc, playbackSrc, events = [] }) {
  const [mode, setMode] = useState('live'); // 'live' or 'playback'
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoPlayerRef = useRef();

  const switchToPlayback = useCallback((time) => {
    if (mode !== 'playback') {
      setMode('playback');
      toast.info("Switched to Playback Mode.");
    }
    setTimeout(() => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.seekTo(time);
      }
    }, 100);
  }, [mode]);
  
  const switchToLive = useCallback(() => {
    setMode('live');
    setPlaybackRate(1);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.reset();
    }
    toast.success("Switched to Live Mode.");
  }, []);

  const handleEventSelect = useCallback((event) => {
    switchToPlayback(event.ts);
  }, [switchToPlayback]);

  const handleTimelineSeek = useCallback((time) => {
    switchToPlayback(time);
  }, [switchToPlayback]);

  const handlePlayPause = useCallback(() => {
    if (mode === 'live') {
      // This should not be callable as button is hidden, but as a safeguard
      toast.info('Playback controls are disabled in Live mode.');
      return;
    }
    if (videoPlayerRef.current) {
      if (isPlaying) videoPlayerRef.current.pause();
      else videoPlayerRef.current.play();
    }
  }, [isPlaying, mode]);

  const handleScreenshot = useCallback(() => {
    if (videoPlayerRef.current) videoPlayerRef.current.takeScreenshot();
  }, []);

  const handleClipToggle = useCallback(() => {
    if (videoPlayerRef.current) {
      if (isRecording) {
        videoPlayerRef.current.stopRecording();
        setIsRecording(false);
      } else {
        videoPlayerRef.current.startRecording();
        setIsRecording(true);
      }
    }
  }, [isRecording]);

  const handleVolumeChange = useCallback((volume) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setVolume(volume);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoPlayerRef.current) {
      return videoPlayerRef.current.toggleMute();
    }
  }, []);

  const handleSpeedChange = useCallback((speed) => {
    if (videoPlayerRef.current) {
      setPlaybackRate(speed);
      videoPlayerRef.current.setPlaybackRate(speed);
    }
  }, []); // mode dependency removed

  const videoSrc = mode === 'live' ? liveSrc : playbackSrc;

  // Get current volume and mute state
  const volume = videoPlayerRef.current?.getVolume?.() || 1;
  const isMuted = videoPlayerRef.current?.isMuted?.() || false;

  return (
    <div className="h-full flex flex-col bg-white text-slate-900">
      <div className="flex-1 grid grid-cols-[1fr_320px] grid-rows-[1fr_auto] overflow-hidden">
        <div className="col-start-1 row-start-1 p-4 flex items-center justify-center bg-slate-900 relative">
          <VideoPlayer
            ref={videoPlayerRef}
            src={videoSrc}
            mode={mode}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            onPlayStateChange={setIsPlaying}
          />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <ControlsBar
              isPlaying={isPlaying}
              isRecording={isRecording}
              onPlayPause={handlePlayPause}
              onScreenshot={handleScreenshot}
              onClipToggle={handleClipToggle}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
              onSpeedChange={handleSpeedChange}
              mode={mode}
            />
          </div>
          
          {mode === 'playback' && (
            <Button onClick={switchToLive} className="absolute top-6 right-6 z-20 bg-red-600 hover:bg-red-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Go Live
            </Button>
          )}
        </div>

        <div className="col-start-2 row-span-2 bg-slate-50 border-l border-slate-200 overflow-hidden">
          <EventsPane events={events} onSelect={handleEventSelect} />
        </div>

        <div className="col-start-1 row-start-2 bg-white border-t border-slate-200">
          <Timeline
            currentTime={currentTime}
            duration={duration}
            events={events}
            mode={mode}
            canSeek={true}
            onSeek={handleTimelineSeek}
          />
        </div>
      </div>
    </div>
  );
}
