import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from "lucide-react";

export default function CameraForm({ camera, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    camera || {
      name: '',
      location: '',
      rtsp_url: '',
      camera_type: 'rtsp',
      resolution: '1920x1080',
      frame_rate: 30,
      status: 'inactive',
      ai_agents: [],
      device_info: null
    }
  );

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Camera name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.camera_type === 'rtsp' && !formData.rtsp_url.trim()) {
      newErrors.rtsp_url = 'RTSP URL is required for RTSP cameras';
    }

    if (formData.rtsp_url && formData.camera_type !== 'device_camera' && !formData.rtsp_url.startsWith('rtsp://') && !formData.rtsp_url.startsWith('https://')) {
      newErrors.rtsp_url = 'Stream URL must start with rtsp:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          {camera ? 'Edit Camera' : 'Add New Camera'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Camera Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Main Entrance Camera"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Building A - Lobby"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="camera_type">Camera Type</Label>
              <Select 
                value={formData.camera_type} 
                onValueChange={(value) => setFormData({...formData, camera_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rtsp">RTSP Camera</SelectItem>
                  <SelectItem value="ip">IP Camera</SelectItem>
                  <SelectItem value="analog">Analog Camera</SelectItem>
                  <SelectItem value="device_camera">Device Camera</SelectItem>
                  <SelectItem value="public_feed">Public Feed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Only show RTSP URL for non-device cameras */}
          {formData.camera_type !== 'device_camera' && (
            <div>
              <Label htmlFor="rtsp_url">Stream URL</Label>
              <Input
                id="rtsp_url"
                value={formData.rtsp_url}
                onChange={(e) => setFormData({...formData, rtsp_url: e.target.value})}
                placeholder="rtsp://... or https://.../playlist.m3u8"
                className={errors.rtsp_url ? 'border-red-500' : ''}
              />
              {errors.rtsp_url && <p className="text-red-500 text-xs mt-1">{errors.rtsp_url}</p>}
            </div>
          )}

          {/* Show device info for device cameras */}
          {formData.camera_type === 'device_camera' && formData.device_info && (
            <Card className="p-4 bg-slate-50">
              <h4 className="font-medium mb-2">Device Information</h4>
              <div className="space-y-1 text-sm text-slate-600">
                <p>Device Type: {formData.device_info.device_type}</p>
                <p>Resolution: {formData.device_info.resolution}</p>
                <p>Frame Rate: {formData.device_info.frame_rate} fps</p>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <Select 
                value={formData.resolution} 
                onValueChange={(value) => setFormData({...formData, resolution: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                  <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                  <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frame_rate">Frame Rate</Label>
              <Select 
                value={formData.frame_rate.toString()} 
                onValueChange={(value) => setFormData({...formData, frame_rate: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 fps</SelectItem>
                  <SelectItem value="25">25 fps</SelectItem>
                  <SelectItem value="30">30 fps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* AI Agents */}
          <div>
            <Label>AI Agents</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['person_detection', 'motion_detection', 'vehicle_detection', 'safety_compliance', 'ppe_detection'].map(agent => {
                const isSelected = formData.ai_agents.includes(agent);
                return (
                  <div key={agent} className="flex items-center space-x-2">
                    <Switch
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newAgents = checked 
                          ? [...formData.ai_agents, agent]
                          : formData.ai_agents.filter(a => a !== agent);
                        setFormData({...formData, ai_agents: newAgents});
                      }}
                    />
                    <Label className="text-sm">{agent.replace('_', ' ').toUpperCase()}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.location}>
              {camera ? 'Update Camera' : 'Add Camera'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}