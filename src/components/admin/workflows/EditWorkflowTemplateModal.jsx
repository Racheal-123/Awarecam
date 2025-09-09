import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WorkflowTemplate } from '@/api/entities';

export default function EditWorkflowTemplateModal({ template, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: template.name || '',
    description: template.description || '',
    template_category: template.template_category || '',
    template_complexity: template.template_complexity || 'beginner',
    industry_type: template.industry_type || '',
    estimated_duration: template.estimated_duration || 30,
    estimated_setup_time_minutes: template.estimated_setup_time_minutes || 15,
    prerequisite_cameras: template.prerequisite_cameras || 1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await WorkflowTemplate.update(template.id, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating workflow template:', error);
      alert('Failed to update workflow template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Workflow Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.template_category} onValueChange={(value) => handleChange('template_category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry Type</Label>
              <Select value={formData.industry_type} onValueChange={(value) => handleChange('industry_type', value)}>
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

            <div>
              <Label htmlFor="complexity">Complexity Level</Label>
              <Select value={formData.template_complexity} onValueChange={(value) => handleChange('template_complexity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="cameras">Required Cameras</Label>
              <Input
                id="cameras"
                type="number"
                value={formData.prerequisite_cameras}
                onChange={(e) => handleChange('prerequisite_cameras', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}