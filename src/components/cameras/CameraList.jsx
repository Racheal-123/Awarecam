
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wifi,
  WifiOff,
  Settings,
  AlertTriangle,
  Eye,
  Edit,
  Zap,
  Activity,
  Shield,
  Video,
  Play,
  Square,
  Loader2,
  Server
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import streamingService from '@/components/services/StreamingService';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusConfig = {
  active: {
    color: 'text-green-500',
    icon: Wifi,
    label: 'Active'
  },
  maintenance: {
    color: 'text-yellow-500',
    icon: Settings,
    label: 'Maintenance'
  },
  inactive: {
    color: 'text-red-500',
    icon: WifiOff,
    label: 'Inactive'
  },
  error: {
    color: 'text-red-700',
    icon: AlertTriangle,
    label: 'Error'
  }
};

const getHealthColor = (score) => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  return "text-red-600";
};

// Function to get appropriate image based on camera name/location
const getCameraImage = (camera) => {
  const name = camera.name.toLowerCase();
  const location = (typeof camera.location === 'string' ? camera.location : camera.location?.name)?.toLowerCase() || '';
  
  if (name.includes('entrance') || name.includes('entry') || location.includes('entrance')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop';
  } else if (name.includes('checkout') || name.includes('register') || name.includes('counter') || location.includes('checkout')) {
    return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&h=80&fit=crop';
  } else if (name.includes('warehouse') || name.includes('loading') || name.includes('dock') || location.includes('warehouse') || location.includes('loading')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=80&h=80&fit=crop';
  } else if (name.includes('parking') || name.includes('lot') || name.includes('garage') || location.includes('parking')) {
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop';
  } else if (name.includes('office') || name.includes('reception') || location.includes('office')) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop';
  } else if (name.includes('kitchen') || name.includes('restaurant') || location.includes('kitchen')) {
    return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop';
  } else if (name.includes('retail') || name.includes('store') || name.includes('shop') || location.includes('retail') || location.includes('store')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop';
  } else {
    // Default security camera image
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop';
  }
};

