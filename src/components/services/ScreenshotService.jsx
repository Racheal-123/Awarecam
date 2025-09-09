import { MediaLibraryItem } from '@/api/entities';
import { User } from '@/api/entities';
import { uploadFile } from '@/api/integrations';
import { toast } from 'sonner';

// --- Helper Functions ---

/**
 * Checks if the video element's content can be safely exported to a canvas.
 * @param {HTMLVideoElement} videoEl The video element.
 * @returns {boolean} True if the canvas will not be tainted.
 */
function clientCanExport(videoEl) {
  if (!videoEl || videoEl.crossOrigin !== 'anonymous') {
    return false;
  }
  
  // A quick draw test to catch more subtle CORS issues
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    ctx.drawImage(videoEl, 0, 0, 1, 1);
    ctx.getImageData(0, 0, 1, 1); // This will throw a SecurityError on a tainted canvas
    return true;
  } catch (error) {
    if (error.name === 'SecurityError') {
      console.warn("Client-side screenshot blocked due to tainted canvas.");
    } else {
      console.error("Canvas export check failed:", error);
    }
    return false;
  }
}

/**
 * Creates a MediaLibraryItem record.
 * @param {object} params - The properties for the new media item.
 * @returns {Promise<object>} The created MediaLibraryItem record.
 */
async function createLibraryItem(params) {
  const { 
    organization_id, 
    camera_name,
    file_url,
    thumbnail_url,
    sourceType,
    event_id
  } = params;

  const defaultTitle = `${camera_name} Snapshot - ${new Date().toLocaleString()}`;

  const itemData = {
    organization_id,
    title: defaultTitle,
    description: `Screenshot from ${sourceType} view of ${camera_name}.`,
    labels: ['screenshot', sourceType],
    media_type: 'screenshot',
    file_url,
    thumbnail_url: thumbnail_url || file_url,
    original_camera_name: camera_name,
    original_timestamp: new Date().toISOString(),
  };

  if (event_id) {
    itemData.event_id = event_id;
    itemData.labels.push('event-related');
  }

  return await MediaLibraryItem.create(itemData);
}

// --- Main Service ---

export const ScreenshotService = {
  /**
   * Captures a screenshot from a video element, prioritizing server-side capture.
   * @param {object} params - Capture parameters.
   * @param {HTMLVideoElement} params.videoEl - The video element to capture from.
   * @param {string} params.organization_id - The organization ID.
   * @param {string} params.camera_id - The camera ID.
   * @param {string} params.camera_name - The camera display name.
   * @param {string} [params.sourceType="live"] - The source context (e.g., 'live', 'event').
   * @param {string} [params.event_id=null] - Associated event ID, if any.
   * @returns {Promise<object|null>} The created MediaLibraryItem or null on failure.
   */
  async capture({ videoEl, organization_id, camera_id, camera_name, sourceType = "live", event_id = null }) {
    if (!videoEl || !organization_id || !camera_id || !camera_name) {
      console.error("ScreenshotService.capture missing required parameters.");
      toast.error("Capture failed: Missing context.");
      return null;
    }
    
    // --- Server-First Approach (Placeholder) ---
    // In a real scenario, this would be the primary path.
    // Since we don't have the droplet endpoint, we'll simulate its failure
    // and proceed to the client-side fallback.
    const serverCaptureSuccess = false;
    
    if (serverCaptureSuccess) {
      // const response = await fetch('/api/stream/snapshot', { ... });
      // const { imageUrl } = await response.json();
      // const item = await createLibraryItem({ ... });
      // return item;
    } else {
      console.warn("Server snapshot endpoint not available. Attempting client-side fallback.");
    }
    
    // --- Client-Side Fallback ---
    if (!clientCanExport(videoEl)) {
      toast.error("Couldn’t capture snapshot from stream.", {
        description: "The video stream's security policy (CORS) prevents it. Contact support to configure the stream source.",
      });
      return null;
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) {
        throw new Error("Failed to create blob from canvas.");
      }
      
      const file = new File([blob], `${camera_name.replace(/\s+/g, '_')}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Upload the file using the Core integration
      const { file_url } = await uploadFile(file);
      
      if (!file_url) {
        throw new Error("File upload failed to return a URL.");
      }
      
      // Create the MediaLibraryItem
      const libraryItem = await createLibraryItem({
        organization_id,
        camera_name,
        file_url,
        sourceType,
        event_id
      });
      
      toast.success("Snapshot saved to Media Library.", {
        action: {
          label: "View",
          onClick: () => {
            // This would navigate to the media library item's detail page
            console.log(`Navigate to /media/${libraryItem.id}`);
            // For now, we'll just log it
          },
        },
      });
      
      return libraryItem;
      
    } catch (error) {
      console.error("Client-side screenshot capture failed:", error);
      toast.error("Screenshot capture failed.", {
        description: "An unexpected error occurred during the capture or upload process."
      });
      return null;
    }
  }
};