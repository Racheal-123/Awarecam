import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  Zap, 
  CheckCircle, 
  Sparkles, 
  Users, 
  ClipboardCheck, 
  BarChart3,
  Crown,
  ArrowRight
} from 'lucide-react';

const PLAN_FEATURES = {
  camera_intelligence: {
    title: 'Camera Intelligence',
    icon: Camera,
    description: 'AI-powered video monitoring and analytics',
    features: [
      'Real-time AI object detection',
      'Custom alert workflows',
      'Video analytics and insights',
      'Multi-camera monitoring',
      'Event timeline and search',
      'Mobile notifications'
    ],
    benefits: 'Perfect for security, safety monitoring, and operational visibility',
    recommended: true
  },
  workflow_automation: {
    title: 'Workflow Automation',
    icon: ClipboardCheck,
    description: 'Task management and compliance tracking',
    features: [
      'Employee task assignments',
      'Compliance checklists',
      'AI-validated task completion',
      'Performance tracking',
      'Custom workflow templates',
      'Team management'
    ],
    benefits: 'Ideal for operational efficiency and compliance management',
    addon: true,
    price: 99
  }
};

export default function PlanSelectionStep({ data, allData, onComplete, onAiMessage }) {
  const [selectedFeatures, setSelectedFeatures] = useState({
    camera_intelligence: data.camera_intelligence !== false, // Default to true
    workflow_automation: data.workflow_automation || false
  });

  const industryType = allData.business_profile?.industry_type;
  const employeeRange = allData.business_profile?.employee_count_range;

  const getIndustryRecommendation = () => {
    const recommendations = {
      warehouse: { workflow: true, reason: "Warehouse operations benefit greatly from task management and compliance tracking" },
      manufacturing: { workflow: true, reason: "Manufacturing facilities need both safety monitoring and operational workflow management" },
      healthcare: { workflow: true, reason: "Healthcare requires strict compliance tracking and task management" },
      education: { workflow: false, reason: "Schools typically start with security monitoring and can add workflow features later" },
      retail: { workflow: false, reason: "Retail businesses often focus on security and customer analytics initially" },
      office: { workflow: false, reason: "Office environments usually prioritize security and occupancy monitoring first" }
    };

    return recommendations[industryType] || { workflow: false, reason: "Start with camera intelligence and add workflows as needed" };
  };

  const recommendation = getIndustryRecommendation();
  const hasLargeTeam = ['51-200', '201-500', '500+'].includes(employeeRange);

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev => {
      const newFeatures = { ...prev, [feature]: !prev[feature] };
      
      // Send contextual message to AI
      if (onAiMessage && feature === 'workflow_automation') {
        if (newFeatures.workflow_automation) {
          onAiMessage(`I'm interested in the Workflow Automation add-on. Can you tell me more about how it would help my ${industryType} business?`);
        }
      }
      
      return newFeatures;
    });
  };

  const handleContinue = () => {
    const planData = {
      ...selectedFeatures,
      workflow_addon_enabled: selectedFeatures.workflow_automation,
      selected_features: Object.keys(selectedFeatures).filter(key => selectedFeatures[key]),
      estimated_monthly_cost: calculateMonthlyCost()
    };

    onComplete(planData);
  };

  const calculateMonthlyCost = () => {
    let cost = 0; // Base camera intelligence is included
    if (selectedFeatures.workflow_automation) {
      cost += PLAN_FEATURES.workflow_automation.price;
    }
    return cost;
  };

  const monthlyCost = calculateMonthlyCost();

  return (
    <div className="space-y-6">
      {/* Recommendation Banner */}
      {(recommendation.workflow || hasLargeTeam) && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900">
                  Recommended for {industryType} businesses
                </h4>
                <p className="text-sm text-purple-700 mt-1">
                  {recommendation.reason}
                  {hasLargeTeam && " With your team size, workflow automation can significantly improve operational efficiency."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Selection */}
      <div className="grid gap-6">
        {Object.entries(PLAN_FEATURES).map(([key, feature]) => {
          const IconComponent = feature.icon;
          const isSelected = selectedFeatures[key];
          const isRequired = key === 'camera_intelligence'; // Base feature is always included

          return (
            <Card 
              key={key}
              className={`transition-all cursor-pointer ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              } ${isRequired ? 'border-green-500 bg-green-50' : ''}`}
              onClick={() => !isRequired && handleFeatureToggle(key)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected || isRequired ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isSelected || isRequired ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        {feature.addon && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            Add-on
                          </Badge>
                        )}
                        {isRequired && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Included
                          </Badge>
                        )}
                        {recommendation.workflow && key === 'workflow_automation' && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm mt-1">{feature.description}</p>
                    </div>
                  </div>
                  
                  {!isRequired && (
                    <div className="flex items-center gap-3">
                      {feature.price && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">${feature.price}</div>
                          <div className="text-xs text-slate-500">per month</div>
                        </div>
                      )}
                      <Switch
                        checked={isSelected}
                        onCheckedChange={() => handleFeatureToggle(key)}
                      />
                    </div>
                  )}
                  
                  {isRequired && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 mb-4">{feature.benefits}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {feature.features.map((featureItem, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{featureItem}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pricing Summary */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Your Plan Summary</h4>
              <p className="text-sm text-slate-600">
                {selectedFeatures.camera_intelligence && selectedFeatures.workflow_automation
                  ? 'Camera Intelligence + Workflow Automation'
                  : 'Camera Intelligence'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ${monthlyCost}
                <span className="text-base font-normal text-slate-500">/month</span>
              </div>
              {monthlyCost === 0 && (
                <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                  30-day free trial
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          Continue with Selected Plan
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}