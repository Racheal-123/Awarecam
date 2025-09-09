import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { EmployeeRole } from '@/api/entities';

export default function CreateEmployeeRoleModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    role_name: '',
    role_display_name: '',
    role_description: '',
    industry_context: [],
    safety_risk_level: 'medium',
    role_hierarchy_level: 1,
    average_task_load: 5
  });
  const [loading, setLoading] = useState(false);

  const industries = [
    'warehouse', 'manufacturing', 'healthcare', 'retail', 
    'hospitality', 'transportation', 'education', 'office'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roleData = {
        ...formData,
        default_workflows: [],
        required_certifications: [],
        camera_zone_access: [],
        ai_agent_interactions: [],
        typical_shift_patterns: ['Day Shift']
      };

      await EmployeeRole.create(roleData);
      onSuccess();
    } catch (error) {
      console.error('Error creating employee role:', error);
      alert('Failed to create employee role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIndustryChange = (industry, checked) => {
    setFormData(prev => ({
      ...prev,
      industry_context: checked 
        ? [...prev.industry_context, industry]
        : prev.industry_context.filter(i => i !== industry)
    }));
  };

  const generateRoleName = (displayName) => {
    return displayName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Employee Role</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Role Display Name *</Label>
              <Input
                id="display_name"
                value={formData.role_display_name}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange('role_display_name', value);
                  handleChange('role_name', generateRoleName(value));
                }}
                placeholder="e.g., Forklift Operator"
                required
              />
            </div>

            <div>
              <Label htmlFor="role_name">Internal Role Name</Label>
              <Input
                id="role_name"
                value={formData.role_name}
                onChange={(e) => handleChange('role_name', e.target.value)}
                placeholder="Auto-generated"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="risk_level">Safety Risk Level</Label>
              <Select value={formData.safety_risk_level} onValueChange={(value) => handleChange('safety_risk_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hierarchy">Hierarchy Level</Label>
              <Input
                id="hierarchy"
                type="number"
                min="1"
                max="5"
                value={formData.role_hierarchy_level}
                onChange={(e) => handleChange('role_hierarchy_level', parseInt(e.target.value) || 1)}
                placeholder="1 = Staff, 2 = Supervisor, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Role Description *</Label>
            <Textarea
              id="description"
              value={formData.role_description}
              onChange={(e) => handleChange('role_description', e.target.value)}
              placeholder="Describe the responsibilities and duties of this role..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Industry Context</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {industries.map(industry => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={industry}
                    checked={formData.industry_context.includes(industry)}
                    onCheckedChange={(checked) => handleIndustryChange(industry, checked)}
                  />
                  <Label htmlFor={industry} className="capitalize text-sm">
                    {industry}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="task_load">Average Daily Task Load</Label>
            <Input
              id="task_load"
              type="number"
              min="1"
              max="20"
              value={formData.average_task_load}
              onChange={(e) => handleChange('average_task_load', parseInt(e.target.value) || 5)}
              placeholder="5"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}