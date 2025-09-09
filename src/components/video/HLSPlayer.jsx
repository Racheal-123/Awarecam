import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

const HLSPlayer = ({ src, poster, cameraName }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!src || !videoRef.current) {
      setHasError(true);
      setErrorMessage('No valid stream URL provided.');
      setIsLoading(false);
      return;
    }

    let hls = null;
    const video = videoRef.current;
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    if (poster) video.poster = poster;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e) => {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(`Failed to load stream: ${e.target?.error?.message || 'Connection failed'}`);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    const isHls = /\.m3u8(\?.*)?$/i.test(src);
    
    if (isHls) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.load();
      } else {
        import('https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js')
          .then(() => {
            if (window.Hls && window.Hls.isSupported()) {
              hls = new window.Hls();
              hls.loadSource(src);
              hls.attachMedia(video);
              hls.on(window.Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  setHasError(true);
                  setErrorMessage(`HLS Error: ${data.type} - ${data.details}`);
                }
              });
            } else {
              setHasError(true);
              setErrorMessage('HLS not supported in this browser');
            }
          })
          .catch(() => {
            setHasError(true);
            setErrorMessage('Failed to load HLS library');
          });
      }
    } else {
      video.src = src;
      video.load();
      video.play().catch((e) => {
        console.warn('Autoplay failed:', e);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      if (video.src) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [src, poster]);

  if (!src) {
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Camera className="w-16 h-16 mx-auto mb-4" />
          <p>No stream URL configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        loop
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Connecting to stream...</p>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <Camera className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">Stream Error</p>
            <p className="text-sm opacity-90 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}
      
      {!isLoading && !hasError && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          ● LIVE
        </div>
      )}
    </div>
  );
};

export default HLSPlayer;