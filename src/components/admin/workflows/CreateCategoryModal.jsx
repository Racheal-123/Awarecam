import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WorkflowTemplateCategory } from '@/api/entities';

export default function CreateCategoryModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    category_name: '',
    category_description: '',
    category_icon: '📋',
    color_theme: 'blue',
    display_order: 0,
    is_featured: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await WorkflowTemplateCategory.create(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.category_name}
              onChange={(e) => handleChange('category_name', e.target.value)}
              placeholder="e.g., Safety & Compliance"
              required
            />
          </div>

          <div>
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              value={formData.category_icon}
              onChange={(e) => handleChange('category_icon', e.target.value)}
              placeholder="📋"
            />
          </div>

          <div>
            <Label htmlFor="color">Color Theme</Label>
            <Select value={formData.color_theme} onValueChange={(value) => handleChange('color_theme', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.category_description}
              onChange={(e) => handleChange('category_description', e.target.value)}
              placeholder="What types of workflows this category contains..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}