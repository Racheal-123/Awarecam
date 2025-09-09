import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Smartphone, Monitor, Globe, Wifi, Camera as CameraIcon } from 'lucide-react';
import VmsView from '@/components/vms/VmsView';
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

// Device Camera Stream Component for Modal
const DeviceCameraModalStream = ({ camera, className }) => {
  const [stream, setStream] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startDeviceStream = async () => {
      console.log('Starting device camera stream for modal:', camera.name);
      
      try {
        setIsInitializing(true);
        setError(null);

        // Clean up any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        const deviceId = camera.device_info?.device_id;
        console.log('Using device ID for modal:', deviceId);

        const constraints = {
          video: deviceId ? {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          } : {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
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
          
          const handleLoadedData = () => {
            console.log('Device camera modal stream loaded');
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
        console.error('Failed to start device camera modal stream:', err);
        if (mounted) {
          setError('Camera not available in modal');
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
      <div className={`${className} bg-slate-900 flex items-center justify-center rounded-lg`}>
        <div className="text-center text-white">
          <Smartphone className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isInitializing || !isLive) {
    return (
      <div className={`${className} bg-slate-900 flex items-center justify-center rounded-lg`}>
        <div className="text-center text-white">
          <Smartphone className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-sm">Connecting to camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative bg-black rounded-lg overflow-hidden`}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover"
        autoPlay 
        muted 
        playsInline
        style={{ backgroundColor: '#000' }}
      />
      {isLive && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            LIVE
          </div>
        </div>
      )}
    </div>
  );
};

export default function LiveVideoModal({ camera, isOpen, onClose }) {
  if (!camera) return null;

  const TypeIcon = getCameraTypeIcon(camera.camera_type);
  const isDeviceCamera = camera.camera_type === 'device_camera';

  // Same mock events as VmsViewPage for consistency
  const mockEvents = [
    { id: "e1", label: "Person detected", ts: 12, type: "person" },
    { id: "e2", label: "PPE violation", ts: 47, type: "ppe" },
    { id: "e3", label: "Intrusion zone", ts: 85, type: "intrusion" },
    { id: "e4", label: "Object left behind", ts: 118, type: "object" },
    { id: "e5", label: "Vehicle detected", ts: 156, type: "vehicle" },
    { id: "e6", label: "Motion detected", ts: 203, type: "motion" }
  ];
  
  // Use our HLS proxy function for secure playback in the browser for regular cameras
  const liveSrc = isDeviceCamera ? null : buildHlsProxyUrl(camera.id);
  const playbackSrc = liveSrc; // Until we wire real VOD/clip URLs, use same proxy

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl h-[95vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
             <TypeIcon className="w-6 h-6 text-blue-600"/>
             {camera.name}
          </DialogTitle>
          <DialogDescription>
            Live feed and event playback for {camera.locationName || camera.location}.
          </DialogDescription>
        </DialogHeader>
        
        {/* Fixed height scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-4">
            {/* Video Stream with increased height (20% more than before) */}
            <div className="w-full">
              {isDeviceCamera ? (
                <DeviceCameraModalStream 
                  camera={camera}
                  className="w-full h-[500px]"
                />
              ) : (
                <div className="w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden">
                  <VmsView
                    camera={camera}
                    liveSrc={liveSrc}
                    playbackSrc={playbackSrc}
                    events={mockEvents}
                  />
                </div>
              )}
            </div>

            {/* Camera Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CameraIcon className="w-4 h-4" />
                  Camera Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-slate-600 min-w-20">Name:</span>
                    <span className="ml-2 font-medium break-all">{camera.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-600 min-w-20">Type:</span>
                    <span className="ml-2 font-medium capitalize">{camera.camera_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-600 min-w-20">Location:</span>
                    <span className="ml-2 font-medium break-all">{camera.locationName || camera.location || 'Unknown Location'}</span>
                  </div>
                  {camera.resolution && (
                    <div className="flex">
                      <span className="text-slate-600 min-w-20">Resolution:</span>
                      <span className="ml-2 font-medium">{camera.resolution}</span>
                    </div>
                  )}
                  {camera.frame_rate && (
                    <div className="flex">
                      <span className="text-slate-600 min-w-20">Frame Rate:</span>
                      <span className="ml-2 font-medium">{camera.frame_rate} fps</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Health */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Status & Health
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-slate-600 min-w-24">Status:</span>
                    <span className={`ml-2 font-medium ${camera.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {camera.status}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-600 min-w-24">Stream Status:</span>
                    <span className="ml-2 font-medium">{camera.stream_status || 'Live'}</span>
                  </div>
                  {camera.health_score && (
                    <div className="flex">
                      <span className="text-slate-600 min-w-24">Health Score:</span>
                      <span className="ml-2 font-medium">{camera.health_score}%</span>
                    </div>
                  )}
                  {camera.last_heartbeat && (
                    <div className="flex flex-col">
                      <span className="text-slate-600">Last Seen:</span>
                      <span className="font-medium text-xs mt-1">{new Date(camera.last_heartbeat).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Device Information for Device Cameras */}
            {isDeviceCamera && camera.device_info && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Device Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {camera.device_info.device_type && (
                    <div className="flex">
                      <span className="text-slate-600 min-w-24">Device Type:</span>
                      <span className="ml-2 font-medium capitalize">{camera.device_info.device_type}</span>
                    </div>
                  )}
                  {camera.device_info.resolution && (
                    <div className="flex">
                      <span className="text-slate-600 min-w-24">Resolution:</span>
                      <span className="ml-2 font-medium">{camera.device_info.resolution}</span>
                    </div>
                  )}
                  {camera.device_info.frame_rate && (
                    <div className="flex">
                      <span className="text-slate-600 min-w-24">Frame Rate:</span>
                      <span className="ml-2 font-medium">{camera.device_info.frame_rate} fps</span>
                    </div>
                  )}
                  {camera.device_info.facing_mode && (
                    <div className="flex">
                      <span className="text-slate-600 min-w-24">Camera Type:</span>
                      <span className="ml-2 font-medium capitalize">{camera.device_info.facing_mode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Agents if present */}
            {camera.ai_agents && camera.ai_agents.length > 0 && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-slate-900 mb-3">AI Agents</h3>
                <div className="flex flex-wrap gap-2">
                  {camera.ai_agents.map((agent, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                      {agent.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}