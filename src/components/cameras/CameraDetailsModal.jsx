import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Camera as CameraIcon, 
  MapPin, 
  Settings, 
  Trash2, 
  Edit, 
  Monitor,
  Globe,
  Smartphone,
  Video,
  Wifi,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  ChevronDown,
  ChevronRight,
  Code,
  Link,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SafeHLSPlayer from '@/components/video/SafeHLSPlayer';
import { buildHlsProxyUrl } from '@/components/utils/functionsBase';
import DeviceViewModal from '@/components/cameras/DeviceViewModal';

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

const getCameraTypeName = (cameraType) => {
  switch (cameraType) {
    case 'device_camera': return 'Device Camera';
    case 'rtsp': return 'RTSP Camera';
    case 'ip': return 'IP Camera';
    case 'public_feed': return 'Public Feed';
    case 'wifi': return 'WiFi Camera';
    case 'analog': return 'Analog Camera';
    case 'webrtc': return 'WebRTC Camera';
    default: return 'Unknown';
  }
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

export default function CameraDetailsModal({ camera, isOpen, onClose, onEdit, onDelete }) {
  const [technicalDetailsOpen, setTechnicalDetailsOpen] = useState(false);
  
  if (!camera) return null;

  // Check if this is a device camera - use specialized modal
  const isDeviceCamera = camera.camera_type === 'device_camera';

  if (isDeviceCamera) {
    return (
      <DeviceViewModal
        camera={camera}
        isOpen={isOpen}
        onClose={onClose}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  // Regular camera modal for non-device cameras - with stacked layout
  const TypeIcon = getCameraTypeIcon(camera.camera_type);
  
  // Get video source for preview
  const getVideoSource = () => {
    if (camera.stream_status === 'live' && camera.hls_url) {
      return buildHlsProxyUrl(camera.id);
    }

    if (camera.camera_type === 'public_feed' && camera.rtsp_url?.includes('.m3u8')) {
      return camera.rtsp_url;
    }

    return null;
  };

  const videoSrc = getVideoSource();

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TypeIcon className="w-6 h-6 text-blue-600" />
            {camera.name}
            <Badge className={getStatusColor(camera.status)}>
              {camera.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Stacked Layout: Video Preview on Top (95% width) */}
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
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                    {videoSrc ? (
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
                              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                              LIVE
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <CameraIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                          <p className="text-sm">No live feed available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 2: Camera Information - Full width, side by side cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
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
                    <p className="font-medium">{getCameraTypeName(camera.camera_type)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Location</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {camera.location || 'Unknown Location'}
                    </p>
                  </div>

                  {camera.resolution && (
                    <div>
                      <p className="text-xs text-slate-600">Resolution</p>
                      <p className="font-medium">{camera.resolution}</p>
                    </div>
                  )}

                  {camera.frame_rate && (
                    <div>
                      <p className="text-xs text-slate-600">Frame Rate</p>
                      <p className="font-medium">{camera.frame_rate} fps</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status */}
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

                  {camera.stream_status && (
                    <div>
                      <p className="text-xs text-slate-600">Stream Status</p>
                      <p className="font-medium capitalize">{camera.stream_status}</p>
                    </div>
                  )}

                  {camera.health_score !== undefined && (
                    <div>
                      <p className="text-xs text-slate-600">Health Score</p>
                      <p className="font-medium">{camera.health_score}%</p>
                    </div>
                  )}

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
                      {/* Stream ID */}
                      {camera.stream_id && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-600">Stream ID</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(camera.stream_id, 'Stream ID')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-xs text-slate-800 break-all">{camera.stream_id}</p>
                        </div>
                      )}

                      {/* HLS URL */}
                      {camera.hls_url && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-600">HLS Stream URL</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(camera.hls_url, 'HLS URL')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-xs text-slate-800 break-all">{camera.hls_url}</p>
                        </div>
                      )}

                      {/* Proxy HLS URL */}
                      {videoSrc && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-600">Proxy HLS URL</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(videoSrc, 'Proxy HLS URL')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-xs text-slate-800 break-all">{videoSrc}</p>
                        </div>
                      )}

                      {/* RTSP URL (if available) */}
                      {camera.rtsp_url && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-600">Original RTSP URL</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(camera.rtsp_url, 'RTSP URL')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono text-xs text-slate-800 break-all">{camera.rtsp_url}</p>
                        </div>
                      )}

                      {/* Last Stream Error */}
                      {camera.last_error && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                          <p className="text-xs font-medium text-red-600 mb-2">Last Stream Error</p>
                          <p className="text-xs text-red-800">{camera.last_error}</p>
                        </div>
                      )}

                      {/* Last Start Response */}
                      {camera.last_start_body && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-slate-600 mb-2">Last Start Response</p>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500">Status Code:</span>
                            <span className="text-xs font-mono">{camera.last_start_code || 'N/A'}</span>
                          </div>
                          <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-32 overflow-auto">
                            {camera.last_start_body}
                          </pre>
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