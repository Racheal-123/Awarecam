import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const startTime = Date.now();

    console.log('🔍 StreamHealthMonitor: Starting health check cycle');
    
    // Get all cameras with their current status
    const cameras = await base44.asServiceRole.entities.Camera.list();
    console.log(`📊 Found ${cameras.length} cameras to monitor`);

    const healthReport = {
      totalCameras: cameras.length,
      activeStreams: 0,
      failedStreams: 0,
      restartsAttempted: 0,
      restartsSuccessful: 0,
      errors: []
    };

    for (const camera of cameras) {
      try {
        await checkAndRecoverCamera(camera, base44, healthReport);
      } catch (error) {
        console.error(`❌ Error processing camera ${camera.id}:`, error);
        healthReport.errors.push({
          cameraId: camera.id,
          cameraName: camera.name,
          error: error.message
        });
      }
    }

    // Log health report
    const duration = Date.now() - startTime;
    console.log(`✅ StreamHealthMonitor completed in ${duration}ms`);
    console.log(`📈 Health Report:`, healthReport);

    // Create monitoring log entry
    await base44.asServiceRole.entities.StreamCallbackLog.create({
      camera_id: 'system_monitor',
      stream_id: 'health_check',
      status: 'completed',
      payload: {
        type: 'health_monitor',
        duration_ms: duration,
        report: healthReport,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({
      success: true,
      duration_ms: duration,
      report: healthReport
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 StreamHealthMonitor fatal error:', error);
    return new Response(JSON.stringify({
      error: 'Health monitor failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function checkAndRecoverCamera(camera, base44, healthReport) {
  const now = new Date();
  const cameraAge = camera.created_date ? (now - new Date(camera.created_date)) / 1000 : 0;
  
  console.log(`🔍 Checking camera: ${camera.name} (${camera.id})`);
  console.log(`   Status: ${camera.status}, Stream: ${camera.stream_status}`);

  // Skip very new cameras (less than 30 seconds old)
  if (cameraAge < 30) {
    console.log(`⏳ Skipping new camera ${camera.name} (${cameraAge}s old)`);
    return;
  }

  // Determine if camera needs intervention
  const needsRestart = shouldRestartCamera(camera, now);
  
  if (needsRestart.restart) {
    console.log(`🚨 Camera ${camera.name} needs restart: ${needsRestart.reason}`);
    healthReport.restartsAttempted++;
    
    const success = await attemptStreamRestart(camera, base44, needsRestart.severity);
    if (success) {
      healthReport.restartsSuccessful++;
      console.log(`✅ Successfully restarted camera ${camera.name}`);
    }
  } else if (camera.stream_status === 'live') {
    healthReport.activeStreams++;
  }

  // Count failed streams
  if (['error', 'stopped'].includes(camera.stream_status)) {
    healthReport.failedStreams++;
  }
}

function shouldRestartCamera(camera, now) {
  // Check for obvious failure states
  if (camera.stream_status === 'error') {
    return { restart: true, reason: 'Stream in error state', severity: 'high' };
  }
  
  if (camera.stream_status === 'stopped') {
    return { restart: true, reason: 'Stream stopped', severity: 'medium' };
  }

  // Check for stale streams
  if (camera.last_heartbeat) {
    const lastHeartbeat = new Date(camera.last_heartbeat);
    const minutesSinceHeartbeat = (now - lastHeartbeat) / (1000 * 60);
    
    if (minutesSinceHeartbeat > 10) {
      return { restart: true, reason: `No heartbeat for ${minutesSinceHeartbeat.toFixed(1)} minutes`, severity: 'high' };
    }
  }

  // Check for cameras that should be streaming but aren't
  if (camera.status === 'active' && camera.stream_status === 'idle' && camera.rtsp_url) {
    return { restart: true, reason: 'Active camera with RTSP URL not streaming', severity: 'medium' };
  }

  // Check for starting streams that are stuck
  if (camera.stream_status === 'starting') {
    const updatedTime = new Date(camera.updated_date);
    const minutesStarting = (now - updatedTime) / (1000 * 60);
    
    if (minutesStarting > 3) {
      return { restart: true, reason: `Stuck in starting state for ${minutesStarting.toFixed(1)} minutes`, severity: 'medium' };
    }
  }

  return { restart: false };
}

async function attemptStreamRestart(camera, base44, severity) {
  try {
    console.log(`🔄 Attempting restart for camera ${camera.name} (severity: ${severity})`);

    // For high severity issues, do a hard restart (stop first)
    if (severity === 'high' && camera.stream_status !== 'idle') {
      console.log(`🛑 Stopping stream for hard restart...`);
      try {
        await base44.functions.invoke('stopStream', {
          camera_id: camera.id
        });
        console.log(`✅ Stream stopped successfully`);
        
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (stopError) {
        console.warn(`⚠️ Stop stream failed, continuing with restart:`, stopError.message);
      }
    }

    // Update camera to starting status
    await base44.asServiceRole.entities.Camera.update(camera.id, {
      stream_status: 'starting',
      last_error: null
    });

    // Start the stream
    console.log(`▶️ Starting stream...`);
    const startResult = await base44.functions.invoke('startStream', {
      camera_id: camera.id,
      rtsp_url: camera.rtsp_url
    });

    console.log(`✅ Start stream result:`, startResult.data);

    // Verify the stream is accessible
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test the proxy connectivity
    try {
      await base44.functions.invoke('hlsProxy', {}, {
        method: 'GET',
        searchParams: { camera_id: camera.id }
      });
      console.log(`🔗 HLS Proxy connectivity verified`);
    } catch (proxyError) {
      console.warn(`⚠️ Proxy test failed:`, proxyError.message);
    }

    // Log successful restart
    await base44.asServiceRole.entities.StreamCallbackLog.create({
      camera_id: camera.id,
      stream_id: camera.stream_id || 'restart_operation',
      status: 'restarted',
      payload: {
        type: 'auto_restart',
        severity: severity,
        previous_status: camera.stream_status,
        restart_time: new Date().toISOString(),
        success: true
      }
    });

    return true;

  } catch (error) {
    console.error(`❌ Restart failed for camera ${camera.name}:`, error);
    
    // Log failed restart
    await base44.asServiceRole.entities.StreamCallbackLog.create({
      camera_id: camera.id,
      stream_id: camera.stream_id || 'restart_operation', 
      status: 'restart_failed',
      payload: {
        type: 'auto_restart',
        severity: severity,
        error: error.message,
        restart_time: new Date().toISOString(),
        success: false
      }
    });

    // Update camera with error info
    await base44.asServiceRole.entities.Camera.update(camera.id, {
      stream_status: 'error',
      last_error: `Auto-restart failed: ${error.message}`
    });

    return false;
  }
}