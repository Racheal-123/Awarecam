import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const base44 = createClientFromRequest(req);
        if (!(await base44.auth.isAuthenticated())) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { cameraId, testRtspUrl } = await req.json();
        if (!cameraId) {
            return new Response(JSON.stringify({ error: 'Camera ID is required' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Use the provided test RTSP URL or get from camera
        let rtspUrl = testRtspUrl;
        if (!rtspUrl) {
            const camera = await base44.asServiceRole.entities.Camera.get(cameraId);
            if (!camera || !camera.rtsp_url) {
                return new Response(JSON.stringify({ error: 'Camera not found or RTSP URL is not configured.' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            rtspUrl = camera.rtsp_url;
        }

        const baseUrl = Deno.env.get('AWARECAM_STREAM_API_BASE');
        const email = Deno.env.get('DROPLET_EMAIL');
        const password = Deno.env.get('DROPLET_PASSWORD');

        if (!baseUrl || !email || !password) {
            throw new Error('Missing required environment variables');
        }

        // Test the direct camera stream endpoint (no JWT required)
        const directStreamUrl = `${baseUrl}/v1/camera/${cameraId}/direct-stream?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        
        console.log('Testing direct stream URL:', directStreamUrl);

        const response = await fetch(directStreamUrl, {
            method: 'GET',
        });

        const responseBody = await response.text();
        console.log('Direct stream response:', {
            status: response.status,
            body: responseBody.substring(0, 500) // Log first 500 chars
        });

        if (response.ok) {
            // Update camera with successful direct stream test
            await base44.asServiceRole.entities.Camera.update(cameraId, {
                stream_status: 'live',
                hls_url: directStreamUrl,
                last_error: null,
                last_start_code: response.status,
                last_start_body: 'Direct stream test successful'
            });

            return new Response(JSON.stringify({
                success: true,
                message: 'Direct stream test successful',
                direct_stream_url: directStreamUrl,
                response_status: response.status,
                rtsp_url: rtspUrl
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Update camera with error
            await base44.asServiceRole.entities.Camera.update(cameraId, {
                stream_status: 'error',
                last_error: `Direct stream test failed: ${response.status} - ${responseBody}`,
                last_start_code: response.status,
                last_start_body: responseBody
            });

            return new Response(JSON.stringify({
                success: false,
                error: 'Direct stream test failed',
                response_status: response.status,
                response_body: responseBody,
                rtsp_url: rtspUrl
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Error in testDirectStream function:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal Server Error', 
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});