import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Target, 
  Square, 
  Eye, 
  Shield, 
  Zap,
  HelpCircle,
  CheckCircle,
  TrendingUp,
  Users,
  AlertTriangle
} from 'lucide-react';

import { CameraZone } from '@/api/entities';
import { DiscoveredObject } from '@/api/entities';

const ZONE_TEMPLATES = {
  warehouse: [
    { type: 'loading_dock', name: 'Loading Dock Zone', color: 'blue' },
    { type: 'work_area', name: 'Work Area', color: 'green' },
    { type: 'safety_zone', name: 'Safety Zone', color: 'red' },
    { type: 'storage_area', name: 'Storage Area', color: 'purple' }
  ],
  manufacturing: [
    { type: 'production_line', name: 'Production Line', color: 'blue' },
    { type: 'safety_zone', name: 'Safety Zone', color: 'red' },
    { type: 'quality_station', name: 'Quality Station', color: 'green' },
    { type: 'work_area', name: 'Work Area', color: 'purple' }
  ],
  retail: [
    { type: 'entrance_exit', name: 'Entrance/Exit', color: 'blue' },
    { type: 'checkout_area', name: 'Checkout Area', color: 'green' },
    { type: 'high_value', name: 'High Value Items', color: 'red' },
    { type: 'customer_area', name: 'Customer Area', color: 'purple' }
  ]
};

