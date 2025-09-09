import React, { useEffect, useRef, useCallback } from 'react';
import { User } from '@/api/entities';
import { Camera } from '@/api/entities';
import { StreamCallbackLog } from '@/api/entities';
import { streamHealthMonitor } from '@/api/functions';
import { proxyKeepAlive } from '@/api/functions';
import { streamWatchdog } from '@/api/functions';

// Stream management service that runs monitoring cycles
export default function StreamManager() {
  const intervalRefs = useRef({});
  const isRunning = useRef(false);

  const startHealthMonitoring = useCallback(() => {
    // Health monitoring every 5 minutes (reduced from 30 seconds)
    intervalRefs.current.health = setInterval(async () => {
      if (!isRunning.current) return;
      
      try {
        console.log('🔍 StreamManager: Running health monitor cycle');
        const result = await streamHealthMonitor();
        
        if (result.data?.report) {
          const report = result.data.report;
          console.log(`📊 Health Report: ${report.activeStreams}/${report.totalCameras} active, ${report.restartsSuccessful}/${report.restartsAttempted} restarts successful`);
        }
      } catch (error) {
        console.error('❌ Health monitoring cycle failed:', error);
      }
    }, 300000); // 5 minutes (300,000 milliseconds)
  }, []);

  const startProxyMaintenance = useCallback(() => {
    // Proxy maintenance every 5 minutes (reduced from 60 seconds)
    intervalRefs.current.proxy = setInterval(async () => {
      if (!isRunning.current) return;
      
      try {
        console.log('🔗 StreamManager: Running proxy keep-alive cycle');
        const result = await proxyKeepAlive();
        
        if (result.data?.results) {
          const results = result.data.results;
          console.log(`🔗 Proxy Health: ${results.healthy}/${results.total} proxies healthy`);
        }
      } catch (error) {
        console.error('❌ Proxy maintenance cycle failed:', error);
      }
    }, 300000); // 5 minutes (300,000 milliseconds)
  }, []);

  const startWatchdogCycle = useCallback(() => {
    // Comprehensive watchdog every 5 minutes (unchanged)
    intervalRefs.current.watchdog = setInterval(async () => {
      if (!isRunning.current) return;
      
      try {
        console.log('🐕 StreamManager: Running comprehensive watchdog cycle');
        const result = await streamWatchdog();
        
        if (result.data?.report) {
          console.log('📈 Watchdog completed - system optimized');
        }
      } catch (error) {
        console.error('❌ Watchdog cycle failed:', error);
      }
    }, 300000); // 5 minutes (300,000 milliseconds)
  }, []);

  const stopStreamManagement = useCallback(() => {
    console.log('🛑 Stopping StreamManager');
    isRunning.current = false;
    
    Object.values(intervalRefs.current).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    
    intervalRefs.current = {};
  }, []);

  const startStreamManagement = useCallback(async () => {
    if (isRunning.current) return;
    
    console.log('🚀 Starting StreamManager - Autonomous stream monitoring active (5-minute intervals)');
    isRunning.current = true;

    try {
      // Verify user permissions
      const user = await User.me();
      if (!user) {
        console.warn('⚠️ StreamManager: No user session, monitoring disabled');
        return;
      }

      // Start monitoring cycles with reduced frequency
      startHealthMonitoring();
      startProxyMaintenance();
      startWatchdogCycle();

      console.log('✅ StreamManager: All monitoring cycles started (5-minute intervals)');
    } catch (error) {
      console.error('❌ StreamManager startup failed:', error);
    }
  }, [startHealthMonitoring, startProxyMaintenance, startWatchdogCycle]);

  useEffect(() => {
    startStreamManagement();
    return () => stopStreamManagement();
  }, [startStreamManagement, stopStreamManagement]);

  // Component doesn't render anything - it's a service
  return null;
}

// Hook for manual stream operations
export const useStreamManager = () => {
  const restartAllFailedStreams = async () => {
    try {
      console.log('🔄 Manual restart of all failed streams requested');
      const result = await streamHealthMonitor();
      return result.data;
    } catch (error) {
      console.error('❌ Manual restart failed:', error);
      throw error;
    }
  };

  const testProxyHealth = async () => {
    try {
      console.log('🔗 Manual proxy health test requested');  
      const result = await proxyKeepAlive();
      return result.data;
    } catch (error) {
      console.error('❌ Proxy health test failed:', error);
      throw error;
    }
  };

  const runFullDiagnostic = async () => {
    try {
      console.log('🐕 Manual full diagnostic requested');
      const result = await streamWatchdog();
      return result.data;
    } catch (error) {
      console.error('❌ Full diagnostic failed:', error);
      throw error;
    }
  };

  return {
    restartAllFailedStreams,
    testProxyHealth,
    runFullDiagnostic
  };
};