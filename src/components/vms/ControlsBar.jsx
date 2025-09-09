
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Camera,
  Video,
  Volume2,
  VolumeX,
  FastForward
} from 'lucide-react';

export default function ControlsBar({
  isPlaying,
  isRecording,
  onPlayPause,
  onScreenshot,
  onClipToggle,
  onVolumeChange,
  onMuteToggle,
  volume = 1,
  isMuted = false,
  playbackRate = 1,
  onSpeedChange,
  mode
}) {
  const speeds = [0.5, 1, 2, 4];

  return (
    <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2">
      {/* Play/Pause - only in playback */}
      {mode === 'playback' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPlayPause}
          className="h-10 w-10 text-white hover:bg-white/20"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
      )}

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMuteToggle}
          className="h-8 w-8 text-white hover:bg-white/20"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume * 100]}
          onValueChange={(value) => onVolumeChange && onVolumeChange(value[0] / 100)}
          max={100}
          step={1}
          className="w-16"
        />
      </div>

      {/* Speed Control */}
      {mode === 'playback' && onSpeedChange && (
        <div className="flex items-center gap-1">
          <FastForward className="w-4 h-4 text-white" />
          <select
            value={playbackRate}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="bg-white/20 text-white text-sm px-2 py-1 rounded border-none outline-none"
          >
            {speeds.map(speed => (
              <option key={speed} value={speed} className="bg-black">
                {speed}x
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Screenshot */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onScreenshot}
        className="h-10 w-10 text-white hover:bg-white/20"
        title="Take Screenshot"
      >
        <Camera className="w-5 h-5" />
      </Button>

      {/* Clip Recording */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClipToggle}
        className={`h-10 w-10 text-white hover:bg-white/20 ${isRecording ? 'bg-red-600' : ''}`}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        <Video className="w-5 h-5" />
      </Button>
    </div>
  );
}
