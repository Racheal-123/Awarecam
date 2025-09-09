import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Camera, 
  Eye, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Settings,
  Target,
  Clock,
  MapPin,
  Shield,
  Users,
  Trash,
  HardHat,
  Package,
  Truck
} from 'lucide-react';

const VALIDATION_TYPES = [
  {
    id: 'ai_auto',
    name: 'AI Auto-Validation',
    description: 'Camera detects and automatically completes task',
    icon: Zap,
    color: 'green'
  },
  {
    id: 'ai_hybrid',
    name: 'AI + Manual Hybrid',
    description: 'AI detects activity, worker confirms completion',
    icon: Eye,
    color: 'blue'
  },
  {
    id: 'manual',
    name: 'Manual Only',
    description: 'Worker provides photo/video evidence',
    icon: Users,
    color: 'gray'
  }
];

const TASK_TEMPLATES = {
  garbage_collection: {
    name: 'Garbage Collection',
    icon: Trash,
    defaultObjects: ['person', 'garbage_bag'],
    defaultMovement: 'exit',
    defaultConfidence: 0.85,
    description: 'AI detects person removing garbage bags'
  },
  ppe_compliance: {
    name: 'PPE Compliance',
    icon: HardHat,
    defaultObjects: ['person', 'hard_hat', 'safety_vest'],
    defaultMovement: 'dwell',
    defaultConfidence: 0.90,
    description: 'AI verifies required safety equipment'
  },
  equipment_cleaning: {
    name: 'Equipment Cleaning',
    icon: Settings,
    defaultObjects: ['person', 'cleaning_supplies', 'equipment'],
    defaultMovement: 'interaction',
    defaultConfidence: 0.80,
    description: 'AI detects cleaning activity and supplies'
  },
  vehicle_operations: {
    name: 'Vehicle Operations',
    icon: Truck,
    defaultObjects: ['vehicle', 'person'],
    defaultMovement: 'pass_through',
    defaultConfidence: 0.88,
    description: 'AI monitors vehicle movement and safety'
  }
};

