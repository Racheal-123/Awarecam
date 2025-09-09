import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Camera,
  Clock,
  MapPin,
  Bot,
  Play,
  ClipboardCheck,
  Bell,
  Sprout,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

export default function EventCard({ event, viewMode, isSelected, onSelectionChange, onViewDetails }) {

  const severityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    new: 'bg-red-500',
    acknowledged: 'bg-blue-500',
    resolved: 'bg-green-500'
  };
  
  const statusLabels = {
    new: 'New',
    acknowledged: 'Acknowledged',
    resolved: 'Resolved'
  };

  const triggeredActionIcons = {
    alert_sent: { icon: Bell, label: 'Alert Sent' },
    task_created: { icon: ClipboardCheck, label: 'Task Created' },
    lockdown_protocol: { icon: Shield, label: 'Lockdown Triggered' },
    logged: { icon: Sprout, label: 'Logged' }
  };

  const timeAgo = formatDistanceToNowStrict(new Date(event.created_date), { addSuffix: true });

  const handleNotesClick = (e) => {
    e.stopPropagation();
    onViewDetails(event, 'notes'); // Pass a flag to scroll to notes section
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`flex items-center px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        onClick={() => onViewDetails(event)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelectionChange(event.id)}
          onClick={(e) => e.stopPropagation()}
          className="mr-4"
        />
        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
          {/* Event Details */}
          <div className="col-span-4 flex items-center gap-4">
             <img src={event.thumbnail_url} alt="Event thumbnail" className="w-16 h-12 object-cover rounded-md" />
             <div className="flex-1 min-w-0">
               <p className="font-semibold text-slate-800 truncate text-sm">{event.description}</p>
               <p className="text-xs text-slate-500 mt-1">{timeAgo}</p>
             </div>
          </div>
          {/* Camera */}
          <div className="col-span-2 text-sm text-slate-600 truncate">
            {event.camera_name}
          </div>
          {/* AI Bot */}
          <div className="col-span-2 text-sm text-slate-600 truncate">
            {event.ai_agent}
          </div>
          {/* Severity */}
          <div className="col-span-2">
            <Badge className={`${severityColors[event.severity]} capitalize`}>{event.severity}</Badge>
          </div>
          {/* Status */}
          <div className="col-span-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[event.status]}`}></div>
            <span className="text-sm capitalize text-slate-700">{statusLabels[event.status]}</span>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <Card 
      className="bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-200 h-full flex flex-col"
      onClick={() => onViewDetails(event)}
    >
      <CardContent className="p-0 flex-grow">
        {/* Event Image */}
        <div className="w-full h-40 rounded-t-lg overflow-hidden relative group">
          <img
            src={event.thumbnail_url}
            alt="Event preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Status & Severity */}
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <Badge className={`${severityColors[event.severity]} border text-xs`}>
              {event.severity}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
             <div className={`w-2.5 h-2.5 rounded-full ${statusColors[event.status]} ring-2 ring-white/50`}></div>
             <span className="text-white text-xs font-medium capitalize">{statusLabels[event.status]}</span>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-slate-900 text-base line-clamp-2">
            {event.description}
          </h3>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.camera_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{timeAgo}</span>
            </div>
             <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.ai_agent}</span>
            </div>
             <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.zone_name}</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
                {event.triggered_actions?.map(action => {
                    const ActionIcon = triggeredActionIcons[action]?.icon;
                    if (!ActionIcon) return null;
                    return <ActionIcon key={action} className="w-4 h-4 text-slate-400" title={triggeredActionIcons[action]?.label} />;
                })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}