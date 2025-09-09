import { Event } from '@/api/entities';
import { alertEngine } from '@/components/services/AlertEngine';

// Configuration constants
const ALERT_PROCESSING_CONFIG = {
    MIN_CONFIDENCE: 0.6,
    MIN_SEVERITY_LEVELS: ['medium', 'high', 'critical'],
    ENABLED: true
};

/**
 * Enhanced event creation that automatically triggers alert processing
 */
export const createEventWithAlerts = async (eventData) => {
    try {
        // Validate required fields
        if (!eventData.organization_id) {
            throw new Error('Event must have an organization_id');
        }

        // Create the event first
        console.log('EventService: Creating new event', eventData);
        const createdEvent = await Event.create(eventData);
        console.log('EventService: Event created successfully', createdEvent.id);

        // Process alerts asynchronously (don't block event creation)
        processEventAlerts(createdEvent);

        return createdEvent;
    } catch (error) {
        console.error('EventService: Failed to create event:', error);
        throw error;
    }
};

/**
 * Process alerts for an event (called automatically after event creation)
 */
const processEventAlerts = async (event) => {
    // Don't block the main thread - process alerts asynchronously
    setTimeout(async () => {
        try {
            // Validation checks before processing alerts
            if (!shouldProcessAlerts(event)) {
                console.log('EventService: Skipping alert processing for event', event.id, 'due to validation criteria');
                return;
            }

            console.log('EventService: Processing alerts for event', event.id);
            await alertEngine.processEvent(event);
            console.log('EventService: Alert processing completed for event', event.id);

        } catch (error) {
            console.error('EventService: Alert processing failed for event', event.id, ':', error);
            // Don't throw - just log the error so event creation isn't affected
        }
    }, 0);
};

/**
 * Determine if an event should trigger alert processing
 */
const shouldProcessAlerts = (event) => {
    // Skip if alert processing is disabled
    if (!ALERT_PROCESSING_CONFIG.ENABLED) {
        return false;
    }

    // Must have organization_id
    if (!event.organization_id) {
        console.log('EventService: No organization_id, skipping alerts');
        return false;
    }

    // Check confidence threshold
    if (event.confidence && event.confidence < ALERT_PROCESSING_CONFIG.MIN_CONFIDENCE) {
        console.log('EventService: Confidence too low', event.confidence, 'vs', ALERT_PROCESSING_CONFIG.MIN_CONFIDENCE);
        return false;
    }

    // Check severity threshold
    if (event.severity && !ALERT_PROCESSING_CONFIG.MIN_SEVERITY_LEVELS.includes(event.severity)) {
        console.log('EventService: Severity too low', event.severity, 'not in', ALERT_PROCESSING_CONFIG.MIN_SEVERITY_LEVELS);
        return false;
    }

    // Skip test events (events with test camera IDs or descriptions)
    if (event.camera_id?.includes('test') || event.description?.toLowerCase().includes('test')) {
        console.log('EventService: Test event detected, processing alerts anyway for demo purposes');
        // For demo purposes, we'll still process test events
        // In production, you might want to skip them:
        // return false;
    }

    return true;
};

/**
 * Bulk create events with alert processing
 */
export const createMultipleEventsWithAlerts = async (eventsData) => {
    const results = [];
    for (const eventData of eventsData) {
        try {
            const event = await createEventWithAlerts(eventData);
            results.push({ success: true, event });
        } catch (error) {
            results.push({ success: false, error: error.message, data: eventData });
        }
    }
    return results;
};

/**
 * Standard event creation (without alerts) - for backwards compatibility
 */
export const createEvent = async (eventData) => {
    return await Event.create(eventData);
};

// Export configuration for external access
export { ALERT_PROCESSING_CONFIG };