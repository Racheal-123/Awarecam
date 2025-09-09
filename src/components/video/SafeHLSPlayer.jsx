import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle, Play, Volume2, VolumeX } from 'lucide-react';

export default function SafeHLSPlayer({ 
  src, 
  autoPlay = false, 
  controls = true, 
  muted = false, 
  className = '', 
  onError,
  ...props 
}) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hls, setHls] = useState(null);

  useEffect(() => {
    let hlsInstance = null;

    const setupVideo = async () => {
      if (!videoRef.current || !src) {
        setIsLoading(false);
        return;
      }

      console.log('SafeHLSPlayer: Setting up HLS player with source:', src);
      setIsLoading(true);
      setError(null);

      try {
        // Validate URL format
        try {
          new URL(src);
        } catch (urlError) {
          const errorMsg = 'Invalid stream URL format';
          console.error('SafeHLSPlayer: URL validation failed:', errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          if (onError) onError(errorMsg);
          return;
        }

        // Check if HLS is natively supported (Safari, newer iOS)
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('SafeHLSPlayer: Using native HLS support for:', src);
          videoRef.current.src = src;
          
          const handleLoadedMetadata = () => {
            console.log('SafeHLSPlayer: Native HLS metadata loaded');
            setIsLoading(false);
            if (autoPlay) {
              videoRef.current?.play().catch(playError => {
                console.warn('SafeHLSPlayer: Autoplay failed:', playError);
              });
            }
          };
          
          const handleError = (e) => {
            console.error('SafeHLSPlayer: Native HLS error:', e);
            const errorMsg = 'Failed to load stream - stream may be offline or inaccessible';
            setError(errorMsg);
            setIsLoading(false);
            if (onError) onError(errorMsg);
          };
          
          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
          videoRef.current.addEventListener('error', handleError);
          videoRef.current.load();
          
          return () => {
            if (videoRef.current) {
              videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
              videoRef.current.removeEventListener('error', handleError);
            }
          };
        } else {
          // Use HLS.js for browsers without native support
          try {
            // Load HLS.js from CDN if not available
            if (typeof window.Hls === 'undefined') {
              console.log('SafeHLSPlayer: Loading HLS.js from CDN...');
              await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js';
                script.onload = () => {
                  console.log('SafeHLSPlayer: HLS.js loaded successfully');
                  resolve();
                };
                script.onerror = (err) => {
                  console.error('SafeHLSPlayer: Failed to load HLS.js:', err);
                  reject(new Error('Failed to load HLS.js library'));
                };
                document.head.appendChild(script);
              });
            }

            const Hls = window.Hls;
            
            if (Hls && Hls.isSupported()) {
              console.log('SafeHLSPlayer: Using HLS.js for:', src);
              
              hlsInstance = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 30,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                fragLoadingTimeOut: 20000,
                manifestLoadingTimeOut: 10000,
                levelLoadingTimeOut: 10000
              });

              hlsInstance.loadSource(src);
              hlsInstance.attachMedia(videoRef.current);

              hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('SafeHLSPlayer: HLS.js manifest parsed successfully');
                setIsLoading(false);
                if (autoPlay) {
                  videoRef.current?.play().catch(playError => {
                    console.warn('SafeHLSPlayer: Autoplay failed:', playError);
                  });
                }
              });

              hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                console.error('SafeHLSPlayer: HLS.js error event:', event);
                console.error('SafeHLSPlayer: HLS.js error data:', JSON.stringify(data, null, 2));
                
                let errorMsg = 'Stream playback error';
                
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                    errorMsg = 'Failed to load stream playlist. The stream may be offline or inaccessible.';
                  } else if (data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
                    errorMsg = 'Invalid stream format. The stream may be corrupted.';
                  } else if (data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
                    errorMsg = 'Failed to load stream segments. Connection may be unstable.';
                  } else {
                    errorMsg = `Network error: ${data.details}`;
                  }
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                  errorMsg = `Media playback error: ${data.details}`;
                } else {
                  errorMsg = `Stream error: ${data.details || 'Unknown error'}`;
                }

                // Add response details if available
                if (data.response && data.response.code) {
                  errorMsg += ` (HTTP ${data.response.code})`;
                }

                if (data.fatal) {
                  console.error('SafeHLSPlayer: Fatal HLS error, destroying player');
                  setError(errorMsg);
                  setIsLoading(false);
                  if (onError) onError(errorMsg);
                  
                  // Clean up on fatal error
                  if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                  }
                  return;
                }

                // Non-fatal errors - attempt recovery
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  console.log('SafeHLSPlayer: Attempting to recover from network error');
                  hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                  console.log('SafeHLSPlayer: Attempting to recover from media error');
                  hlsInstance.recoverMediaError();
                }
              });

              setHls(hlsInstance);

            } else {
              const errorMsg = 'HLS playback is not supported in this browser';
              console.error('SafeHLSPlayer:', errorMsg);
              setError(errorMsg);
              setIsLoading(false);
              if (onError) onError(errorMsg);
            }

          } catch (hlsError) {
            console.error('SafeHLSPlayer: Failed to initialize HLS.js:', hlsError);
            const errorMsg = 'Failed to initialize video player';
            setError(errorMsg);
            setIsLoading(false);
            if (onError) onError(errorMsg);
          }
        }

      } catch (setupError) {
        console.error('SafeHLSPlayer: Video setup error:', setupError);
        const errorMsg = 'Failed to set up video stream';
        setError(errorMsg);
        setIsLoading(false);
        if (onError) onError(errorMsg);
      }
    };

    setupVideo();

    return () => {
      if (hlsInstance) {
        try {
          hlsInstance.destroy();
        } catch (destroyError) {
          console.warn('SafeHLSPlayer: Error destroying HLS instance:', destroyError);
        }
      }
    };
  }, [src, autoPlay, onError]);

  const handleVideoError = (e) => {
    const error = e.target.error;
    let errorMsg = 'Video playback failed';
    
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMsg = 'Video playback was aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMsg = 'Network error occurred during video playback';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMsg = 'Video decoding error';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMsg = 'Video format not supported';
          break;
        default:
          errorMsg = `Video error: ${error.message || 'Unknown error'}`;
      }
    }
    
    console.error('SafeHLSPlayer: HTML5 video error:', error);
    setError(errorMsg);
    setIsLoading(false);
    if (onError) onError(errorMsg);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center p-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
          <p className="text-sm font-medium mb-1">Stream Error</p>
          <p className="text-xs text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm">Loading stream...</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      muted={muted}
      onError={handleVideoError}
      playsInline
      {...props}
    />
  );
}