import { Camera } from '@/api/entities';
import { startStream as startStreamFunction } from '@/api/functions';
import { stopStream as stopStreamFunction } from '@/api/functions';

class StreamingService {
  // Prevent concurrent operations on the same camera
  static operationsInProgress = new Set();
  // Store device camera streams
  static deviceStreams = new Map();

  async startStream(cameraId) {
    // Prevent concurrent operations on the same camera
    if (StreamingService.operationsInProgress.has(cameraId)) {
      console.warn(`Stream operation already in progress for camera: ${cameraId}`);
      return { success: false, error: 'Operation already in progress for this camera' };
    }

    StreamingService.operationsInProgress.add(cameraId);

    try {
      console.log('Starting stream for camera:', cameraId);
      
      // Get camera details first to ensure it exists and we have permissions
      let camera;
      try {
        camera = await Camera.get(cameraId);
        if (!camera) {
          throw new Error('Camera not found');
        }
        console.log('Camera found:', camera.name, 'Type:', camera.camera_type);
      } catch (error) {
        console.error('Failed to get camera details:', error);
        return { success: false, error: 'Failed to access camera details' };
      }

      // Handle device cameras differently
      if (camera.camera_type === 'device_camera') {
        return await this.startDeviceCamera(camera);
      }

      // Handle regular RTSP/IP cameras
      return await this.startRegularCamera(camera);
      
    } catch (error) {
      console.error('Error starting stream:', error);
      
      let errorMessage = 'Connection failed';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed - please refresh the page';
      } else if (error.response?.status === 403) {
        errorMessage = 'Permission denied - insufficient privileges';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests - please wait before trying again';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      StreamingService.operationsInProgress.delete(cameraId);
    }
  }

