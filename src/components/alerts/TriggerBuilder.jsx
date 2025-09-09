
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';
import { Plus, X } from 'lucide-react';

export default function TriggerBuilder({ trigger, onChange }) {
  const updateCondition = (key, value) => {
    onChange({
      ...trigger,
      conditions: {
        ...trigger.conditions,
        [key]: value
      }
    });
  };

  const addTimeWindow = () => {
    const newWindow = { start_time: '09:00', end_time: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] };
    updateCondition('time_windows', [...(trigger.conditions.time_windows || []), newWindow]);
  };

  const removeTimeWindow = (index) => {
    const windows = trigger.conditions.time_windows || [];
    updateCondition('time_windows', windows.filter((_, i) => i !== index));
  };

  const updateTimeWindow = (index, field, value) => {
    const windows = [...(trigger.conditions.time_windows || [])];
    windows[index] = { ...windows[index], [field]: value };
    updateCondition('time_windows', windows);
  };

  return (
    <div className="space-y-4">
      {/* Trigger Type */}
      <div>
        <Label>Trigger Type</Label>
        <Select
          value={trigger.type}
          onValueChange={(value) => onChange({ ...trigger, type: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="event_occurs">Event Occurs</SelectItem>
            <SelectItem value="agent_detection">AI Agent Detection</SelectItem>
            <SelectItem value="anomaly_detected">Anomaly Detected</SelectItem>
            <SelectItem value="camera_offline">Camera Offline</SelectItem>
            <SelectItem value="time_based">Time-Based</SelectItem>
            <SelectItem value="custom_condition">Custom Condition</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event Types */}
      {(trigger.type === 'event_occurs' || trigger.type === 'agent_detection') && (
        <div>
          <Label>Event Types</Label>
          <MultiSelect
            placeholder="Select event types"
            value={trigger.conditions.event_types || []}
            onValueChange={(value) => updateCondition('event_types', value)}
            options={[
              { value: 'motion_detected', label: 'Motion Detected' },
              { value: 'person_detected', label: 'Person Detected' },
              { value: 'vehicle_detected', label: 'Vehicle Detected' },
              { value: 'intrusion_alert', label: 'Intrusion Alert' },
              { value: 'safety_violation', label: 'Safety Violation' },
              { value: 'ppe_compliance_violation', label: 'PPE Violation' },
              { value: 'fire_smoke_detected', label: 'Fire/Smoke' },
              { value: 'weapon_detected', label: 'Weapon Detected' },
              { value: 'fall_detected', label: 'Fall Detected' }
            ]}
          />
        </div>
      )}

      {/* AI Agents */}
      {trigger.type === 'agent_detection' && (
        <div>
          <Label>AI Agents</Label>
          <MultiSelect
            placeholder="Select AI agents"
            value={trigger.conditions.agent_ids || []}
            onValueChange={(value) => updateCondition('agent_ids', value)}
            options={[
              { value: 'safety_detection', label: 'Safety Detection' },
              { value: 'security_monitoring', label: 'Security Monitoring' },
              { value: 'ppe_compliance', label: 'PPE Compliance' },
              { value: 'vehicle_detection', label: 'Vehicle Detection' },
              { value: 'people_counting', label: 'People Counting' }
            ]}
          />
        </div>
      )}

      {/* Cameras */}
      <div>
        <Label>Cameras (Optional)</Label>
        <MultiSelect
          placeholder="All cameras (or select specific ones)"
          value={trigger.conditions.camera_ids || []}
          onValueChange={(value) => updateCondition('camera_ids', value)}
          options={[
            { value: 'cam_entrance', label: 'Main Entrance Camera' },
            { value: 'cam_warehouse', label: 'Warehouse Camera' },
            { value: 'cam_parking', label: 'Parking Lot Camera' },
            { value: 'cam_loading', label: 'Loading Dock Camera' }
          ]}
        />
      </div>

      {/* Zones */}
      <div>
        <Label>Zones (Optional)</Label>
        <MultiSelect
          placeholder="All zones (or select specific ones)"
          value={trigger.conditions.zone_names || []}
          onValueChange={(value) => updateCondition('zone_names', value)}
          options={[
            { value: 'entrance', label: 'Entrance Zone' },
            { value: 'warehouse_floor', label: 'Warehouse Floor' },
            { value: 'loading_dock', label: 'Loading Dock' },
            { value: 'parking_area', label: 'Parking Area' },
            { value: 'restricted_area', label: 'Restricted Area' }
          ]}
        />
      </div>

      {/* Severity Levels */}
      <div>
        <Label>Severity Levels</Label>
        <MultiSelect
          placeholder="Select severity levels"
          value={trigger.conditions.severity_levels || []}
          onValueChange={(value) => updateCondition('severity_levels', value)}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' }
          ]}
        />
      </div>

      {/* Confidence Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Confidence (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={(trigger.conditions.confidence_min || 0) * 100}
            onChange={(e) => updateCondition('confidence_min', parseInt(e.target.value) / 100)}
            placeholder="0"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Max Confidence (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={(trigger.conditions.confidence_max || 1) * 100}
            onChange={(e) => updateCondition('confidence_max', parseInt(e.target.value) / 100)}
            placeholder="100"
            className="mt-1"
          />
        </div>
      </div>

      {/* Time Windows */}
      <div>
        <div className="flex items-center justify-between">
          <Label>Time Windows</Label>
          <Button onClick={addTimeWindow} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Window
          </Button>
        </div>
        
        <div className="space-y-3 mt-2">
          {(trigger.conditions.time_windows || []).map((window, index) => (
            <Card key={index} className="p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Time Window {index + 1}</span>
                <Button
                  onClick={() => removeTimeWindow(index)}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-red-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={window.start_time}
                    onChange={(e) => updateTimeWindow(index, 'start_time', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={window.end_time}
                    onChange={(e) => updateTimeWindow(index, 'end_time', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Days</Label>
                <MultiSelect
                  placeholder="Select days"
                  value={window.days || []}
                  onValueChange={(value) => updateTimeWindow(index, 'days', value)}
                  options={[
                    { value: 'monday', label: 'Monday' },
                    { value: 'tuesday', label: 'Tuesday' },
                    { value: 'wednesday', label: 'Wednesday' },
                    { value: 'thursday', label: 'Thursday' },
                    { value: 'friday', label: 'Friday' },
                    { value: 'saturday', label: 'Saturday' },
                    { value: 'sunday', label: 'Sunday' }
                  ]}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Logic */}
      {trigger.type === 'custom_condition' && (
        <div>
          <Label>Custom Logic</Label>
          <Input
            value={trigger.conditions.custom_logic || ''}
            onChange={(e) => updateCondition('custom_logic', e.target.value)}
            placeholder="e.g., events_in_last_10_minutes > 3"
            className="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">
            Use simple expressions like "events_count &gt; 5" or "time_since_last_event &lt; 300"
          </p>
        </div>
      )}
    </div>
  );
}
