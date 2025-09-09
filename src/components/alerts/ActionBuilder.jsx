
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { Clock, Webhook, Bell, CheckSquare, AlertTriangle, Zap } from 'lucide-react';

export default function ActionBuilder({ action, channels, onChange }) {
  const updateConfig = (key, value) => {
    onChange({
      ...action,
      config: {
        ...action.config,
        [key]: value
      }
    });
  };

  const actionIcons = {
    send_notification: <Bell className="w-4 h-4" />,
    trigger_webhook: <Webhook className="w-4 h-4" />,
    create_task: <CheckSquare className="w-4 h-4" />,
    escalate: <AlertTriangle className="w-4 h-4" />,
    iot_action: <Zap className="w-4 h-4" />,
    log_incident: <Clock className="w-4 h-4" />
  };

  const actionLabels = {
    send_notification: 'Send Notification',
    trigger_webhook: 'Trigger Webhook',
    create_task: 'Create Task',
    escalate: 'Escalate Alert',
    iot_action: 'IoT Device Action',
    log_incident: 'Log Incident'
  };

  const channelOptions = channels?.map(channel => ({
    value: channel.id,
    label: `${channel.channel_name} (${channel.channel_type})`
  })) || [];

  return (
    <div className="space-y-4">
      {/* Action Type */}
      <div>
        <Label>Action Type</Label>
        <Select
          value={action.type}
          onValueChange={(value) => onChange({ ...action, type: value, config: {} })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="send_notification">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Send Notification
              </div>
            </SelectItem>
            <SelectItem value="trigger_webhook">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4" />
                Trigger Webhook
              </div>
            </SelectItem>
            <SelectItem value="create_task">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Create Task
              </div>
            </SelectItem>
            <SelectItem value="escalate">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Escalate Alert
              </div>
            </SelectItem>
            <SelectItem value="iot_action">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                IoT Device Action
              </div>
            </SelectItem>
            <SelectItem value="log_incident">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Log Incident
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Delay */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Execution Order</Label>
          <Input
            type="number"
            min="1"
            value={action.execution_order || 1}
            onChange={(e) => onChange({ ...action, execution_order: parseInt(e.target.value) })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Delay (minutes)</Label>
          <Input
            type="number"
            min="0"
            value={action.config?.delay_minutes || 0}
            onChange={(e) => updateConfig('delay_minutes', parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Send Notification */}
      {action.type === 'send_notification' && (
        <div className="space-y-4">
          <div>
            <Label>Notification Channels</Label>
            <MultiSelect
              placeholder="Select channels to notify"
              value={action.config?.channel_ids || []}
              onValueChange={(value) => updateConfig('channel_ids', value)}
              options={channelOptions}
            />
          </div>
          
          <div>
            <Label>Message Template</Label>
            <Textarea
              value={action.config?.message_template || ''}
              onChange={(e) => updateConfig('message_template', e.target.value)}
              placeholder="🚨 Alert: {{event.description}} detected at {{camera.name}} ({{event.confidence}}% confidence)"
              className="mt-1 h-24"
            />
            <p className="text-xs text-slate-500 mt-1">
              {"Use variables: {{event.type}}, {{event.description}}, {{camera.name}}, {{event.confidence}}, {{event.severity}}"}
            </p>
          </div>
        </div>
      )}

      {/* Trigger Webhook */}
      {action.type === 'trigger_webhook' && (
        <div className="space-y-4">
          <div>
            <Label>Webhook URL</Label>
            <Input
              value={action.config?.webhook_url || ''}
              onChange={(e) => updateConfig('webhook_url', e.target.value)}
              placeholder="https://your-api.com/webhook"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Payload Template (JSON)</Label>
            <Textarea
              value={action.config?.webhook_payload ? JSON.stringify(action.config.webhook_payload, null, 2) : ''}
              onChange={(e) => {
                try {
                  const payload = JSON.parse(e.target.value);
                  updateConfig('webhook_payload', payload);
                } catch (error) {
                  // Invalid JSON, store as string for now
                  updateConfig('webhook_payload_raw', e.target.value);
                }
              }}
              placeholder={`{
  "event_type": "{{event.type}}",
  "description": "{{event.description}}",
  "camera": "{{camera.name}}",
  "confidence": "{{event.confidence}}",
  "timestamp": "{{event.timestamp}}"
}`}
              className="mt-1 h-32 font-mono text-sm"
            />
          </div>
        </div>
      )}

      {/* Create Task */}
      {action.type === 'create_task' && (
        <div className="space-y-4">
          <div>
            <Label>Task Template ID</Label>
            <Select
              value={action.config?.task_template_id || ''}
              onValueChange={(value) => updateConfig('task_template_id', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select task template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety_inspection">Safety Inspection</SelectItem>
                <SelectItem value="equipment_check">Equipment Check</SelectItem>
                <SelectItem value="incident_response">Incident Response</SelectItem>
                <SelectItem value="maintenance_task">Maintenance Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Assign To</Label>
            <Select
              value={action.config?.assign_to || ''}
              onValueChange={(value) => updateConfig('assign_to', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety_manager">Safety Manager</SelectItem>
                <SelectItem value="facility_manager">Facility Manager</SelectItem>
                <SelectItem value="security_team">Security Team</SelectItem>
                <SelectItem value="maintenance_crew">Maintenance Crew</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Escalation */}
      {action.type === 'escalate' && (
        <div className="space-y-4">
          <div>
            <Label>Escalation Target</Label>
            <Select
              value={action.config?.escalation_target || ''}
              onValueChange={(value) => updateConfig('escalation_target', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select escalation target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor">Direct Supervisor</SelectItem>
                <SelectItem value="manager">Department Manager</SelectItem>
                <SelectItem value="admin">System Administrator</SelectItem>
                <SelectItem value="emergency">Emergency Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* IoT Action */}
      {action.type === 'iot_action' && (
        <div className="space-y-4">
          <div>
            <Label>IoT Device</Label>
            <Select
              value={action.config?.iot_device_id || ''}
              onValueChange={(value) => updateConfig('iot_device_id', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select IoT device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency_lights">Emergency Lights</SelectItem>
                <SelectItem value="security_alarm">Security Alarm</SelectItem>
                <SelectItem value="access_control">Access Control System</SelectItem>
                <SelectItem value="ventilation">Ventilation System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Command</Label>
            <Input
              value={action.config?.iot_command || ''}
              onChange={(e) => updateConfig('iot_command', e.target.value)}
              placeholder="e.g., turn_on, activate, lock, unlock"
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Advanced Options</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Require Acknowledgment</Label>
                <p className="text-xs text-slate-500">Action needs manual confirmation</p>
              </div>
              <Switch
                checked={action.config?.require_acknowledgment || false}
                onCheckedChange={(checked) => updateConfig('require_acknowledgment', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Continue on Failure</Label>
                <p className="text-xs text-slate-500">Don't stop workflow if this action fails</p>
              </div>
              <Switch
                checked={action.config?.continue_on_failure || false}
                onCheckedChange={(checked) => updateConfig('continue_on_failure', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
