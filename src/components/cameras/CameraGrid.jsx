
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Camera,
  MapPin,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Wifi,
  WifiOff,
  Settings,
  AlertTriangle,
  Monitor,
  Smartphone,
  Globe,
  CheckCircle2,
  Play,
  Square,
  Loader2,
  Server,
  Activity
} from 'lucide-react';
import streamingService from '@/components/services/StreamingService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { buildHlsProxyUrl } from '@/components/utils/functionsBase';
import SafeHLSPlayer from '@/components/video/SafeHLSPlayer';

// Component for camera preview (video or blank state)
function CameraPreview({ camera, className }) {
  const [showVideo, setShowVideo] = React.useState(false);
  const [videoError, setVideoError] = React.useState(false);

  // Determine video URL - always use proxy for URLs with credentials
  const getVideoUrl = () => {
    if (!camera) return null;
    
    // For public feeds, check if we have a valid HLS URL
    if (camera.camera_type === 'public_feed') {
      const url = camera.rtsp_url || camera.hls_url;
      if (url && url.includes('.m3u8')) {
        // Check if URL has embedded credentials (user:pass@domain)
        if (url.match(/https?:\/\/[^@\/]+:[^@\/]+@/)) {
          // URL has credentials - must use proxy
          return buildHlsProxyUrl(camera.id);
        }
        return url; // Direct HLS URL without credentials
      } else if (url && url.startsWith('rtsp://')) {
        // RTSP URL - cannot be played directly, skip video preview
        return null;
      }
      return url; // Try whatever URL we have
    }
  
    // For other camera types, use proxy if we have stream status or HLS URL
    if (camera.stream_status === 'live' && (camera.hls_url || camera.rtsp_url)) {
      return buildHlsProxyUrl(camera.id);
    }
    
    return null;
  };

  const videoUrl = getVideoUrl();
  const canShowVideo = videoUrl && 
    (camera.stream_status === 'live' || camera.camera_type === 'public_feed') &&
    !videoUrl.startsWith('rtsp://'); // Don't try to show RTSP URLs

  React.useEffect(() => {
    // Only show video if we can actually play it
    if (canShowVideo && !videoError) {
      const timer = setTimeout(() => setShowVideo(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowVideo(false);
    }
  }, [canShowVideo, videoError]);

  if (showVideo && videoUrl && !videoError) {
    return (
      <div className={`relative ${className}`}>
        <SafeHLSPlayer
          src={videoUrl}
          autoPlay={true}
          muted={true}
          controls={false}
          className="w-full h-full object-cover"
          onError={(error) => {
            console.warn('Video preview failed for camera:', camera.id, 'Error:', error);
            setVideoError(true);
            setShowVideo(false);
          }}
        />
        {/* Live indicator */}
        <div className="absolute top-2 left-2">
          <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>
    );
  }

  // Blank state with play icon - no placeholder images
  return (
    <div className={`relative bg-slate-900 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center justify-center text-slate-400">
        <Play className="w-12 h-12 mb-2 opacity-60" />
        <span className="text-xs opacity-80">No Live Stream</span>
      </div>
      
      {/* Offline overlay for inactive cameras */}
      {camera.status === 'inactive' && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            OFFLINE
          </div>
        </div>
      )}
    </div>
  );
}

const statusConfig = {
  active: {
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    icon: Wifi,
    label: 'Active'
  },
  inactive: {
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    icon: WifiOff,
    label: 'Inactive'
  },
  maintenance: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    icon: Settings,
    label: 'Maintenance'
  },
  error: {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: AlertTriangle,
    label: 'Error'
  }
};

const getStatusColor = (status) => {
  const config = statusConfig[status] || statusConfig.inactive;
  return `${config.color} ${config.bgColor}`;
};

const getCameraTypeIcon = (cameraType) => {
  switch (cameraType) {
    case 'device_camera':
      return Smartphone;
    case 'rtsp':
    case 'ip':
      return Monitor;
    case 'public_feed':
      return Globe;
    default:
      return Camera;
  }
};

// Error Boundary for individual camera cards
class CameraCardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Camera Card Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">Error loading camera</p>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

// Separate CameraCard component with comprehensive error handling
function CameraCard({ camera, onEdit, onView, onDelete, onFetchStatus, onViewCallbackLog, callbackLogs, userRole, isManager, onRefresh }) {
  // Call hooks at the top level, before any conditional returns.
  const [streamingStatus, setStreamingStatus] = React.useState(camera?.stream_status || 'idle');
  const [isStreamAction, setIsStreamAction] = React.useState(false);

  // Comprehensive safety checks for all camera properties - moved to top before any returns
  const safeCamera = React.useMemo(() => {
    if (!camera || typeof camera !== 'object') {
      return null;
    }

    return {
      id: camera.id,
      name: String(camera.name || 'Unnamed Camera'),
      location: String(camera.location?.name || camera.location || 'Unknown Location'),
      status: String(camera.status || 'inactive'),
      camera_type: String(camera.camera_type || 'unknown'),
      is_streaming: Boolean(camera.is_streaming),
      health_score: Number(camera.health_score) || 0,
      events_today: Number(camera.events_today) || 0,
      ai_agents: Array.isArray(camera.ai_agents) ? camera.ai_agents.map(String) : [], // Ensure agents are strings
      stream_status: String(camera.stream_status || 'idle'), // New property for streaming status
      stream_id: camera.stream_id || null, // Add stream_id for fetching status
      hls_url: camera.hls_url || null, // Add hls_url for video preview
      rtsp_url: camera.rtsp_url || null, // Add rtsp_url for public feeds
    };
  }, [camera]);

  // Find the latest callback log for this camera - moved to top
  const latestLog = React.useMemo(() => {
    if (!Array.isArray(callbackLogs) || !safeCamera?.id) return null;
    const cameraLogs = callbackLogs.filter(log => log.camera_id === safeCamera.id);
    if (cameraLogs.length === 0) return null;
    // Sort by created_date in descending order to get the latest
    return cameraLogs.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())[0];
  }, [callbackLogs, safeCamera?.id]);

  // This effect syncs the local state with the prop if the camera prop changes.
  React.useEffect(() => {
    if (safeCamera) {
        setStreamingStatus(safeCamera.stream_status || 'idle');
    }
  }, [safeCamera]);

  // Now we can safely do early returns after all hooks have been called
  if (!safeCamera) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Invalid camera data</p>
        </CardContent>
      </Card>
    );
  }

  // Stream status configuration for badges
  const streamStatusConfig = {
    idle: { color: 'text-slate-500', bgColor: 'bg-slate-100', label: 'Idle' },
    stopped: { color: 'text-slate-500', bgColor: 'bg-slate-100', label: 'Stopped' },
    starting: { color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Starting...' },
    live: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Live' },
    error: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Error' }
  };
  
  const streamingFeatureEnabled = window.STREAMING_FEATURE_ENABLED === true;
  const canManageStreaming = streamingFeatureEnabled && isManager;
  const canStart = ['idle', 'stopped', 'error'].includes(streamingStatus);
  const canStop = ['starting', 'live'].includes(streamingStatus);

  const handleStartStream = async () => {
    if (!safeCamera.id || isStreamAction) return;
    
    setIsStreamAction(true);
    setStreamingStatus('starting'); // Optimistic UI update
    
    try {
      const result = await streamingService.startStream(safeCamera.id);
      if (result.success) {
        toast.success('Stream started successfully');
        onRefresh(); // Refresh the camera list from the parent
      } else {
        setStreamingStatus('error'); // Revert to error if failed
        toast.error(`Failed to start stream: ${result.error}`);
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      setStreamingStatus('error'); // Revert to error if failed
      toast.error('Failed to start stream');
    } finally {
      setIsStreamAction(false);
    }
  };

  const handleStopStream = async () => {
    if (!safeCamera.id || isStreamAction) return;
    
    setIsStreamAction(true);
    
    try {
      const result = await streamingService.stopStream(safeCamera.id);
      if (result.success) {
        toast.success('Stream stopped successfully');
        onRefresh(); // Refresh the camera list from the parent
      } else {
        // If stop fails, the actual status from the backend might still be 'live' or 'starting', 
        // so we don't set 'stopped' explicitly. onRefresh will fetch the true state.
        setStreamingStatus('error'); // Indicate a failure
        toast.error(`Failed to stop stream: ${result.error}`);
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
      setStreamingStatus('error'); // Indicate a failure
      toast.error('Failed to stop stream');
    } finally {
      setIsStreamAction(false);
    }
  };

  const TypeIcon = getCameraTypeIcon(safeCamera.camera_type);

  const handleEdit = () => {
    try {
      if (onEdit && typeof onEdit === 'function') {
        onEdit(safeCamera); // Pass the safe camera object back
      }
    } catch (error) {
      console.error('Error in handleEdit for camera:', safeCamera.id, error);
    }
  };

  const handleView = () => {
    try {
      if (onView && typeof onView === 'function') {
        onView(safeCamera); // Pass the safe camera object back - let parent handle navigation
      }
    } catch (error) {
      console.error('Error in handleView for camera:', safeCamera.id, error);
    }
  };

  const handleDelete = () => {
    try {
      if (onDelete && typeof onDelete === 'function') {
        onDelete(safeCamera.id);
      }
    } catch (error) {
      console.error('Error in handleDelete for camera:', safeCamera.id, error);
    }
  };
  
  const handleFetchStatusClick = () => {
    if (onFetchStatus && typeof onFetchStatus === 'function') {
        onFetchStatus(safeCamera);
    }
  };

  const handleViewCallbackLogClick = () => {
    if (onViewCallbackLog && typeof onViewCallbackLog === 'function') {
        onViewCallbackLog(safeCamera.id);
    }
  };

  const streamStatusInfo = streamStatusConfig[streamingStatus] || streamStatusConfig.idle;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Camera preview area with live video */}
        <div className="aspect-video bg-slate-900 relative overflow-hidden">
          <CameraPreview 
            camera={safeCamera} 
            className="w-full h-full object-cover"
          />

          {/* Status indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            {streamingFeatureEnabled && safeCamera.camera_type !== 'device_camera' ? (
              <Badge className={`${streamStatusInfo.bgColor} ${streamStatusInfo.color} border-0 text-xs`}>
                {streamStatusInfo.label}  
              </Badge>
            ) : (
              <Badge className={getStatusColor(safeCamera.status)}>
                {statusConfig[safeCamera.status]?.label || 'Unknown'}
              </Badge>
            )}
          </div>
        </div>

        {/* Camera info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900">{safeCamera.name}</h3>
              <p className="text-sm text-slate-600">{safeCamera.location}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {isManager && (
                   <DropdownMenuItem onClick={handleFetchStatusClick} disabled={!safeCamera.id}>
                      <Server className="w-4 h-4 mr-2" />
                      Fetch Status
                   </DropdownMenuItem>
                )}
                {isManager && latestLog && (
                   <DropdownMenuItem onClick={handleViewCallbackLogClick}>
                      <Activity className="w-4 h-4 mr-2" />
                      View Callback Log
                   </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Camera
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Camera
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Show latest callback info for managers */}
          {isManager && latestLog && (
            <div className="mb-3 p-2 bg-slate-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span>Latest callback: </span>
                  <span className="font-medium">{latestLog.status}</span>
                  <span className="ml-2">{format(new Date(latestLog.created_date), 'MMM d HH:mm')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleViewCallbackLogClick}
                >
                  View JSON
                </Button>
              </div>
            </div>
          )}

          {/* Direct Action Buttons */}
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleView}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="default"
              size="sm"  
              className="flex-1"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>

          {/* Streaming Controls - Only for managers */}
          {canManageStreaming && (
            <div className="flex gap-2 mb-3">
              {canStart && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={handleStartStream}
                  disabled={isStreamAction}
                >
                  {isStreamAction && streamingStatus === 'starting' ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-1" />
                  )}
                  Start Stream
                </Button>
              )}
              {canStop && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleStopStream}
                  disabled={isStreamAction}
                >
                  {isStreamAction ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4 mr-1" />
                  )}
                  Stop Stream
                </Button>
              )}
            </div>
          )}

          {/* AI Agents */}
          {safeCamera.ai_agents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-slate-700">AI Agents</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {safeCamera.ai_agents.slice(0, 3).map((agent, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {String(agent).replace(/_/g, ' ')}
                  </Badge>
                ))}
                {safeCamera.ai_agents.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{safeCamera.ai_agents.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Health indicators */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-slate-600">
                  Health: {safeCamera.health_score}%
                </span>
              </div>
              <div className="text-slate-500">
                Events: {safeCamera.events_today}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CameraGrid({ cameras = [], viewMode = 'grid', onEdit, onView, onDelete, onFetchStatus, onViewCallbackLog, callbackLogs, userRole, onRefresh }) {
  // Comprehensive safety checks
  const safeCameras = React.useMemo(() => {
    if (!Array.isArray(cameras)) {
      console.warn('CameraGrid: cameras prop is not an array:', cameras);
      return [];
    }
    
    return cameras.filter(camera => {
      if (!camera || typeof camera !== 'object') {
        console.warn('CameraGrid: Invalid camera object:', camera);
        return false;
      }
      
      if (!camera.id) {
        console.warn('CameraGrid: Camera missing ID, skipping render:', camera);
        return false;
      }
      
      return true;
    });
  }, [cameras]);

  if (safeCameras.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No cameras found</h3>
        <p className="text-slate-500">Add your first camera to get started with monitoring.</p>
      </div>
    );
  }

  const gridClass = viewMode === 'list' 
    ? 'grid grid-cols-1 gap-4' 
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

  const isManager = userRole && ['organization_admin', 'manager'].includes(userRole);

  return (
    <div className={gridClass}>
      {safeCameras.map((camera) => {
        return (
          <CameraCardErrorBoundary key={camera.id}>
            <CameraCard 
              camera={camera}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
              onFetchStatus={onFetchStatus}
              onViewCallbackLog={onViewCallbackLog}
              callbackLogs={callbackLogs}
              userRole={userRole}
              isManager={isManager}
              onRefresh={onRefresh}
            />
          </CameraCardErrorBoundary>
        );
      })}
    </div>
  );
}
