import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Building, 
  Globe,
  Clock
} from 'lucide-react';

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'UTC', label: 'UTC' }
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
  'Spain', 'Italy', 'Netherlands', 'Australia', 'Japan', 'China',
  'Brazil', 'Mexico', 'India', 'South Korea', 'Singapore'
];

export default function LocationStep({ data, allData, onComplete, onAiMessage, aiMessages, organization }) {
  const [locations, setLocations] = useState(data.locations || [
    {
      id: 'loc_1',
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      timezone: 'UTC',
      notes: ''
    }
  ]);

  const [errors, setErrors] = useState({});

  const addLocation = () => {
    const newLocation = {
      id: `loc_${Date.now()}`,
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      timezone: 'UTC',
      notes: ''
    };
    setLocations([...locations, newLocation]);
  };

  const removeLocation = (index) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index, field, value) => {
    const updated = locations.map((loc, i) => 
      i === index ? { ...loc, [field]: value } : loc
    );
    setLocations(updated);
    
    // Clear error for this field
    if (errors[`${index}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${index}.${field}`]: undefined
      }));
    }
  };

  const validateLocations = () => {
    const newErrors = {};
    let isValid = true;

    locations.forEach((location, index) => {
      if (!location.name.trim()) {
        newErrors[`${index}.name`] = 'Location name is required';
        isValid = false;
      }
      if (!location.country.trim()) {
        newErrors[`${index}.country`] = 'Country is required';
        isValid = false;
      }
    });

    // Check for duplicate names
    const names = locations.map(l => l.name.trim().toLowerCase()).filter(Boolean);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      duplicates.forEach(dupName => {
        locations.forEach((loc, index) => {
          if (loc.name.trim().toLowerCase() === dupName) {
            newErrors[`${index}.name`] = 'Location names must be unique';
          }
        });
      });
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateLocations()) {
      onComplete({ locations });
    }
  };

  const getLocationTitle = (index) => {
    const location = locations[index];
    if (location.name.trim()) {
      return location.name;
    }
    return `Location ${index + 1}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Set Up Your Locations</h3>
        <p className="text-slate-600">
          Define the physical sites where you'll be deploying cameras and managing operations.
        </p>
      </div>

      <div className="space-y-4">
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className="border-2 border-slate-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-900">{getLocationTitle(index)}</h4>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  {locations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLocation(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${index}`}>Location Name *</Label>
                    <Input
                      id={`name-${index}`}
                      value={location.name}
                      onChange={(e) => updateLocation(index, 'name', e.target.value)}
                      placeholder="e.g., Downtown Warehouse, Main Office"
                      className={errors[`${index}.name`] ? 'border-red-300' : ''}
                    />
                    {errors[`${index}.name`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`${index}.name`]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`country-${index}`}>Country *</Label>
                    <Select 
                      value={location.country} 
                      onValueChange={(value) => updateLocation(index, 'country', value)}
                    >
                      <SelectTrigger className={errors[`${index}.country`] ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`${index}.country`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`${index}.country`]}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`address-${index}`}>Address</Label>
                    <Input
                      id={`address-${index}`}
                      value={location.address}
                      onChange={(e) => updateLocation(index, 'address', e.target.value)}
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`city-${index}`}>City</Label>
                    <Input
                      id={`city-${index}`}
                      value={location.city}
                      onChange={(e) => updateLocation(index, 'city', e.target.value)}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`state-${index}`}>State/Province</Label>
                    <Input
                      id={`state-${index}`}
                      value={location.state}
                      onChange={(e) => updateLocation(index, 'state', e.target.value)}
                      placeholder="State or province"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`postal-${index}`}>Postal Code</Label>
                    <Input
                      id={`postal-${index}`}
                      value={location.postal_code}
                      onChange={(e) => updateLocation(index, 'postal_code', e.target.value)}
                      placeholder="ZIP/Postal code"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`timezone-${index}`} className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timezone
                    </Label>
                    <Select 
                      value={location.timezone} 
                      onValueChange={(value) => updateLocation(index, 'timezone', value)}
                    >
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
                    <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
                    <Textarea
                      id={`notes-${index}`}
                      value={location.notes}
                      onChange={(e) => updateLocation(index, 'notes', e.target.value)}
                      placeholder="Any additional details about this location..."
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <Button
          variant="outline"
          onClick={addLocation}
          className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 py-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Another Location
        </Button>
      </div>

      <div className="flex justify-between items-center pt-6">
        <div className="text-sm text-slate-600">
          {locations.length} location{locations.length !== 1 ? 's' : ''} configured
        </div>
        <Button onClick={handleContinue} className="px-8">
          Continue Setup
        </Button>
      </div>
    </div>
  );
}