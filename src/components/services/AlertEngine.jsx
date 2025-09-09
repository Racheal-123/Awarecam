
import { AlertWorkflow } from '@/api/entities';
import { AgentAlertChannel } from '@/api/entities';
import { AlertNotification } from '@/api/entities';
import { Event } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { User } from '@/api/entities';
import { UserNotificationPreferences } from '@/api/entities'; // New import
import { Organization } from '@/api/entities'; // Kept for consistency if needed elsewhere, though its cache and related methods are removed.

class AlertEngine {
    constructor() {
        this.scheduledAlerts = new Map(); // For future escalation scheduling
        // Removed: this.processingQueue, this.isProcessing, this.userSettingsCache, this.orgSettingsCache
    }

    /**
     * Main entry point: process a new event against all workflows
     */
    async processEvent(event) {
        console.log('AlertEngine: Processing event', event.id, 'for org', event.organization_id);

        try {
            // Find all active workflows for this organization
            const workflows = await AlertWorkflow.filter({
                organization_id: event.organization_id,
                is_active: true
            });

            console.log(`AlertEngine: Found ${workflows.length} active workflows for organization ${event.organization_id}`);

            // Process each workflow that matches
            for (const workflow of workflows) {
                if (await this.evaluateConditions(event, workflow)) {
                    console.log(`AlertEngine: Executing workflow "${workflow.workflow_name}" for event ${event.id}`);
                    try {
                        await this.executeWorkflow(event, workflow);
                    } catch (error) {
                        console.error(`AlertEngine: Failed to execute workflow ${workflow.id}:`, error);
                        // Continue with other workflows
                    }
                }
            }

        } catch (error) {
            console.error('AlertEngine: Error processing event:', error);
        }
        // Removed: finally block with processingQueue.delete
    }

    /**
     * Evaluate if event matches workflow conditions
     */
    async evaluateConditions(event, workflow) {
        const conditions = workflow.trigger_conditions || {}; // Changed to trigger_conditions

        console.log('AlertEngine: Evaluating conditions', conditions, 'against event', {
            event_type: event.event_type,
            ai_agent: event.ai_agent, // Kept for logging context
            zone_name: event.zone_name,
            confidence: event.confidence,
            severity: event.severity
        });

        // Match event types
        if (conditions.event_types && !conditions.event_types.includes(event.event_type)) {
            return false;
        }

        // Match severity levels
        if (conditions.severity_levels && !conditions.severity_levels.includes(event.severity)) {
            return false;
        }

        // Match confidence threshold
        if (conditions.confidence_gt && event.confidence < conditions.confidence_gt) {
            return false;
        }

        // Match zones
        if (conditions.zones && conditions.zones.length > 0) {
            if (!event.zone_name || !conditions.zones.includes(event.zone_name)) {
                return false;
            }
        }
        // Removed: old specific checks for triggering_agent_id, single event_type, zone_name, severity

        console.log('AlertEngine: Conditions matched for workflow', workflow.workflow_name);
        return true;
    }

    /**
     * Execute a matching workflow's escalation policy
     */
    async executeWorkflow(event, workflow) {
        console.log(`AlertEngine: Executing workflow "${workflow.workflow_name}"`);

        const escalationPolicy = workflow.escalation_policy || [];

        for (let stepIndex = 0; stepIndex < escalationPolicy.length; stepIndex++) {
            const step = escalationPolicy[stepIndex];

            // For immediate notifications (delay = 0 or first step), execute now
            // For delayed notifications, schedule them
            if (step.delay_minutes > 0 && stepIndex > 0) { // Condition from outline
                await this.scheduleEscalationStep(event, workflow, step, stepIndex, step.delay_minutes);
            } else {
                await this.executeEscalationStep(event, workflow, step, stepIndex);
            }
        }
    }

