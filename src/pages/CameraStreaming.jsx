import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Camera } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, VideoOff, WifiOff, AlertCircle } from 'lucide-react';

export default function CameraStreamingPage() {
  const { cameraId } = useParams();
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load camera data
  useEffect(() => {
    const fetchCamera = async () => {
      try {
        setLoading(true);
        const cameraData = await Camera.get(cameraId);
        setCamera(cameraData);
      } catch (err) {
        console.error('Failed to fetch camera:', err);
        setError('Failed to load camera data. Please check if the camera exists.');
      } finally {
        setLoading(false);
      }
    };

    if (cameraId) {
      fetchCamera();
    } else {
      setError('No camera ID provided.');
      setLoading(false);
    }
  }, [cameraId]);

  // Handle device camera stream
  useEffect(() => {
    if (!camera || camera.camera_type !== 'device_camera') {
      return;
    }

    const videoElement = videoRef.current;
    
    const startStream = async () => {
      try {
        setStreamError(null);
        
        if (!camera.device_info?.deviceId) {
          setStreamError("Device ID not found. Please reconnect the camera.");
          return;
        }

        const constraints = {
          video: { 
            deviceId: { exact: camera.device_info.deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoElement) {
          videoElement.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to start device camera stream:', err);
        let errorMessage = 'Failed to access camera. ';
        
        if (err.name === 'NotFoundError') {
          errorMessage += 'Camera device not found or disconnected.';
        } else if (err.name === 'NotAllowedError') {
          errorMessage += 'Camera access denied. Please allow camera permissions.';
        } else if (err.name === 'NotReadableError') {
          errorMessage += 'Camera is being used by another application.';
        } else {
          errorMessage += err.message || 'Unknown error occurred.';
        }
        
        setStreamError(errorMessage);
      }
    };

    startStream();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject = null;
      }
    };
  }, [camera]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white">Loading camera...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Camera Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link to="/Cameras">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cameras
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isDeviceCamera = camera?.camera_type === 'device_camera';

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Link to="/Cameras">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{camera?.name || 'Camera'}</h1>
            <p className="text-sm text-slate-400">
              {typeof camera?.location === 'string' ? camera.location : camera?.location?.name || 'Unknown Location'}
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          {isDeviceCamera ? 'Device Camera' : 'Network Camera'}
        </div>
      </header>

      {/* Video Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {streamError ? (
          <div className="text-center max-w-md">
            <VideoOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Stream Error</h3>
            <p className="text-slate-400 mb-6">{streamError}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : isDeviceCamera ? (
          <div className="w-full h-full max-w-6xl max-h-[80vh] bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef}
              className="w-full h-full object-contain"
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => console.log('Video loaded successfully')}
              onError={(e) => {
                console.error('Video element error:', e);
                setStreamError('Video playback failed. Please try refreshing.');
              }}
            />
          </div>
        ) : camera?.hls_url ? (
          <div className="w-full h-full max-w-6xl max-h-[80vh] bg-black rounded-lg overflow-hidden">
            <video 
              className="w-full h-full object-contain"
              controls
              autoPlay
              muted
              src={camera.hls_url}
              onError={() => setStreamError('Failed to load video stream.')}
            />
          </div>
        ) : (
          <div className="text-center">
            <WifiOff className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Camera Offline</h3>
            <p className="text-slate-400">This camera is not currently streaming.</p>
          </div>
        )}
      </div>
    </div>
  );
}