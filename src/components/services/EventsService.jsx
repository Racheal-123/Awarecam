
import { Event } from '@/api/entities';
import { User } from '@/api/entities';
import { SHARED_DEMO_EVENTS } from '@/components/events/sharedDemoEvents';

export class EventsService {
  static async listByCamera({ camera_id, since, until, filters = {}, limit = 100 }) {
    if (!camera_id) throw new Error('camera_id is required');
    
    try {
      const user = await User.me();
      const baseFilter = {
        camera_id,
        organization_id: user.organization_id
      };

      // Add time range filters
      if (since) baseFilter.created_date_gte = since;
      if (until) baseFilter.created_date_lte = until;

      // Add additional filters
      if (filters.event_type) baseFilter.event_type = filters.event_type;
      if (filters.severity) baseFilter.severity = filters.severity;
      if (filters.ai_agent) baseFilter.ai_agent = filters.ai_agent;

      const events = await Event.filter(baseFilter, '-created_date', limit);
      
      // If no real events, return demo events for that camera
      if (events.length === 0) {
        console.warn(`No real events found for ${camera_id}, returning demo events.`);
        return SHARED_DEMO_EVENTS.filter(e => e.camera_id === camera_id);
      }

      return events.map(event => ({
        id: event.id,
        timestamp: new Date(event.created_date).getTime(),
        created_date: event.created_date,
        type: event.event_type,
        severity: event.severity,
        confidence: event.confidence || 0.85,
        description: event.description,
        clip_url: event.clip_url || event.video_url, // Changed to clip_url
        snapshot_url: event.thumbnail_url, // Changed to snapshot_url
        actions: event.triggered_actions || [],
        status: event.status,
        ai_agent: event.ai_agent,
        zone_name: event.zone_name,
        raw: event
      }));
    } catch (error) {
      console.error('EventsService.listByCamera error:', error);
      // Fallback to demo events on error
      return SHARED_DEMO_EVENTS.filter(e => e.camera_id === camera_id);
    }
  }

  static async subscribeCamera(camera_id, callback) {
    // Simple polling implementation for now
    // In production, you'd use WebSocket or Server-Sent Events
    const pollInterval = 5000; // 5 seconds
    
    let lastCheck = new Date();
    
    const poll = async () => {
      try {
        const events = await this.listByCamera({
          camera_id,
          since: lastCheck.toISOString(),
          limit: 10
        });
        
        if (events.length > 0) {
          events.forEach(callback);
          lastCheck = new Date();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const intervalId = setInterval(poll, pollInterval);
    
    // Return unsubscribe function
    return () => clearInterval(intervalId);
  }

  static async acknowledgeEvent(eventId) {
    try {
      const user = await User.me();
      await Event.update(eventId, {
        status: 'acknowledged',
        acknowledged_by: user.email,
        acknowledged_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to acknowledge event:', error);
      throw error;
    }
  }
}
