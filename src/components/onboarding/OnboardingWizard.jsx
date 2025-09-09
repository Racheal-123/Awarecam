
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  Bot,
  Building,
  Camera,
  Users,
  Clipboard,
  Rocket,
  MapPin // Added MapPin icon
} from 'lucide-react';
import { Organization } from '@/api/entities';
import { User } from '@/api/entities';
import aiAssistantService from '@/components/services/AIAssistantService';

import BusinessProfileStep from '@/components/onboarding/steps/BusinessProfileStep';
import LocationStep from '@/components/onboarding/steps/LocationStep'; // Added LocationStep import
import PlanSelectionStep from '@/components/onboarding/steps/PlanSelectionStep';
import CameraSetupStep from '@/components/onboarding/steps/CameraSetupStep';
import EmployeeWorkflowStep from '@/components/onboarding/steps/EmployeeWorkflowStep';
import CompletionStep from '@/components/onboarding/steps/CompletionStep';

const ONBOARDING_STEPS = [
  {
    id: 'business_profile',
    title: 'Tell Us About Your Business',
    description: 'Industry, facility type, and goals',
    icon: Building,
    required: true
  },
  {
    id: 'location_setup', // New step for location setup
    title: 'Add Your Locations',
    description: 'Define your operational sites',
    icon: MapPin,
    required: true
  },
  {
    id: 'plan_selection',
    title: 'Choose Your Features',
    description: 'Select the capabilities you need',
    icon: Sparkles,
    required: true
  },
  {
    id: 'camera_setup',
    title: 'Connect Your First Camera',
    description: 'Add cameras to start monitoring',
    icon: Camera,
    required: true
  },
  {
    id: 'employee_workflow',
    title: 'Set Up Your Team',
    description: 'Add employees and workflows',
    icon: Users,
    required: false,
    requiresWorkflowAddon: true
  },
  {
    id: 'completion',
    title: 'Launch Your Dashboard',
    description: 'Review and complete setup',
    icon: Rocket,
    required: true
  }
];

