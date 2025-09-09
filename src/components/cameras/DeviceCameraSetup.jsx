
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera as CameraIcon, 
  Smartphone,
  Wifi,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function DeviceCameraSetup({ onConnect, onCancel, organization }) {
  const [cameraName, setCameraName] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedCameraType, setSelectedCameraType] = useState('device_camera');
  const [wifiUrl, setWifiUrl] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [needUserAction, setNeedUserAction] = useState(false); // for autoplay-block cases

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Get devices & permission once on mount (only when device_camera selected)
  useEffect(() => {
    if (selectedCameraType !== 'device_camera') {
      setIsInitializing(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Request minimal permission to reveal device labels (some browsers require this).
        // We create a temporary stream and stop it immediately.
        let tempStream = null;
        try {
          tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (permErr) {
          // permission may be denied - but still attempt enumerateDevices (labels will be empty)
          console.warn('Permission request for enumerateDevices failed:', permErr);
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');

        if (tempStream) {
          tempStream.getTracks().forEach(t => t.stop());
          tempStream = null;
        }

        if (cancelled || !mountedRef.current) return;

        setAvailableDevices(videoDevices);
        if (videoDevices.length > 0) {
          const first = videoDevices[0];
          setSelectedDeviceId(prev => prev || first.deviceId);
          const deviceLabel = first.label || `Camera 1`;
          setCameraName(prev => prev || (deviceLabel.includes('Camera') ? deviceLabel : `${deviceLabel} Camera`));
        }

        setError(null);
      } catch (err) {
        console.error('initializeDevices error:', err);
        setError('Unable to enumerate camera devices. Check permissions and browser settings.');
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [selectedCameraType]);

  // Start stream when selectedDeviceId changes (and camera type is device)
  useEffect(() => {
    if (selectedCameraType !== 'device_camera') return;
    if (!selectedDeviceId) return;

    let cancelled = false;

    const startStream = async () => {
      // cleanup old stream first
      if (streamRef.current) {
        try { streamRef.current.getTracks().forEach(t => t.stop()); } catch (_) {}
        streamRef.current = null;
      }
      setStream(null);
      setStreamReady(false);
      setNeedUserAction(false);
      setError(null);

      const constraints = {
        video: {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      try {
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled || !mountedRef.current) {
          newStream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = newStream;
        setStream(newStream);

        const video = videoRef.current;
        if (!video) {
          setError('Video element not ready.');
          return;
        }

        // attach events - use 'playing' as the definitive signal we have a playing preview
        const onPlaying = () => {
          if (!mountedRef.current) return;
          setStreamReady(true);
          setNeedUserAction(false);
          // collect device info
          try {
            const track = newStream.getVideoTracks()[0];
            const settings = track.getSettings();
            setDeviceInfo({
              device_id: selectedDeviceId,
              device_signature: `${Date.now()}-${selectedDeviceId.slice(-8)}`,
              device_type: /mobile|tablet/i.test(navigator.userAgent) ? 'phone' : 'laptop',
              user_agent: navigator.userAgent,
              resolution: `${settings.width || 1280}x${settings.height || 720}`,
              frame_rate: Math.round(settings.frameRate || 30),
              facing_mode: settings.facingMode || 'user'
            });
          } catch (e) {
            console.warn('device info extraction failed', e);
          }
        };

        const onError = (ev) => {
          console.warn('video element error', ev);
          if (mountedRef.current) {
            setError('Failed to play video preview.');
            setStreamReady(false);
          }
        };

        video.onplaying = onPlaying;
        video.onerror = onError;

        video.srcObject = newStream;

        // Try to play. If the browser blocks autoplay, show a play overlay to request user gesture.
        try {
          await video.play();
          // if play resolves, playing event should fire -> onPlaying sets streamReady
        } catch (playErr) {
          console.warn('Autoplay blocked or play() failed:', playErr);
          // still set a basic deviceInfo in case events don't fire
          try {
            const track = newStream.getVideoTracks()[0];
            const settings = track.getSettings();
            setDeviceInfo({
              device_id: selectedDeviceId,
              device_signature: `${Date.now()}-${selectedDeviceId.slice(-8)}`,
              device_type: /mobile|tablet/i.test(navigator.userAgent) ? 'phone' : 'laptop',
              user_agent: navigator.userAgent,
              resolution: `${settings.width || 1280}x${settings.height || 720}`,
              frame_rate: Math.round(settings.frameRate || 30),
              facing_mode: settings.facingMode || 'user'
            });
          } catch (_) {}
          // indicate we need a user gesture
          if (mountedRef.current) setNeedUserAction(true);
        }

      } catch (err) {
        console.error('startStream error:', err);
        if (!mountedRef.current) return;
        let msg = 'Failed to start camera.';
        if (err.name === 'NotAllowedError') msg += ' Permission denied.';
        else if (err.name === 'NotFoundError') msg += ' Camera not found.';
        else if (err.name === 'NotReadableError') msg += ' Camera in use.';
        else msg += ` ${err.message || ''}`;
        setError(msg);
        setStreamReady(false);
      }
    };

    startStream();

    return () => {
      cancelled = true;
      // Capture current video element reference at cleanup time
      const currentVideo = videoRef.current;
      // detach video src and stop tracks
      if (currentVideo) {
        try { currentVideo.pause(); } catch (_) {}
        try { currentVideo.srcObject = null; } catch (_) {}
      }
      // don't stop here in case parent wants to keep the stream — but we do keep defensive cleanup
    };
  }, [selectedDeviceId, selectedCameraType]);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        try { streamRef.current.getTracks().forEach(t => t.stop()); } catch (_) {}
        streamRef.current = null;
      }
    };
  }, []);

  const isFormValid = () => {
    if (!cameraName.trim()) return false;
    if (selectedCameraType === 'device_camera') return selectedDeviceId && stream && streamReady && !connecting;
    if (selectedCameraType === 'wifi') return wifiUrl.trim();
    return false;
  };

  const playPreviewWithUserGesture = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      // If play succeeds, 'playing' event will set streamReady
      setNeedUserAction(false);
    } catch (err) {
      console.warn('User play attempt failed:', err);
      toast.error('Unable to start preview. Check camera permissions or try a different browser.');
    }
  };

  const handleDeviceChange = (deviceId) => {
    setError(null);
    setSelectedDeviceId(deviceId);
  };

  const handleCameraTypeChange = (type) => {
    // stop old stream when switching types
    if (streamRef.current) {
      try { streamRef.current.getTracks().forEach(t => t.stop()); } catch (_) {}
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
    setStreamReady(false);
    setSelectedCameraType(type);
    setAvailableDevices([]);
    setSelectedDeviceId('');
    setNeedUserAction(false);
    setError(null);
  };

  const handleConnect = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields and ensure preview is active.');
      return;
    }
    setConnecting(true);
    try {
      let cameraData;
      if (selectedCameraType === 'device_camera') {
        cameraData = {
          name: cameraName.trim(),
          camera_type: 'device_camera',
          device_info: deviceInfo,
          resolution: deviceInfo?.resolution || '1280x720',
          frame_rate: deviceInfo?.frame_rate || 30,
          supports_audio: stream.getAudioTracks?.().length > 0,
          status: 'active',
          stream_status: 'live',
          health_score: 95,
          rtsp_url: `device://${deviceInfo?.device_id || Date.now()}`,
          is_streaming: true,
          ai_agents: []
        };
      } else {
        cameraData = {
          name: cameraName.trim(),
          camera_type: 'wifi',
          rtsp_url: wifiUrl.trim(),
          resolution: '1280x720',
          frame_rate: 30,
          supports_audio: false,
          status: 'active',
          ai_agents: []
        };
      }

      toast.success(`Camera "${cameraData.name}" connected successfully!`);
      // pass stream for device cameras so parent can manage recording/forwarding if desired
      await onConnect(cameraData, selectedCameraType === 'device_camera' ? streamRef.current : null);
    } catch (err) {
      console.error('connect error', err);
      toast.error('Failed to connect camera. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const retryConnection = () => {
    setError(null);
    setStreamReady(false);
    setNeedUserAction(false);
    // restart by toggling device id quickly
    if (selectedDeviceId) {
      const cur = selectedDeviceId;
      setSelectedDeviceId('');
      setTimeout(() => setSelectedDeviceId(cur), 150);
    }
  };

  const renderCameraPreview = () => {
    if (selectedCameraType === 'wifi') {
      return (
        <div className="w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <Wifi className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-sm">WiFi Camera Preview</p>
            <p className="text-xs text-slate-500 mt-1">Preview will be available after connection</p>
          </div>
        </div>
      );
    }

    if (isInitializing) {
      return (
        <div className="w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-slate-400 animate-spin" />
            <p className="text-sm">Initializing camera access...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-white max-w-md mx-auto p-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-sm mb-2">Camera Error</p>
            <p className="text-xs text-slate-300">{error}</p>
            {selectedDeviceId && (
              <Button variant="outline" size="sm" onClick={retryConnection} className="mt-3">Retry</Button>
            )}
          </div>
        </div>
      );
    }

    if (!selectedDeviceId) {
      return (
        <div className="w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <CameraIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-sm">Select a camera device to start preview</p>
          </div>
        </div>
      );
    }

    // video preview area
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-black"
          autoPlay
          muted
          playsInline
          controls={false}
          // events just for debug / logging; the main 'playing' handler is set programmatically in startStream
          onLoadedMetadata={() => console.log('video loadedmetadata')}
          onCanPlay={() => console.log('video canplay')}
        />
        {(!streamReady || needUserAction) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="bg-black/60 p-4 rounded-md text-center">
              <p className="text-white mb-3">{needUserAction ? 'Click to enable camera preview' : 'Connecting to camera...'}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={playPreviewWithUserGesture} disabled={!stream} >
                  <Play className="w-4 h-4 mr-2" /> Start Preview
                </Button>
                <Button variant="outline" onClick={retryConnection}>Retry</Button>
              </div>
              <p className="text-xs text-slate-300 mt-2">If nothing happens, check browser camera permissions or try refreshing the page.</p>
            </div>
          </div>
        )}

        {streamReady && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-600 text-white flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              LIVE
            </Badge>
          </div>
        )}

        {deviceInfo && streamReady && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {deviceInfo.resolution} • {Math.round(deviceInfo.frame_rate)} fps
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CameraIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Connect Camera</h2>
          <p className="text-gray-600">Connect your device camera or WiFi camera as a monitoring source</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Camera Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCameraType} onValueChange={handleCameraTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select camera type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="device_camera">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Device Camera
                  </div>
                </SelectItem>
                <SelectItem value="wifi">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    WiFi Camera
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Camera Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {renderCameraPreview()}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cameraName">Camera Name *</Label>
            <Input id="cameraName" value={cameraName} onChange={(e) => setCameraName(e.target.value)} placeholder="Enter camera name" className="w-full" />
          </div>

          {selectedCameraType === 'device_camera' ? (
            <div className="space-y-2">
              <Label htmlFor="deviceSelect">Select Camera Device *</Label>
              <Select value={selectedDeviceId} onValueChange={handleDeviceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose camera device" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices.length === 0 && <SelectItem value={null}>No devices found</SelectItem>}
                  {availableDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${availableDevices.indexOf(device) + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="wifiUrl">WiFi Camera URL *</Label>
              <Input id="wifiUrl" value={wifiUrl} onChange={(e) => setWifiUrl(e.target.value)} placeholder="rtsp://192.168.1.100:554/stream" className="w-full" />
            </div>
          )}
        </div>

        {selectedCameraType === 'device_camera' && (
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-2 ${streamReady ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 className="w-4 h-4" />
              Camera Connected
            </div>
            <div className={`flex items-center gap-2 ${cameraName.trim() ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 className="w-4 h-4" />
              Name Provided
            </div>
          </div>
        )}

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button onClick={handleConnect} disabled={!isFormValid() || connecting} className="min-w-[140px]">
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <CameraIcon className="w-4 h-4 mr-2" />
                Connect Camera
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
