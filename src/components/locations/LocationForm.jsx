import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Save, X } from 'lucide-react';
import { Location } from '@/api/entities';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
  { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
  { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
  { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
  { value: 'Europe/Paris', label: 'CET (Central European Time)' },
  { value: 'Europe/Berlin', label: 'CET (Central European Time)' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
  { value: 'Asia/Shanghai', label: 'CST (China Standard Time)' },
  { value: 'Asia/Dubai', label: 'GST (Gulf Standard Time)' },
  { value: 'Australia/Sydney', label: 'AEST (Australian Eastern Time)' },
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 
  'Italy', 'Netherlands', 'Australia', 'Japan', 'China', 'Singapore', 
  'United Arab Emirates', 'Israel', 'India', 'Brazil', 'Mexico', 'Other'
];

export default function LocationForm({ location, organization, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    timezone: 'UTC',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        country: location.country || '',
        postal_code: location.postal_code || '',
        timezone: location.timezone || 'UTC',
        notes: location.notes || ''
      });
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const locationData = {
        ...formData,
        organization_id: organization.id
      };

      if (location) {
        await Location.update(location.id, locationData);
      } else {
        await Location.create(locationData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => !loading && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {location ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Downtown Warehouse, Main Office"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Business Street"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="NY"
              />
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="10001"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="timezone" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timezone
              </Label>
              <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Optional notes about this location..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : location ? 'Update Location' : 'Create Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}