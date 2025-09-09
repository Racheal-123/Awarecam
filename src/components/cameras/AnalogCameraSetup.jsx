import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalogCameraSetup({ onConnect, cameraName, locationId, organizationId }) {
  const [dvrBrand, setDvrBrand] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');

  const getHint = () => {
    switch (dvrBrand) {
      case 'hikvision':
        return "For Hikvision, the stream path is usually /Streaming/Channels/<channel>01. Replace <channel> with your camera's channel number (e.g., 101, 201).";
      case 'dahua':
        return "For Dahua, the path is typically /cam/realmonitor?channel=<channel>&subtype=0. Use '0' for main stream and '1' for sub stream.";
      case 'lorex':
        return "Lorex often uses a format similar to Dahua: rtsp://<user>:<pass>@<ip>:<port>/cam/realmonitor?channel=1&subtype=0";
      default:
        return "You'll need to find the RTSP URL format for your specific DVR/NVR model. This is often found in the network or stream settings of the device's web admin panel.";
    }
  };

  const handleConnect = () => {
    if (!rtspUrl.trim()) {
      toast.error("Please enter the full RTSP Stream URL.");
      return;
    }
    if (!cameraName.trim()) {
      toast.error("Please enter a Camera Name in the fields above.");
      return;
    }
     if (!locationId) {
      toast.error("Please select a Location in the fields above.");
      return;
    }

    const analogCameraData = {
      name: `${cameraName} (Analog)`,
      location_id: locationId,
      organization_id: organizationId,
      rtsp_url: rtspUrl.trim(),
      camera_type: 'analog',
      status: 'active'
    };
    onConnect(analogCameraData);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Connecting Analog Cameras</AlertTitle>
        <AlertDescription>
          To connect analog cameras, you need a DVR (Digital Video Recorder) or NVR (Network Video Recorder) that exposes an RTSP stream for each camera channel.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dvr-brand">DVR/NVR Brand (Optional)</Label>
          <Select value={dvrBrand} onValueChange={setDvrBrand}>
            <SelectTrigger id="dvr-brand" className="w-full">
              <SelectValue placeholder="Select brand for a hint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hikvision">Hikvision</SelectItem>
              <SelectItem value="dahua">Dahua</SelectItem>
              <SelectItem value="lorex">Lorex</SelectItem>
              <SelectItem value="other">Other/Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {dvrBrand && <p className="text-sm text-slate-500 p-3 bg-slate-50 rounded-md border">{getHint()}</p>}

      <div className="space-y-2">
        <Label htmlFor="rtsp-url">Full RTSP Stream URL <span className="text-red-500">*</span></Label>
        <Input
          id="rtsp-url"
          placeholder="rtsp://admin:password@192.168.1.100:554/stream1"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          This is the full connection string for a single camera channel from your DVR/NVR.
        </p>
      </div>

      <Button onClick={handleConnect} disabled={!rtspUrl.trim()} className="w-full">
        Connect Analog Camera Channel
      </Button>
    </div>
  );
}