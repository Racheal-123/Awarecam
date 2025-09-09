import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, AlertTriangle } from 'lucide-react';

export default function MediaViewerModal({ item, onClose, onEdit }) {
  const isVideo = item.media_type === 'video';
  const [videoError, setVideoError] = useState(false);
  const [errorUrl, setErrorUrl] = useState('');

  // Check if the video URL is actually pointing to an image file (legacy invalid records)
  const isInvalidVideoRecord = isVideo && item.file_url && (
    item.file_url.endsWith('.jpg') || 
    item.file_url.endsWith('.jpeg') || 
    item.file_url.endsWith('.png') ||
    item.file_url.includes('event-clip') && !item.file_url.endsWith('.mp4')
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 my-4 flex items-center justify-center bg-black rounded-lg overflow-hidden">
          {isVideo ? (
            isInvalidVideoRecord ? (
              <div className="text-white text-center p-8">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold">Invalid Video Record</h3>
                <p className="text-slate-300 mb-4">This video clip was created with an older version and cannot be played.</p>
                <p className="text-slate-300">The thumbnail is available below instead.</p>
                <div className="mt-6 max-w-sm mx-auto">
                  <img 
                    src={item.file_url} 
                    alt="Video thumbnail" 
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
                  console.error('Admin video failed to load:', item.file_url);
                  setErrorUrl(item.file_url);
                  setVideoError(true);
                }}
              >
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <img src={item.file_url} alt={item.title} className="max-w-full max-h-[70vh] object-contain" />
          )}
        </div>
        <DialogFooter className="flex-shrink-0 !justify-between">
          <div className="flex flex-wrap gap-2">
             {item.labels.map(label => (
                <Badge key={label} variant="secondary">{label}</Badge>
              ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}