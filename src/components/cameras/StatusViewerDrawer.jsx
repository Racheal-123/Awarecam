import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera } from '@/api/entities';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

export default function StatusViewerDrawer({ isOpen, onClose, statusData, camera, userRole, onApply }) {
  if (!statusData || !camera) return null;

  const isManager = userRole && ['organization_admin', 'manager'].includes(userRole);
  
  // Normalize incoming status for the check
  const status = statusData?.status?.toLowerCase() || '';
  const isLiveStatus = ['live', 'playing', 'ok', 'success', 'ready'].includes(status);
  const canApplyStatus = isManager && isLiveStatus && statusData?.hls_url;

  const handleApplyClick = async () => {
    if (!canApplyStatus) return;

    try {
      await Camera.update(camera.id, {
        stream_status: 'live',
        hls_url: statusData.hls_url,
        last_error: null,
      });
      toast.success('Applied live status to camera.');
      if (onApply) {
        onApply(); // This will close the drawer and refresh the camera list
      }
    } catch (error) {
      console.error("Failed to apply status:", error);
      toast.error('Failed to apply live status.');
    }
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Status for: {camera.name}</DrawerTitle>
            <DrawerDescription>Raw JSON response from the stream provider.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <ScrollArea className="h-64 w-full rounded-md border bg-slate-900 text-slate-100 p-4">
              <pre>
                <code>{JSON.stringify(statusData, null, 2)}</code>
              </pre>
            </ScrollArea>
          </div>
          <DrawerFooter>
            {canApplyStatus && (
              <Button onClick={handleApplyClick}>
                <Zap className="w-4 h-4 mr-2" />
                Apply Live Status to Camera
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}