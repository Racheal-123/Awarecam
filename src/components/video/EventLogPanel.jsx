
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Share2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Mail,
  Smartphone,
  Webhook,
  Bell,
  Loader2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventNoteService } from '@/components/services/EventNoteService';
import { AlertNotificationService } from '@/components/services/AlertNotificationService';
import { toast } from 'sonner';

const severityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
};

const actionIcons = {
  email: Mail,
  sms: Smartphone,
  webhook: Webhook,
  alert_sent: Bell
};

export default function EventLogPanel({ 
  events = [], 
  onEventClick,
  onAcknowledge,
  onShare,
  onViewClip,
  activeEventId,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showNoteComposer, setShowNoteComposer] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  // Removed eventNotes state and its associated useEffect to prevent rate limiting from fetching notes for all events.
  // Note management for events is now expected to be handled by a higher-level component or global state.

  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.description?.toLowerCase().includes(search) ||
        event.event_type?.toLowerCase().includes(search) ||
        event.ai_agent?.toLowerCase().includes(search) ||
        event.zone_name?.toLowerCase().includes(search)
      );
    }
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (timeFilter === '15m') cutoff.setMinutes(now.getMinutes() - 15);
      if (timeFilter === '1h') cutoff.setHours(now.getHours() - 1);
      if (timeFilter === '24h') cutoff.setHours(now.getHours() - 24);
      filtered = filtered.filter(event => new Date(event.created_date) >= cutoff);
    }
    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }
    return filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [events, searchTerm, timeFilter, severityFilter]);

  const handleSaveNote = async (event) => {
    if (!noteContent.trim() || isSubmittingNote) return;
    setIsSubmittingNote(true);
    try {
      await EventNoteService.create({
        event_id: event.id,
        camera_id: event.camera_id,
        content: noteContent,
        organization_id: event.organization_id
      });
      toast.success("Note added successfully.");
      setShowNoteComposer(null);
      setNoteContent('');
      // No local state update for event notes needed here, as the main notes panel/parent component will handle data refetching/synchronization.
    } catch (error) {
      // Error already toasted by service
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAcknowledgeClick = async (event, e) => {
    e.stopPropagation();
    try {
      await AlertNotificationService.acknowledge({
        alert_id: event.id,
        organization_id: event.organization_id
      });
      onAcknowledge?.(event);
      toast.success("Event acknowledged.");
    } catch (error) {
      // Error already toasted by service
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="p-4 border-b flex-shrink-0">
        <h3 className="text-lg font-semibold">Event Log</h3>
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="15m">Last 15m</SelectItem>
                <SelectItem value="1h">Last 1h</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No matching events found</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const isActive = event.id === activeEventId;
              // notesCount removed as eventNotes state is no longer managed locally.
              
              return (
                <div key={event.id}>
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isActive ? 'ring-2 ring-primary border-primary' : ''}`}
                    onClick={() => onEventClick?.(event)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                          {event.snapshot_url ? (
                            <img src={event.snapshot_url} alt="Event thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-muted-foreground" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm capitalize truncate">{event.event_type?.replace(/_/g, ' ')}</h4>
                            <Badge className={`text-xs ${severityColors[event.severity] || ''}`} variant="secondary">{event.severity}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{formatDistanceToNow(new Date(event.created_date), { addSuffix: true })}</p>
                          <div className="flex items-center gap-1 mt-2">
                            {event.status === 'new' && onAcknowledge && (
                              <Button variant="ghost" size="sm" onClick={(e) => handleAcknowledgeClick(event, e)} className="h-6 px-2 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Ack</Button>
                            )}
                            {/* Removed notesCount display as event notes are no longer fetched locally */}
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowNoteComposer(prev => prev === event.id ? null : event.id); }} className="h-6 px-2 text-xs"><MessageSquare className="w-3 h-3 mr-1" />Note</Button>
                            {onShare && (
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onShare(event); }} className="h-6 px-2 text-xs"><Share2 className="w-3 h-3 mr-1" />Share</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {showNoteComposer === event.id && (
                    <div className="mt-1 p-3 bg-slate-50 rounded-b-lg" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full p-2 text-sm border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" onClick={() => handleSaveNote(event)} disabled={!noteContent.trim() || isSubmittingNote}>
                          {isSubmittingNote ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Saving...</> : 'Save'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowNoteComposer(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