    /**
     * Execute a single escalation step
     */
    async executeEscalationStep(event, workflow, step, stepIndex) {
        const channelIds = step.channel_ids || [];

        console.log(`AlertEngine: Executing escalation step ${stepIndex} with ${channelIds.length} channels`); // Updated log message

        for (const channelId of channelIds) {
            try {
                const channel = await AgentAlertChannel.get(channelId);
                // Keeping !channel for robustness and adding !channel.is_active
                if (!channel || !channel.is_active) { // Updated check
                    console.log(`AlertEngine: Skipping inactive/missing channel ${channelId}`);
                    // Log as skipped for immediate notifications that are not active/missing
                    await this.logNotification(event, workflow, { id: channelId, channel_type: 'unknown', channel_name: 'Unknown' }, 'skipped', stepIndex, 'Channel inactive or missing');
                    continue;
                }

                // New method to process channel notification based on type
                await this.processChannelNotification(event, workflow, channel, stepIndex);

            } catch (error) {
                console.error(`AlertEngine: Failed to process channel ${channelId}:`, error);
                const placeholderChannel = { id: channelId, channel_type: 'unknown' }; // Simplified placeholder
                await this.logNotification(event, workflow, placeholderChannel, 'failed', stepIndex, `Channel processing failed: ${error.message}`);
            }
        }
    }

