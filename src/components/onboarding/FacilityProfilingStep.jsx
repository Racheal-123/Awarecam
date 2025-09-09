
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  Building,
  Users,
  Camera,
  Briefcase,
  Sparkles
} from 'lucide-react';

const ALEX_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";

const facilityTypes = [
  { value: 'warehouse', label: 'Warehouse & Distribution' },
  { value: 'manufacturing', label: 'Manufacturing & Production' },
  { value: 'retail', label: 'Retail & Commercial' },
  { value: 'healthcare', label: 'Healthcare Facilities' },
  { value: 'office', label: 'Office & Corporate' },
  { value: 'education', label: 'Educational Institutions' },
  { value: 'hospitality', label: 'Hospitality & Entertainment' },
  { value: 'transportation', label: 'Transportation & Logistics' }
];

const employeeRanges = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' }
];

export default function FacilityProfilingStep({ data = {}, onNext, onPrevious, onUpdate }) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    facility_type: data.facility_type || '',
    employee_count_range: data.employee_count_range || '',
    camera_count_current: data.camera_count_current || 0,
    camera_count_planned: data.camera_count_planned || 0,
    business_description: data.business_description || ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Organization name is required';
    if (!formData.facility_type) newErrors.facility_type = 'Please select your facility type';
    if (!formData.employee_count_range) newErrors.employee_count_range = 'Please select your employee count';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      if (onUpdate) onUpdate(formData);
      if (onNext) onNext();
    }
  };

  const facilityLabel = formData.facility_type ? facilityTypes.find(f => f.value === formData.facility_type)?.label || 'facility' : 'facility';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
         <div className="flex items-center justify-center gap-4 mb-6">
          <img src={ALEX_AVATAR} alt="AI Assistant" className="w-16 h-16 rounded-full border-4 border-blue-100" />
          <div className="bg-white rounded-2xl shadow-lg p-4 max-w-2xl border-l-4 border-blue-500">
            <p className="text-slate-700">
              <span className="font-semibold">Great to meet you!</span> Let me learn about your {facilityLabel.toLowerCase()} so I can recommend the perfect AI-powered system for your needs.
            </p>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Tell me about your business</h1>
          <p className="text-lg text-slate-600">This helps me understand your environment.</p>
           <Badge className="bg-blue-100 text-blue-800 px-3 py-1 text-base">
            <Sparkles className="w-4 h-4 mr-2" />
            Step 2 of 5 - Facility Profile
          </Badge>
        </div>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="font-medium">Organization Name</label>
            <Input 
              value={formData.name} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
              placeholder="e.g., Acme Corporation" 
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-medium flex items-center gap-2"><Building className="w-4 h-4" /> Facility Type</label>
            <Select value={formData.facility_type} onValueChange={(value) => handleInputChange('facility_type', value)}>
              <SelectTrigger className={errors.facility_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your primary facility type..." />
              </SelectTrigger>
              <SelectContent>
                {facilityTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.facility_type && <p className="text-red-500 text-sm">{errors.facility_type}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-medium flex items-center gap-2"><Users className="w-4 h-4" /> Number of Employees</label>
            <Select value={formData.employee_count_range} onValueChange={(value) => handleInputChange('employee_count_range', value)}>
              <SelectTrigger className={errors.employee_count_range ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your employee count..." />
              </SelectTrigger>
              <SelectContent>
                {employeeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_count_range && <p className="text-red-500 text-sm">{errors.employee_count_range}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium flex items-center gap-2"><Camera className="w-4 h-4" /> Current Cameras</label>
              <Input 
                type="number"
                value={formData.camera_count_current} 
                onChange={(e) => handleInputChange('camera_count_current', parseInt(e.target.value) || 0)} 
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium flex items-center gap-2"><Camera className="w-4 h-4" /> Planned Cameras</label>
              <Input 
                type="number"
                value={formData.camera_count_planned} 
                onChange={(e) => handleInputChange('camera_count_planned', parseInt(e.target.value) || 0)} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between max-w-3xl mx-auto">
        <Button variant="outline" onClick={onPrevious} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
