
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Camera as ScreenshotIcon, 
  Maximize2,
  Download,
  X
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { MediaLibraryService } from '@/components/services/MediaLibraryService';

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if(h > 0) return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    return [m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

export default function VideoControls({
  videoRef,
  camera,
  organization,
  isPlaying,
  isMuted,
  onPlayPause,
  onMuteToggle,
  onFullscreen,
  onDownload,
  onRemove,
  compact = false,
  isReviewMode = false,
  mode = 'live',
  currentTime = 0,
  duration = 0,
}) {
  const canScreenshot = !!(videoRef?.current && camera?.id && organization?.id);

  const handleScreenshot = async () => {
    const video = videoRef.current;
    if (!canScreenshot) {
      toast.error('Screenshot unavailable: missing required context.');
      return;
    }

    if (video.readyState < 2) { // HAVE_CURRENT_DATA
      toast.error('Video is not ready for capture yet.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.getImageData(0, 0, 1, 1); // Test read to trigger taint error if present
    } catch (e) {
      console.error('Canvas tainted, cannot capture frame:', e);
      toast.error('Cannot capture frame due to stream security policy (CORS).', {
        description: 'Ask your administrator to enable CORS on the stream origin.',
      });
      return;
    }

    try {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Failed to create blob from canvas.'))), 'image/jpeg', 0.92);
      });

      const file = new File([blob], `screenshot_${camera.id}_${Date.now()}.jpg`, { type: 'image/jpeg' });

      // The service now handles all toasts and feedback. We just need to call it.
      await MediaLibraryService.saveScreenshot({
        organizationId: organization.id,
        cameraId: camera.id,
        cameraName: camera.name,
        file,
        meta: { mode, capturedAt: new Date().toISOString() }
      });

    } catch (err) {
      // This will catch errors from blob creation or if the service itself throws an unexpected error.
      console.error('Screenshot processing or saving failed:', err);
      toast.error('Failed to process the screenshot.');
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
        videoRef.current.currentTime = value[0];
    }
  };

  const ScreenshotButton = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}> {/* For tooltip on disabled button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={compact ? "h-8 w-8 text-white" : "h-9 w-9 text-white"} 
              onClick={handleScreenshot}
              disabled={!canScreenshot}
            >
              <ScreenshotIcon className="w-4 h-4" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{canScreenshot ? 'Take Screenshot' : 'Screenshot Unavailable'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1 p-1 bg-black/50 rounded-lg backdrop-blur-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={onPlayPause}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={onMuteToggle}>
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <ScreenshotButton />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={onFullscreen}>
          <Maximize2 className="w-4 h-4" />
        </Button>
        {onRemove && (
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8 bg-red-600/80 hover:bg-red-600 text-white"
            onClick={onRemove}
            title="Remove from grid"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Full controls for FullscreenLiveView
  return (
    <div className="flex flex-col gap-2 p-3 bg-black/60 rounded-lg backdrop-blur-sm">
      {isReviewMode && duration > 0 && (
         <div className="w-full">
            <Slider 
                defaultValue={[0]} 
                value={[currentTime]}
                max={duration} 
                step={1} 
                className="w-full"
                onValueChange={handleSeek}
            />
         </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white" onClick={onPlayPause}>
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white" onClick={onMuteToggle}>
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <span className="text-white text-xs font-mono">
            {isReviewMode ? `${formatTime(currentTime)} / ${formatTime(duration)}` : 'LIVE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ScreenshotButton />
          {onDownload && (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white" onClick={() => onDownload()}>
              <Download className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white" onClick={onFullscreen}>
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
