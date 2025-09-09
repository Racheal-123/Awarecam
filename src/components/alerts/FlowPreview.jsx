import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowDown, 
  Bell, 
  Webhook, 
  CheckSquare,
  Zap
} from 'lucide-react';

export default function FlowPreview({ workflow }) {
  const actionIcons = {
    send_notification: <Bell className="w-4 h-4" />,
    trigger_webhook: <Webhook className="w-4 h-4" />,
    create_task: <CheckSquare className="w-4 h-4" />,
    escalate: <AlertTriangle className="w-4 h-4" />,
    iot_action: <Zap className="w-4 h-4" />
  };

  const actionLabels = {
    send_notification: 'Send Notification',
    trigger_webhook: 'Trigger Webhook',
    create_task: 'Create Task',
    escalate: 'Escalate Alert',
    iot_action: 'IoT Action'
  };

  const getTriggerSummary = (trigger) => {
    const conditions = [];
    
    if (trigger.conditions.event_types?.length) {
      conditions.push(`Events: ${trigger.conditions.event_types.join(', ')}`);
    }
    
    if (trigger.conditions.severity_levels?.length) {
      conditions.push(`Severity: ${trigger.conditions.severity_levels.join(', ')}`);
    }
    
    if (trigger.conditions.confidence_min || trigger.conditions.confidence_max) {
      const min = (trigger.conditions.confidence_min || 0) * 100;
      const max = (trigger.conditions.confidence_max || 1) * 100;
      conditions.push(`Confidence: ${min}%-${max}%`);
    }
    
    if (trigger.conditions.camera_ids?.length) {
      conditions.push(`Cameras: ${trigger.conditions.camera_ids.length} selected`);
    }
    
    if (trigger.conditions.zone_names?.length) {
      conditions.push(`Zones: ${trigger.conditions.zone_names.length} selected`);
    }
    
    return conditions.length ? conditions.join(' • ') : 'No conditions set';
  };

  const getActionSummary = (action) => {
    switch (action.type) {
      case 'send_notification':
        const channels = action.config?.channel_ids?.length || 0;
        return `${channels} channel${channels !== 1 ? 's' : ''}`;
      case 'trigger_webhook':
        return action.config?.webhook_url ? 'URL configured' : 'No URL set';
      case 'create_task':
        return action.config?.task_template_id || 'No template selected';
      case 'escalate':
        return action.config?.escalation_target || 'No target set';
      case 'iot_action':
        return action.config?.iot_device_id || 'No device selected';
      default:
        return 'Not configured';
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Flow Preview</h3>
          <p className="text-sm text-slate-600">
            Visual representation of your workflow logic
          </p>
        </div>

        {/* Workflow Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              {workflow.workflow_name || 'Untitled Workflow'}
            </h4>
            {workflow.description && (
              <p className="text-sm text-blue-700">{workflow.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {workflow.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">Priority: {workflow.priority}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Triggers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold">IF Conditions</h4>
          </div>
          
          <div className="space-y-3">
            {workflow.flow_definition.triggers.map((trigger, index) => (
              <div key={index}>
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="text-sm font-medium text-blue-900 mb-1">
                      {trigger.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-blue-700">
                      {getTriggerSummary(trigger)}
                    </div>
                  </CardContent>
                </Card>
                
                {index < workflow.flow_definition.triggers.length - 1 && (
                  <div className="flex justify-center py-1">
                    <Badge className="bg-slate-100 text-slate-700 text-xs">
                      {workflow.flow_definition.logic_operator}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </div>

        {/* Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold">THEN Actions</h4>
          </div>
          
          <div className="space-y-3">
            {workflow.flow_definition.actions
              .sort((a, b) => (a.execution_order || 1) - (b.execution_order || 1))
              .map((action, index) => (
                <Card key={index} className="border-green-200 bg-green-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {actionIcons[action.type]}
                      <span className="text-sm font-medium text-green-900">
                        {actionLabels[action.type]}
                      </span>
                      {action.config?.delay_minutes > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {action.config.delay_minutes}m
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-green-700">
                      {getActionSummary(action)}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Flow Stats */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm">Flow Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Triggers:</span>
                <span className="font-semibold ml-2">
                  {workflow.flow_definition.triggers.length}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Actions:</span>
                <span className="font-semibold ml-2">
                  {workflow.flow_definition.actions.length}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Logic:</span>
                <span className="font-semibold ml-2">
                  {workflow.flow_definition.logic_operator}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Delays:</span>
                <span className="font-semibold ml-2">
                  {workflow.flow_definition.actions.filter(a => a.config?.delay_minutes > 0).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Messages */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h5 className="font-medium text-amber-900 mb-2">Validation</h5>
            <div className="space-y-1 text-sm text-amber-800">
              {!workflow.workflow_name && (
                <div>⚠️ Workflow name is required</div>
              )}
              {workflow.flow_definition.triggers.length === 0 && (
                <div>⚠️ At least one trigger is required</div>
              )}
              {workflow.flow_definition.actions.length === 0 && (
                <div>⚠️ At least one action is required</div>
              )}
              {workflow.flow_definition.actions.some(a => a.type === 'send_notification' && !a.config?.channel_ids?.length) && (
                <div>⚠️ Notification actions need channels selected</div>
              )}
              {workflow.flow_definition.actions.some(a => a.type === 'trigger_webhook' && !a.config?.webhook_url) && (
                <div>⚠️ Webhook actions need URLs configured</div>
              )}
              
              {workflow.workflow_name && 
               workflow.flow_definition.triggers.length > 0 && 
               workflow.flow_definition.actions.length > 0 && (
                <div className="text-green-800">✅ Flow is ready to save</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}