export default function AIValidationSetup({ 
  step, 
  cameras = [], 
  zones = [], 
  onValidationChange,
  initialValidation = {}
}) {
  const [validationType, setValidationType] = useState(initialValidation.validation_method || 'manual');
  const [selectedCamera, setSelectedCamera] = useState(initialValidation.camera_id || '');
  const [selectedZone, setSelectedZone] = useState(initialValidation.zone_name || '');
  const [taskTemplate, setTaskTemplate] = useState(initialValidation.task_template || '');
  const [detectionObjects, setDetectionObjects] = useState(initialValidation.objects_to_detect || []);
  const [movementPattern, setMovementPattern] = useState(initialValidation.movement_pattern || 'dwell');
  const [confidenceThreshold, setConfidenceThreshold] = useState(initialValidation.confidence_threshold || 0.85);
  const [timeWindows, setTimeWindows] = useState(initialValidation.time_windows || []);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  useEffect(() => {
    // Update parent component with validation configuration
    const validationConfig = {
      validation_method: validationType,
      camera_id: selectedCamera,
      zone_name: selectedZone,
      ai_rule_configuration: {
        objects_to_detect: detectionObjects,
        movement_pattern: movementPattern,
        confidence_threshold: confidenceThreshold
      },
      time_windows: timeWindows
    };
    onValidationChange && onValidationChange(validationConfig);
  }, [validationType, selectedCamera, selectedZone, detectionObjects, movementPattern, confidenceThreshold, timeWindows]);

  const handleTemplateSelect = (templateId) => {
    const template = TASK_TEMPLATES[templateId];
    if (template) {
      setTaskTemplate(templateId);
      setDetectionObjects(template.defaultObjects);
      setMovementPattern(template.defaultMovement);
      setConfidenceThreshold(template.defaultConfidence);
      setValidationType('ai_auto');
    }
  };

  const addDetectionObject = (object) => {
    if (!detectionObjects.includes(object)) {
      setDetectionObjects([...detectionObjects, object]);
    }
  };

  const removeDetectionObject = (object) => {
    setDetectionObjects(detectionObjects.filter(obj => obj !== object));
  };

  const availableCameras = cameras.filter(camera => camera.status === 'active');
  const cameraZones = selectedCamera ? 
    zones.filter(zone => zone.camera_id === selectedCamera) : [];

  return (
    <div className="space-y-6">
      {/* Validation Type Selection */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Task Validation Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VALIDATION_TYPES.map((type) => {
              const IconComponent = type.icon;
              return (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    validationType === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setValidationType(type.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={`w-6 h-6 text-${type.color}-600`} />
                    <h4 className="font-semibold">{type.name}</h4>
                  </div>
                  <p className="text-sm text-slate-600">{type.description}</p>
                  {validationType === type.id && (
                    <CheckCircle2 className={`w-5 h-5 text-${type.color}-600 mt-2`} />
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration (only show if AI validation is selected) */}
      {(validationType === 'ai_auto' || validationType === 'ai_hybrid') && (
        <>
          {/* Quick Template Selection */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Quick Setup Templates</CardTitle>
              <p className="text-sm text-slate-600">Choose a pre-configured template for common tasks</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(TASK_TEMPLATES).map(([id, template]) => {
                  const IconComponent = template.icon;
                  return (
                    <motion.div
                      key={id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                        taskTemplate === id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => handleTemplateSelect(id)}
                    >
                      <IconComponent className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <h4 className="font-medium text-sm">{template.name}</h4>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Camera and Zone Selection */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Camera Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Select Camera</Label>
                  <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose monitoring camera..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCameras.map(camera => (
                        <SelectItem key={camera.id} value={camera.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {camera.name} - {camera.location}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Select Zone</Label>
                  <Select 
                    value={selectedZone} 
                    onValueChange={setSelectedZone}
                    disabled={!selectedCamera}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose monitoring zone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cameraZones.map(zone => (
                        <SelectItem key={zone.zone_name} value={zone.zone_name}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {zone.zone_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedCamera && selectedZone && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">AI Validation Available</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This task can be automatically validated by the selected camera and zone.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced AI Configuration */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Detection Configuration
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="advanced-mode" className="text-sm">Advanced Mode</Label>
                  <Switch
                    id="advanced-mode"
                    checked={isAdvancedMode}
                    onCheckedChange={setIsAdvancedMode}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Objects to Detect */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Objects to Detect</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {detectionObjects.map(object => (
                    <Badge 
                      key={object} 
                      className="bg-blue-100 text-blue-800 cursor-pointer"
                      onClick={() => removeDetectionObject(object)}
                    >
                      {object} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['person', 'garbage_bag', 'hard_hat', 'safety_vest', 'cleaning_supplies', 'equipment', 'vehicle', 'forklift'].map(object => (
                    <Button
                      key={object}
                      size="sm"
                      variant="outline"
                      onClick={() => addDetectionObject(object)}
                      disabled={detectionObjects.includes(object)}
                    >
                      + {object}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Movement Pattern */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Movement Pattern</Label>
                <Select value={movementPattern} onValueChange={setMovementPattern}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enter">Enter Zone</SelectItem>
                    <SelectItem value="exit">Exit Zone</SelectItem>
                    <SelectItem value="dwell">Stay in Zone</SelectItem>
                    <SelectItem value="pass_through">Pass Through</SelectItem>
                    <SelectItem value="interaction">Interact with Objects</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence Threshold */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Confidence Threshold: {Math.round(confidenceThreshold * 100)}%
                </Label>
                <Slider
                  value={[confidenceThreshold]}
                  onValueChange={([value]) => setConfidenceThreshold(value)}
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>50% (More detections)</span>
                  <span>100% (Higher accuracy)</span>
                </div>
              </div>

              {/* Advanced Options */}
              {isAdvancedMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 p-4 bg-slate-50 rounded-lg"
                >
                  <h4 className="font-medium">Advanced Detection Rules</h4>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Time Windows (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Start time (e.g., 09:00)" />
                      <Input placeholder="End time (e.g., 17:00)" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Minimum Duration (seconds)</Label>
                    <Input type="number" placeholder="10" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch id="sequence-required" />
                    <Label htmlFor="sequence-required" className="text-sm">
                      Objects must appear in sequence
                    </Label>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Validation Logic Preview */}
          {detectionObjects.length > 0 && (
            <Card className="shadow-lg border-0 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">AI Validation Logic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                  <p className="font-mono text-sm">
                    <strong>IF</strong> ({detectionObjects.join(' AND ')}) detected in {selectedZone || '[zone]'} 
                    <strong> AND</strong> movement pattern is "{movementPattern}"
                    <strong> AND</strong> confidence ≥ {Math.round(confidenceThreshold * 100)}%
                    <br />
                    <strong>THEN</strong> mark task as complete automatically
                  </p>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  This rule will automatically validate the task when the specified conditions are met.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Manual Validation Info */}
      {validationType === 'manual' && (
        <Card className="shadow-lg border-0 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-gray-900">Manual Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-gray-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Worker Evidence Required</p>
                <p className="text-sm text-gray-600 mt-1">
                  Workers will need to provide photo, video, or signature evidence to complete this task.
                  This method is recommended when cameras cannot clearly see the task area or when manual verification is required for compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}