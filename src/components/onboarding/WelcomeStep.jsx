import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Shield, Video } from 'lucide-react';

const ALEX_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";

export default function WelcomeStep({ data, onNext }) {
  const orgName = (data && data.name) ? data.name : 'there';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src={ALEX_AVATAR} alt="AI Assistant" className="w-20 h-20 rounded-full border-4 border-blue-100" />
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl border-l-4 border-blue-500">
            <p className="text-lg text-slate-700">
              <span className="font-semibold">Hi {orgName}!</span> I'm Alex, your AI setup assistant. 
              I'll help you create a personalized video intelligence system in just 5 minutes.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Welcome to AwareCam</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            AI-powered video intelligence that prevents incidents before they happen
          </p>
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Step 1 of 5 - Let's Get Started
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-blue-900 mb-2">Smart Safety</h3>
            <p className="text-blue-700 text-sm">AI agents that prevent accidents and ensure compliance</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <Video className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-green-900 mb-2">Easy Setup</h3>
            <p className="text-green-700 text-sm">Connect your cameras and get intelligent monitoring instantly</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-purple-900 mb-2">Proven Results</h3>
            <p className="text-purple-700 text-sm">Reduce incidents by 78% and save thousands annually</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
        >
          Start My Personalized Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-sm text-slate-500 mt-3">Takes about 5 minutes • No credit card required</p>
      </div>
    </motion.div>
  );
}