  async startDeviceCamera(camera) {
    try {
      console.log('Starting device camera stream:', camera.name);
      
      // Update camera to starting status
      await Camera.update(camera.id, {
        stream_status: 'starting',
        last_error: null
      });

      // For device cameras, we need to use getUserMedia
      const deviceId = camera.device_info?.device_id;
      const constraints = {
        video: deviceId ? {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Store the stream for later cleanup
      StreamingService.deviceStreams.set(camera.id, stream);

      // Update camera status to live
      await Camera.update(camera.id, {
        stream_status: 'live',
        last_error: null,
        last_heartbeat: new Date().toISOString(),
        health_score: 95
      });

      console.log('Device camera stream started successfully');

      return {
        success: true,
        data: {
          status: 'live',
          stream_id: `device_${camera.id}`,
          message: 'Device camera stream started successfully'
        }
      };

    } catch (error) {
      console.error('Failed to start device camera:', error);
      
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access.'
        : error.name === 'NotFoundError'
        ? 'Camera device not found. Please check if camera is connected.'
        : error.name === 'NotReadableError'
        ? 'Camera is already in use by another application.'
        : 'Failed to start device camera stream';

      // Update camera status to error
      await Camera.update(camera.id, {
        stream_status: 'error',
        last_error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  async startRegularCamera(camera) {
    try {
      // Update camera to starting status optimistically
      await Camera.update(camera.id, {
        stream_status: 'starting',
        last_error: null
      });
      
      // Call the backend function with proper payload
      const response = await startStreamFunction({ 
        camera_id: camera.id,
        rtsp_url: camera.rtsp_url,
        manual_trigger: true
      });
      
      console.log('Start stream function response:', response);
      
      if (response && response.data) {
        const result = response.data;
        
        if (result.success) {
          console.log('Stream started successfully:', result);
          
          // Update local camera status with success
          await Camera.update(camera.id, {
            stream_status: result.status || 'live',
            stream_id: result.stream_id || null,
            hls_url: result.returned_hls_url || null,
            last_error: null
          });
          
          return { success: true, data: result };
        } else {
          const error = result.error || result.message || 'Stream start failed';
          console.error('Stream start failed:', error);
          
          // Update camera status to error
          await Camera.update(camera.id, {
            stream_status: 'error',
            last_error: error
          });
          
          return { success: false, error };
        }
      } else {
        const error = 'No response data from start stream function';
        console.error(error);
        
        await Camera.update(camera.id, {
          stream_status: 'error',
          last_error: error
        });
        
        return { success: false, error };
      }
      
    } catch (error) {
      console.error('Error starting regular camera stream:', error);
      
      let errorMessage = 'Connection failed';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed - please refresh the page';
      }
      
      // Update camera status to error
      await Camera.update(camera.id, {
        stream_status: 'error',
        last_error: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  }

  async stopStream(cameraId) {
    if (StreamingService.operationsInProgress.has(cameraId)) {
      console.warn(`Stream operation already in progress for camera: ${cameraId}`);
      return { success: false, error: 'Operation already in progress for this camera' };
    }

    StreamingService.operationsInProgress.add(cameraId);

    try {
      console.log('Stopping stream for camera:', cameraId);
      
      // Get camera details
      const camera = await Camera.get(cameraId);
      if (!camera) {
        throw new Error('Camera not found');
      }

      // Handle device cameras differently
      if (camera.camera_type === 'device_camera') {
        return await this.stopDeviceCamera(camera);
      }

      // Handle regular cameras
      return await this.stopRegularCamera(camera);

    } catch (error) {
      console.error('Error stopping stream:', error);
      return { success: false, error: error.message || 'Failed to stop stream' };
    } finally {
      StreamingService.operationsInProgress.delete(cameraId);
    }
  }

  async stopDeviceCamera(camera) {
    try {
      console.log('Stopping device camera stream:', camera.name);

      // Stop the media stream if it exists
      const stream = StreamingService.deviceStreams.get(camera.id);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        StreamingService.deviceStreams.delete(camera.id);
      }

      // Update camera status
      await Camera.update(camera.id, {
        stream_status: 'idle',
        last_error: null,
        last_heartbeat: new Date().toISOString()
      });

      return {
        success: true,
        data: {
          status: 'stopped',
          message: 'Device camera stream stopped successfully'
        }
      };

    } catch (error) {
      console.error('Failed to stop device camera:', error);
      return { success: false, error: 'Failed to stop device camera stream' };
    }
  }

  async stopRegularCamera(camera) {
    try {
      // Update camera to stopping status
      await Camera.update(camera.id, {
        stream_status: 'stopping',
        last_error: null
      });

      // Call backend function to stop stream
      const response = await stopStreamFunction({ 
        camera_id: camera.id,
        stream_id: camera.stream_id,
        manual_trigger: true
      });

      console.log('Stop stream function response:', response);

      if (response && response.data) {
        const result = response.data;
        
        if (result.success) {
          // Update camera status
          await Camera.update(camera.id, {
            stream_status: 'stopped',
            last_error: null
          });
          
          return { success: true, data: result };
        } else {
          const error = result.error || 'Stream stop failed';
          await Camera.update(camera.id, {
            stream_status: 'error',
            last_error: error
          });
          
          return { success: false, error };
        }
      } else {
        const error = 'No response from stop stream function';
        await Camera.update(camera.id, {
          stream_status: 'error',
          last_error: error
        });
        
        return { success: false, error };
      }

    } catch (error) {
      console.error('Error stopping regular camera stream:', error);
      
      await Camera.update(camera.id, {
        stream_status: 'error',
        last_error: error.message || 'Failed to stop stream'
      });
      
      return { success: false, error: error.message || 'Failed to stop stream' };
    }
  }

  // Cleanup method for device streams
  static cleanup() {
    StreamingService.deviceStreams.forEach((stream, cameraId) => {
      stream.getTracks().forEach(track => track.stop());
    });
    StreamingService.deviceStreams.clear();
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    StreamingService.cleanup();
  });
}

export default new StreamingService();