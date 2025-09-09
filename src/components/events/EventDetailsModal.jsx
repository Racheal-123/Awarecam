import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, X, AlertTriangle, Video, MessageSquare, Plus, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Event } from '@/api/entities';
import { EventNote } from '@/api/entities';
import { User } from '@/api/entities';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';
import EventLogPanel from '@/components/video/EventLogPanel';
import CreateTaskFromEventModal from '@/components/events/CreateTaskFromEventModal';
import EventNotesSection from '@/components/events/EventNotesSection';

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  medium: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  low: { icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-50' },
};

export default function EventDetailsModal({ event, allCameraEvents, isOpen, onClose, onUpdateEvent, organizationId, scrollToSection }) {
  const [loading, setLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(event);
  const [activeEvent, setActiveEvent] = useState(event);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [user, setUser] = useState(null);
  const [cameraEvents, setCameraEvents] = useState(allCameraEvents);

  useEffect(() => {
    const loadUser = async () => {
        try {
            const userData = await User.me();
            setUser(userData);
        } catch (e) {
            console.error("Failed to load user", e);
        }
    }
    loadUser();
  }, []);
  
  useEffect(() => {
    setCurrentEvent(event);
    setActiveEvent(event);
    setLoading(false);
    setCameraEvents(allCameraEvents);
  }, [event, allCameraEvents]);

  const handleEventSelect = (selected) => {
    setActiveEvent(selected);
  };
  
  const videoSourceToPlay = useMemo(() => {
    const current = activeEvent || event;
    return current?.clip_url || current?.video_url;
  }, [activeEvent, event]);

  const videoPoster = useMemo(() => {
    const current = activeEvent || event;
    return current?.thumbnail_url;
  }, [activeEvent, event]);

  const handleStatusChange = async (newStatus) => {
    const updatedEventData = { 
        ...currentEvent, 
        status: newStatus,
        acknowledged_by: newStatus === 'acknowledged' ? user?.email : currentEvent.acknowledged_by,
        acknowledged_at: newStatus === 'acknowledged' ? new Date().toISOString() : currentEvent.acknowledged_at
    };
    setCurrentEvent(updatedEventData);
    if(onUpdateEvent) onUpdateEvent(updatedEventData);

    try {
        if (!String(currentEvent.id).startsWith('evt')) {
           await Event.update(currentEvent.id, { 
             status: newStatus,
             acknowledged_by: newStatus === 'acknowledged' ? user?.email : undefined,
             acknowledged_at: newStatus === 'acknowledged' ? new Date().toISOString() : undefined
           });
        }
    } catch(e) {
        console.error("Failed to update event status", e);
    }
  };

  const SeverityIcon = severityConfig[currentEvent.severity]?.icon || AlertTriangle;

  if (!event) return null;

  if (loading || !currentEvent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b flex-row items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${severityConfig[currentEvent.severity]?.bg}`}>
              <SeverityIcon className={`w-6 h-6 ${severityConfig[currentEvent.severity]?.color}`} />
            </div>
            <div>
              <DialogTitle className="text-xl text-slate-900 capitalize">
                {currentEvent.event_type.replace(/_/g, ' ')} Event
              </DialogTitle>
              <DialogDescription>
                {currentEvent.camera_name} &bull; {format(new Date(currentEvent.created_date), 'MMM d, yyyy, h:mm a')}
              </DialogDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Video player area */}
          <div className="flex-1 flex flex-col min-h-0 bg-black">
            {videoSourceToPlay ? (
              <EnhancedVideoPlayer
                src={videoSourceToPlay}
                poster={videoPoster}
                className="w-full h-full"
                onError={(e) => console.error("Video player error:", e.message)}
              />
            ) : (
              <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center">
                <Video className="w-12 h-12 mb-4 text-slate-500" />
                <p>No video available for this event.</p>
              </div>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="w-[350px] flex flex-col border-l flex-shrink-0 bg-white">
            {/* Event Timeline */}
            <div className="p-4 border-b flex-shrink-0">
              <h3 className="font-semibold text-lg text-slate-800 mb-2">Camera Event Log</h3>
              <EventLogPanel
                events={cameraEvents}
                onEventClick={handleEventSelect}
                selectedEventId={activeEvent?.id}
                isLoading={false}
              />
            </div>

            {/* Tabs for Details and Notes */}
            <Tabs defaultValue={scrollToSection || 'details'} className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="details"><FileText className="w-4 h-4 mr-2" />Details</TabsTrigger>
                <TabsTrigger value="notes"><MessageSquare className="w-4 h-4 mr-2" />Notes</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="details" className="p-4 space-y-4">
                  <h3 className="font-semibold text-lg text-slate-800">Event Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Description:</strong> {currentEvent.description}</p>
                    <p><strong>Severity:</strong> <Badge variant="secondary" className={`${severityConfig[currentEvent.severity]?.bg} ${severityConfig[currentEvent.severity]?.color}`}>{currentEvent.severity}</Badge></p>
                    <p><strong>Status:</strong> <Badge variant={currentEvent.status === 'new' ? 'destructive' : 'default'}>{currentEvent.status}</Badge></p>
                    <p><strong>AI Agent:</strong> {currentEvent.ai_agent}</p>
                    <p><strong>Zone:</strong> {currentEvent.zone_name}</p>
                    <p><strong>Confidence:</strong> {Math.round(currentEvent.confidence * 100)}%</p>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <h3 className="font-semibold text-lg text-slate-800">Actions</h3>
                    {currentEvent.status === 'new' && (
                      <Button onClick={() => handleStatusChange('acknowledged')} className="w-full">Acknowledge Event</Button>
                    )}
                    {currentEvent.status === 'acknowledged' && (
                      <Button onClick={() => handleStatusChange('resolved')} className="w-full">Mark as Resolved</Button>
                    )}
                    <Button onClick={() => setShowCreateTask(true)} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="p-4">
                   <EventNotesSection event={currentEvent} user={user} organizationId={organizationId} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    {showCreateTask && (
        <CreateTaskFromEventModal
            event={currentEvent}
            isOpen={showCreateTask}
            onClose={() => setShowCreateTask(false)}
            onTaskCreated={() => {
                handleStatusChange('in_progress');
            }}
        />
    )}
    </>
  );
}