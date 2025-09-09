import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Camera,
  Smartphone, 
  Globe, 
  Video, 
  ArrowRight, 
  Zap,
  Wifi
} from 'lucide-react';

export default function SmartCameraSetup({ 
  onSelectDemo, 
  onSelectReal, 
  onSelectDeviceCamera, 
  onCancel, 
  industryType 
}) {

  const setupOptions = [
    {
      id: 'device_camera',
      title: 'Use Device Camera',
      description: 'Connect your phone, tablet, or laptop camera instantly',
      icon: Smartphone,
      color: 'from-green-500 to-emerald-600',
      features: ['Instant setup', 'No additional hardware', 'WiFi enabled'],
      action: onSelectDeviceCamera,
      badge: 'Quick Start'
    },
    {
      id: 'demo',
      title: 'Try Demo Feeds',
      description: `Explore ${industryType || 'industry'}-specific demo cameras`,
      icon: Globe,
      color: 'from-blue-500 to-blue-600',
      features: ['Public demo streams', 'Industry examples', 'No setup required'],
      action: onSelectDemo,
      badge: 'No Setup'
    },
    {
      id: 'real',
      title: 'Connect Real Cameras',
      description: 'Set up IP cameras, RTSP streams, or WiFi cameras',
      icon: Video,
      color: 'from-purple-500 to-purple-600',
      features: ['Professional cameras', 'RTSP/IP support', 'WiFi cameras', 'Advanced features'],
      action: onSelectReal,
      badge: 'Professional'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-2xl font-bold text-slate-900 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Add Your Camera
        </motion.h2>
        
        <motion.p 
          className="text-slate-600 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Choose how you'd like to set up your camera monitoring system
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {setupOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="relative h-full cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 rounded-lg transition-opacity`} />
                
                {option.badge && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className={`bg-gradient-to-r ${option.color} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg`}>
                      {option.badge}
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2 mb-6">
                    {option.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${option.color}`} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={option.action}
                    className={`w-full bg-gradient-to-r ${option.color} hover:shadow-lg transition-all group-hover:scale-105`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="text-slate-600 hover:text-slate-800"
        >
          Cancel Setup
        </Button>
      </div>

      {/* WiFi Camera Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center gap-2 text-blue-700">
          <Wifi className="w-5 h-5" />
          <span className="font-medium">WiFi Camera Support</span>
        </div>
        <p className="text-sm text-blue-600 mt-1">
          All setup options support WiFi-enabled cameras, including wireless IP cameras and mobile device cameras.
        </p>
      </motion.div>
    </div>
  );
}