export default function ZoneDrawingInterface({ camera, detectedObjects, organization, onBack, onComplete }) {
  const [zones, setZones] = useState([]);
  const [currentZone, setCurrentZone] = useState(null);
  const [selectedZoneType, setSelectedZoneType] = useState('work_area');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [unknownObjects, setUnknownObjects] = useState([]);
  const canvasRef = useRef(null);

  const industryType = organization?.industry_type || 'warehouse';
  const zoneTemplates = ZONE_TEMPLATES[industryType] || ZONE_TEMPLATES.warehouse;

  useEffect(() => {
    // Simulate some unknown objects for the learning experience
    const mockUnknowns = [
      {
        id: 'unknown-1',
        type: 'unknown',
        confidence: 0.75,
        x: 150,
        y: 200,
        width: 80,
        height: 60,
        needsIdentification: true
      }
    ];
    setUnknownObjects(mockUnknowns);
  }, []);

  const handleCanvasMouseDown = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDrawingPoints([...drawingPoints, { x, y }]);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || drawingPoints.length === 0) return;
    
    // Update drawing preview (you would implement this with canvas drawing)
  };

  const handleFinishZone = () => {
    if (drawingPoints.length < 3) return;

    const newZone = {
      id: `zone-${Date.now()}`,
      zone_name: `${selectedZoneType.replace('_', ' ')} ${zones.length + 1}`,
      zone_type: selectedZoneType,
      coordinates: { points: drawingPoints },
      detected_objects: analyzeZoneObjects(drawingPoints),
      discovery_status: 'discovered',
      zone_activity_level: 'medium'
    };

    setZones([...zones, newZone]);
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  const analyzeZoneObjects = (points) => {
    // Mock analysis - in real implementation, check which detected objects fall within the zone
    return detectedObjects.filter(() => Math.random() > 0.5).map(obj => ({
      object_type: obj.type,
      confidence: obj.confidence,
      frequency: Math.floor(Math.random() * 50) + 10
    }));
  };

  const handleObjectIdentification = (unknownObj, identification) => {
    // Save the identified object
    const identifiedObject = {
      ...unknownObj,
      object_type: identification.type,
      object_name: identification.name,
      customer_confirmed: true,
      learning_status: 'confirmed'
    };

    // Remove from unknowns and add to confirmed
    setUnknownObjects(prev => prev.filter(obj => obj.id !== unknownObj.id));
    
    // In real implementation, save to DiscoveredObject entity
    console.log('Object identified:', identifiedObject);
  };

  const getZoneRecommendations = (zone) => {
    const objectTypes = zone.detected_objects?.map(obj => obj.object_type) || [];
    const recommendations = [];

    if (objectTypes.includes('person') && objectTypes.includes('forklift')) {
      recommendations.push({
        agent: 'Forklift Proximity Agent',
        reason: 'Prevents collisions between people and forklifts',
        confidence: 'Perfect match!',
        roi: '$15,000 saved annually'
      });
    }

    if (objectTypes.includes('person') && zone.zone_type === 'safety_zone') {
      recommendations.push({
        agent: 'PPE Detection Agent',
        reason: 'Ensures safety equipment compliance',
        confidence: 'Highly recommended',
        roi: '78% reduction in incidents'
      });
    }

    return recommendations;
  };

  const handleSaveConfiguration = async () => {
    try {
      // Save zones to database
      const savedZones = await Promise.all(
        zones.map(zone => CameraZone.create({
          ...zone,
          camera_id: camera.id,
          organization_id: organization.id
        }))
      );

      onComplete(savedZones);
    } catch (error) {
      console.error('Error saving zones:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Smart Zone Configuration</h2>
            <p className="text-slate-600">Draw monitoring zones with AI guidance</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800">
          <Eye className="w-3 h-3 mr-1" />
          Live AI Analysis Active
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Drawing Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  {camera.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isDrawing ? "default" : "outline"}
                    onClick={() => setIsDrawing(!isDrawing)}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    {isDrawing ? 'Drawing Mode' : 'Start Drawing'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-slate-900 aspect-video rounded-lg overflow-hidden">
                {/* Mock Camera Feed */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-white text-center opacity-50">
                    <div className="text-lg font-medium">Live Camera Feed</div>
                    <div className="text-sm">AI Detection Active</div>
                  </div>
                </div>

                {/* Drawing Canvas Overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  style={{ pointerEvents: isDrawing ? 'auto' : 'none' }}
                />

                {/* Detected Objects Overlay */}
                {detectedObjects.map((obj, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute border-2 border-green-400 bg-green-400/20"
                    style={{
                      left: `${(obj.x || Math.random() * 400) + 50}px`,
                      top: `${(obj.y || Math.random() * 200) + 50}px`,
                      width: '80px',
                      height: '60px',
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-green-600 text-white px-2 py-1 rounded text-xs">
                      {obj.label} ({Math.round(obj.confidence * 100)}%)
                    </div>
                  </motion.div>
                ))}

                {/* Unknown Objects */}
                {unknownObjects.map((obj) => (
                  <motion.div
                    key={obj.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute border-2 border-amber-400 bg-amber-400/30 cursor-pointer"
                    style={{
                      left: `${obj.x}px`,
                      top: `${obj.y}px`,
                      width: `${obj.width}px`,
                      height: `${obj.height}px`,
                    }}
                    onClick={() => setSelectedObject(obj)}
                  >
                    <div className="absolute -top-6 left-0 bg-amber-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      Unknown Object
                    </div>
                  </motion.div>
                ))}

                {/* Existing Zones */}
                {zones.map((zone, index) => (
                  <div
                    key={zone.id}
                    className="absolute border-2 border-blue-400 bg-blue-400/20"
                    style={{
                      left: `${100 + index * 120}px`,
                      top: `${80 + index * 60}px`,
                      width: '100px',
                      height: '80px',
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {zone.zone_name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawing Controls */}
              {isDrawing && (
                <div className="mt-4 flex items-center gap-4">
                  <Select value={selectedZoneType} onValueChange={setSelectedZoneType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {zoneTemplates.map((template) => (
                        <SelectItem key={template.type} value={template.type}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleFinishZone} disabled={drawingPoints.length < 3}>
                    Finish Zone
                  </Button>
                  <Button variant="outline" onClick={() => setDrawingPoints([])}>
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone Performance Preview */}
          {zones.length > 0 && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-green-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Zone Configuration Analysis
                  </h3>
                  <Badge className="bg-green-100 text-green-800">
                    Excellent Setup - 9.2/10
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-green-700">Expected Accuracy</p>
                    <p className="font-bold text-green-900">96%</p>
                  </div>
                  <div>
                    <p className="text-green-700">Daily Events</p>
                    <p className="font-bold text-green-900">45-60</p>
                  </div>
                  <div>
                    <p className="text-green-700">Coverage</p>
                    <p className="font-bold text-green-900">Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Zone List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configured Zones</CardTitle>
            </CardHeader>
            <CardContent>
              {zones.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  Draw your first monitoring zone to get started
                </p>
              ) : (
                <div className="space-y-3">
                  {zones.map((zone) => (
                    <div key={zone.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="font-medium text-slate-900">{zone.zone_name}</div>
                      <div className="text-sm text-slate-600 capitalize">{zone.zone_type.replace('_', ' ')}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {zone.detected_objects?.length || 0} objects
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {zone.zone_activity_level} activity
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          {zones.length > 0 && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {zones.map((zone) => {
                    const recommendations = getZoneRecommendations(zone);
                    return recommendations.map((rec, index) => (
                      <div key={`${zone.id}-${index}`} className="p-3 bg-white rounded-lg border">
                        <div className="font-medium text-slate-900 text-sm">{rec.agent}</div>
                        <div className="text-xs text-slate-600 mt-1">{rec.reason}</div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {rec.confidence}
                          </Badge>
                          <span className="text-xs text-blue-600 font-medium">{rec.roi}</span>
                        </div>
                      </div>
                    ));
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Setup */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-green-900 mb-2">Ready to Go!</h3>
              <p className="text-green-700 text-sm mb-4">
                Your camera is now AI-powered and ready for intelligent monitoring
              </p>
              <Button 
                onClick={handleSaveConfiguration}
                className="bg-green-600 hover:bg-green-700 w-full"
                disabled={zones.length === 0}
              >
                Complete Camera Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Object Identification Modal */}
      {selectedObject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedObject(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <HelpCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">I Found Something Interesting!</h3>
              <p className="text-slate-600 text-sm">What is this object? Your feedback helps me learn.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">What should I call this?</label>
                <input 
                  type="text" 
                  placeholder="e.g., Conveyor Belt, Safety Sign, Tool Cart"
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700">Object Category</label>
                <select className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md">
                  <option>Equipment</option>
                  <option>Safety Item</option>
                  <option>Furniture</option>
                  <option>Vehicle</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="monitor" className="rounded" />
                <label htmlFor="monitor" className="text-sm text-slate-700">
                  Should I monitor this object for safety or compliance?
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedObject(null)}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button 
                  onClick={() => {
                    handleObjectIdentification(selectedObject, {
                      type: 'equipment',
                      name: 'User Identified Object'
                    });
                    setSelectedObject(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Teach AI
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}