import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

let cachedToken = null;
let tokenExpiry = null;

function normalizeStatus(s) {
  if (!s) return 'error';
  const st = String(s).toLowerCase();
  if (['live', 'playing', 'ok', 'success', 'ready', 'active'].includes(st)) return 'live';
  if (['starting', 'pending', 'buffering', 'connecting', 'connected'].includes(st)) return 'starting';
  if (['stopped', 'ended', 'idle'].includes(st)) return 'stopped';
  return 'error';
}

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
    console.error('Last response body:', errorText);
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

async function authFetch(url, options = {}) {
  let token = await getDropletToken();
  let resp = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  if (resp.status === 401) {
    cachedToken = null; tokenExpiry = null;
    token = await getDropletToken();
    resp = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
  }
  return resp;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
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
    const requestBody = await req.json();
    console.log('Start stream request body:', JSON.stringify(requestBody, null, 2));
    
    // Accept both cameraId and camera_id for compatibility
    const cameraId = requestBody.cameraId || requestBody.camera_id;
    const isManualTrigger = requestBody.manual_trigger || false;
    
    if (!cameraId) {
      console.error('Camera ID missing from request:', requestBody);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Camera ID is required' 
      }), {
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Starting stream for camera: ${cameraId} (manual: ${isManualTrigger})`);

    // Load camera with service role to ensure we have access
    let camera;
    try {
      camera = await base44.asServiceRole.entities.Camera.get(cameraId);
      if (!camera || !camera.rtsp_url) {
        console.error('Camera not found or missing RTSP URL:', camera);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Camera not found or RTSP URL missing' 
        }), {
          status: 404, 
          headers: { 'Content-Type': 'application/json' }
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
      rtsp_url: camera.rtsp_url ? 'present' : 'missing',
      stream_status: camera.stream_status,
      manual_trigger: isManualTrigger
    });

    // For manual triggers, ensure we're not conflicting with automated processes
    if (isManualTrigger) {
      console.log('Manual trigger detected - bypassing automated checks');
    }

    // Mark optimistic "starting"
    await base44.asServiceRole.entities.Camera.update(cameraId, {
      stream_status: 'starting',
      last_error: null
    });

    // Prepare call
    const baseUrl = (Deno.env.get('AWARECAM_STREAM_API_BASE') || 'https://api.awarecam.com').replace(/\/+$/, '');
    const callbackUrl = Deno.env.get('AWARECAM_CALLBACK_URL');
    if (!callbackUrl) throw new Error('Missing AWARECAM_CALLBACK_URL');

    const payload = {
      org_id: camera.organization_id,
      camera_id: cameraId,
      rtsp_url: camera.rtsp_url,
      callback_url: callbackUrl,
      playback_ttl_seconds: 900,
      low_latency: true,
      idempotency_key: `${cameraId}_${Date.now()}${isManualTrigger ? '_manual' : ''}`
    };

    console.log('Starting stream with payload:', JSON.stringify(payload, null, 2));

    const resp = await authFetch(`${baseUrl}/v1/streams/start`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Idempotency-Key': payload.idempotency_key 
      },
      body: JSON.stringify(payload)
    });

    const rawBody = await resp.text();
    console.log('Stream API response:', {
      status: resp.status,
      body: rawBody
    });

    let responseData; 
    try { 
      responseData = JSON.parse(rawBody); 
    } catch { 
      responseData = { raw: rawBody }; 
    }
    const inner = responseData?.data || responseData;

    // Extract data from response
    const statusStr = inner?.status || responseData?.status;
    const returnedStatus = normalizeStatus(statusStr);
    const streamId = inner?.stream_id || inner?.id || responseData?.stream_id || responseData?.id || null;
    const returnedHlsUrl = inner?.hls_url || responseData?.hls_url || null;

    console.log('Parsed response:', {
      statusStr,
      returnedStatus,
      streamId,
      returnedHlsUrl: returnedHlsUrl ? 'present' : 'missing'
    });

    // Build camera update
    const update = {
      last_start_code: resp.status,
      last_start_body: rawBody
    };
    if (streamId) update.stream_id = streamId;

    // Important change: if 202 includes active/ready/live and an HLS URL, mark LIVE now
    if (resp.status === 202 || resp.status === 200) {
      if (returnedHlsUrl && returnedStatus === 'live') {
        update.stream_status = 'live';
        // We keep the raw URL as returned by the API (with credentials) for the proxy to read.
        update.hls_url = returnedHlsUrl;
      } else if (returnedStatus === 'starting') {
        update.stream_status = 'starting';
      } else if (returnedStatus === 'stopped') {
        update.stream_status = 'stopped';
      } else if (!returnedHlsUrl && returnedStatus === 'live') {
        // Edge case: live without URL -> treat as starting until callback updates
        update.stream_status = 'starting';
      } else {
        // Unknown/other -> keep starting but record message
        update.stream_status = 'starting';
      }
    } else {
      update.stream_status = 'error';
      update.last_error = `Stream start failed: ${resp.status}`;
    }

    console.log('Updating camera with:', update);

    await base44.asServiceRole.entities.Camera.update(cameraId, update);

    // Return both statuses and useful URLs for the frontend
    const proxyUrl = `/functions/hlsProxy?camera_id=${encodeURIComponent(cameraId)}`;

    return new Response(JSON.stringify({
      success: resp.status < 400,
      status: update.stream_status,
      stream_id: streamId,
      returned_hls_url: returnedHlsUrl || null,
      proxy_url: proxyUrl,
      manual_trigger: isManualTrigger
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Start stream error:', error);
    
    // Try to persist error on camera
    try {
      const errorRequestBody = await req.json();
      const cameraId = errorRequestBody.cameraId || errorRequestBody.camera_id;
      if (cameraId) {
        await base44.asServiceRole.entities.Camera.update(cameraId, {
          stream_status: 'error',
          last_error: error.message
        });
      }
    } catch (retryError) {
      console.warn('Failed to update camera status on error:', retryError);
    }

    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal Server Error', 
      details: error.message 
    }), {
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
});