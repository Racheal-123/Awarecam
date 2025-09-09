import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Rocket, 
  Camera, 
  Users, 
  ClipboardCheck, 
  Sparkles,
  ArrowRight,
  Building,
  Zap
} from 'lucide-react';

export default function CompletionStep({ data, allData, onComplete }) {
  const businessProfile = allData.business_profile || {};
  const planSelection = allData.plan_selection || {};
  const cameraSetup = allData.camera_setup || {};
  const employeeWorkflow = allData.employee_workflow || {};

  const completedItems = [
    {
      icon: Building,
      title: 'Business Profile',
      description: `${businessProfile.industry_type} facility with ${businessProfile.employee_count_range} employees`,
      completed: true
    },
    {
      icon: Sparkles,
      title: 'Plan Selection',
      description: planSelection.workflow_addon_enabled 
        ? 'Camera Intelligence + Workflow Automation' 
        : 'Camera Intelligence',
      completed: true
    },
    {
      icon: Camera,
      title: 'Camera Setup',
      description: `${cameraSetup.cameras_added || 1} camera connected via ${cameraSetup.selected_method}`,
      completed: cameraSetup.setup_completed !== false
    },
    ...(planSelection.workflow_addon_enabled ? [{
      icon: Users,
      title: 'Team & Workflows',
      description: employeeWorkflow.skipped 
        ? 'Skipped - can be added later'
        : `${employeeWorkflow.employees_added || 0} employees, ${employeeWorkflow.workflows_configured || 0} workflows`,
      completed: true,
      skipped: employeeWorkflow.skipped
    }] : [])
  ];

  const nextSteps = [
    {
      icon: Camera,
      title: 'Explore Live Monitoring',
      description: 'View your camera feeds and set up monitoring zones'
    },
    {
      icon: Zap,
      title: 'Configure AI Agents',
      description: 'Enable object detection and automated alerts'
    },
    ...(planSelection.workflow_addon_enabled ? [{
      icon: ClipboardCheck,
      title: 'Create Custom Workflows',
      description: 'Build workflows specific to your operations'
    }] : [{
      icon: Users,
      title: 'Add Team Members',
      description: 'Invite colleagues to collaborate on security monitoring'
    }])
  ];

  const handleLaunchDashboard = () => {
    const completionData = {
      setup_completed: true,
      completed_at: new Date().toISOString(),
      onboarding_summary: {
        business_profile: businessProfile,
        plan_selection: planSelection,
        camera_setup: cameraSetup,
        employee_workflow: employeeWorkflow
      }
    };

    onComplete(completionData);
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          🎉 Setup Complete!
        </h2>
        <p className="text-slate-600">
          Your AwareCam video intelligence platform is ready to go. Here's what we've set up for you:
        </p>
      </div>

      {/* Setup Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            What We've Configured
          </h3>
          
          <div className="space-y-4">
            {completedItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.skipped 
                      ? 'bg-amber-100'
                      : item.completed 
                        ? 'bg-green-100' 
                        : 'bg-slate-100'
                  }`}>
                    <IconComponent className={`w-4 h-4 ${
                      item.skipped 
                        ? 'text-amber-600'
                        : item.completed 
                          ? 'text-green-600' 
                          : 'text-slate-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                      {item.skipped && (
                        <Badge className="bg-amber-100 text-amber-800 text-xs">Skipped</Badge>
                      )}
                      {item.completed && !item.skipped && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Recommended Next Steps
          </h3>
          
          <div className="grid gap-4">
            {nextSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Summary & Billing */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Your Plan</h3>
              <p className="text-blue-700">
                {planSelection.workflow_addon_enabled 
                  ? 'Camera Intelligence + Workflow Automation'
                  : 'Camera Intelligence'
                }
              </p>
              <p className="text-sm text-blue-600 mt-1">
                30-day free trial • No credit card required
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                ${planSelection.estimated_monthly_cost || 0}
                <span className="text-base font-normal">/month</span>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                Free Trial Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Button */}
      <div className="text-center pt-4">
        <Button
          onClick={handleLaunchDashboard}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Rocket className="w-5 h-5 mr-2" />
          Launch My Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <p className="text-sm text-slate-500 mt-3">
          You can always adjust these settings later from your dashboard
        </p>
      </div>
    </div>
  );
}