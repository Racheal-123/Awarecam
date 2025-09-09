import { useEffect, useState } from 'react';
import { Event } from '@/api/entities';
import { Camera } from '@/api/entities';
import { PlatformAnomaly } from '@/api/entities';
import _ from 'lodash';
import { subDays, subMinutes } from 'date-fns';

const ANOMALY_CHECK_INTERVAL = 60 * 1000; // 1 minute
const EVENT_SPIKE_THRESHOLD = 3; // 3x the baseline
const CAMERA_OFFLINE_MINUTES = 5;

// This is a headless component that performs checks in the background
export default function AnomalyDetector() {
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    const runChecks = async () => {
      console.log('Running platform anomaly checks...');
      
      try {
        const activeAnomalies = await PlatformAnomaly.filter({ status: 'active' });
        
        await checkForEventSpikes(activeAnomalies);
        await checkForOfflineCameras(activeAnomalies);

      } catch (error) {
        console.error("Error during anomaly detection:", error);
      }
      
      setLastCheck(new Date());
    };

    runChecks(); // Run on initial load
    const interval = setInterval(runChecks, ANOMALY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const checkForEventSpikes = async (activeAnomalies) => {
    // 1. Get recent events (last 10 minutes)
    const recentEvents = await Event.filter({ created_date_gte: subMinutes(new Date(), 10).toISOString() });
    const recentEventsByOrg = _.groupBy(recentEvents, 'organization_id');

    // 2. Get baseline events (last 7 days)
    const baselineEvents = await Event.filter({ created_date_gte: subDays(new Date(), 7).toISOString() });
    const baselineEventsByOrg = _.groupBy(baselineEvents, 'organization_id');
    
    for (const orgId in recentEventsByOrg) {
      const currentRate = recentEventsByOrg[orgId].length;
      const baselineTotal = baselineEventsByOrg[orgId]?.length || 0;
      // Baseline average over 10 minutes
      const baselineRate = (baselineTotal / (7 * 24 * 6)); 

      if (currentRate > 10 && currentRate > baselineRate * EVENT_SPIKE_THRESHOLD) {
        // Potential spike found, check if there's already an active alert
        const existingAlert = activeAnomalies.find(a => a.anomaly_type === 'event_spike' && a.organization_id === orgId);
        
        if (!existingAlert) {
            console.log(`EVENT SPIKE DETECTED for org ${orgId}`);
            const spikePercentage = baselineRate > 0 ? ((currentRate - baselineRate) / baselineRate) * 100 : 100;
            await PlatformAnomaly.create({
                anomaly_type: 'event_spike',
                organization_id: orgId,
                status: 'active',
                details: {
                    message: `Event rate is ${spikePercentage.toFixed(0)}% above baseline.`,
                    current_rate: currentRate,
                    baseline_rate: baselineRate.toFixed(2),
                    spike_percentage: spikePercentage
                }
            });
        }
      }
    }
  };

  const checkForOfflineCameras = async (activeAnomalies) => {
    const allCameras = await Camera.list();
    const offlineThreshold = subMinutes(new Date(), CAMERA_OFFLINE_MINUTES);

    for (const camera of allCameras) {
      // Check if camera is supposed to be active but has no recent heartbeat
      const isOffline = camera.status === 'active' && (!camera.last_heartbeat || new Date(camera.last_heartbeat) < offlineThreshold);
      
      if (isOffline) {
        const existingAlert = activeAnomalies.find(a => a.anomaly_type === 'camera_offline' && a.related_id === camera.id);
        
        if (!existingAlert) {
          console.log(`CAMERA OFFLINE DETECTED for cam ${camera.id}`);
          await PlatformAnomaly.create({
            anomaly_type: 'camera_offline',
            organization_id: camera.organization_id,
            related_id: camera.id,
            related_name: camera.name,
            status: 'active',
            details: {
              message: `Camera "${camera.name}" in "${camera.location}" has been offline for >${CAMERA_OFFLINE_MINUTES} minutes.`,
              offline_since: camera.last_heartbeat || new Date().toISOString()
            }
          });
        }
      }
    }
  };

  return null; // This component does not render anything
}