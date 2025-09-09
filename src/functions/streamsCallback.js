
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// Status normalization utility
function normalizeStreamStatus(externalStatus) {
  if (!externalStatus || typeof externalStatus !== 'string') {
    return 'error';
  }
  const status = externalStatus.toLowerCase().trim();
  const liveSynonyms = ['live', 'playing', 'ok', 'success', 'ready', 'active'];
  if (liveSynonyms.includes(status)) {
    return 'live';
  }
  const startingSynonyms = ['starting', 'pending', 'buffering', 'connecting', 'connected'];
  if (startingSynonyms.includes(status)) {
    return 'starting';
  }
  const stoppedSynonyms = ['stopped', 'ended', 'idle'];
  if (stoppedSynonyms.includes(status)) {
    return 'stopped';
  }
  return 'error';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Accept both flat and nested payloads
    const inner = payload?.data || payload;

    let cameraId = inner.camera_id || payload.camera_id;
    const streamId = inner.stream_id || inner.id || payload.stream_id || payload.id;

    const rawStatus = inner.status || payload.status;
    const normalizedStatus = normalizeStreamStatus(rawStatus);

    const baseUrl = (Deno.env.get('AWARECAM_STREAM_API_BASE') || '').replace(/\/+$/, '');
    // Prefer proxied HLS URL; avoid any hard-coded test URLs
    const proxiedHlsUrl = cameraId ? `${baseUrl}/v1/cameras/${cameraId}/stream` : null;
    const directHlsUrl = inner.hls_url || payload.hls_url || null;

    // Resolve camera if not provided but streamId is available
    let camera;
    if (cameraId) {
      try {
        camera = await base44.asServiceRole.entities.Camera.get(cameraId);
      } catch {
        /* ignore error, attempt by streamId if needed */
      }
    }
    if (!camera && streamId) {
      const cams = await base44.asServiceRole.entities.Camera.filter({ stream_id: streamId });
      if (cams.length > 0) {
        camera = cams[0];
        cameraId = camera.id;
      }
    }

    if (!cameraId) {
      console.warn('streamsCallback: Unable to resolve camera_id from payload');
      return new Response('Camera not found', { status: 404 });
    }

    const updatePayload = {
      stream_status: normalizedStatus,
      last_error: null
    };

    if (normalizedStatus === 'live') {
      updatePayload.hls_url = proxiedHlsUrl || directHlsUrl;
    } else if (normalizedStatus === 'error') {
      updatePayload.last_error = `Stream error: ${rawStatus}`;
    }

    if (streamId) {
      updatePayload.stream_id = streamId;
    }

    await base44.asServiceRole.entities.Camera.update(cameraId, updatePayload);

    // Log the exact payload we got (no test data)
    await base44.asServiceRole.entities.StreamCallbackLog.create({
      camera_id: cameraId,
      stream_id: streamId || 'unknown',
      status: normalizedStatus,
      payload
    });

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Callback processing error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
