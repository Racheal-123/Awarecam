import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Camera, Users, Shield } from 'lucide-react';

const ALEX_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";

export default function CompletionStep({ data = {}, onComplete }) {
  // Removed verbose console logs that can cause issues in cross-origin iframes
  const orgName = data.name || 'Your Organization';

  const handleComplete = () => {
    if (onComplete) {
      // The parent component (WelcomePage) already has the data.
      // We just need to trigger the onComplete function without passing data.
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src={ALEX_AVATAR} alt="AI Assistant" className="w-20 h-20 rounded-full border-4 border-green-100" />
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl border-l-4 border-green-500">
            <p className="text-lg text-slate-700">
              <span className="font-semibold">Congratulations {orgName}!</span> Your personalized AI system is ready. 
              Let's get you started with your first camera setup.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          <h1 className="text-4xl font-bold text-slate-900">Setup Complete!</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Your AI-powered video intelligence system is configured and ready to deploy.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <Camera className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-green-900 mb-2">Connect Cameras</h3>
            <p className="text-green-700 text-sm">Add your first camera and start monitoring</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-blue-900 mb-2">AI Agents Active</h3>
            <p className="text-blue-700 text-sm">Your personalized AI agents are ready to work</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-purple-900 mb-2">Invite Your Team</h3>
            <p className="text-purple-700 text-sm">Add users and configure access permissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={handleComplete}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
        >
          Enter AwareCam Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-sm text-slate-500 mt-3">You can always modify these settings later</p>
      </div>
    </motion.div>
  );
}