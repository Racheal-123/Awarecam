import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Settings, Activity, Camera, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/api/entities';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';
import EventLogPanel from '@/components/video/EventLogPanel';
import { SHARED_DEMO_EVENTS } from '@/components/events/sharedDemoEvents';

export default function CameraDetails({ camera, isOpen, onClose }) {
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!camera || !isOpen) return;

    const loadEvents = async () => {
      setLoading(true);
      try {
        let cameraEvents = [];
        
        if (camera.id && !camera.is_demo) {
          try {
            cameraEvents = await Event.filter({ camera_id: camera.id }, '-created_date', 50);
          } catch (e) {
            console.warn("Could not fetch real events for camera:", e);
          }
        }
        
        if (cameraEvents.length === 0) {
          cameraEvents = SHARED_DEMO_EVENTS.filter(event => {
            const cameraIdPattern = camera.id.includes('demo-cam') ? camera.id : 'demo-store-entrance';
            return event.camera_id === cameraIdPattern || 
                   event.camera_name.toLowerCase().includes(camera.location?.toLowerCase() || '');
          });
        }
        
        setEvents(cameraEvents);
        if (cameraEvents.length > 0 && !activeEvent) {
          setActiveEvent(cameraEvents[0]);
        }
      } catch (error) {
        console.error('Error loading camera events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [camera, isOpen]);

  const handleEventSelect = (event) => {
    setActiveEvent(event);
  };

  const videoSourceToPlay = useMemo(() => {
    if (activeEvent?.video_url) {
      return activeEvent.video_url;
    }
    return camera?.rtsp_url;
  }, [activeEvent, camera]);

  const videoPoster = useMemo(() => {
    if (activeEvent?.thumbnail_url) {
      return activeEvent.thumbnail_url;
    }
    return camera?.thumbnail_url;
  }, [activeEvent, camera]);

  if (!camera) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b flex-row items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-slate-900">
                {camera.name}
              </DialogTitle>
              <p className="text-slate-600 text-sm">
                {camera.location} • {format(new Date(), 'MMM d, yyyy, h:mm a')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Video player area */}
          <div className="flex-1 flex flex-col min-h-0 bg-black">
            <EnhancedVideoPlayer
              src={videoSourceToPlay}
              poster={videoPoster}
              className="w-full h-full"
              onError={(e) => console.error("Video player error:", e.message)}
            />
          </div>
          
          {/* Right sidebar */}
          <div className="w-[350px] flex flex-col border-l flex-shrink-0 bg-white">
            <Tabs defaultValue="events" className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="events">
                  <Shield className="w-4 h-4 mr-2" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="details">
                  <Settings className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="events" className="p-4">
                  <EventLogPanel
                    events={events}
                    onEventClick={handleEventSelect}
                    selectedEventId={activeEvent?.id}
                    isLoading={loading}
                  />
                </TabsContent>

                <TabsContent value="details" className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 mb-3">Camera Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <Badge variant={camera.status === 'active' ? 'default' : 'destructive'}>
                          {camera.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Resolution:</span>
                        <span className="font-medium">{camera.resolution || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Frame Rate:</span>
                        <span className="font-medium">{camera.frame_rate || 'Unknown'} fps</span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-slate-600">Health Score:</span>
                        <span className="font-medium">{camera.health_score || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Uptime:</span>
                        <span className="font-medium">{camera.uptime || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Events Today:</span>
                        <span className="font-medium">{camera.events_today || 0}</span>
                      </div>
                    </div>
                  </div>

                  {camera.ai_agents && camera.ai_agents.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Active AI Agents</h4>
                      <div className="flex flex-wrap gap-2">
                        {camera.ai_agents.map((agent, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {camera.zone_name && (
                     <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Zone Information</h4>
                      <p className="text-sm text-slate-600">{camera.zone_name}</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}