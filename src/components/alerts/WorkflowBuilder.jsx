import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  Settings as SettingsIcon,
  GitBranch,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { AlertWorkflow } from '@/api/entities';

import TriggerBuilder from '@/components/alerts/TriggerBuilder';
import ActionBuilder from '@/components/alerts/ActionBuilder';
import FlowPreview from '@/components/alerts/FlowPreview';

export default function WorkflowBuilder({ workflow, channels, onSave, onCancel }) {
  const [workflowData, setWorkflowData] = useState({
    workflow_name: '',
    description: '',
    is_active: true,
    priority: 100,
    flow_definition: {
      triggers: [{ type: 'event_occurs', conditions: {} }],
      logic_operator: 'OR',
      actions: [{ type: 'send_notification', config: {}, execution_order: 1 }],
      modifiers: {}
    },
    ...workflow
  });

  const [activeSection, setActiveSection] = useState('triggers');
  const [showPreview, setShowPreview] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    try {
      const savedWorkflow = await AlertWorkflow.create(workflowData);
      onSave(savedWorkflow);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    // Simulate workflow execution
    setTimeout(() => {
      setIsTesting(false);
      alert('Test completed! Check the preview panel for results.');
    }, 2000);
  };

  const addTrigger = () => {
    setWorkflowData(prev => ({
      ...prev,
      flow_definition: {
        ...prev.flow_definition,
        triggers: [
          ...prev.flow_definition.triggers,
          { type: 'event_occurs', conditions: {} }
        ]
      }
    }));
  };

  const removeTrigger = (index) => {
    setWorkflowData(prev => ({
      ...prev,
      flow_definition: {
        ...prev.flow_definition,
        triggers: prev.flow_definition.triggers.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTrigger = (index, updatedTrigger) => {
    setWorkflowData(prev => ({
      ...prev,
      flow_definition: {
        ...prev.flow_definition,
        triggers: prev.flow_definition.triggers.map((trigger, i) => 
          i === index ? updatedTrigger : trigger
        )
      }
    }));
  };

  const addAction = () => {
    const newOrder = Math.max(...workflowData.flow_definition.actions.map(a => a.execution_order || 1)) + 1;
    setWorkflowData(prev => ({
      ...prev,
      flow_definition: {
        ...prev.flow_definition,
        actions: [
          ...prev.flow_definition.actions,
          { type: 'send_notification', config: {}, execution_order: newOrder }
        ]
      }
    }));
  };

  const removeAction = (index) => {
    setWorkflowData(prev => ({
      ...prev,
      flow_definition: {
        ...prev.flow_definition,
        actions: prev.flow_definition.actions.filter((_, i) => i !== index)
      }
    }));
  };

  const updateAction = (index, updatedAction) => {
    setWorkflowData(prev => ({
      ...prev,
      flow_definition: {
        ...prev.flow_definition,
        actions: prev.flow_definition.actions.map((action, i) => 
          i === index ? updatedAction : action
        )
      }
    }));
  };

  const toggleLogicOperator = () => {
    setWorkflowData(prev => ({
      ...prev,
      flow_definition: {
        ...prev.flow_definition,
        logic_operator: prev.flow_definition.logic_operator === 'AND' ? 'OR' : 'AND'
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-7xl h-[90vh] bg-white rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Flow Builder</h2>
            <p className="text-slate-600">Create automated workflows for your alerts and notifications</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
              className={showPreview ? 'bg-blue-50 border-blue-200' : ''}
            >
              <Zap className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={isTesting}>
              {isTesting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 mr-2"
                >
                  <Play className="w-4 h-4" />
                </motion.div>
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Test Flow
            </Button>
            <Button onClick={onCancel} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Builder Area */}
          <div className="flex-1 flex flex-col">
            {/* Workflow Info */}
            <div className="p-6 border-b bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workflow_name">Workflow Name</Label>
                  <Input
                    id="workflow_name"
                    value={workflowData.workflow_name}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, workflow_name: e.target.value }))}
                    placeholder="e.g., Safety Alert Flow"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={workflowData.description}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this workflow"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Flow Canvas */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-8">
                {/* IF Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">IF (Triggers)</h3>
                      <Badge variant="outline" className="capitalize">
                        {workflowData.flow_definition.logic_operator}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLogicOperator}
                        className="text-xs"
                      >
                        Switch to {workflowData.flow_definition.logic_operator === 'AND' ? 'OR' : 'AND'}
                      </Button>
                    </div>
                    <Button onClick={addTrigger} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Trigger
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {workflowData.flow_definition.triggers.map((trigger, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative"
                      >
                        <Card className="border-2 border-blue-200 bg-blue-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-blue-900">
                                Trigger {index + 1}
                              </h4>
                              {workflowData.flow_definition.triggers.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeTrigger(index)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <TriggerBuilder
                              trigger={trigger}
                              onChange={(updatedTrigger) => updateTrigger(index, updatedTrigger)}
                            />
                          </CardContent>
                        </Card>
                        
                        {/* Logic Operator Between Triggers */}
                        {index < workflowData.flow_definition.triggers.length - 1 && (
                          <div className="flex justify-center py-2">
                            <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                              {workflowData.flow_definition.logic_operator}
                            </Badge>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ↓
                    </motion.div>
                  </div>
                </div>

                {/* THEN Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">THEN (Actions)</h3>
                    </div>
                    <Button onClick={addAction} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Action
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {workflowData.flow_definition.actions
                      .sort((a, b) => (a.execution_order || 1) - (b.execution_order || 1))
                      .map((action, index) => (
                        <motion.div
                          key={index}
                          layout
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className="border-2 border-green-200 bg-green-50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-green-900">
                                  Action {action.execution_order || index + 1}
                                  {action.config?.delay_minutes > 0 && (
                                    <Badge variant="outline" className="ml-2">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {action.config.delay_minutes}m delay
                                    </Badge>
                                  )}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAction(index)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <ActionBuilder
                                action={action}
                                channels={channels}
                                onChange={(updatedAction) => updateAction(index, updatedAction)}
                              />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={workflowData.is_active}
                  onChange={(e) => setWorkflowData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Active workflow</Label>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Workflow
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l bg-slate-50 overflow-hidden"
              >
                <FlowPreview workflow={workflowData} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}