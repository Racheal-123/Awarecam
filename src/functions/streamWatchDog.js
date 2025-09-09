import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    console.log('🐕 StreamWatchdog: Starting comprehensive stream monitoring');

    // Parallel execution of monitoring tasks
    const tasks = [
      checkStreamHealth(base44),
      maintainProxyConnections(base44), 
      cleanupStaleStreams(base44),
      optimizeStreamPerformance(base44)
    ];

    const results = await Promise.allSettled(tasks);
    
    const report = {
      timestamp: new Date().toISOString(),
      healthCheck: results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason?.message },
      proxyMaintenance: results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason?.message },
      cleanup: results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason?.message },
      optimization: results[3].status === 'fulfilled' ? results[3].value : { error: results[3].reason?.message }
    };

    console.log('📊 StreamWatchdog Report:', report);

    // Create comprehensive log entry
    await base44.asServiceRole.entities.StreamCallbackLog.create({
      camera_id: 'stream_watchdog',
      stream_id: 'comprehensive_monitoring',
      status: 'completed',
      payload: {
        type: 'stream_watchdog',
        report: report,
        execution_time: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({
      success: true,
      report: report
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 StreamWatchdog fatal error:', error);
    return new Response(JSON.stringify({
      error: 'Stream watchdog failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function checkStreamHealth(base44) {
  console.log('🔍 Checking stream health across all cameras');
  
  const cameras = await base44.asServiceRole.entities.Camera.list();
  const issues = [];
  let healthyCount = 0;
  
  for (const camera of cameras) {
    if (camera.stream_status === 'live') {
      // Verify HLS URL is still accessible
      if (camera.hls_url) {
        try {
          const testUrl = `${Deno.env.get('NEXT_PUBLIC_FUNCTIONS_BASE') || 'https://app.awarecam.com'}/functions/hlsProxy?camera_id=${camera.id}`;
          const response = await fetch(testUrl, { 
            method: 'HEAD',
            timeout: 5000
          });
          
          if (response.ok) {
            healthyCount++;
          } else {
            issues.push({
              cameraId: camera.id,
              issue: 'HLS URL not accessible',
              status: response.status
            });
          }
        } catch (error) {
          issues.push({
            cameraId: camera.id,
            issue: 'HLS connection failed',
            error: error.message
          });
        }
      }
    } else if (camera.status === 'active' && camera.rtsp_url) {
      // Active camera that should be streaming but isn't
      issues.push({
        cameraId: camera.id,
        issue: 'Active camera not streaming',
        currentStatus: camera.stream_status
      });
    }
  }

  return {
    totalCameras: cameras.length,
    healthyStreams: healthyCount,
    issuesFound: issues.length,
    issues: issues
  };
}

async function maintainProxyConnections(base44) {
  console.log('🔗 Maintaining proxy connections');
  
  // Test core proxy functionality
  try {
    const proxyTestUrl = `${Deno.env.get('NEXT_PUBLIC_FUNCTIONS_BASE') || 'https://app.awarecam.com'}/functions/hlsProxy`;
    const response = await fetch(proxyTestUrl, {
      method: 'POST', // Health check endpoint
      timeout: 3000
    });
    
    const proxyHealthy = response.ok;
    console.log(`🔗 Proxy health: ${proxyHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    
    return {
      proxyHealthy: proxyHealthy,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Proxy health check failed:', error);
    return {
      proxyHealthy: false,
      error: error.message,
      lastCheck: new Date().toISOString()
    };
  }
}

async function cleanupStaleStreams(base44) {
  console.log('🧹 Cleaning up stale streams');
  
  const staleThreshold = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
  const cleanedUp = [];
  
  // Find cameras with very old 'starting' or 'error' status
  const staleCameras = await base44.asServiceRole.entities.Camera.filter({
    stream_status: ['starting', 'error'],
    updated_date: { $lt: staleThreshold.toISOString() }
  });
  
  for (const camera of staleCameras) {
    try {
      // Reset stale cameras to idle status
      await base44.asServiceRole.entities.Camera.update(camera.id, {
        stream_status: 'idle',
        last_error: 'Reset by stream watchdog - was stale'
      });
      
      cleanedUp.push(camera.id);
      console.log(`🧹 Reset stale camera: ${camera.name}`);
    } catch (error) {
      console.error(`❌ Failed to cleanup camera ${camera.id}:`, error);
    }
  }
  
  return {
    staleFound: staleCameras.length,
    cleanedUp: cleanedUp.length,
    cameraIds: cleanedUp
  };
}

async function optimizeStreamPerformance(base44) {
  console.log('⚡ Optimizing stream performance');
  
  // Get cameras with low health scores
  const cameras = await base44.asServiceRole.entities.Camera.list();
  const optimizations = [];
  
  for (const camera of cameras) {
    if (camera.health_score && camera.health_score < 70 && camera.stream_status === 'live') {
      // Camera has low health but is streaming - might benefit from restart
      console.log(`⚡ Low health camera detected: ${camera.name} (${camera.health_score}%)`);
      
      try {
        // Attempt a gentle restart
        await base44.functions.invoke('startStream', {
          camera_id: camera.id,
          rtsp_url: camera.rtsp_url
        });
        
        optimizations.push({
          cameraId: camera.id,
          action: 'restart',
          previousHealth: camera.health_score
        });
      } catch (error) {
        console.error(`❌ Optimization restart failed for ${camera.name}:`, error);
      }
    }
  }
  
  return {
    camerasOptimized: optimizations.length,
    optimizations: optimizations
  };
}