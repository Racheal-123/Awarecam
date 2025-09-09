import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Users, Target, Sparkles } from 'lucide-react';

const INDUSTRY_OPTIONS = [
  { value: 'warehouse', label: 'Warehouse & Distribution', icon: '📦', description: 'Logistics, fulfillment, storage facilities' },
  { value: 'manufacturing', label: 'Manufacturing & Production', icon: '🏭', description: 'Factories, assembly lines, production facilities' },
  { value: 'retail', label: 'Retail & Commerce', icon: '🛍️', description: 'Stores, shops, shopping centers' },
  { value: 'healthcare', label: 'Healthcare & Medical', icon: '🏥', description: 'Hospitals, clinics, medical facilities' },
  { value: 'education', label: 'Education & Schools', icon: '🎓', description: 'Schools, universities, training centers' },
  { value: 'hospitality', label: 'Hospitality & Food Service', icon: '🏨', description: 'Hotels, restaurants, event venues' },
  { value: 'office', label: 'Office & Corporate', icon: '🏢', description: 'Corporate offices, co-working spaces' },
  { value: 'transportation', label: 'Transportation & Logistics', icon: '🚚', description: 'Airports, stations, shipping facilities' },
  { value: 'residential', label: 'Residential & Property', icon: '🏠', description: 'Apartment complexes, residential buildings' },
  { value: 'worship', label: 'Houses of Worship', icon: '⛪', description: 'Churches, temples, religious facilities' },
  { value: 'other', label: 'Other', icon: '🏗️', description: 'Custom or specialized facilities' }
];

const EMPLOYEE_RANGES = [
  { value: '1-10', label: '1-10 employees', description: 'Small team or startup' },
  { value: '11-50', label: '11-50 employees', description: 'Growing business' },
  { value: '51-200', label: '51-200 employees', description: 'Medium enterprise' },
  { value: '201-500', label: '201-500 employees', description: 'Large organization' },
  { value: '500+', label: '500+ employees', description: 'Enterprise scale' }
];

export default function BusinessProfileStep({ data, onComplete, onAiMessage, aiMessages }) {
  const [formData, setFormData] = useState({
    organization_name: data.organization_name || '',
    industry_type: data.industry_type || '',
    facility_description: data.facility_description || '',
    employee_count_range: data.employee_count_range || '',
    location: data.location || '',
    primary_goals: data.primary_goals || [],
    main_challenges: data.main_challenges || ''
  });

  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIndustrySelect = (value) => {
    setFormData(prev => ({ ...prev, industry_type: value }));
    if (value === 'other') {
      setShowCustomIndustry(true);
    } else {
      setShowCustomIndustry(false);
      // Send industry selection to AI for contextual help
      if (onAiMessage) {
        const industry = INDUSTRY_OPTIONS.find(opt => opt.value === value);
        onAiMessage(`I selected ${industry?.label} as my industry type. What specific features would you recommend for this type of business?`);
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.organization_name || !formData.industry_type) return;
    
    onComplete(formData);
  };

  const isValid = formData.organization_name && formData.industry_type && formData.employee_count_range;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="org_name" className="text-sm font-medium text-slate-700">
            Organization Name *
          </Label>
          <Input
            id="org_name"
            placeholder="Enter your organization or business name"
            value={formData.organization_name}
            onChange={(e) => handleInputChange('organization_name', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">
            Industry Type *
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INDUSTRY_OPTIONS.map((industry) => (
              <Card 
                key={industry.value}
                className={`cursor-pointer transition-all border hover:shadow-md ${
                  formData.industry_type === industry.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleIndustrySelect(industry.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{industry.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 text-sm">{industry.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{industry.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {showCustomIndustry && (
          <div>
            <Label htmlFor="custom_industry" className="text-sm font-medium text-slate-700">
              Describe Your Industry
            </Label>
            <Input
              id="custom_industry"
              placeholder="Tell us about your specific industry or facility type"
              value={formData.facility_description}
              onChange={(e) => handleInputChange('facility_description', e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Team Size *
          </Label>
          <Select value={formData.employee_count_range} onValueChange={(value) => handleInputChange('employee_count_range', value)}>
            <SelectTrigger>
              <SelectValue placeholder="How many people work at your facility?" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-medium">{range.label}</div>
                      <div className="text-xs text-slate-500">{range.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location" className="text-sm font-medium text-slate-700">
            Primary Location
          </Label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              id="location"
              placeholder="City, State/Country (optional)"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="challenges" className="text-sm font-medium text-slate-700">
            Main Challenges or Goals
          </Label>
          <Textarea
            id="challenges"
            placeholder="What are your main operational challenges or goals? (e.g., improve security, ensure compliance, reduce incidents, optimize workflows)"
            value={formData.main_challenges}
            onChange={(e) => handleInputChange('main_challenges', e.target.value)}
            className="mt-1 h-20"
          />
          <p className="text-xs text-slate-500 mt-1">
            This helps us recommend the most relevant features and templates
          </p>
        </div>
      </div>

      {/* Industry-Specific Insights */}
      {formData.industry_type && formData.industry_type !== 'other' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Industry Insights</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {getIndustryInsight(formData.industry_type)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSubmit} 
          disabled={!isValid}
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          Continue Setup
        </Button>
      </div>
    </div>
  );
}

function getIndustryInsight(industryType) {
  const insights = {
    warehouse: "Perfect for inventory tracking, loading dock safety, and forklift compliance monitoring. We have specialized templates for warehouse operations.",
    manufacturing: "Ideal for production line monitoring, safety compliance, and quality control. Our PPE detection and equipment monitoring work great in manufacturing.",
    retail: "Great for customer flow analysis, theft prevention, and staff efficiency. Queue management and customer counting are popular features.",
    healthcare: "Excellent for patient safety, compliance monitoring, and infection control. We support HIPAA-compliant workflows for medical facilities.",
    education: "Perfect for campus security, attendance tracking, and safety monitoring. Visitor management and emergency response workflows are very effective.",
    hospitality: "Ideal for guest experience, security, and staff efficiency. Kitchen safety and cleanliness workflows are particularly valuable.",
    office: "Great for occupancy tracking, security, and meeting room management. Visitor check-in and after-hours monitoring work well.",
    transportation: "Perfect for cargo monitoring, vehicle tracking, and facility security. Loading/unloading compliance and safety workflows are essential."
  };
  
  return insights[industryType] || "We'll customize the platform to match your specific operational needs and compliance requirements.";
}