    /**
     * Process channel notification: enhanced routing logic with user preferences
     */
    async processChannelNotification(event, workflow, channel, stepIndex, notificationId = null) {
        console.log(`AlertEngine: Processing ${channel.channel_type} notification via "${channel.channel_name}"`);

        try {
            switch (channel.channel_type) {
                case 'email':
                    await this.sendEmail(event, workflow, channel, stepIndex, notificationId);
                    break;
                case 'webhook':
                    await this.sendWebhook(event, workflow, channel, stepIndex, notificationId);
                    break;
                case 'in_app':
                    await this.sendInAppNotification(event, workflow, channel, stepIndex, notificationId);
                    break;
                case 'whatsapp': // New channel type
                    await this.sendWhatsApp(event, workflow, channel, stepIndex, notificationId);
                    break;
                case 'sms': // Re-implemented
                    await this.sendSMS(event, workflow, channel, stepIndex, notificationId);
                    break;
                case 'iot_device': // Re-implemented
                    await this.sendIoTNotification(event, workflow, channel, stepIndex, notificationId);
                    break;
                case 'zapier': // New channel type
                    await this.sendZapierWebhook(event, workflow, channel, stepIndex, notificationId);
                    break;
                case 'slack': // New channel type
                    await this.sendSlack(event, workflow, channel, stepIndex, notificationId);
                    break;
                case 'telegram': // New channel type
                    await this.sendTelegram(event, workflow, channel, stepIndex, notificationId);
                    break;
                default:
                    // Fallback for unhandled types, using the old stub handler concept
                    await this.handleStubbedChannel(event, workflow, channel, stepIndex, notificationId);
            }
            console.log(`AlertEngine: Processed ${channel.channel_type} notification successfully.`);
        } catch (error) {
            console.error(`AlertEngine: Error during channel processing for ${channel.channel_type}:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, `Error during channel processing: ${error.message}`, null, null, notificationId);
        }
    }

    /**
     * Schedule a delayed escalation step
     */
    async scheduleEscalationStep(event, workflow, step, stepIndex, delayMinutes) {
        const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);

        console.log(`AlertEngine: Scheduling step ${stepIndex} for ${scheduledTime.toISOString()}`);

        // Create scheduled notification records for each channel
        const channelIds = step.channel_ids || [];
        for (const channelId of channelIds) {
            try {
                const channel = await AgentAlertChannel.get(channelId);
                if (!channel || !channel.is_active) continue;

                // For scheduled notifications, we create a pending record that will be processed later.
                await AlertNotification.create({
                    organization_id: event.organization_id,
                    event_id: event.id,
                    workflow_id: workflow.id,
                    channel_id: channelId,
                    notification_type: channel.channel_type,
                    status: 'pending', // Status is pending for scheduled notifications
                    escalation_step: stepIndex,
                    scheduled_for: scheduledTime.toISOString(),
                    // Title, description, severity will be populated on dispatch using logNotification
                    // message_content will be populated on dispatch as well
                });
            } catch (error) {
                console.error(`AlertEngine: Failed to schedule notification for channel ${channelId}:`, error);
            }
        }
    }

    // Removed: getOrgSettings (logic handled by shouldNotifyUser or removed from sendX methods)
    // Removed: getUserSettings (logic handled by shouldNotifyUser)

    /**
     * Check if a user should be notified based on their preferences
     */
    async shouldNotifyUser(user, channelType, severity, workflow) {
        try {
            // Get user preferences
            const preferences = await UserNotificationPreferences.filter({
                user_id: user.id,
                organization_id: user.organization_id
            });

            const userPrefs = preferences.length > 0 ? preferences[0] : null;

            // If user has muted all alerts
            if (userPrefs?.mute_alerts) {
                return { allow: false, reason: 'User has muted all alerts' };
            }

            // Check severity threshold
            const severityLevels = ['low', 'medium', 'high', 'critical'];
            const eventSeverityIndex = severityLevels.indexOf(severity);
            const userThresholdIndex = severityLevels.indexOf(userPrefs?.severity_threshold || 'medium'); // Default to medium

            if (eventSeverityIndex < userThresholdIndex) {
                return { allow: false, reason: `Severity ${severity} below user threshold ${userPrefs.severity_threshold}` };
            }

            // Check if channel is blocked
            if (userPrefs?.blocked_channels?.includes(channelType)) {
                return { allow: false, reason: `User blocked ${channelType} notifications` };
            }

            // Check Do Not Disturb windows
            if (userPrefs?.do_not_disturb_windows && Array.isArray(userPrefs.do_not_disturb_windows)) {
                const now = new Date();
                const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
                const currentDay = now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase(); // e.g., 'monday'

                for (const window of userPrefs.do_not_disturb_windows) {
                    if (window.days && window.days.includes(currentDay)) {
                        // Simple time comparison (doesn't handle crossing midnight for dnd ranges)
                        if (currentTime >= window.start_time && currentTime <= window.end_time) {
                            return { allow: false, reason: 'User in Do Not Disturb window' };
                        }
                    }
                }
            }

            return { allow: true, reason: 'User preferences allow notification' };
        } catch (error) {
            console.error('Error checking user preferences:', error);
            // In case of an error fetching or processing preferences, default to allowing notification
            return { allow: true, reason: `Error checking preferences, allowing notification: ${error.message}` };
        }
    }

    /**
     * Send an email notification with user settings check
     */
    async sendEmail(event, workflow, channel, stepIndex, notificationId = null) {
        const recipientEmail = channel.channel_configuration?.email_address;
        if (!recipientEmail) {
            console.error('AlertEngine: Email channel is missing recipient address in configuration');
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, 'Email address not configured for channel', null, null, notificationId);
            return;
        }

        // If this is a user-specific email, check their preferences
        // Assuming workflow.use_user_preferences is a flag on the workflow
        if (workflow.use_user_preferences) {
            try {
                const users = await User.filter({ email: recipientEmail, organization_id: event.organization_id });
                if (users.length > 0) {
                    const user = users[0];
                    const shouldNotify = await this.shouldNotifyUser(user, 'email', event.severity, workflow);
                    if (!shouldNotify.allow) {
                        console.log(`AlertEngine: Skipping email to ${recipientEmail} - ${shouldNotify.reason}`);
                        await this.logNotification(event, workflow, channel, 'skipped', stepIndex, shouldNotify.reason, null, user.id, notificationId);
                        return;
                    }
                }
            } catch (error) {
                console.error('AlertEngine: Error checking user email settings:', error);
                // Continue with sending if we can't check settings reliably
            }
        }

        const emailSubject = `🚨 [AwareCam Alert] ${event.severity.toUpperCase()}: ${event.event_type.replace(/_/g, ' ')}`;
        const emailBody = `
            A new alert has been triggered:
            - Event: ${event.description}
            - Camera: ${event.camera_name}
            - Severity: ${event.severity}
            - Confidence: ${Math.round(event.confidence * 100)}%
            - Time: ${new Date(event.created_date).toLocaleString()}
        `;
        const emailPayload = {
            to: recipientEmail,
            subject: emailSubject,
            body: emailBody
        };

        try {
            await SendEmail(emailPayload);
            console.log(`AlertEngine: Email sent successfully to ${recipientEmail}`);
            await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, emailPayload, null, notificationId);
        } catch (error) {
            console.error(`AlertEngine: Failed to send email to ${recipientEmail}:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, error.message, emailPayload, null, notificationId);
        }
    }

