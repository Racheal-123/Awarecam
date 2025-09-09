import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    console.log('🔄 ProxyKeepAlive: Starting proxy health check');

    // Get all active cameras with HLS URLs
    const cameras = await base44.asServiceRole.entities.Camera.filter({
      stream_status: 'live'
    });

    console.log(`🎥 Found ${cameras.length} live cameras to check`);

    const results = {
      total: cameras.length,
      healthy: 0,
      unhealthy: 0,
      errors: []
    };

    // Test each camera's proxy connectivity
    for (const camera of cameras) {
      if (!camera.hls_url) continue;

      try {
        console.log(`🔗 Testing proxy for camera: ${camera.name}`);
        
        const startTime = Date.now();
        
        // Make a HEAD request to test connectivity without downloading content
        const response = await fetch(`${Deno.env.get('NEXT_PUBLIC_FUNCTIONS_BASE') || 'https://app.awarecam.com'}/functions/hlsProxy?camera_id=${camera.id}`, {
          method: 'HEAD',
          timeout: 10000 // 10 second timeout
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          results.healthy++;
          console.log(`✅ Proxy healthy for ${camera.name} (${responseTime}ms)`);
          
          // Update camera health metrics
          await base44.asServiceRole.entities.Camera.update(camera.id, {
            health_score: Math.min(100, (camera.health_score || 90) + 1),
            last_heartbeat: new Date().toISOString()
          });
          
        } else {
          results.unhealthy++;
          console.warn(`⚠️ Proxy unhealthy for ${camera.name}: ${response.status} ${response.statusText}`);
          
          // Try to restart the stream if proxy is failing
          console.log(`🔄 Attempting stream restart due to proxy failure`);
          await base44.functions.invoke('streamHealthMonitor');
        }
        
      } catch (error) {
        results.unhealthy++;
        results.errors.push({
          cameraId: camera.id,
          cameraName: camera.name,
          error: error.message
        });
        
        console.error(`❌ Proxy test failed for ${camera.name}:`, error.message);
        
        // Decrease health score for failing cameras
        await base44.asServiceRole.entities.Camera.update(camera.id, {
          health_score: Math.max(0, (camera.health_score || 90) - 5),
          last_error: `Proxy connectivity failed: ${error.message}`
        });
      }
    }

    // Log keep-alive results
    await base44.asServiceRole.entities.StreamCallbackLog.create({
      camera_id: 'proxy_keepalive',
      stream_id: 'keepalive_check',
      status: 'completed',
      payload: {
        type: 'proxy_keepalive',
        results: results,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ ProxyKeepAlive completed:`, results);

    return new Response(JSON.stringify({
      success: true,
      results: results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 ProxyKeepAlive fatal error:', error);
    return new Response(JSON.stringify({
      error: 'Proxy keep-alive failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});