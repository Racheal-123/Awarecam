
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  X, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Save,
  Sparkles, 
  Camera, 
  Eye, 
  AlertCircle,
  CheckSquare,
  FileImage, 
  Video, 
  PenTool, 
  GripVertical
} from 'lucide-react';

// New Component for a single step
const WorkflowStep = ({ step, index, handleStepChange, removeStep, moveStep, totalSteps }) => {
  const stepIcons = {
    checklist: <CheckSquare className="w-5 h-5 text-indigo-600" />,
    photo_required: <FileImage className="w-5 h-5 text-sky-600" />,
    video_required: <Video className="w-5 h-5 text-rose-600" />,
    signature_required: <PenTool className="w-5 h-5 text-amber-600" />,
    camera_validation: <Camera className="w-5 h-5 text-teal-600" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm space-y-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveStep(index, -1)} disabled={index === 0}>
              <ChevronUp className="w-5 h-5" />
            </Button>
            <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveStep(index, 1)} disabled={index === totalSteps - 1}>
              <ChevronDown className="w-5 h-5" />
            </Button>
          </div>
          <div className='flex-1'>
            <h4 className="font-semibold text-lg text-slate-800 flex items-center gap-3">
              {stepIcons[step.step_type] || <CheckSquare className="w-5 h-5 text-gray-500" />}
              Step {index + 1}: {step.title || 'New Step'}
            </h4>
            <p className="text-sm text-slate-500">Define the action and validation for this step.</p>
          </div>
        </div>
        <Button type="button" variant="destructive" size="sm" onClick={() => removeStep(index)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`step-title-${index}`}>Title *</Label>
          <Input
            id={`step-title-${index}`}
            value={step.title}
            onChange={(e) => handleStepChange(index, 'title', e.target.value)}
            placeholder="e.g., 'Inspect Fire Extinguisher'"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`step-type-${index}`}>Step Type</Label>
          <Select
            value={step.step_type}
            onValueChange={(val) => handleStepChange(index, 'step_type', val)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="checklist">Checklist</SelectItem>
              <SelectItem value="photo_required">Photo Required</SelectItem>
              <SelectItem value="video_required">Video Required</SelectItem>
              <SelectItem value="signature_required">Signature Required</SelectItem>
              <SelectItem value="camera_validation">AI Camera Validation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`step-desc-${index}`}>Description</Label>
        <Textarea
          id={`step-desc-${index}`}
          value={step.description}
          onChange={(e) => handleStepChange(index, 'description', e.target.value)}
          placeholder="Provide clear instructions for the user..."
          rows={2}
        />
      </div>

      {/* Step-specific options */}
      <AnimatePresence>
        {step.step_type === 'checklist' && (
          <motion.div 
            key="checklist-options"
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="space-y-2 overflow-hidden"
          >
            <Label>Checklist Options (one per line)</Label>
            <Textarea
              value={step.checklist_options?.join('\n') || ''}
              onChange={(e) => handleStepChange(index, 'checklist_options', e.target.value.split('\n').filter(Boolean))}
              placeholder="Pressure gauge is in the green&#x0A;Pin and tamper seal are intact&#x0A;No visible damage or rust"
              rows={3}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {step.step_type === 'camera_validation' && (
          <motion.div
            key="camera-validation-config"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg space-y-4 overflow-hidden"
          >
            <h5 className="font-semibold text-blue-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600"/>
              AI Validation Configuration
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Camera/Zone</Label>
                <Select 
                  value={step.zone_name}
                  onValueChange={(val) => handleStepChange(index, 'zone_name', val)}>
                  <SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kitchen Zone">Kitchen Zone: ✓ Garbage, ✓ Cleaning</SelectItem>
                    <SelectItem value="Loading Dock">Loading Dock: ✓ Vehicle, ✓ Safety</SelectItem>
                    <SelectItem value="Office Area">Office Area: ⚠️ Manual recommended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>AI Detection Rule</Label>
                <Select 
                  value={step.ai_rule_configuration?.objects_to_detect?.[0] || ''}
                  onValueChange={(val) => handleStepChange(index, 'ai_rule_configuration', { ...step.ai_rule_configuration, objects_to_detect: [val] })}>
                  <SelectTrigger><SelectValue placeholder="Select Rule" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="garbage_collection">Garbage Collection</SelectItem>
                    <SelectItem value="ppe_compliance">PPE Compliance</SelectItem>
                    <SelectItem value="forklift_parked">Forklift Parked</SelectItem>
                    <SelectItem value="area_clear">Area Clear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4"/>
              <span>Based on your zone, specific AI validations are available.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Switch
            id={`mandatory-${index}`}
            checked={step.is_mandatory}
            onCheckedChange={(checked) => handleStepChange(index, 'is_mandatory', checked)}
          />
          <Label htmlFor={`mandatory-${index}`}>Mandatory Step</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`approval-${index}`}
            checked={step.requires_approval}
            onCheckedChange={(checked) => handleStepChange(index, 'requires_approval', checked)}
          />
          <Label htmlFor={`approval-${index}`}>Requires Supervisor Approval</Label>
        </div>
      </div>
    </motion.div>
  );
};


export default function WorkflowBuilder({ template, organization, onComplete, onCancel }) {
  const [workflowData, setWorkflowData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    template_category: template?.template_category || 'custom',
    industry_type: template?.industry_type || organization?.industry_type || 'other',
    estimated_duration: template?.estimated_duration || 30,
    priority: template?.priority || 'medium',
    steps: template?.steps || [],
    required_skills: template?.required_skills || [],
    required_certifications: template?.required_certifications || [],
    is_active: template?.is_active !== undefined ? template.is_active : true
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const handleStepChange = (index, field, value) => {
    const newSteps = [...workflowData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setWorkflowData({ ...workflowData, steps: newSteps });
  };

  const addStep = () => {
    const newStep = {
      step_number: workflowData.steps.length + 1,
      title: '',
      description: '',
      step_type: 'checklist',
      is_mandatory: true,
      requires_approval: false,
      checklist_options: [],
      // camera_id and zone_name are now handled directly within the step or derived from AI config
      // validation_method is implicitly handled by step_type
      ai_rule_configuration: {
        objects_to_detect: [],
        movement_pattern: 'dwell',
        confidence_threshold: 0.85
      }
    };
    setWorkflowData(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const removeStep = (index) => {
    const newSteps = workflowData.steps.filter((_, i) => i !== index);
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      step_number: i + 1
    }));
    setWorkflowData({ ...workflowData, steps: renumberedSteps });
  };

  const moveStep = (index, direction) => {
    const newSteps = [...workflowData.steps];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < newSteps.length) {
      const [movedStep] = newSteps.splice(index, 1);
      newSteps.splice(newIndex, 0, movedStep);
      const renumberedSteps = newSteps.map((step, i) => ({
        ...step,
        step_number: i + 1
      }));
      setWorkflowData({ ...workflowData, steps: renumberedSteps });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      ...workflowData,
      organization_id: organization?.id,
      approval_status: (template && template.id) ? template.approval_status : 'draft'
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !workflowData.required_skills.includes(newSkill.trim())) {
      setWorkflowData({
        ...workflowData,
        required_skills: [...workflowData.required_skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setWorkflowData({
      ...workflowData,
      required_skills: workflowData.required_skills.filter(s => s !== skill)
    });
  };

  const addCertification = () => {
    if (newCertification.trim() && !workflowData.required_certifications.includes(newCertification.trim())) {
      setWorkflowData({
        ...workflowData,
        required_certifications: [...workflowData.required_certifications, newCertification.trim()]
      });
      setNewCertification('');
    }
  };

  const removeCertification = (cert) => {
    setWorkflowData({
      ...workflowData,
      required_certifications: workflowData.required_certifications.filter(c => c !== cert)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[95vh] bg-slate-50 rounded-2xl flex flex-col"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0 pt-6 px-6 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  {template?.id ? 'Edit Workflow Template' : 'Create Workflow Template'}
                </CardTitle>
                <CardDescription>
                  Build a structured, reusable process for your team.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <nav className="w-1/4 p-6 border-r bg-white">
              <div className="space-y-2">
                <Button 
                  type="button" 
                  variant={activeTab === 'details' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('details')}
                >
                  Template Details
                </Button>
                <Button 
                  type="button" 
                  variant={activeTab === 'steps' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('steps')}
                >
                  Workflow Steps
                </Button>
                <Button 
                  type="button" 
                  variant={activeTab === 'requirements' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('requirements')}
                >
                  Requirements
                </Button>
              </div>
            </nav>

            {/* Main Content */}
            <main className="w-3/4 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-slate-900">Basic Information</h3>
                      {/* Form fields for details from original component */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Template Name *</Label>
                          <Input
                            id="name"
                            value={workflowData.name}
                            onChange={(e) => setWorkflowData({...workflowData, name: e.target.value})}
                            placeholder="Daily Safety Inspection"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select value={workflowData.template_category} onValueChange={(value) => setWorkflowData({...workflowData, template_category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="safety">Safety</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="cleaning">Cleaning</SelectItem>
                              <SelectItem value="inspection">Inspection</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="quality">Quality</SelectItem>
                              <SelectItem value="compliance">Compliance</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={workflowData.description}
                          onChange={(e) => setWorkflowData({...workflowData, description: e.target.value})}
                          placeholder="Describe what this workflow template is for..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={workflowData.estimated_duration}
                            onChange={(e) => setWorkflowData({...workflowData, estimated_duration: parseInt(e.target.value) || 0})}
                            placeholder="30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={workflowData.priority} onValueChange={(value) => setWorkflowData({...workflowData, priority: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry Type</Label>
                          <Select value={workflowData.industry_type} onValueChange={(value) => setWorkflowData({...workflowData, industry_type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="office">Office</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="hospitality">Hospitality</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'steps' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-semibold text-slate-900">Workflow Steps</h3>
                           <p className="text-sm text-slate-500">{workflowData.steps.length} steps defined</p>
                        </div>
                        <Button type="button" onClick={addStep} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Add Step
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <AnimatePresence>
                          {workflowData.steps.map((step, index) => (
                            <WorkflowStep 
                              key={index}
                              step={step}
                              index={index}
                              handleStepChange={handleStepChange}
                              removeStep={removeStep}
                              moveStep={moveStep}
                              totalSteps={workflowData.steps.length}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                      
                      {workflowData.steps.length === 0 && (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-xl">
                          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <h4 className="font-semibold text-lg text-slate-600">No steps defined yet.</h4>
                          <p>Click "Add Step" to build your workflow.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'requirements' && (
                     <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-slate-900">Requirements & Status</h3>
                         {/* Form fields for requirements from original component */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Required Skills */}
                          <div className="space-y-3">
                            <Label>Required Skills</Label>
                            <div className="flex gap-2">
                              <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a skill..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                              />
                              <Button type="button" onClick={addSkill} size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[2rem]">
                              {workflowData.required_skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Required Certifications */}
                          <div className="space-y-3">
                            <Label>Required Certifications</Label>
                            <div className="flex gap-2">
                              <Input
                                value={newCertification}
                                onChange={(e) => setNewCertification(e.target.value)}
                                placeholder="Add a certification..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                              />
                              <Button type="button" onClick={addCertification} size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[2rem]">
                              {workflowData.required_certifications.map((cert, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {cert}
                                  <button
                                    type="button"
                                    onClick={() => removeCertification(cert)}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center space-x-2 pt-6 border-t">
                          <Switch
                            id="is_active"
                            checked={workflowData.is_active}
                            onCheckedChange={(checked) => setWorkflowData({...workflowData, is_active: checked})}
                          />
                          <Label htmlFor="is_active">Template is active and available for use</Label>
                        </div>
                     </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          <div className="flex-shrink-0 flex justify-end gap-3 p-6 border-t bg-white">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {template?.id ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
