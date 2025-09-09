import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

let cachedToken = null;
let tokenExpiry = null;

function normalizeFromApiStatus(apiStatus) {
  const s = String(apiStatus || '').toLowerCase();
  if (s === 'active' || s === 'live' || s === 'ready') return 'live';
  if (s === 'starting' || s === 'pending' || s === 'connecting') return 'starting';
  if (s === 'stopped' || s === 'ended' || s === 'idle') return 'stopped';
  if (s === 'failed' || s === 'error') return 'error';
  return 'error';
}

async function getDropletToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) return cachedToken;

  const baseUrl = (Deno.env.get('AWARECAM_STREAM_API_BASE') || '').replace(/\/+$/, '');
  const email = Deno.env.get('DROPLET_EMAIL');
  const password = Deno.env.get('DROPLET_PASSWORD');
  if (!baseUrl || !email || !password) {
    throw new Error('Missing AWARECAM_STREAM_API_BASE, DROPLET_EMAIL or DROPLET_PASSWORD');
  }

  const resp = await fetch(`${baseUrl}/v1/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) throw new Error(`Auth failed: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  if (!data.access_token) throw new Error('Auth OK but no access_token in response');
  cachedToken = data.access_token;
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

function extractStreamData(json) {
  // Doc shape is {status:'success', data:{...}}
  const data = json?.data || json;
  if (!data) return null;
  // For list endpoint, data is an array
  if (Array.isArray(data)) return data;
  return data;
}

function pickBestStreamFromList(list) {
  if (!Array.isArray(list)) return null;
  // Prefer active, then starting, else any last updated
  const byStatus = (st) => list.find(s => String((s.status || '')).toLowerCase() === st);
  return byStatus('active') || byStatus('starting') || list[0] || null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const base44 = createClientFromRequest(req);
  if (!(await base44.auth.isAuthenticated())) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const cameraId = body.camera_id || body.cameraId;
    const streamId = body.stream_id || body.streamId || null;

    if (!cameraId) {
      return new Response(JSON.stringify({ error: 'camera_id is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const baseUrl = (Deno.env.get('AWARECAM_STREAM_API_BASE') || '').replace(/\/+$/, '');
    let status = 'error';
    let message = null;
    let effectiveStreamId = streamId || null;
    let hlsUrl = null;

    // 1) If we have a stream_id, try GET /v1/streams/{stream_id}
    if (effectiveStreamId) {
      const det = await authFetch(`${baseUrl}/v1/streams/${encodeURIComponent(effectiveStreamId)}`, { method: 'GET' });
      if (det.ok) {
        const json = await det.json();
        const data = extractStreamData(json);
        if (data) {
          status = normalizeFromApiStatus(data.status);
          hlsUrl = data.hls_url || null;
        }
      } else if (det.status !== 404) {
        message = `Stream details error: ${det.status}`;
      } else {
        // Not found by ID; we'll fall back to list by camera
        message = 'Stream not found by id; will attempt camera lookup.';
      }
    }

    // 2) If no stream_id or not found or missing data, fall back to GET /v1/streams?camera_id=...
    if (status === 'error' || !hlsUrl) {
      const listResp = await authFetch(`${baseUrl}/v1/streams?camera_id=${encodeURIComponent(cameraId)}`, { method: 'GET' });
      if (listResp.ok) {
        const json = await listResp.json();
        const arr = extractStreamData(json);
        const best = pickBestStreamFromList(arr);
        if (best) {
          effectiveStreamId = best.stream_id || effectiveStreamId;
          hlsUrl = best.hls_url || hlsUrl;
          status = normalizeFromApiStatus(best.status);
          if (!message) message = 'Resolved from list by camera_id';
        } else {
          if (!message) message = 'No streams found for this camera';
        }
      } else {
        message = `List streams error: ${listResp.status}`;
      }
    }

    // Update Camera entity according to resolved status
    try {
      const update = {};
      if (effectiveStreamId) update.stream_id = effectiveStreamId;
      if (status) {
        // Map to our Camera.stream_status enum
        update.stream_status = status; // values: 'live' | 'starting' | 'error' | 'stopped'
      }
      if (hlsUrl) {
        // Store returnedHlsUrl from API (can contain basic auth). Frontend should use proxy_url for playback.
        update.hls_url = hlsUrl;
      }
      if (message && status === 'error') {
        update.last_error = message;
      } else if (status !== 'error') {
        update.last_error = null;
      }
      await base44.asServiceRole.entities.Camera.update(cameraId, update);
    } catch (e) {
      // Do not fail the response on DB update issues
      message = message || `DB update warning: ${e.message}`;
    }

    // Always return 200 to the frontend with a proxy URL it can use
    const respPayload = {
      status,
      stream_id: effectiveStreamId,
      hls_url: hlsUrl,
      proxy_url: `/functions/hlsProxy?camera_id=${encodeURIComponent(cameraId)}`,
      message
    };

    return new Response(JSON.stringify(respPayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
});