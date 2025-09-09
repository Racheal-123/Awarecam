import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LivePlayer({ camera, onFullscreenChange }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(console.warn);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
      onFullscreenChange?.(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
      onFullscreenChange?.(false);
    }
  };

  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setShowControls(false);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={camera.rtsp_url}
        autoPlay
        muted={isMuted}
        loop
        playsInline
      />

      {/* Camera Status Overlay */}
      <div className="absolute top-3 left-3 z-20">
        <Badge variant="secondary" className="bg-black/60 text-white border-0">
          <div className={`w-2 h-2 rounded-full mr-2 ${camera.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
          {camera.name}
        </Badge>
      </div>

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Offline Overlay */}
      {camera.status !== 'active' && (
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div className="w-12 h-12 mx-auto mb-2 opacity-50">
              <Settings className="w-full h-full" />
            </div>
            <p className="text-sm">Camera Offline</p>
          </div>
        </div>
      )}
    </div>
  );
}