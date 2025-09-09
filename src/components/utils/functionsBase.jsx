// Get the functions base URL for making requests to backend functions
export function getFunctionsBase() {
  // In production, Base44 apps use the current domain for functions
  if (typeof window !== 'undefined') {
    // Use the current origin (domain) where the app is hosted
    return window.location.origin;
  }
  
  // Fallback for server-side rendering or when window is not available
  return 'https://app.awarecam.com';
}

// Build HLS proxy URL for a camera
export function buildHlsProxyUrl(cameraId, file) {
  const base = getFunctionsBase();
  const url = new URL(`${base}/functions/hlsProxy`);
  
  if (cameraId) {
    url.searchParams.set('camera_id', cameraId);
  }
  
  if (file) {
    url.searchParams.set('file', file);
  }
  
  // Add timestamp to prevent caching issues
  url.searchParams.set('t', Date.now().toString());
  
  console.log('Built HLS proxy URL:', url.toString());
  return url.toString();
}

// Helper function to create proxy URL for any camera
export function createHlsProxyUrl(cameraId) {
  return buildHlsProxyUrl(cameraId);
}

// Get the base URL for function calls (used by other services)
export function getFunctionUrl(functionName) {
  const base = getFunctionsBase();
  return `${base}/functions/${functionName}`;
}