    /**
     * Send an in-app notification to all users in the organization.
     */
    async sendInAppNotification(event, workflow, channel, stepIndex, notificationId = null) {
        console.log('AlertEngine: Generating in-app notifications for relevant users');

        try {
            // Find all users in the organization to notify them
            const users = await User.filter({ organization_id: event.organization_id });
            if (users.length === 0) {
                console.warn('AlertEngine: No users found for in-app notification in org', event.organization_id);
                await this.logNotification(event, workflow, channel, 'skipped', stepIndex, 'No users in organization', null, null, notificationId);
                return;
            }

            for (const user of users) {
                try {
                    // Check user preferences using the new shouldNotifyUser method
                    const shouldNotify = await this.shouldNotifyUser(user, 'in_app', event.severity, workflow);

                    if (!shouldNotify.allow) {
                        console.log(`AlertEngine: Skipping in-app for user ${user.id} due to preferences: ${shouldNotify.reason}`);
                        await this.logNotification(event, workflow, channel, 'skipped', stepIndex, shouldNotify.reason, null, user.id, notificationId);
                        continue; // Skip to the next user
                    }

                    // For in-app, we log a separate notification for each user.
                    // The actual "delivery" is logging it to the user's notification feed.
                    // Message content is now generic for logNotification
                    await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, null, user.id, notificationId); // Status changed to 'sent' from 'delivered'
                    console.log(`AlertEngine: In-app notification delivered for user ${user.id}`);
                } catch (error) {
                    console.error(`AlertEngine: Failed to process in-app notification for user ${user.id}:`, error);
                    await this.logNotification(event, workflow, channel, 'failed', stepIndex, `Error processing in-app for user ${user.id}: ${error.message}`, null, user.id, notificationId);
                }
            }

        } catch (error) {
            console.error(`AlertEngine: Failed to process in-app notifications:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, `In-app processing error: ${error.message}`, null, null, notificationId);
        }
    }

    /**
     * Send webhook notification
     */
    async sendWebhook(event, workflow, channel, stepIndex, notificationId = null) {
        const config = channel.channel_configuration;

        const url = config.url; // Use 'url' as per outline
        if (!url) {
            console.error('AlertEngine: Webhook URL not configured for channel');
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, 'Webhook URL not configured for channel', null, null, notificationId);
            return;
        }

        const payload = { event, workflow }; // Simplified payload as per outline

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(config.headers || {}) // Preserving custom headers
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Get full response text for error detail
                throw new Error(`Webhook failed with status ${response.status}: ${await response.text()}`);
            }

            await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, {
                webhook_url: url,
                response_status: response.status,
                response_text: response.statusText,
                sent_data: payload // Use 'payload' as the content
            }, null, notificationId);
            console.log(`AlertEngine: Webhook sent successfully to ${url}`);
        } catch (error) {
            console.error(`AlertEngine: Failed to send webhook notification to ${url}:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, error.message, {
                webhook_url: url,
                error_message: error.message,
                sent_data: payload // Use 'payload' as the content
            }, null, notificationId);
        }
    }

    /**
     * Send WhatsApp notification (simulated)
     */
    async sendWhatsApp(event, workflow, channel, stepIndex, notificationId = null) {
        const phoneNumber = channel.channel_configuration?.phone_number;
        if (!phoneNumber) {
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, 'Phone number not configured for WhatsApp', null, null, notificationId);
            return;
        }

        const message = `🚨 AwareCam Alert\n${event.description}\nCamera: ${event.camera_name}\nSeverity: ${event.severity.toUpperCase()}`;

        try {
            // Simulate WhatsApp API call (e.g., via a third-party service's API)
            console.log(`AlertEngine: Would send WhatsApp to ${phoneNumber}: ${message}`);
            // In a real scenario, this would be an actual API call.
            // For now, it's simulated success.
            await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, { to: phoneNumber, message }, null, notificationId);
        } catch (error) {
            console.error(`AlertEngine: WhatsApp send failed:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, error.message, { to: phoneNumber, message, error_message: error.message }, null, notificationId);
        }
    }

    /**
     * Send Zapier webhook
     */
    async sendZapierWebhook(event, workflow, channel, stepIndex, notificationId = null) {
        const url = channel.channel_configuration?.zapier_webhook_url;
        if (!url) {
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, 'Zapier webhook URL not configured', null, null, notificationId);
            return;
        }

        const payload = {
            event_type: event.event_type,
            severity: event.severity,
            description: event.description,
            camera_name: event.camera_name,
            confidence: event.confidence,
            zone_name: event.zone_name,
            timestamp: event.created_date,
            organization_id: event.organization_id,
            workflow_name: workflow.workflow_name
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Zapier webhook failed with status ${response.status}: ${await response.text()}`);
            }

            await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, payload, null, notificationId);
            console.log(`AlertEngine: Zapier webhook sent successfully to ${url}`);
        } catch (error) {
            console.error(`AlertEngine: Zapier webhook failed:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, error.message, payload, null, notificationId);
        }
    }

    /**
     * Send SMS notification
     */
    async sendSMS(event, workflow, channel, stepIndex, notificationId = null) {
        const config = channel.channel_configuration;

        if (!config.phone_number) {
            console.error('AlertEngine: Phone number not configured for channel');
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, 'Phone number not configured for channel', null, null, notificationId);
            return;
        }

        const message = `AwareCam Alert: ${event.description} at ${event.camera_name}. Severity: ${event.severity.toUpperCase()}`;

        try {
            // TODO: Implement SMS via Twilio or similar service
            console.log(`AlertEngine: SMS would be sent to ${config.phone_number}:`, message);

            await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, {
                delivery_method: 'sms',
                phone_number: config.phone_number,
                message: message,
                status: 'simulated_success'
            }, null, notificationId);
        } catch (error) {
            console.error(`AlertEngine: Failed to simulate SMS notification to ${config.phone_number}:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, error.message, {
                delivery_method: 'sms',
                phone_number: config.phone_number,
                error_message: error.message
            }, null, notificationId);
        }
    }

    /**
     * Send IoT device notification
     */
    async sendIoTNotification(event, workflow, channel, stepIndex, notificationId = null) {
        const config = channel.channel_configuration;

        if (!config.device_endpoint) { // Changed from device_ip to device_endpoint as per common practice
            console.error('AlertEngine: Device endpoint not configured for channel');
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, 'Device endpoint not configured for channel', null, null, notificationId);
            return;
        }

        const payload = {
            alert_type: event.event_type,
            severity: event.severity,
            message: event.description,
            timestamp: new Date().toISOString()
        };

        try {
            // TODO: Implement IoT device communication
            console.log(`AlertEngine: IoT alert would be sent to ${config.device_endpoint}:`, payload);

            await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, {
                delivery_method: 'iot_device',
                device_endpoint: config.device_endpoint,
                message: payload,
                status: 'simulated_success'
            }, null, notificationId);
        } catch (error) {
            console.error(`AlertEngine: Failed to simulate IoT notification to ${config.device_endpoint}:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, error.message, {
                delivery_method: 'iot_device',
                device_endpoint: config.device_endpoint,
                error_message: error.message
            }, null, notificationId);
        }
    }

    /**
     * Send Slack notification
     */
    async sendSlack(event, workflow, channel, stepIndex, notificationId = null) {
        const webhookUrl = channel.channel_configuration?.webhook_url;
        if (!webhookUrl) {
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, 'Slack webhook URL not configured', null, null, notificationId);
            return;
        }

        const slackPayload = {
            text: `🚨 AwareCam Alert`,
            attachments: [{
                color: this.getSeverityColor(event.severity), // Use existing severity color logic
                fields: [
                    { title: 'Event', value: event.description, short: false },
                    { title: 'Camera', value: event.camera_name, short: true },
                    { title: 'Severity', value: event.severity.toUpperCase(), short: true },
                    { title: 'Confidence', value: `${Math.round(event.confidence * 100)}%`, short: true },
                    { title: 'Time', value: new Date(event.created_date).toLocaleString(), short: true }
                ]
            }]
        };

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(slackPayload)
            });

            if (!response.ok) {
                throw new Error(`Slack webhook failed with status ${response.status}: ${await response.text()}`);
            }

            await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, slackPayload, null, notificationId);
            console.log(`AlertEngine: Slack notification sent successfully to ${webhookUrl}`);
        } catch (error) {
            console.error(`AlertEngine: Slack notification failed:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, error.message, slackPayload, null, notificationId);
        }
    }

    /**
     * Send Telegram notification (simulated)
     */
    async sendTelegram(event, workflow, channel, stepIndex, notificationId = null) {
        // Simulate Telegram bot API or use a real integration like 'node-telegram-bot-api'
        const chatId = channel.channel_configuration?.chat_id;
        if (!chatId) {
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, 'Telegram chat ID not configured', null, null, notificationId);
            return;
        }

        const payload = {
            chat_id: chatId,
            text: `🚨 *AwareCam Alert*\n\n${event.description}\n\n📹 Camera: ${event.camera_name}\n⚠️ Severity: ${event.severity.toUpperCase()}\n📊 Confidence: ${Math.round(event.confidence * 100)}%`,
            parse_mode: 'Markdown' // For rich text formatting
        };

        try {
            // Simulate sending to Telegram API
            console.log(`AlertEngine: Would send Telegram notification to chat ID ${chatId}:`, payload);
            await this.logNotification(event, workflow, channel, 'sent', stepIndex, null, payload, null, notificationId);
        } catch (error) {
            console.error(`AlertEngine: Telegram notification failed:`, error);
            await this.logNotification(event, workflow, channel, 'failed', stepIndex, error.message, payload, null, notificationId);
        }
    }

    /**
     * Handle stubbed channels (for types not explicitly implemented above)
     */
    async handleStubbedChannel(event, workflow, channel, stepIndex, notificationId = null) {
        console.warn(`AlertEngine: Unknown or unimplemented channel type: ${channel.channel_type}`);
        await this.logNotification(event, workflow, channel, 'failed', stepIndex, `Unsupported channel type: ${channel.channel_type}`, null, null, notificationId);
    }

    /**
     * Log notification to the database (create new or update existing)
     * Updated signature and parameters as per outline, but retaining notificationId for updates.
     */
    async logNotification(event, workflow, channel, status, stepIndex, error = null, content = null, userId = null, notificationId = null) {
        // New fields for AlertNotification from outline
        // These are already calculated in the existing code, keeping for consistency.
        const title = `${event.severity.charAt(0).toUpperCase() + event.severity.slice(1)} Alert: ${event.event_type.replace(/_/g, ' ')}`;
        const description = `${event.description} at ${event.camera_name}`;

        const notificationData = {
            organization_id: event.organization_id,
            user_id: userId, // Can be null for non-user-specific channels like webhooks
            event_id: event.id,
            workflow_id: workflow.id,
            channel_id: channel.id,
            notification_type: channel.channel_type,
            title: title, // New field, but already calculated
            description: description, // New field, but already calculated
            severity: event.severity, // New field, but already present
            status: status,
            delivery_error: error,
            message_content: content, // Renamed from messageContent to content parameter
            escalation_step: stepIndex,
            sent_at: ['sent', 'delivered'].includes(status) ? new Date().toISOString() : null,
        };

        try {
            if (notificationId) {
                // Update existing record for scheduled notifications that are now being processed
                await AlertNotification.update(notificationId, notificationData);
                console.log(`AlertEngine: Updated notification ${notificationId} to status "${status}"`);
            } else {
                // Create new record for immediate notifications or when no existing ID is provided
                await AlertNotification.create(notificationData);
                console.log(`AlertEngine: Logged new "${status}" notification for channel ${channel.id}`);
            }
        } catch (dbError) {
            console.error(`AlertEngine: CRITICAL - Failed to log/update notification:`, dbError);
        }
    }

    /**
     * Process scheduled notifications (would be called by a background job)
     */
    async processScheduledNotifications() {
        const now = new Date().toISOString();

        const pendingNotifications = await AlertNotification.filter({
            status: 'pending',
            scheduled_for: { $lte: now }
        });

        console.log(`AlertEngine: Processing ${pendingNotifications.length} scheduled notifications`);

        for (const notification of pendingNotifications) {
            try {
                // Get the related objects
                const [event, workflow, channel] = await Promise.all([
                    Event.get(notification.event_id),
                    AlertWorkflow.get(notification.workflow_id),
                    AgentAlertChannel.get(notification.channel_id)
                ]);

                if (event && workflow && channel && channel.is_active) {
                    // Pass the notification.id so logNotification can update this existing record
                    await this.processChannelNotification(event, workflow, channel, notification.escalation_step, notification.id); // Changed to processChannelNotification
                } else {
                    // Log failure if event, workflow, or channel is missing/inactive/not found
                    console.error(`AlertEngine: Skipping scheduled notification ${notification.id} due to missing/inactive dependencies.`);
                    // Provide minimal data for logging if full objects aren't available
                    await this.logNotification(
                        event || { organization_id: notification.organization_id, id: notification.event_id, description: 'Unknown event', event_type: 'unknown', severity: 'low', camera_name: 'Unknown' }, // Added camera_name for description
                        workflow || { id: notification.workflow_id, workflow_name: 'Unknown Workflow' },
                        channel || { id: notification.channel_id, channel_type: 'unknown', channel_name: 'Unknown Channel' },
                        'failed', // status
                        notification.escalation_step,
                        'Missing event/workflow/inactive channel for scheduled notification', // error
                        null, // content
                        null, // userId
                        notification.id // Ensure the original scheduled notification record is updated
                    );
                }

            } catch (error) {
                console.error(`AlertEngine: Failed to process scheduled notification ${notification.id}:`, error);
                // This catch block is for unhandled errors during the fetching or setup of a scheduled notification.
                // The logNotification within sendNotification should handle most status updates.
                // This acts as a final safeguard to mark the original record as failed if internal logging failed.
                await AlertNotification.update(notification.id, {
                    status: 'failed',
                    delivery_error: error.message,
                    message_content: { info: 'Unhandled error during scheduled notification processing' }
                });
            }
        }
    }

    /**
     * Get color for severity levels (for email styling)
     */
    getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return '#dc2626';
            case 'high': return '#ea580c';
            case 'medium': return '#d97706';
            case 'low': return '#059669';
            default: return '#6b7280';
        }
    }
}

// Export singleton instance
export const alertEngine = new AlertEngine();
export default alertEngine;
