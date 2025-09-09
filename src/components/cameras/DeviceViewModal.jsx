import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Smartphone,
  Trash2, 
  Edit, 
  Video,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Monitor,
  ChevronDown,
  ChevronRight,
  Code,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-red-100 text-red-800';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800';
    case 'error': return 'bg-red-100 text-red-800';
    case 'pairing': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DeviceViewModal({ camera, isOpen, onClose, onEdit, onDelete }) {
  const [technicalDetailsOpen, setTechnicalDetailsOpen] = useState(false);

  if (!camera) return null;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Smartphone className="w-6 h-6 text-blue-600" />
            {camera.name}
            <Badge className={getStatusColor(camera.status)}>
              {camera.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-6 p-6">
            {/* Row 1: Video Preview - Stretched to 95% width */}
            <div className="w-[95%] mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DeviceCameraModalStream 
                    camera={camera}
                    className="w-full aspect-video"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Row 2: Camera Information - Full width, side by side cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Camera Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600">Name</p>
                    <p className="font-medium">{camera.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-600">Type</p>
                    <p className="font-medium">Device Camera</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Location</p>
                    <p className="font-medium">{camera.location || 'Unknown Location'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Resolution</p>
                    <p className="font-medium">{camera.resolution || '1280x720'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Frame Rate</p>
                    <p className="font-medium">{camera.frame_rate || 30} fps</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status & Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Status & Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600">Status</p>
                    <div className="flex items-center gap-2">
                      {camera.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium capitalize">{camera.status}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Stream Status</p>
                    <p className="font-medium capitalize">{camera.stream_status || 'Live'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Health Score</p>
                    <p className="font-medium">{camera.health_score || 95}%</p>
                  </div>

                  {camera.last_heartbeat && (
                    <div>
                      <p className="text-xs text-slate-600">Last Seen</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(camera.last_heartbeat), 'PPp')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Device Information */}
            {camera.device_info && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Device Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {camera.device_info.device_type && (
                      <div>
                        <p className="text-xs text-slate-600">Device Type</p>
                        <p className="font-medium capitalize">{camera.device_info.device_type}</p>
                      </div>
                    )}
                    {camera.device_info.resolution && (
                      <div>
                        <p className="text-xs text-slate-600">Resolution</p>
                        <p className="font-medium">{camera.device_info.resolution}</p>
                      </div>
                    )}
                    {camera.device_info.frame_rate && (
                      <div>
                        <p className="text-xs text-slate-600">Frame Rate</p>
                        <p className="font-medium">{camera.device_info.frame_rate} fps</p>
                      </div>
                    )}
                    {camera.device_info.facing_mode && (
                      <div>
                        <p className="text-xs text-slate-600">Camera Type</p>
                        <p className="font-medium capitalize">{camera.device_info.facing_mode}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Details Section */}
            <Card className="w-full">
              <Collapsible open={technicalDetailsOpen} onOpenChange={setTechnicalDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Technical Details
                      {technicalDetailsOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Device ID */}
                      {camera.device_info?.device_id && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-600">Device ID</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(camera.device_info.device_id, 'Device ID')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-xs text-slate-800 break-all">{camera.device_info.device_id}</p>
                        </div>
                      )}

                      {/* Device Signature */}
                      {camera.device_info?.device_signature && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-600">Device Signature</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(camera.device_info.device_signature, 'Device Signature')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-xs text-slate-800 break-all">{camera.device_info.device_signature}</p>
                        </div>
                      )}

                      {/* Internal RTSP URL */}
                      {camera.rtsp_url && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-600">Internal RTSP URL</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(camera.rtsp_url, 'Internal RTSP URL')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-xs text-slate-800 break-all">{camera.rtsp_url}</p>
                        </div>
                      )}

                      {/* User Agent */}
                      {camera.device_info?.user_agent && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-600">User Agent</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(camera.device_info.user_agent, 'User Agent')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-xs text-slate-800 break-all">{camera.device_info.user_agent}</p>
                        </div>
                      )}

                      {/* Last Stream Error */}
                      {camera.last_error && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                          <p className="text-xs font-medium text-red-600 mb-2">Last Stream Error</p>
                          <p className="text-xs text-red-800">{camera.last_error}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* AI Agents if present */}
            {camera.ai_agents && camera.ai_agents.length > 0 && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-sm">AI Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {camera.ai_agents.map((agent, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {agent.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex justify-end gap-2 p-4 border-t bg-white flex-shrink-0">
          <Button variant="outline" onClick={() => onEdit(camera)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(camera.id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}