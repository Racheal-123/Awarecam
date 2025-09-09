import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Smartphone, 
  Globe, 
  Monitor, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Settings
} from 'lucide-react';

const CAMERA_METHODS = {
  rtsp: {
    title: 'Network Camera (RTSP/IP)',
    icon: Globe,
    description: 'Connect existing IP cameras using network URLs',
    difficulty: 'Technical',
    timeEstimate: '2-5 minutes',
    recommended: true
  },
  device: {
    title: 'Use This Device',
    icon: Monitor,
    description: 'Turn your computer camera into a monitoring camera',
    difficulty: 'Easy',
    timeEstimate: '1-2 minutes',
    popular: true
  },
  mobile: {
    title: 'Mobile Device Camera',
    icon: Smartphone,
    description: 'Use your phone or tablet as a camera',
    difficulty: 'Easy',
    timeEstimate: '1-2 minutes',
    coming_soon: false
  }
};

export default function CameraSetupStep({ data, allData, onComplete, onAiMessage }) {
  const [selectedMethod, setSelectedMethod] = useState(data.selected_method || '');
  const [cameraConfig, setCameraConfig] = useState({
    rtsp_url: data.rtsp_url || '',
    camera_name: data.camera_name || 'My First Camera',
    location: data.location || '',
    test_status: data.test_status || 'untested'
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const industryType = allData.business_profile?.industry_type;

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    
    // Send contextual AI message
    if (onAiMessage) {
      const methodInfo = CAMERA_METHODS[method];
      onAiMessage(`I want to use the "${methodInfo.title}" method to add my camera. Can you walk me through the setup process?`);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, assume success
      setCameraConfig(prev => ({
        ...prev,
        test_status: 'success'
      }));
      
      if (onAiMessage) {
        onAiMessage("Great! My camera connection test was successful. What's the next step?");
      }
    } catch (error) {
      setCameraConfig(prev => ({
        ...prev,
        test_status: 'failed'
      }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleContinue = () => {
    const setupData = {
      selected_method: selectedMethod,
      ...cameraConfig,
      cameras_added: 1,
      setup_completed: cameraConfig.test_status === 'success'
    };

    onComplete(setupData);
  };

  const getIndustryGuidance = () => {
    const guidance = {
      warehouse: "For warehouses, I recommend positioning cameras at loading docks, main aisles, and high-value storage areas.",
      manufacturing: "In manufacturing, focus on production lines, safety zones, and equipment areas for optimal monitoring.",
      retail: "For retail, place cameras at entrances, checkout areas, and high-traffic merchandise sections.",
      office: "Office environments benefit from entrance monitoring and common area coverage."
    };

    return guidance[industryType] || "Position your camera to cover the most important areas of your facility.";
  };

  const canContinue = selectedMethod && cameraConfig.camera_name && (
    selectedMethod === 'device' || 
    selectedMethod === 'mobile' || 
    (selectedMethod === 'rtsp' && cameraConfig.rtsp_url && cameraConfig.test_status === 'success')
  );

  return (
    <div className="space-y-6">
      {/* Industry-specific guidance */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Camera Placement Tip</h4>
              <p className="text-sm text-blue-700 mt-1">{getIndustryGuidance()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method Selection */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-4 block">
          Choose how you'd like to add your first camera
        </Label>
        
        <div className="grid gap-4">
          {Object.entries(CAMERA_METHODS).map(([key, method]) => {
            const IconComponent = method.icon;
            const isSelected = selectedMethod === key;
            
            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                } ${method.coming_soon ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !method.coming_soon && handleMethodSelect(key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isSelected ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-900">{method.title}</h3>
                        {method.recommended && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Recommended</Badge>
                        )}
                        {method.popular && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">Most Popular</Badge>
                        )}
                        {method.coming_soon && (
                          <Badge className="bg-slate-100 text-slate-500 text-xs">Coming Soon</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{method.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Difficulty: {method.difficulty}</span>
                        <span>Setup time: {method.timeEstimate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Configuration Form */}
      {selectedMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Camera Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="camera_name">Camera Name *</Label>
              <Input
                id="camera_name"
                placeholder="e.g., Main Entrance, Loading Dock A"
                value={cameraConfig.camera_name}
                onChange={(e) => setCameraConfig(prev => ({ ...prev, camera_name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="camera_location">Location</Label>
              <Input
                id="camera_location"
                placeholder="e.g., Building A, Zone 1, Front Office"
                value={cameraConfig.location}
                onChange={(e) => setCameraConfig(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1"
              />
            </div>

            {selectedMethod === 'rtsp' && (
              <>
                <div>
                  <Label htmlFor="rtsp_url">Camera URL *</Label>
                  <Input
                    id="rtsp_url"
                    placeholder="rtsp://192.168.1.100:554/stream or http://camera-ip/mjpeg"
                    value={cameraConfig.rtsp_url}
                    onChange={(e) => setCameraConfig(prev => ({ ...prev, rtsp_url: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your camera's RTSP or HTTP stream URL. Check your camera manual for the correct format.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={!cameraConfig.rtsp_url || isTestingConnection}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isTestingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>

                  {cameraConfig.test_status === 'success' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Connection successful!</span>
                    </div>
                  )}

                  {cameraConfig.test_status === 'failed' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Connection failed. Check your URL.</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {(selectedMethod === 'device' || selectedMethod === 'mobile') && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Easy Setup Ready</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your device camera is ready to use. We'll help you enable it after you complete the setup.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleContinue}
          disabled={!canContinue}
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          {selectedMethod === 'rtsp' && cameraConfig.test_status !== 'success' 
            ? 'Test Connection First' 
            : 'Continue Setup'
          }
        </Button>
      </div>
    </div>
  );
}