import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Sparkles, Zap, ClipboardCheck, DollarSign, Lightbulb } from 'lucide-react';

const ALEX_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";

const agentRecommendations = {
  theft: { display_name: 'Theft Detection', description: 'Detects unauthorized removal of items.' },
  safety: { display_name: 'Safety & PPE Compliance', description: 'Ensures safety gear is worn.' },
  access: { display_name: 'Access Control', description: 'Monitors restricted area access.' },
  shoplifting: { display_name: 'Shoplifting Prevention', description: 'Identifies suspicious behavior.' },
  default: { display_name: 'General Security', description: 'Monitors for unusual activity.' }
};

const workflowRecommendations = {
  warehouse: { name: 'Warehouse Safety Inspection', description: 'Daily checks for hazards.' },
  manufacturing: { name: 'Production Line QC', description: 'Ensures quality standards are met.' },
  retail: { name: 'Opening & Closing Checklist', description: 'Secures the store daily.' },
  default: { name: 'Daily Security Patrol', description: 'Routine security checks.' }
};

export default function RecommendationsStep({ data = {}, onNext, onPrevious, onUpdate }) {
  const [recommendations, setRecommendations] = useState({
    agents: [],
    workflows: [],
    estimated_roi: 0
  });

  useEffect(() => {
    // **BULLETPROOF FIX**: Defensively determine facilityType and primary_risks.
    let facilityType = 'default';
    if (data && typeof data.facility_type === 'string' && data.facility_type.trim() !== '') {
        facilityType = data.facility_type;
    }
    
    const primaryRisks = (data && Array.isArray(data.primary_risks)) ? data.primary_risks : [];

    // Generate recommendations based on safe data
    const recommendedAgents = [...new Set(primaryRisks.map(risk => agentRecommendations[risk] || agentRecommendations.default))];
    const recommendedWorkflow = workflowRecommendations[facilityType] || workflowRecommendations.default;
    const estimatedRoi = (primaryRisks.length * 1500) + (data.camera_count_planned * 250);

    setRecommendations({
      agents: recommendedAgents,
      workflows: [recommendedWorkflow],
      estimated_roi: estimatedRoi
    });
  }, [data]);

  const handleNext = () => {
    const updateData = {
      recommended_agents: recommendations.agents.map(a => a.display_name),
      recommended_workflows: recommendations.workflows.map(w => w.name),
      estimated_roi: recommendations.estimated_roi,
      recommendations_completed: true
    };
    if (onUpdate) onUpdate(updateData);
    if (onNext) onNext();
  };

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
              <span className="font-semibold">Fantastic!</span> Based on your priorities, here is the AI-powered solution I've custom-built for you.
            </p>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Your Personalized Solution</h1>
          <p className="text-lg text-slate-600">This setup is designed to address your top risks and maximize your return on investment.</p>
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1 text-base">
            <Sparkles className="w-4 h-4 mr-2" />
            Step 4 of 5 - AI Recommendations
          </Badge>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="text-blue-600"/>Recommended AI Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.agents.map(agent => (
              <div key={agent.display_name} className="p-3 bg-slate-50 rounded-lg">
                <p className="font-semibold">{agent.display_name}</p>
                <p className="text-sm text-slate-600">{agent.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardCheck className="text-green-600"/>Suggested Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.workflows.map(workflow => (
              <div key={workflow.name} className="p-3 bg-slate-50 rounded-lg">
                <p className="font-semibold">{workflow.name}</p>
                <p className="text-sm text-slate-600">{workflow.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

       <Card className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <h3 className="text-lg font-semibold">Estimated Annual ROI</h3>
            <p className="text-4xl font-bold">${recommendations.estimated_roi.toLocaleString()}</p>
            <p className="opacity-80 text-sm">based on incident reduction and operational efficiency</p>
          </CardContent>
       </Card>
      
      <div className="flex justify-between max-w-6xl mx-auto">
        <Button variant="outline" onClick={onPrevious} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Complete Setup
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}