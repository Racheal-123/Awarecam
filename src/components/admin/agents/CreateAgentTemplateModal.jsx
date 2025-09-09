import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AIAgent } from '@/api/entities';

export default function CreateAgentTemplateModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    category: '',
    pricing_tier: 'core',
    base_price_annual: 0,
    model_version: '1.0',
    industry_focus: [],
    agent_type: 'detection'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AIAgent.create({
        ...formData,
        is_active: true,
        is_beta: false,
        key_features: []
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating agent template:', error);
      alert('Failed to create agent template. Please try again.');
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
          <DialogTitle>Create New AI Agent Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Internal Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., forklift_safety_detector"
                required
              />
            </div>

            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="e.g., Forklift Safety Monitor"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pricing_tier">Pricing Tier *</Label>
              <Select value={formData.pricing_tier} onValueChange={(value) => handleChange('pricing_tier', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="base_price">Annual Price ($)</Label>
              <Input
                id="base_price"
                type="number"
                value={formData.base_price_annual}
                onChange={(e) => handleChange('base_price_annual', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="agent_type">Agent Type</Label>
              <Select value={formData.agent_type} onValueChange={(value) => handleChange('agent_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detection">Detection</SelectItem>
                  <SelectItem value="tracking">Tracking</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="prediction">Prediction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the agent's capabilities..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Agent Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}