import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Plus, 
  Trash2, 
  Save,
  Sparkles, 
  Camera, 
  Eye, 
  AlertCircle,
  Settings,
  Target,
  Clock,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { TaskValidationRule } from '@/api/entities';

export default function AITaskRulesModal({ onClose, organization }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    task_category: 'garbage_collection',
    zone_types: [],
    detection_requirements: {
      primary_objects: [],
      secondary_objects: [],
      movement_pattern: 'dwell',
      duration_requirement: 30,
      sequence_required: false
    },
    validation_logic: '',
    confidence_thresholds: {
      auto_complete: 0.85,
      manual_prompt: 0.70,
      supervisor_alert: 0.50
    },
    time_constraints: {
      allowed_windows: [],
      deadline_buffer: 30
    },
    escalation_rules: {
      no_detection_action: 'alert_worker',
      low_confidence_action: 'request_manual',
      camera_offline_action: 'switch_manual'
    },
    is_active: true
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const rulesData = await TaskValidationRule.filter({ organization_id: organization?.id });
      setRules(rulesData);
    } catch (error) {
      console.error('Error loading validation rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setNewRule({
      rule_name: '',
      task_category: 'garbage_collection',
      zone_types: [],
      detection_requirements: {
        primary_objects: [],
        secondary_objects: [],
        movement_pattern: 'dwell',
        duration_requirement: 30,
        sequence_required: false
      },
      validation_logic: '',
      confidence_thresholds: {
        auto_complete: 0.85,
        manual_prompt: 0.70,
        supervisor_alert: 0.50
      },
      time_constraints: {
        allowed_windows: [],
        deadline_buffer: 30
      },
      escalation_rules: {
        no_detection_action: 'alert_worker',
        low_confidence_action: 'request_manual',
        camera_offline_action: 'switch_manual'
      },
      is_active: true
    });
    setShowCreateForm(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setNewRule({...rule});
    setShowCreateForm(true);
  };

  const handleSaveRule = async () => {
    try {
      const ruleData = {
        ...newRule,
        organization_id: organization?.id
      };

      if (editingRule) {
        await TaskValidationRule.update(editingRule.id, ruleData);
      } else {
        await TaskValidationRule.create(ruleData);
      }

      setShowCreateForm(false);
      setEditingRule(null);
      loadRules();
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (confirm('Are you sure you want to delete this validation rule?')) {
      try {
        await TaskValidationRule.delete(ruleId);
        loadRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const taskCategoryOptions = [
    { value: 'garbage_collection', label: 'Garbage Collection', icon: '🗑️' },
    { value: 'equipment_cleaning', label: 'Equipment Cleaning', icon: '🧽' },
    { value: 'vehicle_departure', label: 'Vehicle Departure', icon: '🚛' },
    { value: 'area_clearing', label: 'Area Clearing', icon: '📦' },
    { value: 'ppe_compliance', label: 'PPE Compliance', icon: '🦺' },
    { value: 'equipment_positioning', label: 'Equipment Positioning', icon: '🚜' },
    { value: 'quality_inspection', label: 'Quality Inspection', icon: '🔍' },
    { value: 'safety_check', label: 'Safety Check', icon: '⚠️' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'custom', label: 'Custom Rule', icon: '⚙️' }
  ];

  const predefinedObjects = [
    'person', 'garbage_bag', 'cleaning_supplies', 'vehicle', 'forklift', 
    'hard_hat', 'safety_vest', 'tools', 'package', 'equipment'
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="animate-pulse bg-white rounded-xl p-8">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              AI Task Validation Rules
            </h2>
            <p className="text-slate-600 mt-1">
              Configure intelligent rules for automatic task validation
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!showCreateForm && (
              <Button onClick={handleCreateRule} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {showCreateForm ? (
            <RuleForm
              rule={newRule}
              setRule={setNewRule}
              taskCategoryOptions={taskCategoryOptions}
              predefinedObjects={predefinedObjects}
              onSave={handleSaveRule}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingRule(null);
              }}
              isEditing={!!editingRule}
            />
          ) : (
            <RulesList
              rules={rules}
              taskCategoryOptions={taskCategoryOptions}
              onEdit={handleEditRule}
              onDelete={handleDeleteRule}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Rule Form Component
function RuleForm({ rule, setRule, taskCategoryOptions, predefinedObjects, onSave, onCancel, isEditing }) {
  const addObject = (objectType, objectName) => {
    if (!rule.detection_requirements[objectType].includes(objectName)) {
      setRule({
        ...rule,
        detection_requirements: {
          ...rule.detection_requirements,
          [objectType]: [...rule.detection_requirements[objectType], objectName]
        }
      });
    }
  };

  const removeObject = (objectType, objectName) => {
    setRule({
      ...rule,
      detection_requirements: {
        ...rule.detection_requirements,
        [objectType]: rule.detection_requirements[objectType].filter(obj => obj !== objectName)
      }
    });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Validation Rule' : 'Create New Validation Rule'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="detection">Detection</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">Rule Name *</Label>
                <Input
                  id="rule_name"
                  value={rule.rule_name}
                  onChange={(e) => setRule({...rule, rule_name: e.target.value})}
                  placeholder="Kitchen Garbage Collection Rule"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task_category">Task Category *</Label>
                <Select value={rule.task_category} onValueChange={(value) => setRule({...rule, task_category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskCategoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validation_logic">Validation Logic</Label>
              <Textarea
                id="validation_logic"
                value={rule.validation_logic}
                onChange={(e) => setRule({...rule, validation_logic: e.target.value})}
                placeholder="IF person detected AND garbage bag detected AND movement toward exit THEN mark task complete"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="detection" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Primary Objects (Required)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {rule.detection_requirements.primary_objects.map(obj => (
                    <Badge key={obj} className="bg-red-100 text-red-800">
                      {obj}
                      <button
                        onClick={() => removeObject('primary_objects', obj)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => addObject('primary_objects', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add primary object" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedObjects.map(obj => (
                      <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Secondary Objects (Optional)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {rule.detection_requirements.secondary_objects.map(obj => (
                    <Badge key={obj} className="bg-blue-100 text-blue-800">
                      {obj}
                      <button
                        onClick={() => removeObject('secondary_objects', obj)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => addObject('secondary_objects', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add secondary object" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedObjects.map(obj => (
                      <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Movement Pattern</Label>
                <Select 
                  value={rule.detection_requirements.movement_pattern} 
                  onValueChange={(value) => setRule({
                    ...rule, 
                    detection_requirements: {
                      ...rule.detection_requirements, 
                      movement_pattern: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enter">Enter Zone</SelectItem>
                    <SelectItem value="exit">Exit Zone</SelectItem>
                    <SelectItem value="dwell">Stay in Zone</SelectItem>
                    <SelectItem value="pass_through">Pass Through</SelectItem>
                    <SelectItem value="stationary">Stationary</SelectItem>
                    <SelectItem value="interaction">Object Interaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration Requirement (seconds)</Label>
                <Input
                  type="number"
                  value={rule.detection_requirements.duration_requirement}
                  onChange={(e) => setRule({
                    ...rule,
                    detection_requirements: {
                      ...rule.detection_requirements,
                      duration_requirement: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="thresholds" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Auto-Complete Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={rule.confidence_thresholds.auto_complete}
                    onChange={(e) => setRule({
                      ...rule,
                      confidence_thresholds: {
                        ...rule.confidence_thresholds,
                        auto_complete: parseFloat(e.target.value)
                      }
                    })}
                  />
                  <span className="text-sm text-slate-500">
                    {Math.round(rule.confidence_thresholds.auto_complete * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">Task completes automatically above this confidence</p>
              </div>

              <div className="space-y-2">
                <Label>Manual Prompt Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={rule.confidence_thresholds.manual_prompt}
                    onChange={(e) => setRule({
                      ...rule,
                      confidence_thresholds: {
                        ...rule.confidence_thresholds,
                        manual_prompt: parseFloat(e.target.value)
                      }
                    })}
                  />
                  <span className="text-sm text-slate-500">
                    {Math.round(rule.confidence_thresholds.manual_prompt * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">Worker gets manual validation prompt</p>
              </div>

              <div className="space-y-2">
                <Label>Supervisor Alert Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={rule.confidence_thresholds.supervisor_alert}
                    onChange={(e) => setRule({
                      ...rule,
                      confidence_thresholds: {
                        ...rule.confidence_thresholds,
                        supervisor_alert: parseFloat(e.target.value)
                      }
                    })}
                  />
                  <span className="text-sm text-slate-500">
                    {Math.round(rule.confidence_thresholds.supervisor_alert * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">Supervisor gets notified below this confidence</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="escalation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>No Detection Action</Label>
                <Select 
                  value={rule.escalation_rules.no_detection_action}
                  onValueChange={(value) => setRule({
                    ...rule,
                    escalation_rules: {
                      ...rule.escalation_rules,
                      no_detection_action: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alert_worker">Alert Worker</SelectItem>
                    <SelectItem value="alert_supervisor">Alert Supervisor</SelectItem>
                    <SelectItem value="auto_escalate">Auto Escalate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Low Confidence Action</Label>
                <Select 
                  value={rule.escalation_rules.low_confidence_action}
                  onValueChange={(value) => setRule({
                    ...rule,
                    escalation_rules: {
                      ...rule.escalation_rules,
                      low_confidence_action: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="request_manual">Request Manual</SelectItem>
                    <SelectItem value="supervisor_review">Supervisor Review</SelectItem>
                    <SelectItem value="auto_retry">Auto Retry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Camera Offline Action</Label>
                <Select 
                  value={rule.escalation_rules.camera_offline_action}
                  onValueChange={(value) => setRule({
                    ...rule,
                    escalation_rules: {
                      ...rule.escalation_rules,
                      camera_offline_action: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="switch_manual">Switch to Manual</SelectItem>
                    <SelectItem value="use_backup_camera">Use Backup Camera</SelectItem>
                    <SelectItem value="alert_maintenance">Alert Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Rules List Component
function RulesList({ rules, taskCategoryOptions, onEdit, onDelete }) {
  if (rules.length === 0) {
    return (
      <Card className="border-2 border-dashed border-slate-200">
        <CardContent className="text-center py-16">
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Validation Rules</h3>
          <p className="text-slate-500 mb-4">
            Create your first AI validation rule to start automating task completion.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => {
        const category = taskCategoryOptions.find(c => c.value === rule.task_category);
        return (
          <Card key={rule.id} className="border-2 hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category?.icon || '⚙️'}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{rule.rule_name}</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {category?.label || rule.task_category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(rule)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Detection Objects</p>
                  <div className="flex flex-wrap gap-1">
                    {rule.detection_requirements?.primary_objects?.slice(0, 3).map(obj => (
                      <Badge key={obj} variant="outline" className="text-xs">{obj}</Badge>
                    ))}
                    {rule.detection_requirements?.primary_objects?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{rule.detection_requirements.primary_objects.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Auto-Complete Threshold</p>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold text-green-600">
                      {Math.round((rule.confidence_thresholds?.auto_complete || 0.85) * 100)}%
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Usage</p>
                  <div className="text-lg font-semibold text-slate-700">
                    {rule.usage_frequency || 0} times
                  </div>
                </div>
              </div>

              {rule.validation_logic && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Validation Logic:</p>
                  <p className="text-sm text-slate-700 font-mono">{rule.validation_logic}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}