import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PlatformAnomaly } from '@/api/entities';
import { User } from '@/api/entities';
import { Loader2, Bell, ShieldAlert, CheckCircle, VideoOff, BarChart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const AnomalyCard = ({ anomaly, onAcknowledge }) => {
  const Icon = anomaly.anomaly_type === 'event_spike' ? BarChart : VideoOff;
  const title = anomaly.anomaly_type === 'event_spike' ? 'Event Spike Detected' : 'Camera Offline';
  
  const getLink = () => {
    if (anomaly.anomaly_type === 'camera_offline' && anomaly.organization_id) {
        return `${createPageUrl('AdminOrganizationDetails')}?id=${anomaly.organization_id}&tab=cameras`;
    }
    if (anomaly.anomaly_type === 'event_spike' && anomaly.organization_id) {
        return `${createPageUrl('AdminOrganizationDetails')}?id=${anomaly.organization_id}&tab=events`;
    }
    return '#';
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-4">
        <Icon className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold text-red-800">{title}</h4>
          <p className="text-sm text-red-700">{anomaly.details.message}</p>
          <div className="text-xs text-red-600 mt-2 flex items-center gap-4">
             <span>
                Detected: {formatDistanceToNow(new Date(anomaly.created_date), { addSuffix: true })}
             </span>
            {anomaly.related_name && (
              <Link to={getLink()} className="font-semibold hover:underline">
                View Details
              </Link>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => onAcknowledge(anomaly.id)}>
          <CheckCircle className="w-3.5 h-3.5 mr-1" />
          Acknowledge
        </Button>
      </div>
    </div>
  );
};

export default function ActiveAnomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAnomalies = useCallback(async () => {
    try {
      const activeAnomalies = await PlatformAnomaly.filter({ status: 'active' }, '-created_date');
      setAnomalies(activeAnomalies);
    } catch (error) {
      console.error("Failed to fetch active anomalies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
    // Refresh anomalies every 30 seconds
    const interval = setInterval(fetchAnomalies, 30000);
    return () => clearInterval(interval);
  }, [fetchAnomalies]);

  const handleAcknowledge = async (id) => {
    try {
      const user = await User.me();
      await PlatformAnomaly.update(id, { 
        status: 'acknowledged',
        acknowledged_by: user.email,
        acknowledged_at: new Date().toISOString()
      });
      // Refresh list immediately after acknowledging
      fetchAnomalies();
    } catch (error) {
      console.error("Failed to acknowledge anomaly:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading active anomalies...</span>
      </div>
    );
  }
  
  if (anomalies.length === 0) {
    return (
        <Alert className="bg-green-50 border-green-200">
            <Bell className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">All Systems Normal</AlertTitle>
            <AlertDescription className="text-green-700">
                No active platform anomalies detected at this time.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600"/>
            <h2 className="text-2xl font-bold text-slate-900">Active Anomalies ({anomalies.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} onAcknowledge={handleAcknowledge} />
            ))}
        </div>
    </div>
  );
}