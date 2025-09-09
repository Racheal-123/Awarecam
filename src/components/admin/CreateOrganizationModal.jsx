import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Organization } from '@/api/entities';

export default function CreateOrganizationModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    industry_type: '',
    business_description: '',
    employee_count_range: '',
    billing_email: '',
    subscription_plan: 'trial'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await Organization.create({
        ...formData,
        onboarding_completed: false,
        onboarding_step: 1
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization. Please try again.');
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
          <DialogTitle>Create New Organization</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Acme Manufacturing"
                required
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry Type *</Label>
              <Select value={formData.industry_type} onValueChange={(value) => handleChange('industry_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse & Distribution</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employee_count">Employee Count</Label>
              <Select value={formData.employee_count_range} onValueChange={(value) => handleChange('employee_count_range', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="billing_email">Billing Email</Label>
              <Input
                id="billing_email"
                type="email"
                value={formData.billing_email}
                onChange={(e) => handleChange('billing_email', e.target.value)}
                placeholder="billing@company.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              value={formData.business_description}
              onChange={(e) => handleChange('business_description', e.target.value)}
              placeholder="Brief description of the organization and its operations..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="plan">Initial Subscription Plan</Label>
            <Select value={formData.subscription_plan} onValueChange={(value) => handleChange('subscription_plan', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}