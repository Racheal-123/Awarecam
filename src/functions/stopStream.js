import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

let cachedToken = null;
let tokenExpiry = null;

async function getDropletToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) return cachedToken;

  const email = Deno.env.get('DROPLET_EMAIL');
  const password = Deno.env.get('DROPLET_PASSWORD');
  if (!email || !password) {
    throw new Error('Missing DROPLET_EMAIL or DROPLET_PASSWORD');
  }

  console.log('Authenticating with email:', email);
  
  // Try different possible auth endpoints
  const authEndpoints = [
    'https://api.awarecam.com/auth/login',
    'https://api.awarecam.com/v1/auth/login',
    'https://api.awarecam.com/login'
  ];
  
  let authResponse = null;
  let lastError = null;
  
  for (const endpoint of authEndpoints) {
    try {
      console.log(`Trying auth endpoint: ${endpoint}`);
      authResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      
      if (authResponse.ok) {
        console.log(`Success with endpoint: ${endpoint}`);
        break;
      } else {
        console.log(`Failed with endpoint ${endpoint}: ${authResponse.status}`);
        lastError = `${authResponse.status} ${authResponse.statusText}`;
      }
    } catch (error) {
      console.log(`Error with endpoint ${endpoint}:`, error.message);
      lastError = error.message;
    }
  }
  
  if (!authResponse || !authResponse.ok) {
    const errorText = authResponse ? await authResponse.text() : 'No successful response';
    console.error('All auth endpoints failed. Last error:', lastError);
    throw new Error(`Auth failed: ${lastError} - ${errorText.substring(0, 200)}`);
  }
  
  const data = await authResponse.json();
  const token = data.token || data.access_token;
  if (!token) {
    console.error('Auth response:', data);
    throw new Error('Auth OK but no token in response');
  }
  
  console.log('Authentication successful');
  cachedToken = token;
  tokenExpiry = now + 10 * 60 * 1000;
  return cachedToken;
}

async function authFetch(url, options={}) {
  let token = await getDropletToken();
  let resp = await fetch(url, { 
    ...options, 
    headers: { 
      'Authorization': `Bearer ${token}`, 
      ...(options.headers||{}) 
    }
  });
  if (resp.status === 401) {
    cachedToken = null; tokenExpiry = null;
    token = await getDropletToken();
    resp = await fetch(url, { 
      ...options, 
      headers: { 
        'Authorization': `Bearer ${token}`, 
        ...(options.headers||{}) 
      }
    });
  }
  return resp;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {status:405});
  }
  
  const base44 = createClientFromRequest(req);
  
  // Check authentication
  const isAuthenticated = await base44.auth.isAuthenticated();
  if (!isAuthenticated) {
    console.error('Request not authenticated');
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Authentication required' 
    }), {
      status: 401, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    console.log('Stop stream request body:', JSON.stringify(body, null, 2));
    
    // Accept both cameraId and camera_id for compatibility
    const cameraId = body.cameraId || body.camera_id;
    const isManualTrigger = body.manual_trigger || false;
    
    if (!cameraId) {
      console.error('Camera ID missing from request:', body);
      return new Response(JSON.stringify({
        success: false,
        error:'Camera ID is required'
      }),{
        status:400, 
        headers:{'Content-Type':'application/json'}
      });
    }

    console.log(`Stopping stream for camera: ${cameraId} (manual: ${isManualTrigger})`);

    // Load camera with service role to ensure we have access
    let camera;
    try {
      camera = await base44.asServiceRole.entities.Camera.get(cameraId);
      if (!camera) {
        console.error('Camera not found:', cameraId);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Camera not found' 
        }), {
          status:404, 
          headers:{'Content-Type':'application/json'}
        });
      }
    } catch (error) {
      console.error('Failed to load camera:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to access camera data' 
      }), {
        status: 403, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Camera found:', {
      id: camera.id,
      name: camera.name,
      stream_id: camera.stream_id || 'none',
      stream_status: camera.stream_status || 'none',
      manual_trigger: isManualTrigger
    });

    // For manual triggers, ensure we're not conflicting with automated processes
    if (isManualTrigger) {
      console.log('Manual trigger detected - bypassing automated checks');
    }

    let apiSuccess = false;
    let apiResponse = null;

    // If we have a stream_id, try to stop it via API
    if (camera.stream_id) {
      console.log('Attempting to stop stream via API with stream_id:', camera.stream_id);
      
      try {
        const baseUrl = (Deno.env.get('AWARECAM_STREAM_API_BASE') || 'https://api.awarecam.com').replace(/\/+$/, '');
        const resp = await authFetch(`${baseUrl}/v1/streams/${camera.stream_id}`, { 
          method: 'DELETE' 
        });
        const rawBody = await resp.text();

        console.log('Stream API response:', {
          status: resp.status,
          body: rawBody
        });

        apiResponse = {
          status: resp.status,
          body: rawBody
        };

        apiSuccess = resp.status === 200 || resp.status === 404; // 404 means already stopped
      } catch (apiError) {
        console.warn('API call failed, but continuing with local cleanup:', apiError);
        apiResponse = {
          status: 500,
          body: apiError.message
        };
      }
    } else {
      console.log('No stream_id found, performing local cleanup only');
      apiSuccess = true; // No API call needed, just local cleanup
    }

    // Always update camera to stopped state, regardless of API success
    const update = {
      stream_status: 'idle',
      hls_url: null,
      stream_id: null, // Clear the stream_id
      last_error: null,
      last_start_code: apiResponse?.status || null,
      last_start_body: apiResponse?.body || 'Local cleanup only'
    };

    if (!apiSuccess && apiResponse) {
      // If API failed but we tried, record the error but still mark as stopped locally
      update.last_error = `API stop failed: ${apiResponse.status} ${apiResponse.body}`;
    }

    await base44.asServiceRole.entities.Camera.update(cameraId, update);

    console.log('Camera updated to stopped state:', update.stream_status);

    // Return success even if API failed, since we cleaned up locally
    return new Response(JSON.stringify({ 
      success: true, 
      status: update.stream_status,
      message: camera.stream_id ? 
        (apiSuccess ? 'Stream stopped successfully' : 'Local cleanup completed (API may have failed)') :
        'Local cleanup completed (no active stream found)',
      manual_trigger: isManualTrigger
    }), {
      status:200, 
      headers:{'Content-Type':'application/json'}
    });

  } catch (e) {
    console.error('Stop stream error:', e);
    try {
      const requestBody = await req.json();
      const cameraId = requestBody.cameraId || requestBody.camera_id;
      if (cameraId) {
        const base44Retry = createClientFromRequest(req);
        await base44Retry.asServiceRole.entities.Camera.update(cameraId, { 
          stream_status:'error', 
          last_error: e.message 
        });
      }
    } catch(retryError) {
      console.warn('Failed to update camera status on error:', retryError);
    }
    return new Response(JSON.stringify({ 
      success: false,
      error:'Internal Server Error', 
      details: e.message 
    }), {
      status:500, 
      headers:{'Content-Type':'application/json'}
    });
  }
});