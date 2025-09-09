import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Location } from '@/api/entities';

import SmartCameraSetup from '@/components/cameras/SmartCameraSetup';
import DemoExperience from '@/components/cameras/DemoExperience';
import RealCameraSetup from '@/components/cameras/RealCameraSetup';
import DeviceCameraSetup from '@/components/cameras/DeviceCameraSetup';

const STEPS = {
  SETUP_TYPE: 'setup_type',
  DEMO: 'demo',
  REAL: 'real',
  DEVICE_CAMERA: 'device_camera'
};

export default function CameraSetupWizard({ camera, onComplete, onCancel, industryType, organization }) {
  // Determine initial step based on camera type
  const getInitialStep = () => {
    if (!camera) return STEPS.SETUP_TYPE;
    if (camera.is_public_feed) return STEPS.DEMO;
    if (camera.camera_type === 'device_camera') return STEPS.DEVICE_CAMERA;
    return STEPS.REAL;
  };
  
  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleDeviceCameraConnect = async (cameraData, stream) => {
    try {
      console.log('Device camera connection data:', cameraData);
      
      // Ensure we have a valid location
      let locationId = selectedLocation;
      
      if (!locationId && organization) {
        // Try to get the first available location for the organization
        try {
          const locations = await Location.filter({ organization_id: organization.id });
          if (locations && locations.length > 0) {
            locationId = locations[0].id;
            console.log('Using first available location:', locations[0]);
          } else {
            // Create a default location if none exists
            const defaultLocation = await Location.create({
              organization_id: organization.id,
              name: 'Main Location',
              country: 'Unknown',
              city: 'Unknown'
            });
            locationId = defaultLocation.id;
            console.log('Created default location:', defaultLocation);
          }
        } catch (locationError) {
          console.error('Failed to handle location:', locationError);
          toast.error('Failed to set up location for camera');
          return;
        }
      }

      if (!locationId) {
        toast.error('No location available. Please create a location first.');
        return;
      }

      // Validate required fields
      if (!organization?.id) {
        toast.error('Organization is required to add camera');
        return;
      }

      if (!cameraData.name?.trim()) {
        toast.error('Camera name is required');
        return;
      }

      // Add required fields for database storage with proper validation
      const fullCameraData = {
        // Required fields
        organization_id: organization.id,
        location_id: locationId,
        name: cameraData.name.trim(),
        
        // Device camera specific fields
        camera_type: 'device_camera',
        device_info: cameraData.device_info || {},
        
        // Stream and status fields
        status: 'active',
        stream_status: 'live',
        is_streaming: true,
        is_public_feed: false,
        
        // Technical specifications
        resolution: cameraData.resolution || '1280x720',
        frame_rate: cameraData.frame_rate || 30,
        supports_audio: cameraData.supports_audio || false,
        ptz_enabled: false,
        
        // Virtual RTSP URL for device cameras
        rtsp_url: cameraData.rtsp_url || `device://${cameraData.device_info?.device_signature || Date.now()}`,
        
        // Monitoring fields
        ai_agents: cameraData.ai_agents || [],
        health_score: 95,
        events_today: 0,
        uptime: '100%',
        last_heartbeat: new Date().toISOString()
      };

      console.log('Creating device camera with validated data:', fullCameraData);
      
      // Complete the setup - don't stop stream as it needs to persist for live view
      await onComplete(fullCameraData);
      
      // Show success message
      toast.success(`Device camera "${cameraData.name}" added successfully!`, {
        description: 'Your camera is now live and ready for monitoring.'
      });
      
    } catch (error) {
      console.error('Error setting up device camera:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to setup device camera';
      if (error.response?.status === 422) {
        errorMessage = 'Validation error: Please check all required fields are filled correctly';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error: Please refresh the page and try again';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case STEPS.SETUP_TYPE:
        return (
          <SmartCameraSetup
            onSelectDemo={() => setCurrentStep(STEPS.DEMO)}
            onSelectReal={() => setCurrentStep(STEPS.REAL)}
            onSelectDeviceCamera={() => setCurrentStep(STEPS.DEVICE_CAMERA)}
            onCancel={onCancel}
            industryType={industryType}
          />
        );
      case STEPS.DEMO:
        return (
          <DemoExperience 
            camera={camera?.is_public_feed ? camera : null}
            onComplete={onComplete} 
            onBack={camera ? onCancel : () => setCurrentStep(STEPS.SETUP_TYPE)} 
            organization={organization}
          />
        );
      case STEPS.REAL:
        return (
          <RealCameraSetup
            camera={camera?.camera_type !== 'device_camera' ? camera : null}
            onComplete={onComplete}
            onCancel={onCancel}
            organization={organization}
            onBack={camera ? onCancel : () => setCurrentStep(STEPS.SETUP_TYPE)}
          />
        );
      case STEPS.DEVICE_CAMERA:
        return (
          <DeviceCameraSetup
            onConnect={handleDeviceCameraConnect}
            onCancel={camera ? onCancel : () => setCurrentStep(STEPS.SETUP_TYPE)}
            organization={organization}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-slate-50">
        <div className="max-h-[95vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}