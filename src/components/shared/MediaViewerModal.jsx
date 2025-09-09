import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Download, Camera, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function MediaViewerModal({ item, onClose, onEdit }) {
  const isVideo = item.media_type === 'video';
  const [videoError, setVideoError] = useState(false);
  const [errorUrl, setErrorUrl] = useState('');

  // Check if the video URL is actually pointing to an image file (legacy invalid records)
  const isInvalidVideoRecord = isVideo && item.file_url && (
    item.file_url.endsWith('.jpg') || 
    item.file_url.endsWith('.jpeg') || 
    item.file_url.endsWith('.png')
  );

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = item.file_url;
    link.download = `${item.title}.${isVideo ? 'mp4' : 'jpg'}`;
    link.click();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.title}
            <Badge className={isVideo ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
              {item.media_type}
            </Badge>
          </DialogTitle>
          {item.description && (
            <DialogDescription className="text-left">{item.description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-1 my-4 flex items-center justify-center bg-black rounded-lg overflow-hidden">
          {isVideo ? (
            isInvalidVideoRecord ? (
              <div className="text-white text-center p-8">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold">Legacy Video Record</h3>
                <p className="text-slate-300 mb-4">This is an older video record that was saved incorrectly.</p>
                <p className="text-slate-300">Showing the saved content below:</p>
                <div className="mt-6 max-w-sm mx-auto">
                  <img 
                    src={item.file_url} 
                    alt="Legacy content" 
                    className="w-full rounded-lg border border-slate-600"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ) : videoError ? (
              <div className="text-white text-center p-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold">Video Failed to Load</h3>
                <p className="text-slate-300">The video source is unavailable or in an unsupported format.</p>
                <p className="text-xs text-slate-400 mt-2 break-all">URL: {errorUrl}</p>
              </div>
            ) : (
              <video 
                src={item.file_url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[70vh]"
                onError={() => {
                  console.error('Video failed to load:', item.file_url);
                  setErrorUrl(item.file_url);
                  setVideoError(true);
                }}
              >
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <img 
              src={item.file_url} 
              alt={item.title} 
              className="max-w-full max-h-[70vh] object-contain"
              onError={() => console.error('Image failed to load')}
            />
          )}
        </div>
        
        {/* Media Info */}
        {(item.original_camera_name || item.original_timestamp) && (
          <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            {item.original_camera_name && (
              <div className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                <span>{item.original_camera_name}</span>
              </div>
            )}
            {item.original_timestamp && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(item.original_timestamp), 'MMM d, yyyy h:mm a')}</span>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="flex-shrink-0 !justify-between">
          <div className="flex flex-wrap gap-2">
             {item.labels && item.labels.length > 0 ? (
               item.labels.map(label => (
                 <Badge key={label} variant="secondary">{label}</Badge>
               ))
             ) : (
               <span className="text-sm text-slate-400">No labels</span>
             )}
          </div>
          <div className="flex gap-2">
            {!isInvalidVideoRecord && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" /> 
              Edit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}