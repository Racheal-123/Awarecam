import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock } from 'lucide-react';
import { AlertWorkflow } from '@/api/entities';
import { AgentAlertChannel } from '@/api/entities';
import { useUser } from '@/pages/Layout';

export default function WorkflowForm({ workflow, agents, onComplete, onCancel }) {
  const { organization } = useUser();
  const [channels, setChannels] = useState([]);
  const [formData, setFormData] = useState({
    workflow_name: workflow?.workflow_name || '',
    triggering_agent_id: workflow?.triggering_agent_id || '',
    trigger_conditions: workflow?.trigger_conditions || {
      event_types: [],
      severity_levels: ['medium', 'high', 'critical'],
      confidence_gt: 0.8
    },
    escalation_policy: workflow?.escalation_policy || [
      { delay_minutes: 0, channel_ids: [] }
    ],
    use_user_preferences: workflow?.use_user_preferences ?? true,
    is_active: workflow?.is_active ?? true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChannels();
  }, [organization]);

  const loadChannels = async () => {
    try {
      const channelList = await AgentAlertChannel.filter({ 
        organization_id: organization.id,
        is_active: true 
      });
      setChannels(channelList);
    } catch (error) {
      console.error('Failed to load channels:', error);
      setChannels([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const workflowData = {
        ...formData,
        organization_id: organization.id
      };

      if (workflow?.id) {
        await AlertWorkflow.update(workflow.id, workflowData);
      } else {
        await AlertWorkflow.create(workflowData);
      }
      
      onComplete();
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  const addEscalationStep = () => {
    setFormData(prev => ({
      ...prev,
      escalation_policy: [
        ...prev.escalation_policy,
        { delay_minutes: 15, channel_ids: [] }
      ]
    }));
  };

  const removeEscalationStep = (index) => {
    setFormData(prev => ({
      ...prev,
      escalation_policy: prev.escalation_policy.filter((_, i) => i !== index)
    }));
  };

  const updateEscalationStep = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      escalation_policy: prev.escalation_policy.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const updateTriggerCondition = (field, value) => {
    setFormData(prev => ({
      ...prev,
      trigger_conditions: {
        ...prev.trigger_conditions,
        [field]: value
      }
    }));
  };

  const eventTypes = [
    'motion_detected',
    'person_detected',
    'vehicle_detected',
    'intrusion_alert',
    'safety_violation',
    'system_alert',
    'ppe_compliance_violation',
    'fire_smoke_detected',
    'weapon_detected'
  ];

  const severityLevels = ['low', 'medium', 'high', 'critical'];

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workflow ? 'Edit Alert Workflow' : 'Create Alert Workflow'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow_name">Workflow Name</Label>
              <Input
                id="workflow_name"
                value={formData.workflow_name}
                onChange={(e) => setFormData(prev => ({ ...prev, workflow_name: e.target.value }))}
                placeholder="Safety Alert Workflow"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="triggering_agent">Triggering AI Agent</Label>
              <Select
                value={formData.triggering_agent_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, triggering_agent_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an AI agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trigger Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trigger Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Event Types (leave empty for all)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {eventTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={formData.trigger_conditions.event_types.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = formData.trigger_conditions.event_types;
                        const updated = current.includes(type)
                          ? current.filter(t => t !== type)
                          : [...current, type];
                        updateTriggerCondition('event_types', updated);
                      }}
                    >
                      {type.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Severity Levels</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {severityLevels.map((level) => (
                    <Badge
                      key={level}
                      variant={formData.trigger_conditions.severity_levels.includes(level) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        const current = formData.trigger_conditions.severity_levels;
                        const updated = current.includes(level)
                          ? current.filter(l => l !== level)
                          : [...current, level];
                        updateTriggerCondition('severity_levels', updated);
                      }}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="confidence_threshold">Minimum Confidence Threshold</Label>
                <Input
                  id="confidence_threshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.trigger_conditions.confidence_gt}
                  onChange={(e) => updateTriggerCondition('confidence_gt', parseFloat(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Escalation Policy */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Escalation Policy</CardTitle>
                <Button type="button" size="sm" onClick={addEscalationStep}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.escalation_policy.map((step, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Step {index + 1}</h4>
                    {formData.escalation_policy.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeEscalationStep(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Delay (minutes)</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <Input
                          type="number"
                          min="0"
                          value={step.delay_minutes}
                          onChange={(e) => updateEscalationStep(index, 'delay_minutes', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Alert Channels</Label>
                      <Select
                        value=""
                        onValueChange={(channelId) => {
                          const currentIds = step.channel_ids;
                          if (!currentIds.includes(channelId)) {
                            updateEscalationStep(index, 'channel_ids', [...currentIds, channelId]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {channels
                            .filter(c => !step.channel_ids.includes(c.id))
                            .map((channel) => (
                            <SelectItem key={channel.id} value={channel.id}>
                              {channel.channel_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {step.channel_ids.map((channelId) => {
                          const channel = channels.find(c => c.id === channelId);
                          return channel ? (
                            <Badge
                              key={channelId}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => updateEscalationStep(
                                index,
                                'channel_ids',
                                step.channel_ids.filter(id => id !== channelId)
                              )}
                            >
                              {channel.channel_name} ✕
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use_user_preferences"
                  checked={formData.use_user_preferences}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_user_preferences: checked }))}
                />
                <Label htmlFor="use_user_preferences">Respect user notification preferences</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Workflow is active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : (workflow ? 'Update Workflow' : 'Create Workflow')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}