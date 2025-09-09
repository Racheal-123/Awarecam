import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Shield, ShieldCheck, Sparkles } from 'lucide-react';

const ALEX_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";

const riskCategories = {
  warehouse: [
    { id: 'theft', title: 'Theft & Pilferage', description: 'Unauthorized removal of goods' },
    { id: 'safety', title: 'Workplace Safety', description: 'Accidents, injuries, and hazards' },
    { id: 'vandalism', title: 'Vandalism & Damage', description: 'Intentional damage to property' },
    { id: 'access', title: 'Unauthorized Access', description: 'Entry into restricted areas' }
  ],
  manufacturing: [
    { id: 'safety', title: 'Worker Safety', description: 'Machine accidents, PPE violations' },
    { id: 'quality', title: 'Quality Control', description: 'Production errors, defects' },
    { id: 'theft', title: 'Asset & Material Theft', description: 'Theft of tools or raw materials' },
    { id: 'process', title: 'Process Adherence', description: 'Ensuring protocols are followed' }
  ],
  retail: [
    { id: 'shoplifting', title: 'Shoplifting', description: 'Customer theft of merchandise' },
    { id: 'employee_theft', title: 'Employee Theft', description: 'Theft by staff members' },
    { id: 'safety', title: 'Slip & Fall', description: 'Customer and employee safety' },
    { id: 'vandalism', title: 'Vandalism', description: 'Damage to store property' }
  ],
  // Add other categories...
  default: [
    { id: 'theft', title: 'Theft', description: 'General theft of property' },
    { id: 'safety', title: 'Safety', description: 'General safety concerns' },
    { id: 'access', title: 'Access Control', description: 'Unauthorized entry' },
    { id: 'vandalism', title: 'Vandalism', description: 'Damage to property' }
  ]
};

const getAllRisks = () => {
    const all = new Map();
    Object.values(riskCategories).flat().forEach(risk => {
        if (!all.has(risk.id)) {
            all.set(risk.id, risk);
        }
    });
    return Array.from(all.values());
};


export default function RiskAssessmentStep({ data = {}, onNext, onPrevious, onUpdate }) {
  const [selectedRisks, setSelectedRisks] = useState({
    primary: data.primary_risks || [],
    secondary: data.secondary_risks || []
  });
  const [searchTerm, setSearchTerm] = useState('');

  // **BULLETPROOF FIX**: Defensively determine facilityType.
  let facilityType = 'default';
  if (data && typeof data.facility_type === 'string' && data.facility_type.trim() !== '') {
    facilityType = data.facility_type;
  }
  
  const relevantRisks = riskCategories[facilityType] || getAllRisks();
  const industryLabel = facilityType !== 'default' ? `for your ${facilityType.toLowerCase()} facility` : 'for your facility';

  const handleRiskToggle = (riskId, isPrimary) => {
    setSelectedRisks(prev => {
      const newRisks = { ...prev };
      
      if (isPrimary) {
        if (newRisks.primary.includes(riskId)) {
          newRisks.primary = newRisks.primary.filter(id => id !== riskId);
        } else {
          if (newRisks.primary.length < 5) {
            newRisks.primary = [...newRisks.primary, riskId];
          }
          newRisks.secondary = newRisks.secondary.filter(id => id !== riskId);
        }
      } else {
        if (newRisks.secondary.includes(riskId)) {
          newRisks.secondary = newRisks.secondary.filter(id => id !== riskId);
        } else {
          newRisks.secondary = [...newRisks.secondary, riskId];
          newRisks.primary = newRisks.primary.filter(id => id !== riskId);
        }
      }
      return newRisks;
    });
  };

  const handleNext = () => {
    const updateData = {
      primary_risks: selectedRisks.primary,
      secondary_risks: selectedRisks.secondary,
      risk_assessment_completed: true
    };
    if (onUpdate) onUpdate(updateData);
    if (onNext) onNext();
  };

  const filteredRisks = searchTerm
    ? relevantRisks.filter(risk => risk.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : relevantRisks;

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
              <span className="font-semibold">Perfect.</span> Now, let's identify the most critical risks {industryLabel}. This helps me recommend the right AI agents.
            </p>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">What are your top priorities?</h1>
          <p className="text-lg text-slate-600">Select up to 5 primary risks you want to prevent.</p>
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1 text-base">
            <Sparkles className="w-4 h-4 mr-2" />
            Step 3 of 5 - Risk Assessment
          </Badge>
        </div>
      </div>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Risks</CardTitle>
            <Input 
              placeholder="Search risks..." 
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRisks.map(risk => (
              <RiskItem 
                key={risk.id} 
                risk={risk} 
                isSelectedPrimary={selectedRisks.primary.includes(risk.id)}
                isSelectedSecondary={selectedRisks.secondary.includes(risk.id)}
                onToggle={handleRiskToggle}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrevious} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Continue to Recommendations
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function RiskItem({ risk, isSelectedPrimary, isSelectedSecondary, onToggle }) {
  // ... (Component implementation remains the same)
  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${isSelectedPrimary ? 'bg-blue-50 border-blue-500 shadow-lg' : isSelectedSecondary ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelectedPrimary ? 'bg-blue-500' : 'bg-slate-200'}`}>
            <Shield className={`w-5 h-5 ${isSelectedPrimary ? 'text-white' : 'text-slate-600'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">{risk.title}</h4>
            <p className="text-sm text-slate-500">{risk.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button 
            variant={isSelectedSecondary ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToggle(risk.id, false)}
            disabled={isSelectedPrimary}
           >
             Secondary
           </Button>
           <Button 
            variant={isSelectedPrimary ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToggle(risk.id, true)}
            className={isSelectedPrimary ? 'bg-blue-600 hover:bg-blue-700' : ''}
           >
             <ShieldCheck className="w-4 h-4 mr-2" />
             Primary
           </Button>
        </div>
      </div>
    </div>
  )
}