export default function OnboardingWizard({ user, organization, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    business_profile: {},
    location_setup: {}, // Added location_setup to onboardingData
    plan_selection: {},
    camera_setup: {},
    employee_workflow: {},
    ...organization?.onboarding_progress?.step_data
  });
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiChat, setShowAiChat] = useState(true);
  const [skippedSteps, setSkippedSteps] = useState(new Set());
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0); // New state for tracking current location within a step

  // Filter steps based on plan
  const availableSteps = ONBOARDING_STEPS.filter(step => {
    if (step.requiresWorkflowAddon) {
      return onboardingData.plan_selection?.workflow_addon_enabled;
    }
    return true;
  });

  const currentStepData = availableSteps[currentStep];

  const getStepTitle = () => {
    const step = currentStepData;
    const locations = onboardingData.location_setup?.locations || [];

    if ((step.id === 'camera_setup' || step.id === 'employee_workflow') && locations.length > 1) {
        const locationName = locations[currentLocationIndex]?.name || `Location ${currentLocationIndex + 1}`;
        return `${step.title} for ${locationName}`;
    }
    return step.title;
  };
  
  const progress = (() => {
    const totalSteps = availableSteps.length;
    // Calculate base progress for current main step
    let baseProgress = (currentStep / totalSteps);

    // If current step is location-aware and has multiple locations
    if (['camera_setup', 'employee_workflow'].includes(currentStepData.id)) {
        const locations = onboardingData.location_setup?.locations || [];
        const numLocations = locations.length > 0 ? locations.length : 1;
        if (numLocations > 1) {
            // Calculate progress within the current location-aware step
            const stepWeight = 1 / totalSteps; // Each main step has equal weight
            const progressWithinLocationStep = (currentLocationIndex / numLocations) * stepWeight;
            
            // Add this sub-progress to the base progress
            baseProgress += progressWithinLocationStep;
        }
    } else {
        // For non-location-aware steps, just add the current step's weight
        baseProgress += (1 / totalSteps);
    }
    
    return baseProgress * 100;
  })();

  useEffect(() => {
    initializeAiAssistant();
  }, [currentStep, currentLocationIndex]); // Added currentLocationIndex to dependencies

  const initializeAiAssistant = async () => {
    if (!user || !organization) return;

    try {
      const welcomeMessage = generateStepWelcomeMessage(currentStepData, onboardingData);
      const aiMessage = {
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString(),
        step: currentStepData.id
      };

      setAiMessages(prev => {
        // Only add if this isn't a duplicate for the same step and location
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.step === currentStepData.id && lastMessage?.locationIndex === currentLocationIndex) return prev;
        
        // Add current location index to AI message for context
        const messageWithLocation = { ...aiMessage, locationIndex: currentLocationIndex };
        return [...prev, messageWithLocation];
      });

      // Initialize AI context for this step
      await aiAssistantService.initializeSession(user.id, organization.id, {
        page: 'Onboarding',
        step: currentStepData.id,
        userRole: user.role,
        onboardingData,
        currentLocationIndex: currentLocationIndex, // Pass current location index to AI service
        currentLocation: onboardingData.location_setup?.locations?.[currentLocationIndex]
      });
    } catch (error) {
      console.error('Failed to initialize AI assistant:', error);
    }
  };

  const generateStepWelcomeMessage = (step, data) => {
    const messages = {
      business_profile: `👋 Welcome to AwareCam! I'm here to help you set up your video intelligence platform. 

Let's start by learning about your business. This helps me provide the most relevant recommendations and templates for your industry.

What type of facility or business are you setting up AwareCam for? For example:
• Manufacturing plant or warehouse
• Retail store or restaurant  
• Office building or school
• Healthcare facility
• Or something else entirely

Just tell me in your own words, and I'll help guide you through the setup!`,

      location_setup: `Great! Now let's define your operational sites. This is where your cameras and team members will be located.
      
You can add multiple locations if your business operates across different sites. For each location, tell me:
• Its name (e.g., "Main Warehouse," "Downtown Store")
• Its primary function (e.g., "Retail," "Distribution," "Office")
• Its address or general area
      
Ready to add your first location?`,

      plan_selection: `Perfect! Now that I know about your business and locations, let's choose the right features for your needs.

AwareCam offers different capabilities:
🎥 **Camera Intelligence**: AI-powered monitoring, alerts, and analytics
🔄 **Workflow Automation**: Task management, compliance tracking, and team coordination

${data.business_profile?.industry_type ? `Based on your ${data.business_profile.industry_type} facility, I'd recommend both features for maximum operational efficiency.` : ''}

What sounds most valuable for your immediate needs? I can explain any of these features in detail!`,

      camera_setup: `Perfect! Let's get cameras connected. 
      ${onboardingData.location_setup?.locations?.length > 1 && currentLocationIndex < onboardingData.location_setup.locations.length ? 
        `We're currently setting up cameras for **${onboardingData.location_setup.locations[currentLocationIndex]?.name || `Location ${currentLocationIndex + 1}`}**. ` : ''}

You have several options:
🔗 **Network Camera**: Connect an existing IP camera using RTSP/ONVIF
📱 **Use Your Device**: Turn your phone, tablet, or computer camera into a monitoring camera
🎥 **Webcam**: Use a USB webcam connected to your computer

Which option sounds easiest for you to start with? I'll guide you through the entire process step by step.`,

      employee_workflow: `Excellent work on the camera setup! Now let's set up your team and workflows to maximize your operational efficiency.
      ${onboardingData.location_setup?.locations?.length > 1 && currentLocationIndex < onboardingData.location_setup.locations.length ? 
        `We're focusing on **${onboardingData.location_setup.locations[currentLocationIndex]?.name || `Location ${currentLocationIndex + 1}`}** right now. ` : ''}

Since you have the Workflow add-on enabled, you can:
👥 Add team members and assign roles
📋 Set up automated task assignments
✅ Create compliance checklists
📊 Track performance and completion rates

Would you like to start by adding some team members, or would you prefer to see some workflow templates I can recommend for your industry?`,

      completion: `🎉 Fantastic! You've successfully set up the core components of your AwareCam system. Let me recap what we've accomplished:

${generateCompletionSummary(data)}

You're now ready to launch your dashboard and start using AwareCam! I'll continue to be available to help you as you explore the platform.

Ready to see your new video intelligence system in action?`
    };

    return messages[step.id] || `Let's continue with ${step.title}. I'm here to help you through this step!`;
  };

  const generateCompletionSummary = (data) => {
    let summary = [];
    
    if (data.business_profile?.industry_type) {
      summary.push(`✅ Business Profile: ${data.business_profile.industry_type} facility`);
    }

    if (data.location_setup?.locations?.length > 0) {
      summary.push(`✅ Locations: ${data.location_setup.locations.length} site(s) added`);
    }
    
    if (data.plan_selection?.workflow_addon_enabled) {
      summary.push(`✅ Features: Camera Intelligence + Workflow Automation`);
    } else {
      summary.push(`✅ Features: Camera Intelligence`);
    }
    
    // Sum cameras and employees across all locations if applicable
    let totalCameras = 0;
    let totalEmployees = 0;

    if (data.camera_setup?.cameras_added) { // legacy for single setup
      totalCameras += data.camera_setup.cameras_added;
    }
    if (data.camera_setup?.locations_data) { // new multi-location structure
        Object.values(data.camera_setup.locations_data).forEach(loc => {
          totalCameras += loc.cameras_added || 0;
        });
    }

    if (data.employee_workflow?.employees_added) { // legacy for single setup
      totalEmployees += data.employee_workflow.employees_added;
    }
    if (data.employee_workflow?.locations_data) { // new multi-location structure
      Object.values(data.employee_workflow.locations_data).forEach(loc => {
        totalEmployees += loc.employees_added || 0;
      });
    }

    if (totalCameras > 0) {
      summary.push(`✅ Cameras: ${totalCameras} camera(s) connected`);
    }
    
    if (totalEmployees > 0) {
      summary.push(`✅ Team: ${totalEmployees} team member(s) added`);
    }
    
    return summary.join('\n');
  };

  const handleAiMessage = async (message) => {
    if (!message.trim() || isAiLoading) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const response = await aiAssistantService.sendMessage(
        user.id,
        organization.id,
        message,
        {
          page: 'Onboarding',
          step: currentStepData.id,
          onboardingData,
          userRole: user.role,
          currentLocationIndex: currentLocationIndex, // Pass current location index to AI service
          currentLocation: onboardingData.location_setup?.locations?.[currentLocationIndex]
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        step: currentStepData.id,
        locationIndex: currentLocationIndex // Associate AI response with current location
      };

      setAiMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI message error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble right now. You can continue with the setup using the form, or try asking me again in a moment.",
        timestamp: new Date().toISOString(),
        error: true
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStepComplete = async (stepData) => {
    const updatedOnboardingData = { ...onboardingData };
    const isLocationAwareStep = ['camera_setup', 'employee_workflow'].includes(currentStepData.id);
    const locations = updatedOnboardingData.location_setup?.locations || [];
    const numLocations = locations.length;

    if (isLocationAwareStep && numLocations > 0) {
      // Store data specifically for the current location
      if (!updatedOnboardingData[currentStepData.id].locations_data) {
        updatedOnboardingData[currentStepData.id].locations_data = {};
      }
      updatedOnboardingData[currentStepData.id].locations_data[locations[currentLocationIndex].id] = stepData;

      if (currentLocationIndex < numLocations - 1) {
        // Move to next location for the same step
        setCurrentLocationIndex(prev => prev + 1);
        setOnboardingData(updatedOnboardingData); // Update data immediately
        return; // Do not proceed to next main step or save yet
      } else {
        // All locations for this step are complete, reset index and fall through to save/next step
        setCurrentLocationIndex(0);
      }
    } else {
      // For non-location-aware steps, just store the data directly
      updatedOnboardingData[currentStepData.id] = stepData;
    }
    
    setOnboardingData(updatedOnboardingData); // Ensure data is updated before saving

    // Save progress to organization
    try {
      await Organization.update(organization.id, {
        onboarding_progress: {
          current_step: currentStep + 1, // This is the next main step index
          completed_steps: [...Array(currentStep + 1).keys()],
          step_data: updatedOnboardingData
        }
      });
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }

    // Move to next step or complete
    if (currentStep < availableSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      // currentLocationIndex is already reset or was 0 for non-location steps
    } else {
      handleOnboardingComplete(updatedOnboardingData);
    }
  };

  const handleOnboardingComplete = async (finalData) => {
    try {
      // Mark onboarding as complete
      await Organization.update(organization.id, {
        onboarding_completed: true,
        onboarding_step: availableSteps.length,
        // Apply the collected data to the organization
        ...finalData.business_profile,
        workflow_addon_enabled: finalData.plan_selection?.workflow_addon_enabled || false,
        // Potentially save locations data directly if needed
        locations: finalData.location_setup?.locations || []
      });

      onComplete(finalData);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const handleSkipStep = () => {
    if (currentStepData.required) return;
    
    setSkippedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (currentStep < availableSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentLocationIndex(0); // Reset location index when skipping a main step
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentLocationIndex(0); // Reset location index when moving to previous main step
    }
  };

  const renderCurrentStep = () => {
    const location = onboardingData.location_setup?.locations?.[currentLocationIndex];
    const stepProps = {
      data: onboardingData[currentStepData.id] || {},
      allData: onboardingData,
      onComplete: handleStepComplete,
      onAiMessage: handleAiMessage,
      aiMessages: aiMessages.filter(msg => 
        (msg.step === currentStepData.id && (msg.locationIndex === undefined || msg.locationIndex === currentLocationIndex)) || !msg.step
      ),
      organization,
      user,
      location // Pass current location to the step component if applicable
    };

    switch (currentStepData.id) {
      case 'business_profile':
        return <BusinessProfileStep {...stepProps} />;
      case 'location_setup':
        return <LocationStep {...stepProps} />; // Render LocationStep
      case 'plan_selection':
        return <PlanSelectionStep {...stepProps} />;
      case 'camera_setup':
        return <CameraSetupStep {...stepProps} />;
      case 'employee_workflow':
        return <EmployeeWorkflowStep {...stepProps} />;
      case 'completion':
        return <CompletionStep {...stepProps} />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Progress Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome to AwareCam</h1>
              <p className="text-slate-600">Let's set up your video intelligence platform</p>
            </div>
            <Badge variant="outline" className="text-sm">
              Step {currentStep + 1} of {availableSteps.length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-slate-500">
              {availableSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-1 ${
                    index === currentStep ? 'text-blue-600 font-medium' : 
                    index < currentStep ? 'text-green-600' : 'text-slate-400'
                  }`}
                >
                  <step.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full p-6 gap-6">
        {/* Step Content */}
        <div className="flex-1 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentStep}-${currentLocationIndex}`} // Key includes location index for re-rendering
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0 mb-6">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <currentStepData.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{getStepTitle()}</h2>
                      <p className="text-slate-600">{currentStepData.description}</p>
                    </div>
                  </div>
                  
                  {renderCurrentStep()}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0 && currentLocationIndex === 0} // Disable if first step and first location
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  {!currentStepData.required && (
                    <Button
                      variant="ghost"
                      onClick={handleSkipStep}
                      className="text-slate-500"
                    >
                      Skip for now
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* AI Assistant Panel */}
        {showAiChat && (
          <div className="w-96">
            <Card className="sticky top-6 shadow-xl border-0 h-[600px] flex flex-col">
              <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Setup Assistant</h3>
                    <p className="text-sm text-blue-100">I'm here to help!</p>
                  </div>
                </div>
              </div>
              
              {/* AI Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {aiMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : message.error
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isAiLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* AI Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiMessage(aiInput)}
                    disabled={isAiLoading}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAiMessage(aiInput)}
                    disabled={isAiLoading || !aiInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