export default function CameraList({ cameras, isLoading, onCameraSelect, onCameraEdit, onFetchStatus, onViewCallbackLog, callbackLogs, userRole, onRefresh }) {
  const [streamActions, setStreamActions] = React.useState({});

  const streamStatusConfig = {
    idle: { color: 'text-slate-500', bgColor: 'bg-slate-100', label: 'Idle' },  
    stopped: { color: 'text-slate-500', bgColor: 'bg-slate-100', label: 'Stopped' },
    starting: { color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Starting...' },
    live: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Live' },
    error: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Error' }
  };

  const streamingFeatureEnabled = window.STREAMING_FEATURE_ENABLED === true;
  const isManager = userRole && ['organization_admin', 'manager'].includes(userRole);
  const canManageStreaming = streamingFeatureEnabled && isManager;

  const handleStartStream = async (camera) => {
    if (!camera.id || streamActions[camera.id]) return;
    
    setStreamActions(prev => ({ ...prev, [camera.id]: 'starting' }));
    
    try {
      const result = await streamingService.startStream(camera.id);
      if (result.success) {
        toast.success('Stream started successfully');
        onRefresh(); // Refresh the camera list from the parent
      } else {
        toast.error(`Failed to start stream: ${result.error}`);
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start stream');
    } finally {
      setStreamActions(prev => {
        const updated = { ...prev };
        delete updated[camera.id];
        return updated;
      });
    }
  };

  const handleStopStream = async (camera) => {
    if (!camera.id || streamActions[camera.id]) return;
    
    setStreamActions(prev => ({ ...prev, [camera.id]: 'stopping' }));
    
    try {
      const result = await streamingService.stopStream(camera.id);
      if (result.success) {
        toast.success('Stream stopped successfully');
        onRefresh(); // Refresh the camera list from the parent
      } else {
        toast.error(`Failed to stop stream: ${result.error}`);
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Failed to stop stream');
    } finally {
      setStreamActions(prev => {
        const updated = { ...prev };
        delete updated[camera.id];
        return updated;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 h-16 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (cameras.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="text-center py-16">
          <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No Cameras Found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filter criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-medium text-slate-600 text-sm bg-slate-50 rounded-t-lg">
            <div className="col-span-3">Camera</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Health</div>
            <div className="col-span-2">Events Today</div>
            <div className="col-span-2">AI Bots</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {/* Body */}
          <TooltipProvider>
            {cameras.map((camera, index) => {
              const statusInfo = statusConfig[camera.status] || statusConfig.inactive;
              const StatusIcon = statusInfo.icon;
              const isDemo = camera.id.startsWith('demo-');
              const cameraImage = getCameraImage(camera);
              
              const streamStatus = camera.stream_status || 'idle';
              const streamStatusInfo = streamStatusConfig[streamStatus] || streamStatusConfig.idle;
              const canStart = ['idle', 'stopped', 'error'].includes(streamStatus);
              const canStop = ['starting', 'live'].includes(streamStatus);
              const isStreamActionActive = streamActions[camera.id];
              const canShowStreamingControls = canManageStreaming && camera.camera_type !== 'device_camera';
              
              const latestLog = callbackLogs?.find(log => log.camera_id === camera.id);

              const isStartingOrLive = streamStatus === 'starting' || streamStatus === 'live';

              return (
                <motion.div
                  key={camera.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  {/* Camera Name and Location with Image */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                    <img 
                      src={cameraImage} 
                      alt={camera.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex items-center gap-2">
                      {/* Hide old status icon while starting or live to avoid confusion */}
                      {!(streamingFeatureEnabled && isStartingOrLive) && (
                        <Tooltip>
                          <TooltipTrigger>
                            <StatusIcon className={`w-5 h-5 flex-shrink-0 ${statusInfo.color}`} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Status: {statusInfo.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{camera.name}</p>
                      <p className="text-sm text-slate-500">{camera.location?.name || camera.location}</p>
                      {/* Show callback log info for managers */}
                      {isManager && latestLog && (
                        <div className="text-xs text-slate-400 mt-1">
                          Last callback: {latestLog.status} ({format(new Date(latestLog.created_date), 'MMM d HH:mm')})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stream Status */}
                  <div className="col-span-6 md:col-span-1">
                    {camera.camera_type === 'device_camera' ? (
                      <Badge className={`${(statusInfo.label === 'Active' ? streamStatusConfig.live : streamStatusConfig.idle).bgColor} ${(statusInfo.label === 'Active' ? streamStatusConfig.live : streamStatusConfig.idle).color} border-0 text-xs px-2 py-1`}>
                        {statusInfo.label === 'Active' ? 'Live' : 'Idle'}
                      </Badge>
                    ) : streamingFeatureEnabled ? (
                      <Badge className={`${streamStatusInfo.bgColor} ${streamStatusInfo.color} border-0 text-xs px-2 py-1`}>
                        {streamStatusInfo.label}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </div>

                  {/* Health */}
                  <div className="col-span-6 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${getHealthColor(camera.health_score)}`} />
                      <span className={`font-medium ${getHealthColor(camera.health_score)}`}>{camera.health_score}%</span>
                    </div>
                  </div>

                  {/* Events Today */}
                  <div className="col-span-6 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-800">{camera.events_today}</span>
                    </div>
                  </div>

                  {/* AI Bots */}
                  <div className="col-span-6 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-slate-800">{camera.ai_agents?.length || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-6 md:col-span-2 flex justify-end gap-2">
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onCameraSelect(camera)}>
                              <Eye className="w-4 h-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>View Details</p></TooltipContent>
                     </Tooltip>
                     
                     {isManager && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-9 w-9" 
                                    onClick={() => onFetchStatus(camera)}
                                    disabled={!camera.id}
                                >
                                    <Server className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Fetch Stream Status</p></TooltipContent>
                        </Tooltip>
                     )}
                     
                     {isManager && latestLog && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-9 w-9" 
                                    onClick={() => onViewCallbackLog(camera.id)}
                                >
                                    <Activity className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>View Callback Log</p></TooltipContent>
                        </Tooltip>
                     )}

                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="default" size="icon" className="h-9 w-9" onClick={() => onCameraEdit(camera)} disabled={isDemo}>
                              <Edit className="w-4 h-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isDemo ? "Demo cameras cannot be edited." : "Edit Camera"}</p></TooltipContent>
                     </Tooltip>

                     {/* Streaming Controls */}
                     {canShowStreamingControls && canStart && (
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button 
                             variant="outline" 
                             size="icon" 
                             className="h-9 w-9 border-green-300 text-green-700 hover:bg-green-50"
                             onClick={() => handleStartStream(camera)}
                             disabled={isStreamActionActive}
                           >
                             {isStreamActionActive ? (
                               <Loader2 className="w-4 h-4 animate-spin" />
                             ) : (
                               <Play className="w-4 h-4" />
                             )}
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent><p>Start Stream</p></TooltipContent>
                       </Tooltip>
                     )}

                     {canShowStreamingControls && canStop && (
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button 
                             variant="outline" 
                             size="icon" 
                             className="h-9 w-9 border-red-300 text-red-700 hover:bg-red-50"
                             onClick={() => handleStopStream(camera)}
                             disabled={isStreamActionActive}
                           >
                             {isStreamActionActive ? (
                               <Loader2 className="w-4 h-4 animate-spin" />
                             ) : (
                               <Square className="w-4 h-4" />
                             )}
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent><p>Stop Stream</p></TooltipContent>
                       </Tooltip>
                     )}
                  </div>
                </motion.div>
              );
            })}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
