import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Play, 
  Globe, 
  Clock, 
  CheckCircle, 
  Users,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

export default function DemoExperience({ camera, onComplete, onBack }) {
  const [selectedFeed, setSelectedFeed] = useState(camera?.rtsp_url || '');
  const [cameraName, setCameraName] = useState(camera?.name || '');
  const [selectedIndustry, setSelectedIndustry] = useState('retail');

  const demoFeeds = {
    retail: [
      {
        id: 'retail-entrance',
        name: 'Store Entrance',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        description: 'Customer flow and entrance monitoring',
        detections: ['Person Detection', 'Queue Analysis', 'Traffic Counting']
      },
      {
        id: 'retail-checkout',
        name: 'Checkout Area',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        description: 'Point-of-sale and queue management',
        detections: ['Queue Detection', 'Theft Prevention', 'Customer Behavior']
      }
    ],
    warehouse: [
      {
        id: 'warehouse-loading',
        name: 'Loading Dock',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        description: 'Vehicle and worker safety monitoring',
        detections: ['Vehicle Detection', 'Safety Compliance', 'Loading Activity']
      },
      {
        id: 'warehouse-storage',
        name: 'Storage Area',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        description: 'Inventory and movement tracking',
        detections: ['Inventory Tracking', 'Worker Safety', 'Equipment Monitoring']
      }
    ],
    office: [
      {
        id: 'office-reception',
        name: 'Reception Area',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        description: 'Visitor management and security',
        detections: ['Visitor Detection', 'Access Control', 'Occupancy Monitoring']
      }
    ]
  };

  const currentFeeds = demoFeeds[selectedIndustry] || demoFeeds.retail;
  const currentFeed = currentFeeds.find(f => f.url === selectedFeed) || currentFeeds[0];

  const handleComplete = () => {
    if (!selectedFeed || !cameraName.trim()) return;

    const cameraData = {
      name: cameraName.trim(),
      rtsp_url: selectedFeed,
      camera_type: 'public_feed',
      status: 'active',
      is_streaming: true,
      resolution: '1920x1080',
      frame_rate: 30,
      ai_agents: currentFeed?.detections || [],
      health_score: 100,
      uptime: '100%',
      events_today: Math.floor(Math.random() * 100) + 50,
      ptz_enabled: false,
      supports_audio: false,
      zone_config: { zones: [] },
      device_info: {},
      is_public_feed: true
    };

    onComplete(cameraData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6"
    >
      <DialogHeader className="mb-6">
        <DialogTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          {camera ? 'Edit Demo Feed' : 'Demo Feed Experience'}
        </DialogTitle>
        <DialogDescription>
          {camera ? 'Modify your demo camera settings' : 'Try AwareCam with industry-specific demo feeds to see AI detection in action'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="camera-name" className="text-sm font-medium">
                Camera Name
              </Label>
              <Input
                id="camera-name"
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
                placeholder="e.g., Demo - Main Entrance"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Industry Context</Label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail Store</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="office">Office Building</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Choose Demo Feed</Label>
              <div className="space-y-2">
                {currentFeeds.map((feed) => (
                  <Card 
                    key={feed.id}
                    className={`cursor-pointer transition-all ${
                      selectedFeed === feed.url 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setSelectedFeed(feed.url);
                      if (!cameraName.trim()) {
                        setCameraName(`Demo - ${feed.name}`);
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        {feed.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {feed.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {feed.detections.map((detection, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {detection}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  What You'll Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Real-time AI Detection</p>
                    <p className="text-sm text-slate-600">See live object and activity recognition</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">People & Vehicle Tracking</p>
                    <p className="text-sm text-slate-600">Count and analyze movement patterns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Safety & Security Alerts</p>
                    <p className="text-sm text-slate-600">Automated incident detection and notifications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Analytics Dashboard</p>
                    <p className="text-sm text-slate-600">Historical data and performance insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {currentFeed && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview: {currentFeed.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                    <video 
                      src={currentFeed.url}
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!selectedFeed || !cameraName.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {camera ? 'Update Demo Camera' : 'Start Demo Experience'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}