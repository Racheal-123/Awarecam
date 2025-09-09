
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Camera, ArrowLeft, Wifi, Cpu, Monitor, Smartphone, Globe, Info, AlertCircle, Eye, DatabaseZap, Loader2 } from 'lucide-react';
import DeviceCameraSetup from '@/components/cameras/DeviceCameraSetup';
import { Location } from '@/api/entities';
import { User } from '@/api/entities';
import AnalogCameraSetup from '@/components/cameras/AnalogCameraSetup';
import { useToast } from '@/components/ui/use-toast';
import SafeHLSPlayer from '@/components/video/SafeHLSPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import DevicePairingHandler from '@/components/cameras/DevicePairingHandler';

// Preview Modal Component
const PreviewModal = ({ isOpen, onClose, streamUrl, cameraName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Stream Preview - {cameraName || 'Camera'}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 aspect-video rounded-lg overflow-hidden">
          <SafeHLSPlayer src={streamUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Refactored live preview component to use SafeHLSPlayer
const LivePreview = ({ streamUrl }) => {
  const [infoMessage, setInfoMessage] = useState('');
  const [isHls, setIsHls] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [isStandardVideo, setIsStandardVideo] = useState(false);

  useEffect(() => {
    // Reset all states when URL changes
    setInfoMessage('');
    setIsHls(false);
    setIsUnsupported(false);
    setIsStandardVideo(false);

    if (!streamUrl) return;

    // Check for unsupported types first
    try {
      if (streamUrl.startsWith('rtsp:')) {
        setInfoMessage("RTSP streams can't be previewed directly. Save the camera, and our servers will connect to it.");
        setIsUnsupported(true);
        return;
      }
      const url = new URL(streamUrl);
      if (url.username || url.password) {
        setInfoMessage("Authenticated streams can't be previewed for security reasons. Save the camera to connect via the backend.");
        setIsUnsupported(true);
        return;
      }
    } catch (e) {
      // Ignore URL parsing errors for now, let the player try
    }
    
    // Check if it's an HLS stream
    if (/\.m3u8(\?.*)?$/i.test(streamUrl)) {
      setIsHls(true);
    } else {
      // Assume it's a standard video file otherwise
      setIsStandardVideo(true);
    }

  }, [streamUrl]);

  // Render "empty" state
  if (!streamUrl) {
    return (
      <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
        <div className="text-center text-slate-500">
          <Camera className="w-12 h-12 mx-auto mb-2" />
          <p>Enter stream URL to preview</p>
        </div>
      </div>
    );
  }

  // Render informational message for unsupported types
  if (isUnsupported) {
    return (
      <div className="aspect-video bg-blue-100/50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300 p-4">
        <div className="text-center text-blue-800">
          <Info className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Preview Unavailable</p>
          <p className="text-sm mt-1">{infoMessage}</p>
        </div>
      </div>
    );
  }

  // Render the appropriate player
  if (isHls) {
    return <SafeHLSPlayer src={streamUrl} />;
  }

  if (isStandardVideo) {
     return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <video src={streamUrl} controls playsInline autoPlay muted className="w-full h-full object-contain" />
      </div>
    );
  }

  // Fallback case (should be rare)
  return null;
};


export default function RealCameraSetup({ camera, onComplete, onCancel, onBack, organization }) {
  const [currentStep, setCurrentStep] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [user, setUser] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [urlError, setUrlError] = useState('');

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: camera?.name || '',
    location_id: camera?.location_id || '',
    camera_type: camera?.camera_type || 'public_feed', // Default to public_feed to match the UI
    rtsp_url: camera?.rtsp_url || '',
    resolution: camera?.resolution || '1920x1080',
    frame_rate: camera?.frame_rate || 30,
    manufacturer: camera?.manufacturer || '',
    supports_audio: camera?.supports_audio || false,
    ptz_enabled: camera?.ptz_enabled || false,
    ai_agents: camera?.ai_agents || [],
    is_streaming: camera?.is_streaming !== false,
    stream_status: camera?.stream_status || 'idle',
    device_info: camera?.device_info || null,
  });

  const [previewUrl, setPreviewUrl] = useState(formData.rtsp_url || '');

  // Effect to validate the stream URL based on camera type
  useEffect(() => {
    const url = formData.rtsp_url.trim();
    if (!url) {
      setUrlError('');
      return;
    }

    if (formData.camera_type === 'public_feed') {
      if (!url.includes('.m3u8')) {
        setUrlError("This looks like RTSP. Switch type to RTSP/IP or provide an HLS .m3u8 URL.");
      } else {
        setUrlError('');
      }
    } else if (formData.camera_type === 'rtsp') {
      if (!url.startsWith('rtsp://')) {
        setUrlError("Please enter a valid RTSP URL (rtsp://…).");
      } else {
        setUrlError('');
      }
    } else {
      setUrlError('');
    }
  }, [formData.rtsp_url, formData.camera_type]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, locationsData] = await Promise.all([
          User.me(),
          Location.list()
        ]);
        setUser(userData);
        setLocations(locationsData);

        // If editing and camera has location_id but formData doesn't, set it
        if (camera?.location_id && !formData.location_id) {
          setFormData(prev => ({ ...prev, location_id: camera.location_id }));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "Error",
          description: "Failed to load required data. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, [camera, toast, formData.location_id]);

  const handleSubmit = async () => {
    if (!organization) {
      toast({
        title: "Error",
        description: "Organization information is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.location_id || !formData.rtsp_url) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including name, location, and stream URL.",
        variant: "destructive"
      });
      return;
    }

    // Validation before submit
    if (urlError) {
      toast({
        title: "Validation Error",
        description: "Please fix the URL error before saving.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Find the selected location to get its name
      const selectedLocation = locations.find(loc => loc.id === formData.location_id);
      
      const cameraData = {
        name: formData.name.trim(),
        location_id: formData.location_id,
        organization_id: organization.id,
        camera_type: formData.camera_type,
        rtsp_url: formData.rtsp_url.trim(),
        resolution: formData.resolution,
        frame_rate: parseInt(formData.frame_rate) || 30,
        manufacturer: formData.manufacturer.trim(),
        supports_audio: formData.supports_audio,
        ptz_enabled: formData.ptz_enabled,
        ai_agents: formData.ai_agents,
        is_streaming: formData.is_streaming,
        stream_status: formData.stream_status,
        device_info: formData.device_info,
        status: 'inactive', // Set initial status
        location: selectedLocation ? selectedLocation.name : 'Unknown Location',
        // Add additional fields for public feeds
        ...(formData.camera_type === 'public_feed' && {
          is_public_feed: false, // This is a real camera, not demo data. This field implies it's NOT a public demo feed.
          hls_url: formData.rtsp_url.trim() // For public feeds, use the provided URL as HLS URL
        })
      };
      
      console.log('Creating camera with data:', cameraData);
      
      await onComplete(cameraData);

    } catch (error) {
      console.error('Failed to save camera:', error);
      toast({
        title: "Error",
        description: `Failed to save camera: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceCameraConnect = (deviceData) => {
    toast({
      title: "Device Connected",
      description: "Your device's camera is now connected. Please name it.",
    });
    setFormData({
      ...formData,
      name: deviceData.name || formData.name || 'Device Camera', // Prefer device name if provided
      camera_type: 'device_camera',
      device_info: deviceData, // Store device specific info
    });
  };

  const handlePreviewClick = () => {
    const url = previewUrl.trim();
    
    // This should not be triggered if button is disabled, but as a safeguard
    if (urlError) {
      toast({ title: "Invalid URL", description: urlError, variant: "destructive" });
      return;
    }
    
    // If it's a valid RTSP URL, show the informational toast
    if (formData.camera_type === 'rtsp' && url.startsWith('rtsp://')) {
      toast({
        title: "RTSP Preview Info",
        description: "RTSP preview requires converting via our server. You can save the camera and start the stream from the camera list.",
      });
      return;
    }

    // If it's a valid HLS URL, open the preview modal
    if (formData.camera_type === 'public_feed' && url.includes('.m3u8')) {
      setShowPreviewModal(true);
      return;
    }
  };

  const showStreamFields = formData.camera_type === 'rtsp' || formData.camera_type === 'public_feed';

  return (
    <div>
      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <CardTitle>{camera ? 'Edit Camera' : 'Add a New Camera'}</CardTitle>
          <CardDescription>Set up a new camera for your network.</CardDescription>
        </div>
      </CardHeader>
      
      <div className="p-6">
        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Camera Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Warehouse Entrance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select
                  value={formData.location_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, location_id: value }))}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {locations.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">No locations available. Please create a location first.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="camera_type">Camera Type</Label>
                <Select
                  value={formData.camera_type}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, camera_type: value }));
                  }}
                >
                  <SelectTrigger id="camera_type">
                    <SelectValue placeholder="Select camera type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public_feed">
                      <div className="flex items-center gap-2"><DatabaseZap className="w-4 h-4" /> Public Feed</div>
                    </SelectItem>
                    <SelectItem value="rtsp">
                      <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> RTSP / IP Camera</div>
                    </SelectItem>
                    <SelectItem value="device_camera">
                      <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Device Camera</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.camera_type === 'device_camera' && (
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <h4 className="font-medium text-blue-900 mb-2">Device Camera Setup</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Connect your phone, tablet, or computer camera to use as a security camera.
                  </p>
                  <DeviceCameraSetup
                    onConnect={handleDeviceCameraConnect}
                    existingDeviceId={formData.device_info?.deviceId}
                  />
                </div>
              )}

              <AnimatePresence>
                {showStreamFields && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="stream-url">
                        {formData.camera_type === 'public_feed' ? 'Stream URL' : 'RTSP URL'} *
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="stream-url"
                          value={formData.rtsp_url}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, rtsp_url: e.target.value }));
                            setPreviewUrl(e.target.value);
                          }}
                          placeholder={
                            formData.camera_type === 'public_feed' 
                              ? "https://example.com/stream.m3u8" 
                              : "rtsp://username:password@ip:port/stream"
                          }
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={handlePreviewClick}
                          disabled={!previewUrl.trim() || !!urlError}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                      {urlError ? (
                        <p className="text-sm text-red-600 mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{urlError}</p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          {formData.camera_type === 'public_feed' 
                            ? "Enter the direct HLS (.m3u8) stream URL"
                            : "Include credentials in URL if required: rtsp://user:pass@ip:port/stream"
                          }
                        </p>
                      )}
                    </div>
                    {previewUrl && !urlError && (
                      <div className="space-y-2">
                        <Label>Live Preview</Label>
                        <LivePreview streamUrl={previewUrl} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Input id="resolution" value={formData.resolution} onChange={(e) => setFormData(prev => ({...prev, resolution: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frame_rate">Frame Rate (fps)</Label>
                  <Input id="frame_rate" type="number" value={formData.frame_rate} onChange={(e) => setFormData(prev => ({...prev, frame_rate: e.target.value}))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input id="manufacturer" value={formData.manufacturer} onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))} placeholder="e.g., Hikvision" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="supports_audio"
                  checked={formData.supports_audio}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, supports_audio: checked }))}
                />
                <Label htmlFor="supports_audio">Supports Audio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ptz_enabled"
                  checked={formData.ptz_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ptz_enabled: checked }))}
                />
                <Label htmlFor="ptz_enabled">PTZ (Pan-Tilt-Zoom) Enabled</Label>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t px-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !formData.name || !formData.location_id || !formData.rtsp_url || !!urlError}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? 'Saving...' : (camera ? 'Save Changes' : 'Add Camera')}
        </Button>
      </div>

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        streamUrl={previewUrl}
        cameraName={formData.name}
      />
    </div>
  );
}
