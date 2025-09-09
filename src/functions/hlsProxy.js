import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const cameraId = url.searchParams.get('camera_id');
  const file = url.searchParams.get('file');
  
  console.log('HLS Proxy request:', { 
    method: req.method, 
    cameraId, 
    file, 
    url: req.url 
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Allow POST requests for deployment health checks
  if (req.method === 'POST') {
    return new Response('POST request received (for deployment health check).', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    });
  }
  
  // Only allow GET and HEAD requests for actual content
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: {
        'Allow': 'GET, HEAD, OPTIONS, POST',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // Validate required parameters
  if (!cameraId) {
    console.error('Missing camera_id parameter');
    return new Response('Missing camera_id parameter', { 
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    // Get camera details to check if it exists and get credentials
    console.log('Fetching camera details for ID:', cameraId);
    const camera = await base44.entities.Camera.get(cameraId);
    
    if (!camera) {
      console.error(`Camera not found: ${cameraId}`);
      return new Response('Camera not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    console.log('Camera found:', {
      id: camera.id,
      name: camera.name,
      camera_type: camera.camera_type,
      stream_status: camera.stream_status,
      has_hls_url: !!camera.hls_url,
      has_rtsp_url: !!camera.rtsp_url
    });

    // Construct the authenticated stream URL
    let streamUrl;
    
    if (file) {
      // Request for a specific file (segment or sub-playlist)
      if (camera.hls_url) {
        // Replace the index.m3u8 with the requested file
        streamUrl = camera.hls_url.replace(/\/[^\/]*\.m3u8.*$/, `/${file}`);
      } else {
        // Fallback construction
        const baseUrl = Deno.env.get('AWARECAM_STREAM_API_BASE') || 'https://api.awarecam.com';
        streamUrl = `${baseUrl}/video/${cameraId}/${file}`;
      }
    } else {
      // Request for the main playlist
      if (camera.hls_url) {
        streamUrl = camera.hls_url;
      } else {
        // Fallback construction
        const baseUrl = Deno.env.get('AWARECAM_STREAM_API_BASE') || 'https://api.awarecam.com';
        streamUrl = `${baseUrl}/video/${cameraId}/index.m3u8`;
      }
    }

    console.log(`Original stream URL: ${streamUrl}`);

    // CRITICAL FIX: Replace placeholder credentials with real ones
    const email = Deno.env.get('DROPLET_EMAIL');
    const password = Deno.env.get('DROPLET_PASSWORD');
    
    if (email && password) {
      console.log('Found credentials - attempting to replace placeholders');
      
      // Check if URL has placeholder credentials and replace them
      if (streamUrl.includes('myuser:mypass@')) {
        const originalUrl = streamUrl;
        streamUrl = streamUrl.replace('myuser:mypass', `${encodeURIComponent(email)}:${encodeURIComponent(password)}`);
        console.log('✅ Replaced placeholder credentials myuser:mypass with real credentials');
        console.log(`Before: ${originalUrl.substring(0, 50)}...`);
        console.log(`After: ${streamUrl.replace(/:([^@:]+)@/, ':***@')}`); // Log with masked password
      }
      // Also handle case where URL has no credentials at all
      else if (!streamUrl.includes('@') && (streamUrl.startsWith('https://api.awarecam.com') || streamUrl.startsWith('http://api.awarecam.com'))) {
        const originalUrl = streamUrl;
        streamUrl = streamUrl.replace('https://api.awarecam.com', `https://${encodeURIComponent(email)}:${encodeURIComponent(password)}@api.awarecam.com`);
        streamUrl = streamUrl.replace('http://api.awarecam.com', `http://${encodeURIComponent(email)}:${encodeURIComponent(password)}@api.awarecam.com`);
        console.log('✅ Added credentials to URL without authentication');
        console.log(`Before: ${originalUrl}`);
        console.log(`After: ${streamUrl.replace(/:([^@:]+)@/, ':***@')}`); // Log with masked password
      }
      // Handle any other placeholder patterns we might encounter
      else if (streamUrl.includes('username:password@') || streamUrl.includes('user:pass@')) {
        streamUrl = streamUrl.replace(/[^@\/]+:[^@\/]+@/, `${encodeURIComponent(email)}:${encodeURIComponent(password)}@`);
        console.log('✅ Replaced generic placeholder credentials with real credentials');
      }
      else {
        console.log('ℹ️  No credential placeholders found in URL, using as-is');
      }
    } else {
      console.error('❌ Missing DROPLET_EMAIL or DROPLET_PASSWORD environment variables');
      return new Response('Missing authentication credentials', { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log(`Final stream URL host: ${new URL(streamUrl).host}`); // Only log the host for security

    // Fetch the stream
    console.log('🔄 Fetching stream with real credentials...');
    const response = await fetch(streamUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Base44-HLS-Proxy/1.0',
        'Accept': 'application/vnd.apple.mpegurl,application/x-mpegURL,application/octet-stream,*/*'
      }
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('html')) {
      const html = await response.text();
      console.error('❌ Received HTML instead of HLS:', html.substring(0, 500));
      return new Response('Upstream returned HTML instead of HLS', { status: 502, headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' } });
    }

    console.log('📡 Stream response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: contentType,
      contentLength: response.headers.get('content-length')
    });
    
    if (!response.ok) {
      console.error(`❌ Stream fetch failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response body:', errorText.substring(0, 500));
      
      return new Response(`Stream fetch failed: ${response.status} ${response.statusText}`, { 
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get the content type
  // Use the contentType already fetched above, or fallback
  const finalContentType = contentType || (streamUrl.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'application/octet-stream');

    // For playlist files (.m3u8), we need to rewrite URLs to go through our proxy
    if (contentType.includes('mpegurl') || contentType.includes('m3u8') || streamUrl.includes('.m3u8')) {
      const content = await response.text();

      console.log('📋 Processing HLS playlist:');
      console.log(`   Content length: ${content.length} characters`);
      console.log(`   First 200 characters: ${content.substring(0, 200)}`);

      // Validate HLS content
      if (!content.includes('#EXTM3U')) {
        console.error('❌ Invalid HLS content received - no #EXTM3U header found');
        console.error('Full content received:', content.substring(0, 500));
        return new Response('Invalid HLS content received from stream server', {
          status: 502,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      console.log('✅ Valid HLS playlist detected');

      // Rewrite URLs in the playlist to go through our proxy
      const rewrittenContent = content.replace(
        /^([^#\n\r]+\.(ts|m3u8).*?)$/gm,
        (match) => {
          // Skip if already an absolute URL
          if (match.startsWith('http')) {
            return match;
          }

          // Create proxy URL for this file
          const proxyUrl = new URL(req.url);
          proxyUrl.searchParams.set('camera_id', cameraId);
          proxyUrl.searchParams.set('file', match);
          proxyUrl.searchParams.delete('t'); // Remove timestamp to avoid accumulating params
          return proxyUrl.toString();
        }
      );

      console.log('🔄 Playlist URL rewriting complete');

      return new Response(rewrittenContent, {
        status: response.status,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // For other content (like .ts segments), pass through directly
    console.log('📹 Passing through non-playlist content (video segments)');
    
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': finalContentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': response.headers.get('cache-control') || 'public, max-age=10'
      }
    });

  } catch (error) {
    console.error('💥 HLS Proxy error:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(`Proxy error: ${error.message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});