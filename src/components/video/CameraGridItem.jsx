import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Maximize2, 
  Settings,
  X,
  Smartphone,
  Monitor,
  Globe,
  Wifi,
  Camera as CameraIcon,
  Play,
  Pause
} from 'lucide-react';
import { motion } from 'framer-motion';
import SafeHLSPlayer from '@/components/video/SafeHLSPlayer';
import { buildHlsProxyUrl } from '@/components/utils/functionsBase';

const getCameraTypeIcon = (cameraType) => {
  switch (cameraType) {
    case 'device_camera': return Smartphone;
    case 'rtsp':
    case 'ip': return Monitor;
    case 'public_feed': return Globe;
    case 'wifi': return Wifi;
    default: return CameraIcon;
  }
};

// Device Camera Stream Component
const DeviceCameraStream = ({ camera, className }) => {
  const [stream, setStream] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startDeviceStream = async () => {
      console.log('Starting device camera stream for grid:', camera.name);
      
      try {
        setIsInitializing(true);
        setError(null);

        // Clean up any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        const deviceId = camera.device_info?.device_id;
        console.log('Using device ID:', deviceId);

        const constraints = {
          video: deviceId ? {
            deviceId: { exact: deviceId },
            width: { ideal: 640 },
            height: { ideal: 360 },
            frameRate: { ideal: 15 } // Lower framerate for grid view
          } : {
            width: { ideal: 640 },
            height: { ideal: 360 },
            frameRate: { ideal: 15 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        setIsLive(true);
        setError(null);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Wait for video to load
          const handleLoadedData = () => {
            console.log('Device camera stream loaded in grid');
            if (mounted) {
              setIsInitializing(false);
            }
          };

          videoRef.current.addEventListener('loadeddata', handleLoadedData, { once: true });
          
          // Fallback timeout
          setTimeout(() => {
            if (mounted) {
              setIsInitializing(false);
            }
          }, 3000);
        } else {
          setIsInitializing(false);
        }

      } catch (err) {
        console.error('Failed to start device camera stream:', err);
        if (mounted) {
          setError('Camera not available');
          setIsLive(false);
          setIsInitializing(false);
        }
      }
    };

    startDeviceStream();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [camera.device_info?.device_id, camera.id, camera.name]);

  if (error) {
    return (
      <div className={`${className} bg-slate-900 flex items-center justify-center`}>
        <div className="text-center text-white">
          <Smartphone className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (isInitializing || !isLive) {
    return (
      <div className={`${className} bg-slate-900 flex items-center justify-center`}>
        <div className="text-center text-white">
          <Smartphone className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-xs">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative bg-black`}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover"
        autoPlay 
        muted 
        playsInline
        style={{ backgroundColor: '#000' }}
      />
      {isLive && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            LIVE
          </div>
        </div>
      )}
    </div>
  );
};

export default function CameraGridItem({ 
  camera, 
  organization,
  onRemove, 
  onViewDetails, 
  onEdit, 
  onFullscreen 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const TypeIcon = getCameraTypeIcon(camera.camera_type);

  const getVideoSource = () => {
    if (camera.camera_type === 'device_camera') {
      return null; // Device cameras use special component
    }

    if (camera.stream_status === 'live' && camera.hls_url) {
      return buildHlsProxyUrl(camera.id);
    }

    if (camera.camera_type === 'public_feed' && camera.rtsp_url?.includes('.m3u8')) {
      return camera.rtsp_url;
    }

    return null;
  };

  const videoSrc = getVideoSource();
  const isDeviceCamera = camera.camera_type === 'device_camera';

  const getStatusBadge = () => {
    if (camera.stream_status === 'live' || (isDeviceCamera && camera.status === 'active')) {
      return <Badge className="bg-green-500 text-white">Live</Badge>;
    }
    if (camera.status === 'active') {
      return <Badge className="bg-blue-500 text-white">Active</Badge>;
    }
    return <Badge variant="secondary">Offline</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-200">
        <CardContent className="p-0">
          {/* Video Container */}
          <div className="aspect-video bg-slate-900 relative overflow-hidden">
            {isDeviceCamera ? (
              <DeviceCameraStream 
                camera={camera} 
                className="w-full h-full"
              />
            ) : videoSrc ? (
              <>
                <SafeHLSPlayer
                  src={videoSrc}
                  autoPlay={true}
                  muted={true}
                  controls={false}
                  className="w-full h-full object-cover"
                />
                {camera.stream_status === 'live' && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                      LIVE
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <TypeIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs">No Live Stream</p>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-2 right-2 z-10">
              {getStatusBadge()}
            </div>

            {/* Remove Button */}
            {isHovered && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(camera.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}

            {/* Hover Controls */}
            {isHovered && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(camera);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFullscreen(camera);
                    }}
                  >
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Fullscreen
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Camera Info */}
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 truncate flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  {camera.name}
                </h3>
                <p className="text-sm text-slate-500 truncate">
                  {camera.location || 'Unknown Location'}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(camera)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(camera)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Camera
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
