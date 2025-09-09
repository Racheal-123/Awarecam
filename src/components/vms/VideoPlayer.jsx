import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { toast } from 'sonner';

const VideoPlayer = forwardRef(({ src, mode, onTimeUpdate, onDurationChange, onPlayStateChange }, ref) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current && mode === 'playback') {
        videoRef.current.play().catch(console.error);
      }
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    seekTo: (time) => {
      if (videoRef.current && mode === 'playback') {
        videoRef.current.currentTime = time;
      }
    },
    setPlaybackRate: (rate) => {
      if (videoRef.current && mode === 'playback') {
        videoRef.current.playbackRate = rate;
      }
    },
    takeScreenshot: () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `screenshot-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Screenshot saved!');
        }
      }, 'image/png');
    },
    startRecording: () => {
      if (!videoRef.current) return;
      
      try {
        const stream = videoRef.current.captureStream();
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        
        mediaRecorderRef.current.start();
        toast.success('Recording started');
      } catch (error) {
        toast.error('Recording not supported');
        console.error('Recording error:', error);
      }
    },
    stopRecording: () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `clip-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Clip saved!');
        };
      }
    },
    reset: () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    },
    setVolume: (vol) => {
      setVolume(vol);
      if (videoRef.current) {
        videoRef.current.volume = vol;
      }
    },
    toggleMute: () => {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
      return newMuted;
    },
    getVolume: () => volume,
    isMuted: () => isMuted
  }));

  // Setup video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = src.includes('.m3u8');
    
    if (isHls && mode === 'live') {
      // Load HLS.js dynamically
      if (typeof window !== 'undefined' && !window.Hls) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = () => setupHls();
        document.head.appendChild(script);
      } else {
        setupHls();
      }
      
      function setupHls() {
        if (window.Hls && window.Hls.isSupported()) {
          hlsRef.current = new window.Hls();
          hlsRef.current.loadSource(src);
          hlsRef.current.attachMedia(video);
          
          hlsRef.current.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(console.error);
          });
          
          hlsRef.current.on(window.Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('HLS error:', data);
              toast.error('Live stream error');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = src;
          video.play().catch(console.error);
        }
      }
    } else {
      // Direct video source
      video.src = src;
      if (mode === 'live') {
        video.play().catch(console.error);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, mode]);

  // Event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate) onTimeUpdate(video.currentTime);
    };

    const handleDurationChange = () => {
      if (onDurationChange) onDurationChange(video.duration);
    };

    const handlePlay = () => {
      if (onPlayStateChange) onPlayStateChange(true);
    };

    const handlePause = () => {
      if (onPlayStateChange) onPlayStateChange(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Set initial volume and mute state
    video.volume = volume;
    video.muted = isMuted;

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onDurationChange, onPlayStateChange, volume, isMuted]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="max-w-full max-h-full"
        controls={false}
        playsInline
        crossOrigin="anonymous"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {!src && (
        <div className="text-white text-center">
          <p>No video source available</p>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;