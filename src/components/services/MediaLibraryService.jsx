
import { MediaLibraryItem } from '@/api/entities';
import { uploadFile } from '@/api/integrations';
import { toast } from 'sonner';

export const MediaLibraryService = {
  async saveScreenshot({ organizationId, cameraId, cameraName, file, meta }) {
    if (!organizationId || !cameraId || !file) {
      console.error('saveScreenshot missing required params:', { organizationId, cameraId, file });
      toast.error('Could not save screenshot: missing critical information.');
      return null;
    }

    const toastId = toast.loading('Uploading screenshot...');

    try {
      // 1) Convert the Blob to a File object and upload it
      const fileName = `screenshot-${cameraId}-${Date.now()}.jpg`;
      const fileToUpload = new File([file], fileName, { type: 'image/jpeg' });
      const uploadRes = await uploadFile(fileToUpload);
      
      if (!uploadRes?.file_url) {
        toast.error('Upload failed: No URL was returned from the server.', { id: toastId });
        throw new Error('File upload did not return a valid URL.');
      }
      
      const { file_url } = uploadRes;
      toast.loading('Upload complete. Saving to media library...', { id: toastId });

      // 2) Create the database record in MediaLibraryItem
      const recordData = {
        organization_id: organizationId,
        title: `Screenshot - ${cameraName || 'Camera'} - ${new Date().toLocaleString()}`,
        description: `Captured from ${meta?.mode || 'live'} view at ${new Date(meta?.capturedAt || Date.now()).toLocaleString()}`,
        labels: ['screenshot', meta?.mode || 'live'],
        media_type: 'screenshot',
        file_url: file_url,
        thumbnail_url: file_url,
        original_camera_name: cameraName || cameraId,
        original_timestamp: meta?.capturedAt || new Date().toISOString(),
      };
      
      const record = await MediaLibraryItem.create(recordData);

      if (!record?.id) {
          toast.error('Failed to save the record to the database after upload.', { id: toastId });
          throw new Error('MediaLibraryItem.create did not return a valid record.');
      }

      toast.success('Screenshot saved to Media Library!', { 
        id: toastId,
        description: 'You can view it on the Media Library page.'
      });
      
      // Dispatch an event so other components can react if needed
      window.dispatchEvent(new CustomEvent('mediaLibraryUpdated'));
      
      return record;
    } catch (err) {
      console.error('MediaLibraryService.saveScreenshot failed:', err);
      toast.error('Failed to save screenshot.', { 
        id: toastId,
        description: err.message || 'An unknown error occurred during the process.'
      });
      return null;
    }
  },

  async getItem({ organization_id, id }) {
    if (!organization_id || !id) return null;
    try {
      return await MediaLibraryItem.get(id);
    } catch (err) {
      console.error(`Failed to get media item ${id}:`, err);
      return null;
    }
  },

  async listRecent({ organization_id, limit = 10 }) {
    if (!organization_id) return [];
    try {
      return await MediaLibraryItem.filter({ organization_id }, '-created_date', limit);
    } catch (err) {
      console.error('Failed to list recent media items:', err);
      return [];
    }
  }
};
