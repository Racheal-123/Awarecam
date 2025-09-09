import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Video, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function DeviceCameraCapture({ isOpen, onClose, onCapture, captureType = 'photo' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Try back camera first
        audio: captureType === 'video'
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      // Fallback to any available camera
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: captureType === 'video'
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (fallbackError) {
        toast.error('Could not access camera. Please check permissions.');
        onClose();
      }
    }
  }, [captureType, onClose]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [isOpen, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const startVideoRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      onCapture(file);
      setRecordedChunks([]);
    };

    setRecordedChunks(chunks);
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    if (captureType === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Capture {captureType === 'photo' ? 'Photo' : 'Video'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleCapture}
              size="lg"
              className={isRecording ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {captureType === 'photo' ? (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo
                </>
              ) : isRecording ? (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={onClose}>
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </div>
          
          {isRecording && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                Recording...
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}